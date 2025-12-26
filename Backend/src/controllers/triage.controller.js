import * as triageService from '../services/triage.service.js';
import asyncWrapper from '../middleware/async.wrapper.js';

/**
 * GET /api/psychologist/patients/:patientId/triage
 * Get all triage records for a patient with pagination, search, and sorting
 * Query params: page, limit, search, sortBy, sortOrder
 */
export const getTriageRecords = asyncWrapper(async (req, res) => {
  const { patientId } = req.params;
  const user = req.user;
  const queryParams = req.query;

  const result = await triageService.getTriageRecords(patientId, user, queryParams);

  res.json({
    success: true,
    data: result.triages,
    pagination: result.pagination,
    count: result.triages.length
  });
});

/**
 * GET /api/psychologist/patients/:patientId/triage/:triageId
 * Get a single triage record
 * Supports both psychologist and company_admin access
 */
export const getTriageById = asyncWrapper(async (req, res) => {
  const { patientId, triageId } = req.params;
  const user = req.user;

  const triage = await triageService.getTriageById(triageId, patientId, user);

  res.json({
    success: true,
    data: triage
  });
});

/**
 * POST /api/psychologist/patients/:patientId/triage
 * Create a new triage record
 */
export const createTriage = asyncWrapper(async (req, res) => {
  const { patientId } = req.params;
  const psychologistId = req.user._id || req.user.id;
  const triageData = req.body;

  // Validate required fields
  if (!triageData.severityLevel) {
    return res.status(400).json({
      success: false,
      error: 'Severity level is required'
    });
  }

  if (!Array.isArray(triageData.symptoms)) {
    return res.status(400).json({
      success: false,
      error: 'Symptoms must be an array'
    });
  }

  const triage = await triageService.createTriage(patientId, triageData, psychologistId);

  res.status(201).json({
    success: true,
    data: triage,
    message: 'Triage record created successfully'
  });
});

/**
 * POST /api/psychologist/patients/:patientId/triage/:triageId/duplicate
 * Duplicate a triage record (create a copy with optional modifications)
 * The original triage remains unchanged - this creates a new record
 */
export const duplicateTriage = asyncWrapper(async (req, res) => {
  const { patientId, triageId } = req.params;
  const psychologistId = req.user._id || req.user.id;
  const updateData = req.body;

  // Validate symptoms if provided
  if (updateData.symptoms !== undefined && !Array.isArray(updateData.symptoms)) {
    return res.status(400).json({
      success: false,
      error: 'Symptoms must be an array'
    });
  }

  // Validate severity level if provided
  if (updateData.severityLevel !== undefined && !['low', 'moderate', 'high'].includes(updateData.severityLevel)) {
    return res.status(400).json({
      success: false,
      error: 'Severity level must be low, moderate, or high'
    });
  }

  const newTriage = await triageService.duplicateTriage(triageId, patientId, updateData, psychologistId);

  res.status(201).json({
    success: true,
    data: newTriage,
    message: 'Triage record duplicated successfully'
  });
});

/**
 * PUT /api/psychologist/patients/:patientId/triage/:triageId
 * Update a triage record
 */
// export const updateTriage = asyncWrapper(async (req, res) => {
//   const { patientId, triageId } = req.params;
//   const psychologistId = req.user._id || req.user.id;
//   const updateData = req.body;

//   // Validate symptoms if provided
//   if (updateData.symptoms !== undefined && !Array.isArray(updateData.symptoms)) {
//     return res.status(400).json({
//       success: false,
//       error: 'Symptoms must be an array'
//     });
//   }

//   const triage = await triageService.updateTriage(triageId, patientId, updateData, psychologistId);

//   res.json({
//     success: true,
//     data: triage,
//     message: 'Triage record updated successfully'
//   });
// });

/**
 * DELETE /api/psychologist/patients/:patientId/triage/:triageId
 * Delete a triage record
 */
// export const deleteTriage = asyncWrapper(async (req, res) => {
//   const { patientId, triageId } = req.params;
//   const psychologistId = req.user._id || req.user.id;

//   await triageService.deleteTriage(triageId, patientId, psychologistId);

//   res.json({
//     success: true,
//     message: 'Triage record deleted successfully'
//   });
// });

/**
 * GET /api/psychologist/triage/match-diagnoses
 * Match diagnoses based on symptoms and triage filters
 * Query params: symptoms (comma-separated or array), system (DSM-5 or ICD-10), page, limit, showAll
 * Triage filters: duration, durationUnit, course, severityLevel, preliminaryDiagnosis, notes
 */
export const matchDiagnoses = asyncWrapper(async (req, res) => {
  // Extract from query params
  const { symptoms: querySymptoms, system, page, limit, showAll } = req.query;
  let { duration, durationUnit, course, severityLevel, preliminaryDiagnosis, notes } = req.query;
  const user = req.user;

  // Parse symptoms from query
  let symptomsArray = [];
  if (querySymptoms) {
    if (Array.isArray(querySymptoms)) {
      symptomsArray = querySymptoms;
    } else if (typeof querySymptoms === 'string') {
      // Support comma-separated or space-separated
      symptomsArray = querySymptoms.split(/[,\s]+/).filter(s => s.trim().length > 0);
    }
  }

  // Also check body for symptoms and triage filters (in case POST is used)
  if (req.body) {
    if (req.body.symptoms && Array.isArray(req.body.symptoms)) {
      symptomsArray = req.body.symptoms;
    }
    // Override query params with body params if provided
    if (req.body.duration !== undefined) duration = req.body.duration;
    if (req.body.durationUnit !== undefined) durationUnit = req.body.durationUnit;
    if (req.body.course !== undefined) course = req.body.course;
    if (req.body.severityLevel !== undefined) severityLevel = req.body.severityLevel;
    if (req.body.preliminaryDiagnosis !== undefined) preliminaryDiagnosis = req.body.preliminaryDiagnosis;
    if (req.body.notes !== undefined) notes = req.body.notes;
  }

  // Build query params
  const queryParams = {
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 20,
    showAll: showAll === 'true' || showAll === true
  };

  // Build triage filters
  const triageFilters = {};
  if (duration !== undefined && duration !== null && duration !== '') {
    triageFilters.duration = parseFloat(duration);
  }
  if (durationUnit) {
    triageFilters.durationUnit = durationUnit;
  }
  if (course) {
    triageFilters.course = course;
  }
  if (severityLevel) {
    triageFilters.severityLevel = severityLevel;
  }
  if (preliminaryDiagnosis) {
    triageFilters.preliminaryDiagnosis = preliminaryDiagnosis;
  }
  if (notes) {
    triageFilters.notes = notes;
  }

  // If no symptoms and showAll is false, return empty
  if (symptomsArray.length === 0 && !queryParams.showAll && Object.keys(triageFilters).length === 0) {
    return res.json({
      success: true,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: queryParams.limit,
        hasNextPage: false,
        hasPrevPage: false
      },
      count: 0,
      query: {
        symptoms: symptomsArray,
        system: system || 'all',
        showAll: queryParams.showAll,
        filters: triageFilters
      }
    });
  }

  const result = await triageService.matchDiagnoses(symptomsArray, system, user, queryParams, triageFilters);

  res.json({
    success: true,
    data: result.diagnoses,
    pagination: result.pagination,
    count: result.diagnoses.length,
    query: {
      symptoms: symptomsArray,
      system: system || 'all',
      showAll: queryParams.showAll,
      filters: triageFilters
    }
  });
});

