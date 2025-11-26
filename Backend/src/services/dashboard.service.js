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

/**
 * Get dashboard statistics for a company admin
 * Returns comprehensive organization-wide statistics including psychologists, patients, triages, diagnoses, and activity metrics
 */
export const getCompanyAdminDashboardStats = async (companyAdminId) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Find the organization where this user is the admin
  const organization = await Organization.findOne({ admin: companyAdminId })
    .populate('admin', 'name email role')
    .lean();

  if (!organization) {
    throw new Error('Organization not found or you are not the admin of any organization');
  }

  const organizationId = organization._id;

  // Get all patient IDs for this organization
  const organizationPatients = await Patient.find({ organization: organizationId })
    .select('_id')
    .lean();
  const patientIds = organizationPatients.map(p => p._id);

  // Get all psychologist IDs in the organization
  const organizationPsychologists = await User.find({
    organization: organizationId,
    role: 'psychologist'
  })
    .select('_id')
    .lean();
  const psychologistIds = organizationPsychologists.map(p => p._id);

  // Organization details
  const isExpired = organization.subscriptionEndDate && new Date() > new Date(organization.subscriptionEndDate);
  const effectiveStatus = isExpired ? 'expired' : organization.subscriptionStatus;
  const endDate = organization.subscriptionEndDate;
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, diffDays);

  // Psychologists statistics
  const [
    totalPsychologists,
    activePsychologists,
    inactivePsychologists,
    recentPsychologists,
    psychologistsList
  ] = await Promise.all([
    User.countDocuments({ organization: organizationId, role: 'psychologist' }),
    User.countDocuments({ organization: organizationId, role: 'psychologist', isActive: true }),
    User.countDocuments({ organization: organizationId, role: 'psychologist', isActive: false }),
    User.countDocuments({
      organization: organizationId,
      role: 'psychologist',
      createdAt: { $gte: thirtyDaysAgo }
    }),
    User.find({ organization: organizationId, role: 'psychologist' })
      .select('name email specialization experience isActive createdAt')
      .sort({ createdAt: -1 })
      .lean()
  ]);

  // Patients statistics
  const [
    totalPatients,
    activePatients,
    inactivePatients,
    deletedPatients,
    recentPatients,
    patientsByGender
  ] = await Promise.all([
    Patient.countDocuments({ organization: organizationId }),
    Patient.countDocuments({ organization: organizationId, status: 'active', isDeleted: false }),
    Patient.countDocuments({ organization: organizationId, status: 'inactive', isDeleted: false }),
    Patient.countDocuments({ organization: organizationId, isDeleted: true }),
    Patient.countDocuments({ organization: organizationId, createdAt: { $gte: thirtyDaysAgo } }),
    Patient.aggregate([
      { $match: { organization: organizationId, isDeleted: false } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ])
  ]);

  // Triage statistics
  const triageFilter = patientIds.length > 0 ? { patient: { $in: patientIds } } : { _id: null }; // Empty filter if no patients
  const [
    totalTriages,
    triagesBySeverity,
    triagesToday,
    triagesThisWeek,
    triagesThisMonth,
    triagesThisYear,
    recentTriages
  ] = await Promise.all([
    patientIds.length > 0 ? Triage.countDocuments(triageFilter) : Promise.resolve(0),
    patientIds.length > 0 ? {
      low: Triage.countDocuments({ ...triageFilter, severityLevel: 'low' }),
      moderate: Triage.countDocuments({ ...triageFilter, severityLevel: 'moderate' }),
      high: Triage.countDocuments({ ...triageFilter, severityLevel: 'high' })
    } : Promise.resolve({ low: 0, moderate: 0, high: 0 }),
    patientIds.length > 0 ? Triage.countDocuments({ ...triageFilter, createdAt: { $gte: startOfToday } }) : Promise.resolve(0),
    patientIds.length > 0 ? Triage.countDocuments({ ...triageFilter, createdAt: { $gte: startOfWeek } }) : Promise.resolve(0),
    patientIds.length > 0 ? Triage.countDocuments({ ...triageFilter, createdAt: { $gte: startOfMonth } }) : Promise.resolve(0),
    patientIds.length > 0 ? Triage.countDocuments({ ...triageFilter, createdAt: { $gte: startOfYear } }) : Promise.resolve(0),
    patientIds.length > 0 ? Triage.find(triageFilter)
      .populate('patient', 'name age gender')
      .populate('psychologist', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean() : Promise.resolve([])
  ]);

  // Resolve severity counts if they're promises
  const resolvedSeverity = await Promise.all([
    triagesBySeverity.low,
    triagesBySeverity.moderate,
    triagesBySeverity.high
  ]);

  // Diagnosis statistics
  const [
    organizationDiagnoses,
    globalDiagnoses,
    personalDiagnosesFromOrg,
    accessibleDiagnoses,
    recentOrganizationDiagnoses
  ] = await Promise.all([
    Diagnosis.countDocuments({ type: 'organization', createdBy: companyAdminId }),
    Diagnosis.countDocuments({ type: 'global' }),
    psychologistIds.length > 0 ? Diagnosis.countDocuments({
      type: 'personal',
      createdBy: { $in: psychologistIds }
    }) : Promise.resolve(0),
    Diagnosis.countDocuments({
      $or: [
        { type: 'global' },
        { type: 'organization', createdBy: companyAdminId },
        ...(psychologistIds.length > 0 ? [{ type: 'personal', createdBy: { $in: psychologistIds } }] : [])
      ]
    }),
    Diagnosis.countDocuments({
      type: 'organization',
      createdBy: companyAdminId,
      createdAt: { $gte: thirtyDaysAgo }
    })
  ]);

  // Activity metrics
  // Patients with most triages (top 5)
  const patientsWithMostTriages = patientIds.length > 0 ? await Patient.aggregate([
    {
      $match: {
        organization: organizationId,
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
  ]) : [];

  // Top psychologists by triage count
  const topPsychologistsByTriages = psychologistIds.length > 0 && patientIds.length > 0 ? await Triage.aggregate([
    {
      $match: {
        patient: { $in: patientIds },
        psychologist: { $in: psychologistIds }
      }
    },
    {
      $group: {
        _id: '$psychologist',
        triageCount: { $sum: 1 }
      }
    },
    {
      $sort: { triageCount: -1 }
    },
    {
      $limit: 5
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'psychologist'
      }
    },
    {
      $unwind: '$psychologist'
    },
    {
      $project: {
        _id: 0,
        psychologistId: '$_id',
        name: '$psychologist.name',
        email: '$psychologist.email',
        triageCount: 1
      }
    }
  ]) : [];

  // Average triages per patient
  const patientsWithTriages = await Patient.countDocuments({
    organization: organizationId,
    triageRecords: { $exists: true, $ne: [] },
    isDeleted: false
  });
  const averageTriagesPerPatient = patientsWithTriages > 0
    ? (totalTriages / patientsWithTriages).toFixed(2)
    : 0;

  // Monthly triage trend (last 6 months)
  const monthlyTriageTrend = patientIds.length > 0 ? await Triage.aggregate([
    {
      $match: {
        patient: { $in: patientIds },
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
  ]) : [];

  // Patients by age groups
  const patientsByAgeGroup = await Patient.aggregate([
    {
      $match: {
        organization: organizationId,
        isDeleted: false
      }
    },
    {
      $project: {
        ageGroup: {
          $switch: {
            branches: [
              { case: { $lt: ['$age', 18] }, then: '0-17' },
              { case: { $lt: ['$age', 25] }, then: '18-24' },
              { case: { $lt: ['$age', 35] }, then: '25-34' },
              { case: { $lt: ['$age', 45] }, then: '35-44' },
              { case: { $lt: ['$age', 55] }, then: '45-54' },
              { case: { $lt: ['$age', 65] }, then: '55-64' },
              { case: { $gte: ['$age', 65] }, then: '65+' }
            ],
            default: 'unknown'
          }
        }
      }
    },
    {
      $group: {
        _id: '$ageGroup',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return {
    organization: {
      _id: organization._id,
      name: organization.name,
      psychologistSeats: organization.psychologistSeats,
      subscriptionStatus: organization.subscriptionStatus,
      subscriptionStartDate: organization.subscriptionStartDate,
      subscriptionEndDate: organization.subscriptionEndDate,
      effectiveStatus,
      isSubscriptionExpired: isExpired,
      daysRemaining,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      admin: organization.admin
    },
    psychologists: {
      total: totalPsychologists,
      active: activePsychologists,
      inactive: inactivePsychologists,
      recent: recentPsychologists, // Last 30 days
      seats: {
        total: organization.psychologistSeats,
        taken: totalPsychologists,
        available: Math.max(0, organization.psychologistSeats - totalPsychologists),
        utilization: organization.psychologistSeats > 0
          ? ((totalPsychologists / organization.psychologistSeats) * 100).toFixed(2)
          : 0
      },
      list: psychologistsList.map(p => ({
        _id: p._id,
        name: p.name,
        email: p.email,
        specialization: p.specialization || '',
        experience: p.experience || 0,
        isActive: p.isActive,
        createdAt: p.createdAt
      }))
    },
    patients: {
      total: totalPatients,
      active: activePatients,
      inactive: inactivePatients,
      deleted: deletedPatients,
      recent: recentPatients, // Last 30 days
      byGender: patientsByGender.reduce((acc, item) => {
        acc[item._id || 'other'] = item.count;
        return acc;
      }, {}),
      byAgeGroup: patientsByAgeGroup.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    },
    triages: {
      total: totalTriages,
      bySeverity: {
        low: resolvedSeverity[0],
        moderate: resolvedSeverity[1],
        high: resolvedSeverity[2]
      },
      today: triagesToday,
      thisWeek: triagesThisWeek,
      thisMonth: triagesThisMonth,
      thisYear: triagesThisYear,
      averagePerPatient: parseFloat(averageTriagesPerPatient)
    },
    diagnoses: {
      organization: organizationDiagnoses,
      global: globalDiagnoses,
      personalFromOrg: personalDiagnosesFromOrg,
      accessible: accessibleDiagnoses, // Global + organization + personal from org psychologists
      recent: recentOrganizationDiagnoses // Last 30 days
    },
    activity: {
      patientsWithMostTriages: patientsWithMostTriages.map(p => ({
        name: p.name,
        age: p.age,
        gender: p.gender,
        triageCount: p.triageCount
      })),
      topPsychologistsByTriages: topPsychologistsByTriages,
      recentTriages: recentTriages.map(t => ({
        _id: t._id,
        patient: t.patient ? {
          _id: t.patient._id,
          name: t.patient.name,
          age: t.patient.age,
          gender: t.patient.gender
        } : null,
        psychologist: t.psychologist ? {
          _id: t.psychologist._id,
          name: t.psychologist.name,
          email: t.psychologist.email
        } : null,
        severityLevel: t.severityLevel,
        symptomsCount: t.symptoms?.length || 0,
        createdAt: t.createdAt
      })),
      monthlyTrend: monthlyTriageTrend
    },
    summary: {
      totalPsychologists,
      totalPatients,
      totalTriages,
      activePsychologists,
      activePatients,
      triagesThisMonth,
      organizationDiagnoses,
      accessibleDiagnoses,
      daysRemaining,
      effectiveStatus
    }
  };
};

