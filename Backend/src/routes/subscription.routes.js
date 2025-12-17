import { Router } from 'express';
import {
  upgradeSeats,
  scheduleOrgCancellation,
  undoOrgCancellation,
  scheduleUserCancel,
  undoUserCancel,
} from '../controllers/subscription.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All subscription routes require authentication
router.use(authenticateToken);

// Organization subscription routes
// POST /api/subscription/organizations/:organizationId/upgrade-seats
router.post('/organizations/:organizationId/upgrade-seats', upgradeSeats);

// POST /api/subscription/organizations/:organizationId/cancel-at-period-end
router.post('/organizations/:organizationId/cancel-at-period-end', scheduleOrgCancellation);

// POST /api/subscription/organizations/:organizationId/undo-cancel
router.post('/organizations/:organizationId/undo-cancel', undoOrgCancellation);

// Individual user subscription routes
// POST /api/subscription/users/:userId/cancel-at-period-end
router.post('/users/:userId/cancel-at-period-end', scheduleUserCancel);

// POST /api/subscription/users/:userId/undo-cancel
router.post('/users/:userId/undo-cancel', undoUserCancel);

export default router;

