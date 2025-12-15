import { Router } from 'express';
import { upgradeSeats } from '../controllers/subscription.controller.js';

const router = Router();

// POST /api/subscription/organizations/:organizationId/upgrade-seats
router.post('/organizations/:organizationId/upgrade-seats', upgradeSeats);

export default router;

