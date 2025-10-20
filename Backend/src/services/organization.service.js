import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';

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
    filter.subscriptionStatus = subscriptionStatus;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with pagination
  const organizations = await Organization.find(filter)
    .populate('admin', 'name email role')
    .populate('psychologists', 'name email role specialization')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count for pagination
  const total = await Organization.countDocuments(filter);

  return {
    organizations,
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

  return organization;
};

export const updateOrganizationStatus = async (organizationId, subscriptionStatus, subscriptionEndDate = null) => {
  const validStatuses = ['active', 'inactive', 'expired'];
  
  if (!validStatuses.includes(subscriptionStatus)) {
    throw new Error('Invalid subscription status. Must be one of: active, inactive, expired');
  }

  const updateData = { subscriptionStatus };
  
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
  const organization = new Organization(organizationData);
  await organization.save();
  
  return await Organization.findById(organization._id)
    .populate('admin', 'name email role')
    .populate('psychologists', 'name email role specialization')
    .lean();
};

export const updateOrganization = async (organizationId, updateData) => {
  const organization = await Organization.findByIdAndUpdate(
    organizationId,
    updateData,
    { new: true, runValidators: true }
  ).populate('admin', 'name email role')
   .populate('psychologists', 'name email role specialization')
   .populate('patients', 'name email phone')
   .lean();

  if (!organization) {
    throw new Error('Organization not found');
  }

  return organization;
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
    subscriptionStatus: organization.subscriptionStatus,
    subscriptionStartDate: organization.subscriptionStartDate,
    subscriptionEndDate: organization.subscriptionEndDate,
    isSubscriptionExpired: organization.isSubscriptionExpired,
    daysRemaining: organization.daysRemaining,
    stats: {
      psychologists: psychologistCount,
      patients: patientCount,
      diagnoses: diagnosisCount
    }
  };
};

export const checkAndUpdateExpiredSubscriptions = async () => {
  const now = new Date();
  
  // Find organizations with expired subscriptions that are still marked as active
  const expiredOrganizations = await Organization.find({
    subscriptionStatus: 'active',
    subscriptionEndDate: { $lt: now }
  });

  if (expiredOrganizations.length > 0) {
    // Update all expired organizations
    await Organization.updateMany(
      { _id: { $in: expiredOrganizations.map(org => org._id) } },
      { subscriptionStatus: 'expired' }
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
      subscriptionStatus: 'active',
      subscriptionStartDate: now,
      subscriptionEndDate: endDate
    },
    { new: true, runValidators: true }
  ).populate('admin', 'name email role');

  return updatedOrganization;
};
