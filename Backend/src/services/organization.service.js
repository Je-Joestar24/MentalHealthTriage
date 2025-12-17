import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import bcrypt from 'bcryptjs';

export const getAllOrganizations = async (queryParams) => {
  const {
    page = 1,
    limit = 5,
    search = '',
    subscriptionStatus = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = queryParams;

  // Build filter object
  const filter = {};
  
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  
  if (subscriptionStatus) {
    if (subscriptionStatus === 'expired') {
      // For expired status, filter by organizations past their end date
      filter.subscriptionEndDate = { $lt: new Date() };
    } else if (subscriptionStatus === 'active') {
      // Map 'active' to Stripe subscription_status 'active' and is_paid true
      filter.subscription_status = 'active';
      filter.is_paid = true;
    } else if (subscriptionStatus === 'inactive') {
      // Map 'inactive' to any non-active subscription_status
      filter.$or = [
        { subscription_status: { $ne: 'active' } },
        { is_paid: false }
      ];
    }
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with pagination and add seats information
  const organizations = await Organization.find(filter)
    .populate('admin', 'name email role')
    .populate('psychologists', 'name email role specialization')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Transform the organizations to include seats_taken and effective status
  const transformedOrganizations = organizations.map(org => {
    // Calculate effective status (expired if past end date)
    const isExpired = org.subscriptionEndDate && new Date() > new Date(org.subscriptionEndDate);
    const effectiveStatus = isExpired ? 'expired' : (org.subscription_status === 'active' && org.is_paid ? 'active' : org.subscription_status);
    
    return {
      ...org,
      seats_taken: org.psychologists ? org.psychologists.length : 0,
      seats_available: org.psychologistSeats - (org.psychologists ? org.psychologists.length : 0),
      seats_total: org.psychologistSeats,
      effectiveStatus,
      isSubscriptionExpired: isExpired
    };
  });

  // Get total count for pagination
  const total = await Organization.countDocuments(filter);

  return {
    organizations: transformedOrganizations,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: skip + parseInt(limit) < total,
      hasPrevPage: parseInt(page) > 1
    }
  };
};

export const getOrganizationById = async (organizationId) => {
  const organization = await Organization.findById(organizationId)
    .populate('admin', 'name email role')
    .populate('psychologists', 'name email role specialization experience')
    .populate('patients', 'name email phone')
    .populate('diagnosisCatalog', 'name description category')
    .lean();

  if (!organization) {
    throw new Error('Organization not found');
  }

  // Calculate effective status (expired if past end date)
  const isExpired = organization.subscriptionEndDate && new Date() > new Date(organization.subscriptionEndDate);
  const effectiveStatus = isExpired ? 'expired' : (organization.subscription_status === 'active' && organization.is_paid ? 'active' : organization.subscription_status);

  return {
    ...organization,
    effectiveStatus,
    isSubscriptionExpired: isExpired
  };
};

/**
 * @deprecated This function updates the legacy subscriptionStatus field.
 * Use Stripe webhooks and updateOrganizationSubscription instead.
 * This is kept for backward compatibility but should not be used for Stripe-managed subscriptions.
 */
export const updateOrganizationStatus = async (organizationId, subscriptionStatus, subscriptionEndDate = null) => {
  const validStatuses = ['active', 'inactive'];
  
  if (!validStatuses.includes(subscriptionStatus)) {
    throw new Error('Invalid subscription status. Must be one of: active, inactive');
  }

  // Map legacy status to Stripe subscription_status
  const updateData = {};
  if (subscriptionStatus === 'active') {
    updateData.subscription_status = 'active';
    updateData.is_paid = true;
  } else {
    updateData.subscription_status = 'incomplete';
    updateData.is_paid = false;
  }
  
  // Also update legacy field for backward compatibility (but it's not the source of truth)
  updateData.subscriptionStatus = subscriptionStatus;
  
  // If updating to active and providing end date, update the subscription dates
  if (subscriptionStatus === 'active' && subscriptionEndDate) {
    updateData.subscriptionStartDate = new Date();
    updateData.subscriptionEndDate = new Date(subscriptionEndDate);
  }

  const organization = await Organization.findByIdAndUpdate(
    organizationId,
    updateData,
    { new: true, runValidators: true }
  ).populate('admin', 'name email role');

  if (!organization) {
    throw new Error('Organization not found');
  }

  return organization;
};

export const createOrganization = async (organizationData) => {
  // organizationData.admin can be an ObjectId or an object describing a new admin
  let adminUserId = organizationData.admin;

  if (adminUserId && typeof adminUserId === 'object') {
    const adminPayload = organizationData.admin;
    // Create admin user
    const existing = await User.findOne({ email: adminPayload.email });
    if (existing) {
      throw new Error('Admin email already exists');
    }
    const adminUser = new User({
      name: adminPayload.name,
      email: adminPayload.email.toLowerCase(),
      password: adminPayload.password,
      role: 'company_admin',
      isActive: true,
    });
    await adminUser.save();
    adminUserId = adminUser._id;
  }

  // Ensure we don't pass the nested admin object into the Organization ctor
  const { admin: _ignoredAdmin, ...orgRest } = organizationData || {};
  const organization = new Organization({
    ...orgRest,
    admin: adminUserId,
  });
  await organization.save();

  // Link admin to organization if newly created
  if (adminUserId && typeof organizationData.admin === 'object') {
    await User.findByIdAndUpdate(adminUserId, { organization: organization._id });
  }

  return await Organization.findById(organization._id)
    .populate('admin', 'name email role')
    .populate('psychologists', 'name email role specialization')
    .lean();
};

export const updateOrganization = async (organizationId, updateData) => {
  let finalUpdateData = { ...updateData };
  
  // Handle admin updates separately if provided
  if (updateData.admin && typeof updateData.admin === 'object') {
    const adminData = updateData.admin;
    const organization = await Organization.findById(organizationId).populate('admin');
    
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Update admin user if exists
    if (organization.admin) {
      const adminUpdateData = {};
      if (adminData.name) adminUpdateData.name = adminData.name;
      if (adminData.email) adminUpdateData.email = adminData.email.toLowerCase();
      if (adminData.password) {
        // Hash the password before updating
        const salt = await bcrypt.genSalt(10);
        adminUpdateData.password = await bcrypt.hash(adminData.password, salt);
      }
      
      await User.findByIdAndUpdate(organization.admin._id, adminUpdateData);
    }
    
    // Remove admin from updateData to avoid conflicts with Organization model
    const { admin, ...orgUpdateData } = updateData;
    finalUpdateData = orgUpdateData;
  }

  const organization = await Organization.findByIdAndUpdate(
    organizationId,
    finalUpdateData,
    { new: true, runValidators: true }
  ).populate('admin', 'name email role')
   .populate('psychologists', 'name email role specialization')
   .populate('patients', 'name email phone')
   .lean();

  if (!organization) {
    throw new Error('Organization not found');
  }

  // Calculate effective status (expired if past end date)
  const isExpired = organization.subscriptionEndDate && new Date() > new Date(organization.subscriptionEndDate);
  const effectiveStatus = isExpired ? 'expired' : (organization.subscription_status === 'active' && organization.is_paid ? 'active' : organization.subscription_status);

  return {
    ...organization,
    effectiveStatus,
    isSubscriptionExpired: isExpired
  };
};

export const deleteOrganization = async (organizationId) => {
  const organization = await Organization.findByIdAndDelete(organizationId);
  
  if (!organization) {
    throw new Error('Organization not found');
  }

  return { message: 'Organization deleted successfully' };
};

export const getOrganizationStats = async (organizationId) => {
  const organization = await Organization.findById(organizationId);
  
  if (!organization) {
    throw new Error('Organization not found');
  }

  const psychologistCount = organization.psychologists.length;
  const patientCount = organization.patients.length;
  const diagnosisCount = organization.diagnosisCatalog.length;

  return {
    organizationId,
    name: organization.name,
      subscription_status: organization.subscription_status,
      is_paid: organization.is_paid,
    subscriptionStartDate: organization.subscriptionStartDate,
    subscriptionEndDate: organization.subscriptionEndDate,
    isSubscriptionExpired: organization.isSubscriptionExpired,
    daysRemaining: organization.daysRemaining,
    psychologistSeats: organization.psychologistSeats,
    stats: {
      psychologists: psychologistCount,
      patients: patientCount,
      diagnoses: diagnosisCount,
      availableSeats: organization.psychologistSeats - psychologistCount
    }
  };
};

export const checkAndUpdateExpiredSubscriptions = async () => {
  const now = new Date();
  
  // Find organizations with expired subscriptions that are still marked as active
  // Use subscription_status (Stripe) as source of truth
  const expiredOrganizations = await Organization.find({
    subscription_status: 'active',
    is_paid: true,
    subscriptionEndDate: { $lt: now }
  });

  if (expiredOrganizations.length > 0) {
    // Update all expired organizations - set subscription_status to 'past_due' or 'canceled'
    // Don't update subscriptionStatus (legacy field) as it's no longer used
    await Organization.updateMany(
      { _id: { $in: expiredOrganizations.map(org => org._id) } },
      { 
        subscription_status: 'past_due', // Stripe status for expired
        is_paid: false 
      }
    );

    console.log(`Updated ${expiredOrganizations.length} expired organizations`);
  }

  return {
    updatedCount: expiredOrganizations.length,
    expiredOrganizations: expiredOrganizations.map(org => ({
      id: org._id,
      name: org.name,
      subscriptionEndDate: org.subscriptionEndDate
    }))
  };
};

export const extendSubscription = async (organizationId, newEndDate) => {
  const organization = await Organization.findById(organizationId);
  
  if (!organization) {
    throw new Error('Organization not found');
  }

  const endDate = new Date(newEndDate);
  const now = new Date();
  
  if (endDate <= now) {
    throw new Error('Subscription end date must be in the future');
  }

  const updatedOrganization = await Organization.findByIdAndUpdate(
    organizationId,
    {
      subscription_status: 'active', // Stripe status (source of truth)
      is_paid: true,
      subscriptionStatus: 'active', // Legacy field for backward compatibility
      subscriptionStartDate: now,
      subscriptionEndDate: endDate
    },
    { new: true, runValidators: true }
  ).populate('admin', 'name email role');

  return updatedOrganization;
};
