import { AppError } from '../../../../middlewares/errorHandler';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';

export class DeleteSubscriptionPlanUseCase {
  constructor(private readonly repo: ISubscriptionPlanRepository) {}
  async execute(id: string): Promise<void> {
    const exists = await this.repo.findById(id);
    if (!exists) throw new AppError('Subscription plan not found', 404);
    return this.repo.delete(id);
  }
}
