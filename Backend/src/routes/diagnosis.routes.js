import express from 'express';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.middleware.js';
import * as diagnosisController from '../controllers/diagnosis.controller.js';

const router = express.Router();

// Protect all routes with authentication
router.use(authenticateToken);

// GET /api/diagnoses - Get all diagnoses with pagination and filtering
router.get('/', diagnosisController.getAllDiagnoses);

// POST /api/diagnoses - Create new diagnosis
router.post('/', diagnosisController.createDiagnosis);

// POST /api/diagnoses/bulk-import - Bulk import diagnoses (super admin only)
router.post('/bulk-import', requireSuperAdmin, diagnosisController.bulkImportDiagnoses);

// GET /api/diagnoses/symptoms/fetch - List all symptoms (prettified, for form suggestions)
router.get('/symptoms/fetch', diagnosisController.getAllSymptoms);

// Notes routes for a specific diagnosis (must come before /:id routes)
// GET /api/diagnoses/:id/notes - Get all notes for a diagnosis
router.get('/:id/notes', diagnosisController.getDiagnosisNotes);

// POST /api/diagnoses/:id/notes - Add a note to a diagnosis
router.post('/:id/notes', diagnosisController.addDiagnosisNote);

// PUT /api/diagnoses/:id/notes/:noteId - Update a note
router.put('/:id/notes/:noteId', diagnosisController.updateDiagnosisNote);

// DELETE /api/diagnoses/:id/notes/:noteId - Delete a note
router.delete('/:id/notes/:noteId', diagnosisController.deleteDiagnosisNote);

// GET /api/diagnoses/:id - Get single diagnosis
router.get('/:id', diagnosisController.getDiagnosisById);

// PUT /api/diagnoses/:id - Update diagnosis
router.put('/:id', diagnosisController.updateDiagnosis);

// DELETE /api/diagnoses/:id - Delete diagnosis
router.delete('/:id', diagnosisController.deleteDiagnosis);

export default router;