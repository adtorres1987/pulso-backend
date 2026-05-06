import { ISubscriptionPlanRepository, SubscriptionPlanResult } from '../../domain/repositories/ISubscriptionPlanRepository';

export class GetAllSubscriptionPlansUseCase {
  constructor(private readonly repo: ISubscriptionPlanRepository) {}
  execute(): Promise<SubscriptionPlanResult[]> { return this.repo.findAll(); }
}
