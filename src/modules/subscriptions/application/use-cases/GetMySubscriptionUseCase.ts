import { ISubscriptionRepository, SubscriptionResult } from '../../domain/repositories/ISubscriptionRepository';
import { CreateTrialSubscriptionUseCase } from './CreateTrialSubscriptionUseCase';

export class GetMySubscriptionUseCase {
  constructor(
    private readonly repo: ISubscriptionRepository,
    private readonly createTrial: CreateTrialSubscriptionUseCase,
  ) {}

  async execute(userId: string): Promise<SubscriptionResult | null> {
    const existing = await this.repo.findByUserId(userId);
    if (existing) return existing;

    try {
      return await this.createTrial.execute(userId);
    } catch {
      return null;
    }
  }
}
