import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/auth.js';

const createOrderSchema = z.object({
  designTheme: z.enum(['Prestij', 'Aksiyon', 'Vizyon']),
  industry: z.string().min(2).max(100),
});

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { designTheme, industry } = createOrderSchema.parse(req.body);

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        designTheme,
        industry,
        price: 7000, // Fixed price
        status: 'PENDING',
      },
    });

    res.status(201).json({
      message: 'Sipariş oluşturuldu',
      order,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Sipariş oluşturulamadı' });
  }
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check ownership
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Sipariş alınamadı' });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Siparişler alınamadı' });
  }
};
