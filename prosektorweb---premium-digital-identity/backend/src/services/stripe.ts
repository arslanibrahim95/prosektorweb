import Stripe from 'stripe';
import { prisma } from '../index.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = async (orderId: string, frontendUrl: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'try',
            product_data: {
              name: 'Premium Web Tasarım',
              description: `${order.designTheme} Tasarım Teması - ${order.industry} Sektörü`,
            },
            unit_amount: order.price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/`,
      customer_email: order.user.email,
      metadata: {
        orderId: order.id,
        userId: order.userId,
      },
    });

    // Update order with session ID
    await prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: session.id },
    });

    return {
      sessionId: session.id,
      sessionUrl: session.url,
    };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw new Error('Ödeme sayfası oluşturulamadı');
  }
};

export const handleCheckoutSessionCompleted = async (sessionId: string) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && session.metadata?.orderId) {
      await prisma.order.update({
        where: { id: session.metadata.orderId },
        data: {
          status: 'PAID',
          stripePaymentId: session.payment_intent as string,
        },
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
};

export const constructWebhookEvent = (body: Buffer, signature: string, secret: string) => {
  return stripe.webhooks.constructEvent(body, signature, secret);
};
