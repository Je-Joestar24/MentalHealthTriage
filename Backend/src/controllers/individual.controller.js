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
 * PATCH /api/admin/individuals/:id
 * Update psychologist account details
 * Can update: subscriptionEndDate, email, name, password, organization
 */
export const updatePsychologist = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Validate that at least one field is being updated
  const allowedFields = ['subscriptionEndDate', 'email', 'name', 'password', 'organization'];
  const hasValidField = allowedFields.some(field => updateData.hasOwnProperty(field));

  if (!hasValidField) {
    return res.status(400).json({
      success: false,
      error: `At least one of the following fields must be provided: ${allowedFields.join(', ')}`
    });
  }

  const psychologist = await individualService.updatePsychologist(id, updateData);

  res.json({
    success: true,
    data: psychologist,
    message: 'Psychologist updated successfully'
  });
});

