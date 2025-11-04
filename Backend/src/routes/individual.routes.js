import express from 'express';
import {
  getAllIndividualPsychologists,
  updatePsychologistStatus,
  updatePsychologist
} from '../controllers/individual.controller.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and super admin access
router.use(authenticateToken);
router.use(requireSuperAdmin);

// GET /api/admin/individuals - Get all individual psychologists with pagination, search, sort, and filter
router.get('/', getAllIndividualPsychologists);

// PATCH /api/admin/individuals/:id/status - Deactivate or reactivate psychologist account
router.patch('/:id/status', updatePsychologistStatus);

// PATCH /api/admin/individuals/:id - Update psychologist account details
router.patch('/:id', updatePsychologist);

export default router;

