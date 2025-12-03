import { Router } from 'express';
import express from 'express';
import {
  handleStripeWebhook,
  verifyCheckoutSession,
} from '../controllers/stripeController.js';

const router = Router();

/**
 * Stripe webhook endpoint
 * Must use raw body for signature verification
 * This route should be registered BEFORE express.json() middleware
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

/**
 * Verify checkout session (for frontend redirect after payment)
 * GET /api/stripe/verify-session/:sessionId
 */
router.get('/verify-session/:sessionId', verifyCheckoutSession);

export default router;

