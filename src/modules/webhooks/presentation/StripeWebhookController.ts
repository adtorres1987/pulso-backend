import { Request, Response } from 'express';
import { env } from '../../../config/env';
import { stripe } from '../../../config/stripe';
import { prisma } from '../../../config/prisma';

// Minimal inline shapes — Stripe v22 no expone los tipos vía namespace Stripe.XXX
type SessionObj = { metadata?: Record<string, string> | null; subscription?: string | { id: string } | null; customer?: string | { id: string } | null };
type StripePeriod = { current_period_start: number; current_period_end: number };
type InvoiceObj = { subscription?: string | { id: string } | null; period_start: number; period_end: number };
type SubscriptionObj = { id: string };

export class StripeWebhookController {
  handle = async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'] as string;

    let event: ReturnType<typeof stripe.webhooks.constructEvent>;
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch {
      res.status(400).json({ error: 'Webhook signature verification failed' });
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as SessionObj);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as InvoiceObj);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as InvoiceObj);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as SubscriptionObj);
          break;
      }
      res.json({ received: true });
    } catch (err) {
      console.error('Stripe webhook handler error:', err);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  };

  private async handleCheckoutCompleted(session: SessionObj): Promise<void> {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    if (!userId || !session.subscription || !planId) return;

    const stripeSubId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id;

    const stripeCustomerId = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id ?? null;

    const stripeSub = await stripe.subscriptions.retrieve(stripeSubId) as unknown as StripePeriod;
    const periodStart = new Date(stripeSub.current_period_start * 1000);
    const periodEnd = new Date(stripeSub.current_period_end * 1000);

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        planId,
        stripeSubscriptionId: stripeSubId,
        ...(stripeCustomerId ? { stripeCustomerId } : {}),
        status: 'active',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelledAt: null,
      },
      create: {
        userId,
        planId,
        status: 'active',
        trialEndsAt: periodStart,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: stripeSubId,
        ...(stripeCustomerId ? { stripeCustomerId } : {}),
      },
    });
  }

  private async handlePaymentSucceeded(invoice: InvoiceObj): Promise<void> {
    const stripeSubId = typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id;
    if (!stripeSubId) return;

    const sub = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: stripeSubId } });
    if (!sub) return;

    const periodStart = new Date(invoice.period_start * 1000);
    const periodEnd = new Date(invoice.period_end * 1000);

    await prisma.subscription.update({
      where: { userId: sub.userId },
      data: { status: 'active', currentPeriodStart: periodStart, currentPeriodEnd: periodEnd, cancelledAt: null },
    });
  }

  private async handlePaymentFailed(invoice: InvoiceObj): Promise<void> {
    const stripeSubId = typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id;
    if (!stripeSubId) return;

    const sub = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: stripeSubId } });
    if (!sub) return;

    await prisma.subscription.update({ where: { userId: sub.userId }, data: { status: 'expired' } });
  }

  private async handleSubscriptionDeleted(stripeSub: SubscriptionObj): Promise<void> {
    const sub = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: stripeSub.id } });
    if (!sub) return;

    await prisma.subscription.update({
      where: { userId: sub.userId },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });
  }
}
