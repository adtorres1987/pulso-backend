import { APP_CONFIG_KEYS } from '../../../app-config/domain/repositories/IAppConfigRepository';
import { IAppConfigRepository } from '../../../app-config/domain/repositories/IAppConfigRepository';
import { ISubscriptionPlanRepository } from '../../../subscription-plans/domain/repositories/ISubscriptionPlanRepository';
import { AppError } from '../../../../middlewares/errorHandler';
import { ISubscriptionRepository, SubscriptionResult } from '../../domain/repositories/ISubscriptionRepository';

export class CreateTrialSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly planRepo: ISubscriptionPlanRepository,
    private readonly configRepo: IAppConfigRepository,
  ) {}

  async execute(userId: string): Promise<SubscriptionResult> {
    const plan = await this.planRepo.findActiveDefault();
    if (!plan) throw new AppError('No active subscription plan found. Contact an administrator.', 503);

    const trialDays = await this.configRepo.getValueAsNumber(APP_CONFIG_KEYS.TRIAL_DAYS, 30);

    return this.subscriptionRepo.create({ userId, planId: plan.id, trialDays });
  }
}
