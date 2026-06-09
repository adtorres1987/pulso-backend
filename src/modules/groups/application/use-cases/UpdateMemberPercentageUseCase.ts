import { AppError } from '../../../../middlewares/errorHandler';
import { GroupMemberResult, IGroupRepository } from '../../domain/repositories/IGroupRepository';

export class UpdateMemberPercentageUseCase {
  constructor(private readonly repo: IGroupRepository) {}

  async execute(groupId: string, requesterId: string, targetUserId: string, percentage: number): Promise<GroupMemberResult> {
    const group = await this.repo.findByIdAndUser(groupId, requesterId);
    if (!group) throw new AppError('Group not found', 404);

    const requester = group.members.find((m) => m.userId === requesterId);
    if (!requester || requester.role !== 'owner') {
      throw new AppError('Only the group owner can update payment percentages', 403);
    }

    const target = group.members.find((m) => m.userId === targetUserId);
    if (!target) throw new AppError('Member not found in this group', 404);

    return this.repo.updateMemberPercentage(groupId, targetUserId, percentage);
  }
}
