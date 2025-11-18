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

// Middleware to ensure user is a psychologist
const requirePsychologist = (req, res, next) => {
  if (!req.user || req.user.role !== 'psychologist') {
    return res.status(403).json({ success: false, error: 'Psychologist access required' });
  }
  next();
};

// All routes require authentication and psychologist access
router.use(authenticateToken);
router.use(requirePsychologist);

// GET /api/psychologist/triage/match-diagnoses - Match diagnoses based on symptoms
// Query params: ?symptoms=depression,anxiety&system=DSM-5
// Or POST with body: { symptoms: ['depression', 'anxiety'], system: 'DSM-5' }
router.get('/match-diagnoses', matchDiagnoses);
router.post('/match-diagnoses', matchDiagnoses);

// GET /api/psychologist/patients/:patientId/triage - Get all triage records for a patient
// Query params: ?page=1&limit=10&search=term&sortBy=createdAt&sortOrder=desc
router.get('/patients/:patientId/triage', getTriageRecords);

// GET /api/psychologist/patients/:patientId/triage/:triageId - Get a single triage record
// router.get('/patients/:patientId/triage/:triageId', getTriageById);

// POST /api/psychologist/patients/:patientId/triage - Create a new triage record
router.post('/patients/:patientId/triage', createTriage);

// PUT /api/psychologist/patients/:patientId/triage/:triageId - Update a triage record
// router.put('/patients/:patientId/triage/:triageId', updateTriage);

// DELETE /api/psychologist/patients/:patientId/triage/:triageId - Delete a triage record
// router.delete('/patients/:patientId/triage/:triageId', deleteTriage);

export default router;

