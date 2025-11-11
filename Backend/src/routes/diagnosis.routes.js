import express from 'express';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.middleware.js';
import * as diagnosisController from '../controllers/diagnosis.controller.js';

const router = express.Router();

// Protect all routes with authentication
router.use(authenticateToken);

// GET /api/diagnoses - Get all diagnoses with pagination and filtering
router.get('/', diagnosisController.getAllDiagnoses);

// GET /api/diagnoses/:id - Get single diagnosis
router.get('/:id', diagnosisController.getDiagnosisById);

// POST /api/diagnoses - Create new diagnosis
router.post('/', diagnosisController.createDiagnosis);

// PUT /api/diagnoses/:id - Update diagnosis
router.put('/:id', diagnosisController.updateDiagnosis);

// DELETE /api/diagnoses/:id - Delete diagnosis
router.delete('/:id', diagnosisController.deleteDiagnosis);

// POST /api/diagnoses/bulk-import - Bulk import diagnoses (super admin only)
router.post('/bulk-import', requireSuperAdmin, diagnosisController.bulkImportDiagnoses);

// GET /api/symptoms - List all symptoms (prettified, for form suggestions)
router.get('/symptoms/fetch', diagnosisController.getAllSymptoms);

export default router;