import { Router } from 'express';
import { analyze } from '../controllers/ai.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/analyze-industry', aiRateLimiter, analyze);

export default router;
