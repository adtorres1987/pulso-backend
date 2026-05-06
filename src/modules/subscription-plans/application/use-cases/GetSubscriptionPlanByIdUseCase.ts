import { AppError } from '../../../../middlewares/errorHandler';
import { ISubscriptionPlanRepository, SubscriptionPlanResult } from '../../domain/repositories/ISubscriptionPlanRepository';

export class GetSubscriptionPlanByIdUseCase {
  constructor(private readonly repo: ISubscriptionPlanRepository) {}
  async execute(id: string): Promise<SubscriptionPlanResult> {
    const plan = await this.repo.findById(id);
    if (!plan) throw new AppError('Subscription plan not found', 404);
    return plan;
  }
}
