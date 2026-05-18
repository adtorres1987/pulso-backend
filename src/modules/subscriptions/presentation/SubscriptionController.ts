import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types';
import { GetMySubscriptionUseCase } from '../application/use-cases/GetMySubscriptionUseCase';
import { CancelSubscriptionUseCase } from '../application/use-cases/CancelSubscriptionUseCase';
import { CreateCheckoutSessionUseCase } from '../application/use-cases/CreateCheckoutSessionUseCase';
import { sendSuccess } from '../../../utils/response';

export class SubscriptionController {
  constructor(
    private readonly getMySubscription: GetMySubscriptionUseCase,
    private readonly cancelSubscription: CancelSubscriptionUseCase,
    private readonly createCheckoutSession: CreateCheckoutSessionUseCase,
  ) {}

  getMine = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.getMySubscription.execute(req.userId!)); } catch (err) { next(err); }
  };

  cancel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.cancelSubscription.execute(req.userId!), 200, 'Subscription cancelled'); } catch (err) { next(err); }
  };

  checkout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.createCheckoutSession.execute(req.userId!, req.body.planId);
      sendSuccess(res, result, 200, 'Checkout session created');
    } catch (err) { next(err); }
  };
}
