import { ISubscriptionPlanRepository, SubscriptionPlanResult } from '../../domain/repositories/ISubscriptionPlanRepository';
import { CreateSubscriptionPlanDto } from '../dtos/SubscriptionPlanDto';

export class CreateSubscriptionPlanUseCase {
  constructor(private readonly repo: ISubscriptionPlanRepository) {}
  execute(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlanResult> { return this.repo.create(dto); }
}
