import express from 'express';
import {
  getAllOrganizations,
  getOrganizationById,
  updateOrganizationStatus,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats,
  extendSubscription,
  checkExpiredSubscriptions
} from '../controllers/organization.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin access
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/organizations - Get all organizations with pagination and filtering
router.get('/', getAllOrganizations);

// GET /api/admin/organizations/:id - Get single organization with details
router.get('/:id', getOrganizationById);

// PATCH /api/admin/organizations/:id/status - Update organization subscription status
router.patch('/:id/status', updateOrganizationStatus);

// POST /api/admin/organizations - Create new organization
router.post('/', createOrganization);

// PUT /api/admin/organizations/:id - Update organization
router.put('/:id', updateOrganization);

// DELETE /api/admin/organizations/:id - Delete organization
router.delete('/:id', deleteOrganization);

// GET /api/admin/organizations/:id/stats - Get organization statistics
router.get('/:id/stats', getOrganizationStats);

// POST /api/admin/organizations/:id/extend - Extend organization subscription
router.post('/:id/extend', extendSubscription);

// POST /api/admin/organizations/check-expired - Check and update expired subscriptions
router.post('/check-expired', checkExpiredSubscriptions);

export default router;
