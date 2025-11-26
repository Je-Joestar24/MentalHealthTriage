import express from 'express';
import { getDashboardStats, getPsychologistDashboardStats, getCompanyAdminDashboardStats } from '../controllers/dashboard.controller.js';
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

// Company admin dashboard router
const companyAdminDashboardRouter = express.Router();

// Middleware to ensure user is a company admin
const requireCompanyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'company_admin') {
    return res.status(403).json({ success: false, error: 'Company admin access required' });
  }
  next();
};

// All company admin dashboard routes require authentication and company admin access
companyAdminDashboardRouter.use(authenticateToken);
companyAdminDashboardRouter.use(requireCompanyAdmin);

// GET /api/company/dashboard/stats - Get company admin dashboard statistics
companyAdminDashboardRouter.get('/stats', getCompanyAdminDashboardStats);

export { companyAdminDashboardRouter };

