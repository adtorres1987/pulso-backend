import { AppError } from '../../../../middlewares/errorHandler';
import { ISubscriptionRepository, SubscriptionResult } from '../../domain/repositories/ISubscriptionRepository';

export class CancelSubscriptionUseCase {
  constructor(private readonly repo: ISubscriptionRepository) {}

  async execute(userId: string): Promise<SubscriptionResult> {
    const sub = await this.repo.findByUserId(userId);
    if (!sub) throw new AppError('No subscription found', 404);
    if (sub.status === 'cancelled') throw new AppError('Subscription is already cancelled', 409);
    return this.repo.cancel(userId);
  }
}
