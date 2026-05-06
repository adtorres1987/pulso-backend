import { AppError } from '../../../../middlewares/errorHandler';
import { APP_CONFIG_KEYS } from '../../../app-config/domain/repositories/IAppConfigRepository';
import { IAppConfigRepository } from '../../../app-config/domain/repositories/IAppConfigRepository';
import { ISubscriptionRepository } from '../../../subscriptions/domain/repositories/ISubscriptionRepository';
import { GroupMemberResult, IGroupRepository } from '../../domain/repositories/IGroupRepository';

export class AddGroupMemberUseCase {
  constructor(
    private readonly groupRepo: IGroupRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly configRepo: IAppConfigRepository,
  ) {}

  async execute(groupId: string, requesterId: string, targetUserId: string): Promise<GroupMemberResult> {
    const group = await this.groupRepo.findByIdAndUser(groupId, requesterId);
    if (!group) throw new AppError('Group not found', 404);

    const requester = group.members.find((m) => m.userId === requesterId);
    if (requester?.role !== 'owner') throw new AppError('Only the group owner can add members', 403);

    const alreadyMember = await this.groupRepo.findMember(groupId, targetUserId);
    if (alreadyMember) throw new AppError('User is already a member of this group', 409);

    const member = await this.groupRepo.addMember(groupId, targetUserId);

    // Recalculate group discount for all members after adding
    const discountPercent = await this.configRepo.getValueAsNumber(APP_CONFIG_KEYS.GROUP_DISCOUNT_PERCENT, 10);
    await this.subscriptionRepo.syncGroupDiscounts(groupId, discountPercent, 3);

    return member;
  }
}
