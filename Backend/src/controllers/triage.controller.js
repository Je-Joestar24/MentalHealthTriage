import * as triageService from '../services/triage.service.js';
import asyncWrapper from '../middleware/async.wrapper.js';

/**
 * GET /api/psychologist/patients/:patientId/triage
 * Get all triage records for a patient with pagination, search, and sorting
 * Query params: page, limit, search, sortBy, sortOrder
 */
export const getTriageRecords = asyncWrapper(async (req, res) => {
  const { patientId } = req.params;
  const psychologistId = req.user._id || req.user.id;
  const queryParams = req.query;

  const result = await triageService.getTriageRecords(patientId, psychologistId, queryParams);

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
 */
// export const getTriageById = asyncWrapper(async (req, res) => {
//   const { patientId, triageId } = req.params;
//   const psychologistId = req.user._id || req.user.id;

//   const triage = await triageService.getTriageById(triageId, patientId, psychologistId);

//   res.json({
//     success: true,
//     data: triage
//   });
// });

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
 * Match diagnoses based on symptoms
 * Query params: symptoms (comma-separated or array), system (DSM-5 or ICD-10), page, limit, showAll
 */
export const matchDiagnoses = asyncWrapper(async (req, res) => {
  const { symptoms, system, page, limit, showAll } = req.query;
  const user = req.user;

  // Parse symptoms from query
  let symptomsArray = [];
  if (symptoms) {
    if (Array.isArray(symptoms)) {
      symptomsArray = symptoms;
    } else if (typeof symptoms === 'string') {
      // Support comma-separated or space-separated
      symptomsArray = symptoms.split(/[,\s]+/).filter(s => s.trim().length > 0);
    }
  }

  // Also check body for symptoms (in case POST is used)
  if (req.body && req.body.symptoms && Array.isArray(req.body.symptoms)) {
    symptomsArray = req.body.symptoms;
  }

  // Build query params
  const queryParams = {
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 20,
    showAll: showAll === 'true' || showAll === true
  };

  // If no symptoms and showAll is false, return empty
  if (symptomsArray.length === 0 && !queryParams.showAll) {
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
      message: 'No symptoms provided'
    });
  }

  const result = await triageService.matchDiagnoses(symptomsArray, system, user, queryParams);

  res.json({
    success: true,
    data: result.diagnoses,
    pagination: result.pagination,
    count: result.diagnoses.length,
    query: {
      symptoms: symptomsArray,
      system: system || 'all',
      showAll: queryParams.showAll
    }
  });
});

