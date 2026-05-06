import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types';
import { GetMySubscriptionUseCase } from '../application/use-cases/GetMySubscriptionUseCase';
import { CancelSubscriptionUseCase } from '../application/use-cases/CancelSubscriptionUseCase';
import { sendSuccess } from '../../../utils/response';

export class SubscriptionController {
  constructor(
    private readonly getMySubscription: GetMySubscriptionUseCase,
    private readonly cancelSubscription: CancelSubscriptionUseCase,
  ) {}

  getMine = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.getMySubscription.execute(req.userId!)); } catch (err) { next(err); }
  };

  cancel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.cancelSubscription.execute(req.userId!), 200, 'Subscription cancelled'); } catch (err) { next(err); }
  };
}
