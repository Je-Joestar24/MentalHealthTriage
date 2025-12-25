import express from 'express';
import {
  getTriageRecords,
//   getTriageById,
  createTriage,
//   updateTriage,
//   deleteTriage,
  matchDiagnoses
} from '../controllers/triage.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware to ensure user is a psychologist or company_admin
const requirePsychologistOrCompanyAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'psychologist' && req.user.role !== 'company_admin')) {
    return res.status(403).json({ success: false, error: 'Psychologist or company admin access required' });
  }
  next();
};

// Middleware to ensure user is a psychologist (for write operations)
const requirePsychologist = (req, res, next) => {
  if (!req.user || req.user.role !== 'psychologist') {
    return res.status(403).json({ success: false, error: 'Psychologist access required' });
  }
  next();
};

router.use(authenticateToken);

// GET /api/psychologist/triage/match-diagnoses - Match diagnoses based on symptoms and triage filters
// Query params: ?symptoms=depression,anxiety&system=DSM-5&duration=2&durationUnit=months&course=Continuous&severityLevel=moderate
// Or POST with body: { symptoms: ['depression', 'anxiety'], system: 'DSM-5', duration: 2, durationUnit: 'months', course: 'Continuous', severityLevel: 'moderate', preliminaryDiagnosis: '...', notes: '...' }
// Triage filters: duration, durationUnit (days/weeks/months/years), course (Continuous/Episodic/Either), severityLevel (low/moderate/high), preliminaryDiagnosis, notes
// Only psychologists can match diagnoses (for triaging)
router.get('/match-diagnoses', requirePsychologist, matchDiagnoses);
router.post('/match-diagnoses', requirePsychologist, matchDiagnoses);

// GET /api/psychologist/patients/:patientId/triage - Get all triage records for a patient
// Query params: ?page=1&limit=10&search=term&sortBy=createdAt&sortOrder=desc
// Allow both psychologist and company_admin to view triage history
router.get('/patients/:patientId/triage', requirePsychologistOrCompanyAdmin, getTriageRecords);

// GET /api/psychologist/patients/:patientId/triage/:triageId - Get a single triage record
// router.get('/patients/:patientId/triage/:triageId', getTriageById);

// POST /api/psychologist/patients/:patientId/triage - Create a new triage record
// Only psychologists can create triages
router.post('/patients/:patientId/triage', requirePsychologist, createTriage);

// PUT /api/psychologist/patients/:patientId/triage/:triageId - Update a triage record
// router.put('/patients/:patientId/triage/:triageId', updateTriage);

// DELETE /api/psychologist/patients/:patientId/triage/:triageId - Delete a triage record
// router.delete('/patients/:patientId/triage/:triageId', deleteTriage);

export default router;

