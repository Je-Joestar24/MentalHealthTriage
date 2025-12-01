import User from '../models/User.js';
import Triage from '../models/Triage.js';
import Diagnosis from '../models/Diagnosis.js';
import Organization from '../models/Organization.js';
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

/**
 * Create a new psychologist
 * @param {Object} psychologistData - Psychologist data
 * @param {string} psychologistData.name - Psychologist name
 * @param {string} psychologistData.email - Psychologist email
 * @param {string} psychologistData.password - Psychologist password (min 8 chars)
 * @param {string} psychologistData.organization - Optional organization ID
 * @param {Object} user - Current user making the request
 */
export const createPsychologist = async (psychologistData, user = null) => {
  const { name, email, password, organization: organizationId } = psychologistData;

  // Validate required fields
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }

  // Validate password length
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Determine organization
  let finalOrganizationId = null;
  if (organizationId) {
    // If organization ID is provided, validate it exists
    if (mongoose.Types.ObjectId.isValid(organizationId)) {
      const org = await Organization.findById(organizationId);
      if (!org) {
        throw new Error('Organization not found');
      }
      finalOrganizationId = organizationId;
    } else {
      throw new Error('Invalid organization ID');
    }
  } else if (user && user.role === 'company_admin' && user.organization) {
    // If company_admin is creating, assign to their organization
    finalOrganizationId = user.organization._id || user.organization;
  }

  // Create new psychologist
  const psychologist = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password, // Will be hashed by pre-save middleware
    role: 'psychologist',
    organization: finalOrganizationId,
    isActive: true,
  });

  await psychologist.save();

  // If organization is assigned, add psychologist to organization's psychologists array
  if (finalOrganizationId) {
    await Organization.findByIdAndUpdate(finalOrganizationId, {
      $addToSet: { psychologists: psychologist._id }
    });
  }

  // Return created psychologist without password
  const createdPsychologist = await User.findById(psychologist._id)
    .select('name email role organization specialization experience isActive createdAt updatedAt')
    .populate('organization', 'name')
    .lean();

  return createdPsychologist;
};

/**
 * Update a psychologist (only name, email, and password can be updated)
 * @param {string} psychologistId - Psychologist ID
 * @param {Object} updateData - Update data
 * @param {string} updateData.name - Updated name (optional)
 * @param {string} updateData.email - Updated email (optional)
 * @param {string} updateData.password - New password (optional, min 8 chars)
 * @param {Object} user - Current user making the request
 */
export const updatePsychologist = async (psychologistId, updateData, user = null) => {
  const { name, email, password } = updateData;

  // Validate that at least one field is provided
  if (!name && !email && !password) {
    throw new Error('At least one field (name, email, or password) must be provided for update');
  }

  // Validate psychologist exists and is a psychologist
  const psychologist = await User.findById(psychologistId);
  if (!psychologist) {
    throw new Error('Psychologist not found');
  }

  if (psychologist.role !== 'psychologist') {
    throw new Error('User is not a psychologist');
  }

  // If company_admin, verify psychologist belongs to their organization
  if (user && user.role === 'company_admin' && user.organization) {
    const userOrgId = user.organization._id || user.organization;
    const psychologistOrgId = psychologist.organization?._id || psychologist.organization;
    
    // Convert both to strings for comparison (handles both ObjectId and string)
    const userOrgIdStr = userOrgId?.toString();
    const psychologistOrgIdStr = psychologistOrgId?.toString();
    
    if (!psychologistOrgIdStr || psychologistOrgIdStr !== userOrgIdStr) {
      throw new Error('You can only update psychologists from your organization');
    }
  }

  // Update name if provided
  if (name !== undefined) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Name cannot be empty');
    }
    psychologist.name = trimmedName;
  }

  // Update email if provided
  if (email !== undefined) {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail) {
      throw new Error('Email cannot be empty');
    }
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: trimmedEmail,
      _id: { $ne: psychologistId }
    });
    if (existingUser) {
      throw new Error('Email already exists');
    }
    
    psychologist.email = trimmedEmail;
  }

  // Update password if provided
  if (password !== undefined) {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    psychologist.password = password; // Will be hashed by pre-save middleware
  }

  await psychologist.save();

  // Return updated psychologist without password
  const updatedPsychologist = await User.findById(psychologistId)
    .select('name email role organization specialization experience isActive createdAt updatedAt')
    .populate('organization', 'name')
    .lean();

  return updatedPsychologist;
};

/**
 * Delete a psychologist (soft delete by setting isActive to false)
 * @param {string} psychologistId - Psychologist ID
 * @param {Object} user - Current user making the request
 */
export const deletePsychologist = async (psychologistId, user = null) => {
  // Validate psychologist exists and is a psychologist
  const psychologist = await User.findById(psychologistId);
  if (!psychologist) {
    throw new Error('Psychologist not found');
  }

  if (psychologist.role !== 'psychologist') {
    throw new Error('User is not a psychologist');
  }

  // If company_admin, verify psychologist belongs to their organization
  if (user && user.role === 'company_admin' && user.organization) {
    const userOrgId = user.organization._id || user.organization;
    const psychologistOrgId = psychologist.organization?._id || psychologist.organization;
    
    // Convert both to strings for comparison (handles both ObjectId and string)
    const userOrgIdStr = userOrgId?.toString();
    const psychologistOrgIdStr = psychologistOrgId?.toString();
    
    if (!psychologistOrgIdStr || psychologistOrgIdStr !== userOrgIdStr) {
      throw new Error('You can only delete psychologists from your organization');
    }
  }

  // Soft delete: set isActive to false
  psychologist.isActive = false;
  await psychologist.save();

  // Remove from organization's psychologists array if applicable
  if (psychologist.organization) {
    await Organization.findByIdAndUpdate(psychologist.organization, {
      $pull: { psychologists: psychologistId }
    });
  }

  return {
    _id: psychologist._id,
    name: psychologist.name,
    email: psychologist.email,
    isActive: false,
    deletedAt: new Date()
  };
};

