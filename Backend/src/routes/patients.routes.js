import express from 'express';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  softDeletePatient,
  restorePatient,
  reassignPsychologist
} from '../controllers/patients.controller.js';
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

// Middleware to ensure user is a company_admin
const requireCompanyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'company_admin') {
    return res.status(403).json({ success: false, error: 'Company admin access required' });
  }
  next();
};

router.use(authenticateToken);

// GET /api/patients - Allow both psychologist and company_admin
router.get('/', requirePsychologistOrCompanyAdmin, getPatients);

// GET /api/patients/:id - Allow both psychologist and company_admin
router.get('/:id', requirePsychologistOrCompanyAdmin, getPatientById);

// POST /api/patients - Only psychologists can create
router.post('/', requirePsychologist, createPatient);

// PUT /api/patients/:id - Only psychologists can update
router.put('/:id', requirePsychologist, updatePatient);

// DELETE /api/patients/:id (soft delete) - Only psychologists can delete
router.delete('/:id', requirePsychologist, softDeletePatient);

// PATCH /api/patients/:id/restore - Only psychologists can restore
router.patch('/:id/restore', requirePsychologist, restorePatient);

// PATCH /api/patients/:id/reassign - Only company_admin can reassign psychologists
router.patch('/:id/reassign', requireCompanyAdmin, reassignPsychologist);

export default router;

