import { stripe } from '../../../../config/stripe';
import { env } from '../../../../config/env';
import { AppError } from '../../../../middlewares/errorHandler';
import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
import { ISubscriptionPlanRepository } from '../../../subscription-plans/domain/repositories/ISubscriptionPlanRepository';
import { IMeRepository } from '../../../me/domain/repositories/IMeRepository';

export class CreateCheckoutSessionUseCase {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly planRepo: ISubscriptionPlanRepository,
    private readonly meRepo: IMeRepository,
  ) {}

  async execute(userId: string, planId: string): Promise<{ checkoutUrl: string }> {
    const plan = await this.planRepo.findById(planId);
    if (!plan) throw new AppError('Plan not found', 404);
    if (!plan.stripePriceId) throw new AppError('Plan has no Stripe price configured', 400);

    const user = await this.meRepo.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    try {
      const stripeData = await this.subscriptionRepo.findStripeData(userId);
      let stripeCustomerId = stripeData?.stripeCustomerId ?? null;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({ email: user.email, metadata: { userId } });
        stripeCustomerId = customer.id;
        await this.subscriptionRepo.setStripeCustomerId(userId, stripeCustomerId);
      }

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.FRONTEND_URL}/subscription/cancel`,
        metadata: { userId, planId },
      });

      return { checkoutUrl: session.url! };
    } catch (err) {
      if (err instanceof AppError) throw err;
      const stripeMessage = (err as { message?: string }).message ?? 'Stripe error';
      throw new AppError(`Payment error: ${stripeMessage}`, 502);
    }
  }
}
