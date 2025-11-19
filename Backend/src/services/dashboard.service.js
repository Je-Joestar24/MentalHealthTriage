import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Diagnosis from '../models/Diagnosis.js';
import Patient from '../models/Patient.js';
import Triage from '../models/Triage.js';

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

/**
 * Get dashboard statistics for a psychologist
 * Returns counts for patients, triages, diagnoses, and activity metrics
 */
export const getPsychologistDashboardStats = async (psychologistId) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Patient counts
  const totalPatients = await Patient.countDocuments({
    assignedPsychologist: psychologistId
  });

  const activePatients = await Patient.countDocuments({
    assignedPsychologist: psychologistId,
    status: 'active',
    isDeleted: false
  });

  const inactivePatients = await Patient.countDocuments({
    assignedPsychologist: psychologistId,
    status: 'inactive',
    isDeleted: false
  });

  const deletedPatients = await Patient.countDocuments({
    assignedPsychologist: psychologistId,
    isDeleted: true
  });

  // Recent patients (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentPatients = await Patient.countDocuments({
    assignedPsychologist: psychologistId,
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Triage counts
  const totalTriages = await Triage.countDocuments({
    psychologist: psychologistId
  });

  const triagesBySeverity = {
    low: await Triage.countDocuments({
      psychologist: psychologistId,
      severityLevel: 'low'
    }),
    moderate: await Triage.countDocuments({
      psychologist: psychologistId,
      severityLevel: 'moderate'
    }),
    high: await Triage.countDocuments({
      psychologist: psychologistId,
      severityLevel: 'high'
    })
  };

  // Recent triages
  const triagesToday = await Triage.countDocuments({
    psychologist: psychologistId,
    createdAt: { $gte: startOfToday }
  });

  const triagesThisWeek = await Triage.countDocuments({
    psychologist: psychologistId,
    createdAt: { $gte: startOfWeek }
  });

  const triagesThisMonth = await Triage.countDocuments({
    psychologist: psychologistId,
    createdAt: { $gte: startOfMonth }
  });

  const triagesThisYear = await Triage.countDocuments({
    psychologist: psychologistId,
    createdAt: { $gte: startOfYear }
  });

  // Diagnosis counts (personal diagnoses created by this psychologist)
  const totalPersonalDiagnoses = await Diagnosis.countDocuments({
    type: 'personal',
    createdBy: psychologistId
  });

  // Get accessible diagnoses count (global + organization + personal)
  const psychologist = await User.findById(psychologistId).lean();
  const accessibleDiagnosesFilter = {
    $or: [
      { type: 'global' },
      ...(psychologist?.organization ? [{ type: 'organization', organization: psychologist.organization }] : []),
      { type: 'personal', createdBy: psychologistId }
    ]
  };
  const accessibleDiagnoses = await Diagnosis.countDocuments(accessibleDiagnosesFilter);

  // Recent diagnoses created
  const recentPersonalDiagnoses = await Diagnosis.countDocuments({
    type: 'personal',
    createdBy: psychologistId,
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Activity metrics
  // Patients with most triages (top 5)
  const patientsWithMostTriages = await Patient.aggregate([
    {
      $match: {
        assignedPsychologist: psychologistId,
        isDeleted: false
      }
    },
    {
      $project: {
        name: 1,
        age: 1,
        gender: 1,
        triageCount: { $size: { $ifNull: ['$triageRecords', []] } }
      }
    },
    {
      $sort: { triageCount: -1 }
    },
    {
      $limit: 5
    }
  ]);

  // Recent triages (last 5)
  const recentTriages = await Triage.find({
    psychologist: psychologistId
  })
    .populate('patient', 'name age gender')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Average triages per patient
  const patientsWithTriages = await Patient.countDocuments({
    assignedPsychologist: psychologistId,
    triageRecords: { $exists: true, $ne: [] },
    isDeleted: false
  });
  const averageTriagesPerPatient = patientsWithTriages > 0 
    ? (totalTriages / patientsWithTriages).toFixed(2)
    : 0;

  // Monthly triage trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyTriageTrend = await Triage.aggregate([
    {
      $match: {
        psychologist: psychologistId,
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            { $cond: [{ $lt: ['$_id.month', 10] }, '0', ''] },
            { $toString: '$_id.month' }
          ]
        },
        count: 1
      }
    }
  ]);

  return {
    patients: {
      total: totalPatients,
      active: activePatients,
      inactive: inactivePatients,
      deleted: deletedPatients,
      recent: recentPatients // Last 30 days
    },
    triages: {
      total: totalTriages,
      bySeverity: triagesBySeverity,
      today: triagesToday,
      thisWeek: triagesThisWeek,
      thisMonth: triagesThisMonth,
      thisYear: triagesThisYear,
      averagePerPatient: parseFloat(averageTriagesPerPatient)
    },
    diagnoses: {
      personal: totalPersonalDiagnoses,
      accessible: accessibleDiagnoses, // Global + organization + personal
      recent: recentPersonalDiagnoses // Last 30 days
    },
    activity: {
      patientsWithMostTriages: patientsWithMostTriages.map(p => ({
        name: p.name,
        age: p.age,
        gender: p.gender,
        triageCount: p.triageCount
      })),
      recentTriages: recentTriages.map(t => ({
        _id: t._id,
        patient: t.patient ? {
          name: t.patient.name,
          age: t.patient.age,
          gender: t.patient.gender
        } : null,
        severityLevel: t.severityLevel,
        symptomsCount: t.symptoms?.length || 0,
        createdAt: t.createdAt
      })),
      monthlyTrend: monthlyTriageTrend
    },
    summary: {
      totalPatients: totalPatients,
      totalTriages: totalTriages,
      totalPersonalDiagnoses: totalPersonalDiagnoses,
      activePatients: activePatients,
      triagesThisMonth: triagesThisMonth
    }
  };
};

