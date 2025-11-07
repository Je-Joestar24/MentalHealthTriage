import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Diagnosis from '../models/Diagnosis.js';

/**
 * Get dashboard statistics/counts
 * Returns various counts for organizations, individuals, and diagnoses
 */
export const getDashboardStats = async () => {
  const now = new Date();

  // Organizations counts
  const totalOrganizations = await Organization.countDocuments();
  
  // Active organizations: subscriptionStatus = 'active' AND not expired
  const activeOrganizations = await Organization.countDocuments({
    subscriptionStatus: 'active',
    subscriptionEndDate: { $gte: now }
  });

  // Expired organizations: past subscriptionEndDate
  const expiredOrganizations = await Organization.countDocuments({
    subscriptionEndDate: { $lt: now }
  });

  // Inactive organizations: subscriptionStatus = 'inactive'
  const inactiveOrganizations = await Organization.countDocuments({
    subscriptionStatus: 'inactive'
  });

  // Individual Accounts counts (psychologists without organization)
  const totalIndividualAccounts = await User.countDocuments({
    role: 'psychologist',
    organization: null
  });

  // Active individual accounts: isActive = true AND not expired
  const activeIndividualAccounts = await User.countDocuments({
    role: 'psychologist',
    organization: null,
    isActive: true,
    $or: [
      { subscriptionEndDate: null }, // Unlimited subscription
      { subscriptionEndDate: { $gte: now } } // Not expired
    ]
  });

  // Expired individual accounts: past subscriptionEndDate
  const expiredIndividualAccounts = await User.countDocuments({
    role: 'psychologist',
    organization: null,
    subscriptionEndDate: { $lt: now }
  });

  // Inactive individual accounts: isActive = false
  const inactiveIndividualAccounts = await User.countDocuments({
    role: 'psychologist',
    organization: null,
    isActive: false
  });

  // Diagnosis counts
  const totalDiagnoses = await Diagnosis.countDocuments();

  // Global diagnoses
  const globalDiagnoses = await Diagnosis.countDocuments({
    type: 'global'
  });

  // Organization diagnoses
  const organizationDiagnoses = await Diagnosis.countDocuments({
    type: 'organization'
  });

  // Personal diagnoses
  const personalDiagnoses = await Diagnosis.countDocuments({
    type: 'personal'
  });

  // Additional useful counts
  // Total users (all roles)
  const totalUsers = await User.countDocuments();

  // Total psychologists (both individual and organization-based)
  const totalPsychologists = await User.countDocuments({
    role: 'psychologist'
  });

  // Organization-based psychologists
  const organizationPsychologists = await User.countDocuments({
    role: 'psychologist',
    organization: { $ne: null }
  });

  // Company admins
  const companyAdmins = await User.countDocuments({
    role: 'company_admin'
  });

  // Super admins
  const superAdmins = await User.countDocuments({
    role: 'super_admin'
  });

  return {
    organizations: {
      total: totalOrganizations,
      active: activeOrganizations,
      expired: expiredOrganizations,
      inactive: inactiveOrganizations
    },
    individualAccounts: {
      total: totalIndividualAccounts,
      active: activeIndividualAccounts,
      expired: expiredIndividualAccounts,
      inactive: inactiveIndividualAccounts
    },
    diagnoses: {
      total: totalDiagnoses,
      global: globalDiagnoses,
      organization: organizationDiagnoses,
      personal: personalDiagnoses
    },
    users: {
      total: totalUsers,
      psychologists: totalPsychologists,
      organizationPsychologists: organizationPsychologists,
      individualPsychologists: totalIndividualAccounts, // Same as individual accounts
      companyAdmins: companyAdmins,
      superAdmins: superAdmins
    }
  };
};

