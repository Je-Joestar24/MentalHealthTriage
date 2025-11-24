import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as companyDetailsController from '../controllers/companydetails.controller.js';

const router = express.Router();

// Middleware to require company_admin role
const requireCompanyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'company_admin') {
    return res.status(403).json({ error: 'Company admin access required' });
  }

  next();
};

// All routes require authentication and company_admin role
router.use(authenticateToken);
router.use(requireCompanyAdmin);

// GET /api/company/details - Get company details
router.get('/details', companyDetailsController.getCompanyDetails);

// PUT /api/company/details - Update company details
router.put('/details', companyDetailsController.updateCompanyDetails);

export default router;

