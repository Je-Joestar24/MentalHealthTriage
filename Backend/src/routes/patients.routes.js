import express from 'express';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  softDeletePatient,
  restorePatient
} from '../controllers/patients.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware to ensure user is a psychologist
const requirePsychologist = (req, res, next) => {
  if (!req.user || req.user.role !== 'psychologist') {
    return res.status(403).json({ success: false, error: 'Psychologist access required' });
  }
  next();
};

router.use(authenticateToken);
router.use(requirePsychologist);

// GET /api/patients
router.get('/', getPatients);

// GET /api/patients/:id
router.get('/:id', getPatientById);

// POST /api/patients
router.post('/', createPatient);

// PUT /api/patients/:id
router.put('/:id', updatePatient);

// DELETE /api/patients/:id (soft delete)
router.delete('/:id', softDeletePatient);

// PATCH /api/patients/:id/restore
router.patch('/:id/restore', restorePatient);

export default router;

