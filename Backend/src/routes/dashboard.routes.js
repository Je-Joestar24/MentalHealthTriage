import express from 'express';
import { getDashboardStats, getPsychologistDashboardStats } from '../controllers/dashboard.controller.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and super admin access
router.use(authenticateToken);
router.use(requireSuperAdmin);

// GET /api/admin/dashboard/stats - Get dashboard statistics and counts
router.get('/stats', getDashboardStats);

export default router;

// Psychologist dashboard router
const psychologistDashboardRouter = express.Router();

// Middleware to ensure user is a psychologist
const requirePsychologist = (req, res, next) => {
  if (!req.user || req.user.role !== 'psychologist') {
    return res.status(403).json({ success: false, error: 'Psychologist access required' });
  }
  next();
};

// All psychologist dashboard routes require authentication and psychologist access
psychologistDashboardRouter.use(authenticateToken);
psychologistDashboardRouter.use(requirePsychologist);

// GET /api/psychologist/dashboard/stats - Get psychologist dashboard statistics
psychologistDashboardRouter.get('/stats', getPsychologistDashboardStats);

export { psychologistDashboardRouter };

