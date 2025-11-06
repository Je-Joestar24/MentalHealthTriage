import * as individualService from '../services/individual.service.js';
import asyncWrapper from '../middleware/async.wrapper.js';

/**
 * GET /api/admin/individuals
 * Get all individual psychologists with pagination, search, sort, and filter
 */
export const getAllIndividualPsychologists = asyncWrapper(async (req, res) => {
  const result = await individualService.getAllIndividualPsychologists(req.query);
  
  res.json({
    success: true,
    data: result.psychologists,
    pagination: result.pagination
  });
});

/**
 * PATCH /api/admin/individuals/:id/status
 * Deactivate or reactivate a psychologist account
 */
export const updatePsychologistStatus = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'isActive must be a boolean value (true or false)'
    });
  }

  const psychologist = await individualService.updatePsychologistStatus(id, isActive);

  res.json({
    success: true,
    data: psychologist,
    message: `Psychologist account ${isActive ? 'activated' : 'deactivated'} successfully`
  });
});

/**
 * POST /api/admin/individuals
 * Create a new individual psychologist account
 */
export const createIndividualPsychologist = asyncWrapper(async (req, res) => {
  const { name, email, password, months } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, and password are required'
    });
  }

  // Validate months
  if (months === undefined || months === null || months < 0) {
    return res.status(400).json({
      success: false,
      error: 'Months must be a non-negative number (0 for unlimited subscription)'
    });
  }

  try {
    const psychologist = await individualService.createIndividualPsychologist({
      name,
      email,
      password,
      months
    });

    res.status(201).json({
      success: true,
      data: psychologist,
      message: 'Individual psychologist account created successfully'
    });
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }
    throw error;
  }
});

/**
 * PATCH /api/admin/individuals/:id/extend
 * Extend subscription months for an individual psychologist
 */
export const extendSubscriptionMonths = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { months } = req.body;

  // Validate months
  if (!months || months <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Months must be a positive number'
    });
  }

  try {
    const psychologist = await individualService.extendSubscriptionMonths(id, months);

    res.json({
      success: true,
      data: psychologist,
      message: `Subscription extended by ${months} month(s) successfully`
    });
  } catch (error) {
    if (error.message === 'Individual psychologist not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    throw error;
  }
});

/**
 * PATCH /api/admin/individuals/:id
 * Update psychologist account details
 * Can update: email, name, password only
 */
export const updatePsychologist = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Validate that at least one field is being updated
  const allowedFields = ['email', 'name', 'password'];
  const hasValidField = allowedFields.some(field => updateData.hasOwnProperty(field));

  if (!hasValidField) {
    return res.status(400).json({
      success: false,
      error: `At least one of the following fields must be provided: ${allowedFields.join(', ')}`
    });
  }

  try {
    const psychologist = await individualService.updatePsychologist(id, updateData);

    res.json({
      success: true,
      data: psychologist,
      message: 'Psychologist updated successfully'
    });
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }
    if (error.message === 'Password must be at least 8 characters long') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    throw error;
  }
});

