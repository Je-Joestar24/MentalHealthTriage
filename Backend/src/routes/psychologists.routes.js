import express from 'express';
import { getPsychologists } from '../controllers/psychologists.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware to ensure user is super_admin or company_admin
const requireSuperAdminOrCompanyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  if (req.user.role !== 'super_admin' && req.user.role !== 'company_admin') {
    return res.status(403).json({ success: false, error: 'Super admin or company admin access required' });
  }
  next();
};

router.use(authenticateToken);
router.use(requireSuperAdminOrCompanyAdmin);

// GET /api/psychologists - Get list of psychologists with pagination, sorting, filtering, and search
router.get('/', getPsychologists);

export default router;

