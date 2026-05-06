import { AppError } from '../../../../middlewares/errorHandler';
import { ISubscriptionRepository, SubscriptionResult } from '../../domain/repositories/ISubscriptionRepository';

export class GetMySubscriptionUseCase {
  constructor(private readonly repo: ISubscriptionRepository) {}

  async execute(userId: string): Promise<SubscriptionResult> {
    const sub = await this.repo.findByUserId(userId);
    if (!sub) throw new AppError('No subscription found', 404);
    return sub;
  }
}
