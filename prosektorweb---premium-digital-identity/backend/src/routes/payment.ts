import { Router, raw } from 'express';
import { createCheckout, webhook } from '../controllers/payment.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Regular route for creating checkout
router.post('/create-checkout-session', authMiddleware, createCheckout);

// Webhook route - needs raw body for signature verification
router.post('/webhook', raw({ type: 'application/json' }), webhook);

export default router;
