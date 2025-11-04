import User from '../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * Get all individual psychologists (no organization reference)
 * Supports search, sort, pagination, and filtering
 */
export const getAllIndividualPsychologists = async (queryParams) => {
  const {
    page = 1,
    limit = 5,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status = '', // Filter by subscription status: 'active', 'expired', 'inactive'
    isActive = '' // Filter by account status: 'true', 'false'
  } = queryParams;

  // Build filter object - only psychologists without organization
  const filter = {
    role: 'psychologist',
    organization: null
  };

  // Filter by account active status
  if (isActive !== '') {
    filter.isActive = isActive === 'true';
  }

  // Filter by subscription status (expired status at query level)
  if (status === 'expired') {
    filter.subscriptionEndDate = { $lt: new Date() };
  } else if (status === 'active') {
    // Active means not expired (either no end date or end date in future)
    filter.$or = [
      { subscriptionEndDate: null },
      { subscriptionEndDate: { $gte: new Date() } }
    ];
  }

  // Search by name or email (after status filter to avoid $or conflicts)
  // If status filter already uses $or, we need to combine with $and
  if (search) {
    const searchConditions = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    // If status filter created an $or, we need to combine properly
    if (filter.$or && status === 'active') {
      // We need to use $and to combine search with status filter
      const statusConditions = filter.$or;
      delete filter.$or;
      filter.$and = [
        { $or: statusConditions }, // Status conditions
        { $or: searchConditions }   // Search conditions
      ];
    } else {
      // No conflict, just add search
      filter.$or = searchConditions;
    }
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with pagination
  const psychologists = await User.find(filter)
    .select('name email subscriptionStartDate subscriptionEndDate isActive createdAt updatedAt')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Transform the psychologists to include effective status and days remaining
  const transformedPsychologists = psychologists.map(psychologist => {
    // Calculate effective status (expired if past end date)
    const isExpired = psychologist.subscriptionEndDate && new Date() > new Date(psychologist.subscriptionEndDate);
    const effectiveStatus = isExpired ? 'expired' : 'active';
    
    // Calculate days remaining
    let daysRemaining = null;
    if (psychologist.subscriptionEndDate) {
      const now = new Date();
      const endDate = new Date(psychologist.subscriptionEndDate);
      const diffTime = endDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysRemaining = Math.max(0, diffDays);
    }

    return {
      ...psychologist,
      effectiveStatus,
      isSubscriptionExpired: isExpired,
      daysRemaining
    };
  });

  // Get total count for pagination
  const total = await User.countDocuments(filter);

  return {
    psychologists: transformedPsychologists,
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

/**
 * Deactivate or reactivate a psychologist account
 */
export const updatePsychologistStatus = async (psychologistId, isActive) => {
  const psychologist = await User.findOneAndUpdate(
    { _id: psychologistId, role: 'psychologist', organization: null },
    { isActive },
    { new: true, runValidators: true }
  )
    .select('name email subscriptionStartDate subscriptionEndDate isActive createdAt updatedAt')
    .lean();

  if (!psychologist) {
    throw new Error('Individual psychologist not found');
  }

  // Calculate effective status
  const isExpired = psychologist.subscriptionEndDate && new Date() > new Date(psychologist.subscriptionEndDate);
  const effectiveStatus = isExpired ? 'expired' : 'active';
  
  let daysRemaining = null;
  if (psychologist.subscriptionEndDate) {
    const now = new Date();
    const endDate = new Date(psychologist.subscriptionEndDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, diffDays);
  }

  return {
    ...psychologist,
    effectiveStatus,
    isSubscriptionExpired: isExpired,
    daysRemaining
  };
};

/**
 * Update psychologist account details
 * Can update: subscriptionEndDate, email, name, password, organization
 */
export const updatePsychologist = async (psychologistId, updateData) => {
  const psychologist = await User.findOne({
    _id: psychologistId,
    role: 'psychologist',
    organization: null
  });

  if (!psychologist) {
    throw new Error('Individual psychologist not found');
  }

  // Prepare update object
  const updateFields = {};

  // Update subscription end date
  if (updateData.subscriptionEndDate !== undefined) {
    updateFields.subscriptionEndDate = updateData.subscriptionEndDate ? new Date(updateData.subscriptionEndDate) : null;
  }

  // Update email
  if (updateData.email !== undefined) {
    // Check if email already exists for another user
    const existingUser = await User.findOne({ 
      email: updateData.email.toLowerCase().trim(),
      _id: { $ne: psychologistId }
    });
    if (existingUser) {
      throw new Error('Email already exists');
    }
    updateFields.email = updateData.email.toLowerCase().trim();
  }

  // Update name
  if (updateData.name !== undefined) {
    updateFields.name = updateData.name.trim();
  }

  // Update password
  if (updateData.password !== undefined) {
    if (updateData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    const salt = await bcrypt.genSalt(10);
    updateFields.password = await bcrypt.hash(updateData.password, salt);
  }

  // Update organization (add to organization)
  if (updateData.organization !== undefined) {
    if (updateData.organization === null || updateData.organization === '') {
      // Remove from organization
      updateFields.organization = null;
    } else {
      // Add to organization
      updateFields.organization = updateData.organization;
    }
  }

  // Apply updates
  Object.assign(psychologist, updateFields);
  await psychologist.save();

  // Fetch updated psychologist with virtual fields
  const updatedPsychologist = await User.findById(psychologistId)
    .select('name email subscriptionStartDate subscriptionEndDate isActive organization createdAt updatedAt')
    .lean();

  // Calculate effective status
  const isExpired = updatedPsychologist.subscriptionEndDate && new Date() > new Date(updatedPsychologist.subscriptionEndDate);
  const effectiveStatus = isExpired ? 'expired' : 'active';
  
  let daysRemaining = null;
  if (updatedPsychologist.subscriptionEndDate) {
    const now = new Date();
    const endDate = new Date(updatedPsychologist.subscriptionEndDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, diffDays);
  }

  return {
    ...updatedPsychologist,
    effectiveStatus,
    isSubscriptionExpired: isExpired,
    daysRemaining
  };
};

