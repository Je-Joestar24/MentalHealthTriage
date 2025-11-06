import express from 'express';
import {
  getAllIndividualPsychologists,
  createIndividualPsychologist,
  updatePsychologistStatus,
  extendSubscriptionMonths,
  updatePsychologist
} from '../controllers/individual.controller.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and super admin access
router.use(authenticateToken);
router.use(requireSuperAdmin);

// GET /api/admin/individuals - Get all individual psychologists with pagination, search, sort, and filter
router.get('/', getAllIndividualPsychologists);

// POST /api/admin/individuals - Create a new individual psychologist account
router.post('/', createIndividualPsychologist);

// PATCH /api/admin/individuals/:id/status - Deactivate or reactivate psychologist account
router.patch('/:id/status', updatePsychologistStatus);

// PATCH /api/admin/individuals/:id/extend - Extend subscription months for psychologist
router.patch('/:id/extend', extendSubscriptionMonths);

// PATCH /api/admin/individuals/:id - Update psychologist account details
router.patch('/:id', updatePsychologist);

export default router;

