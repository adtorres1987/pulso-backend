import { ISubscriptionRepository, SubscriptionResult } from '../../domain/repositories/ISubscriptionRepository';

export class GetMySubscriptionUseCase {
  constructor(private readonly repo: ISubscriptionRepository) {}

  async execute(userId: string): Promise<SubscriptionResult | null> {
    return this.repo.findByUserId(userId);
  }
}
