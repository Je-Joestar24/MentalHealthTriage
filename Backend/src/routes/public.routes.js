import { Router } from 'express';
import { getPublicStats } from '../controllers/public.controller.js';

const router = Router();

// Public routes - no authentication required
// GET /api/public/stats - Get public statistics (professionals and clients count)
router.get('/stats', getPublicStats);

export default router;

