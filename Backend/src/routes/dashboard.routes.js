import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and super admin access
router.use(authenticateToken);
router.use(requireSuperAdmin);

// GET /api/admin/dashboard/stats - Get dashboard statistics and counts
router.get('/stats', getDashboardStats);

export default router;

