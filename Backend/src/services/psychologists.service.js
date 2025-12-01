import User from '../models/User.js';
import Triage from '../models/Triage.js';
import Diagnosis from '../models/Diagnosis.js';
import mongoose from 'mongoose';

/**
 * Get list of psychologists with pagination, sorting, filtering, and search
 * Also includes counts of triages and diagnoses for each psychologist
 */
export const getPsychologists = async (queryParams = {}, user = null) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    isActive = '',
    organization = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = queryParams;

  // Build base filter - only psychologists
  const filter = { role: 'psychologist' };

  // Organization filter
  if (organization) {
    if (organization === 'null' || organization === 'none') {
      // Filter for psychologists without organization (individual accounts)
      filter.organization = null;
    } else if (mongoose.Types.ObjectId.isValid(organization)) {
      filter.organization = new mongoose.Types.ObjectId(organization);
    }
  } else if (user && user.role === 'company_admin' && user.organization) {
    // If company_admin, show only psychologists from their organization
    const organizationId = user.organization._id || user.organization;
    if (organizationId) {
      filter.organization = organizationId;
    }
  }
  // If no organization filter and user is not company_admin, show all psychologists

  // Active status filter
  if (isActive !== '') {
    filter.isActive = isActive === 'true';
  }

  // Search filter (by name or email)
  if (search) {
    const regex = { $regex: search, $options: 'i' };
    filter.$or = [
      { name: regex },
      { email: regex }
    ];
  }

  // Allowed sort fields
  const allowedSortFields = {
    name: 'name',
    email: 'email',
    createdAt: 'createdAt',
    isActive: 'isActive',
    specialization: 'specialization',
    experience: 'experience'
  };

  const sortField = allowedSortFields[sortBy] || 'createdAt';
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortDirection };

  // Calculate pagination
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  // Get total count
  const total = await User.countDocuments(filter);

  // Get psychologists with pagination
  const psychologists = await User.find(filter)
    .select('name email role organization specialization experience isActive createdAt updatedAt')
    .populate('organization', 'name')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit, 10))
    .lean();

  // Get psychologist IDs
  const psychologistIds = psychologists.map(p => p._id);

  // Initialize maps with zeros for all psychologists
  const triageCountMap = {};
  const diagnosisCountMap = {};
  psychologists.forEach(psychologist => {
    const id = psychologist._id.toString();
    triageCountMap[id] = 0;
    diagnosisCountMap[id] = 0;
  });

  // Aggregate triage and diagnosis counts only if there are psychologists
  if (psychologistIds.length > 0) {
    const [triageCounts, diagnosisCounts] = await Promise.all([
      Triage.aggregate([
        {
          $match: {
            psychologist: { $in: psychologistIds }
          }
        },
        {
          $group: {
            _id: '$psychologist',
            count: { $sum: 1 }
          }
        }
      ]),
      Diagnosis.aggregate([
        {
          $match: {
            createdBy: { $in: psychologistIds },
            type: 'personal'
          }
        },
        {
          $group: {
            _id: '$createdBy',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Update maps with actual counts
    triageCounts.forEach(item => {
      triageCountMap[item._id.toString()] = item.count;
    });

    diagnosisCounts.forEach(item => {
      diagnosisCountMap[item._id.toString()] = item.count;
    });
  }

  // Add counts to each psychologist
  const psychologistsWithCounts = psychologists.map(psychologist => ({
    ...psychologist,
    triageCount: triageCountMap[psychologist._id.toString()] || 0,
    diagnosisCount: diagnosisCountMap[psychologist._id.toString()] || 0
  }));

  return {
    psychologists: psychologistsWithCounts,
    pagination: {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: skip + parseInt(limit, 10) < total,
      hasPrevPage: parseInt(page, 10) > 1
    }
  };
};

