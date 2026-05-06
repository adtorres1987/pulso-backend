import { AppError } from '../../../../middlewares/errorHandler';
import { ISubscriptionPlanRepository, SubscriptionPlanResult } from '../../domain/repositories/ISubscriptionPlanRepository';
import { UpdateSubscriptionPlanDto } from '../dtos/SubscriptionPlanDto';

export class UpdateSubscriptionPlanUseCase {
  constructor(private readonly repo: ISubscriptionPlanRepository) {}
  async execute(id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlanResult> {
    const exists = await this.repo.findById(id);
    if (!exists) throw new AppError('Subscription plan not found', 404);
    return this.repo.update(id, dto);
  }
}
