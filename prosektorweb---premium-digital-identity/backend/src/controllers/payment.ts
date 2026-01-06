import { Request, Response } from 'express';
import { z } from 'zod';
import { createCheckoutSession, handleCheckoutSessionCompleted, constructWebhookEvent } from '../services/stripe.js';

const checkoutSchema = z.object({
  orderId: z.string().uuid('Geçerli bir Order ID girin'),
});

export const createCheckout = async (req: any, res: Response) => {
  try {
    const { orderId } = checkoutSchema.parse(req.body);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const { sessionUrl } = await createCheckoutSession(orderId, frontendUrl);

    res.json({
      sessionUrl,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Ödeme sayfası oluşturulamadı' });
  }
};

export const webhook = async (req: any, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    let event;
    try {
      event = constructWebhookEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('Webhook error:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      await handleCheckoutSessionCompleted(session.id);
      console.log(`✓ Order marked as paid: ${session.metadata?.orderId}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
