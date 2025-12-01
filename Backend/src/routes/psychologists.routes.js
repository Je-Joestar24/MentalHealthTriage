import express from 'express';
import { 
  getPsychologists, 
  createPsychologist, 
  updatePsychologist, 
  deletePsychologist 
} from '../controllers/psychologists.controller.js';
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

// GET /api/company/psychologists - Get list of psychologists with pagination, sorting, filtering, and search
router.get('/', getPsychologists);

// POST /api/company/psychologists - Create a new psychologist
router.post('/', createPsychologist);

// PUT /api/company/psychologists/:id - Update a psychologist (name, email, password only)
router.put('/:id', updatePsychologist);

// DELETE /api/company/psychologists/:id - Delete a psychologist (soft delete)
router.delete('/:id', deletePsychologist);

export default router;

