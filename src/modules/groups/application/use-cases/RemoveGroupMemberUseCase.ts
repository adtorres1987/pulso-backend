import { AppError } from '../../../../middlewares/errorHandler';
import { APP_CONFIG_KEYS } from '../../../app-config/domain/repositories/IAppConfigRepository';
import { IAppConfigRepository } from '../../../app-config/domain/repositories/IAppConfigRepository';
import { ISubscriptionRepository } from '../../../subscriptions/domain/repositories/ISubscriptionRepository';
import { IGroupRepository } from '../../domain/repositories/IGroupRepository';

export class RemoveGroupMemberUseCase {
  constructor(
    private readonly groupRepo: IGroupRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly configRepo: IAppConfigRepository,
  ) {}

  async execute(groupId: string, requesterId: string, targetUserId: string): Promise<void> {
    const group = await this.groupRepo.findByIdAndUser(groupId, requesterId);
    if (!group) throw new AppError('Group not found', 404);

    const requester = group.members.find((m) => m.userId === requesterId);
    const isSelfLeave = requesterId === targetUserId;

    if (!isSelfLeave && requester?.role !== 'owner') {
      throw new AppError('Only the group owner can remove other members', 403);
    }

    const target = group.members.find((m) => m.userId === targetUserId);
    if (!target) throw new AppError('User is not a member of this group', 404);
    if (target.role === 'owner' && !isSelfLeave) throw new AppError('Cannot remove the group owner', 400);

    await this.groupRepo.removeMember(groupId, targetUserId);

    // Recalculate discount after removal
    const discountPercent = await this.configRepo.getValueAsNumber(APP_CONFIG_KEYS.GROUP_DISCOUNT_PERCENT, 10);
    const minMembers = await this.configRepo.getValueAsNumber(APP_CONFIG_KEYS.GROUP_MIN_MEMBERS, 3);
    await this.subscriptionRepo.syncGroupDiscounts(groupId, discountPercent, minMembers);

    // Remove discount from the removed user
    await this.subscriptionRepo.applyGroupDiscount(targetUserId, 0);
  }
}
