import { Router } from 'express';
import { register, verifyCode, me, refresh } from '../controllers/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/verify-code', authRateLimiter, verifyCode);
router.get('/me', authMiddleware, me);
router.post('/refresh', refresh);

export default router;
