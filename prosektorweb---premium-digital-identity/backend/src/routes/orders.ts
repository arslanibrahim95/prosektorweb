import { Router } from 'express';
import { createOrder, getOrder, getUserOrders } from '../controllers/orders.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/create', authMiddleware, createOrder);
router.get('/:id', authMiddleware, getOrder);
router.get('/my-orders/list', authMiddleware, getUserOrders);

export default router;
