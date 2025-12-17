import User from '../models/User.js';
import Organization from '../models/Organization.js';
import {
  createStripeCustomer,
  updateUserStripeCustomer,
  updateOrganizationStripeCustomer,
} from './stripe.service.js';

/**
 * Check if email is available or exists with payment status
 * @param {string} email - Email to check
 * @returns {Promise<Object>} Status object
 */
export const checkEmailAvailability = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (!normalizedEmail) {
    throw new Error('Email is required');
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (!existingUser) {
    return {
      status: 'available',
      available: true,
      redirect_to_payment: false,
    };
  }

  // Check payment status based on account type
  let isPaid = false;
  let subscriptionStatus = 'incomplete';
  
  if (existingUser.account_type === 'organization' && existingUser.organization) {
    // For organization accounts, check organization subscription
    const organization = await Organization.findById(existingUser.organization);
    if (organization) {
      isPaid = organization.is_paid;
      subscriptionStatus = organization.subscription_status;
    }
  } else {
    // For individual accounts, check user subscription
    isPaid = existingUser.is_paid;
    subscriptionStatus = existingUser.subscription_status;
  }

  // If user exists but hasn't paid
  if (!isPaid || subscriptionStatus === 'incomplete') {
    return {
      status: 'unpaid_existing',
      available: false,
      redirect_to_payment: true,
      userId: existingUser._id.toString(),
      accountType: existingUser.account_type,
    };
  }

  // If user exists and has paid
  return {
    status: 'exists_paid',
    available: false,
    redirect_to_payment: false,
    error: 'Email already registered',
  };
};

/**
 * Create a temporary user before payment (Individual account)
 * @param {Object} userData - User data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} Created user object
 */
export const createTempIndividualUser = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Validate required fields
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser && existingUser.is_paid) {
    throw new Error('Email already registered');
  }

  let user;

  if (existingUser && !existingUser.is_paid) {
    // Update existing unpaid user
    user = existingUser;
    user.name = name.trim();
    user.password = password; // Will be hashed by pre-save middleware
    user.account_type = 'individual';
    user.subscription_status = 'incomplete';
    user.is_paid = false;
    await user.save();
  } else {
    // Create new user
    user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'psychologist',
      account_type: 'individual',
      subscription_status: 'incomplete',
      is_paid: false,
      isActive: true,
    });
    await user.save();
  }

  // Create Stripe customer
  try {
    const customer = await createStripeCustomer({
      email: normalizedEmail,
      name: user.name,
    });

    // Update user with Stripe customer ID
    await updateUserStripeCustomer(user._id, customer.id);
    user.stripe_customer_id = customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer for individual:', error);
    // Don't throw - user is created, Stripe customer can be created later
  }

  // Return user without password
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

/**
 * Create a temporary user and organization before payment (Organization account)
 * @param {Object} orgData - Organization data
 * @param {string} orgData.companyName - Company name
 * @param {string} orgData.adminName - Admin name
 * @param {string} orgData.email - Admin email
 * @param {string} orgData.password - Admin password
 * @param {number} orgData.seats - Number of psychologist seats (minimum 4)
 * @returns {Promise<Object>} Created user and organization objects
 */
export const createTempOrganizationUser = async ({
  companyName,
  adminName,
  email,
  password,
  seats = 4,
}) => {
  const normalizedEmail = email.toLowerCase().trim();
  const seatCount = Math.max(4, parseInt(seats, 10) || 4);

  // Validate required fields
  if (!companyName || !adminName || !email || !password) {
    throw new Error('Company name, admin name, email, and password are required');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser && existingUser.is_paid) {
    throw new Error('Email already registered');
  }

  let adminUser;
  let organization;

  if (existingUser && !existingUser.is_paid) {
    // Update existing unpaid user
    adminUser = existingUser;
    adminUser.name = adminName.trim();
    adminUser.password = password; // Will be hashed by pre-save middleware
    adminUser.account_type = 'organization';
    adminUser.subscription_status = 'incomplete';
    adminUser.is_paid = false;
    adminUser.role = 'company_admin';
    await adminUser.save();

    // Find existing organization for this admin
    organization = await Organization.findOne({ admin: adminUser._id });
    if (organization) {
      organization.name = companyName.trim();
      organization.psychologistSeats = seatCount;
      organization.seats_limit = seatCount;
      await organization.save();
    }
  } else {
    // Create new admin user
    adminUser = new User({
      name: adminName.trim(),
      email: normalizedEmail,
      password,
      role: 'company_admin',
      account_type: 'organization',
      subscription_status: 'incomplete',
      is_paid: false,
      isActive: true,
    });
    await adminUser.save();
  }

  // Create or update organization
  if (!organization) {
    // Calculate subscription end date (1 month from now)
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    organization = new Organization({
      name: companyName.trim(),
      admin: adminUser._id,
      psychologistSeats: seatCount,
      seats_limit: seatCount,
      subscriptionStatus: 'inactive',
      subscriptionStartDate: new Date(),
      subscriptionEndDate,
      subscription_status: 'incomplete',
      is_paid: false,
    });
    await organization.save();

    // Link organization to admin user
    adminUser.organization = organization._id;
    await adminUser.save();
  }

  // Create Stripe customer for organization
  try {
    const customer = await createStripeCustomer({
      email: normalizedEmail,
      name: companyName.trim(),
    });

    // Update organization with Stripe customer ID
    await updateOrganizationStripeCustomer(organization._id, customer.id);
    organization.stripe_customer_id = customer.id;

    // Also update admin user with Stripe customer ID
    await updateUserStripeCustomer(adminUser._id, customer.id);
    adminUser.stripe_customer_id = customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer for organization:', error);
    // Don't throw - user and org are created, Stripe customer can be created later
  }

  // Return user and organization without password
  const userObj = adminUser.toObject();
  delete userObj.password;
  const orgObj = organization.toObject();

  return {
    user: userObj,
    organization: orgObj,
  };
};

