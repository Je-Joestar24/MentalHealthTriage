import * as triageService from '../services/triage.service.js';
import asyncWrapper from '../middleware/async.wrapper.js';

/**
 * GET /api/psychologist/patients/:patientId/triage
 * Get all triage records for a patient
 */
// export const getTriageRecords = asyncWrapper(async (req, res) => {
//   const { patientId } = req.params;
//   const psychologistId = req.user._id || req.user.id;

//   const triages = await triageService.getTriageRecords(patientId, psychologistId);

//   res.json({
//     success: true,
//     data: triages,
//     count: triages.length
//   });
// });

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
 * Query params: symptoms (comma-separated or array), system (DSM-5 or ICD-10)
 */
export const matchDiagnoses = asyncWrapper(async (req, res) => {
  const { symptoms, system } = req.query;
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

  if (symptomsArray.length === 0) {
    return res.json({
      success: true,
      data: [],
      message: 'No symptoms provided'
    });
  }

  const matchedDiagnoses = await triageService.matchDiagnoses(symptomsArray, system, user);

  res.json({
    success: true,
    data: matchedDiagnoses,
    count: matchedDiagnoses.length,
    query: {
      symptoms: symptomsArray,
      system: system || 'all'
    }
  });
});

