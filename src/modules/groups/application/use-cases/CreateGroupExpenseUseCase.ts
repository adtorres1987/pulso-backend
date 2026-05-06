import { AppError } from '../../../../middlewares/errorHandler';
import { GroupExpenseResult, IGroupRepository } from '../../domain/repositories/IGroupRepository';
import { CreateGroupExpenseDto } from '../dtos/GroupDto';

export class CreateGroupExpenseUseCase {
  constructor(private readonly repo: IGroupRepository) {}

  async execute(groupId: string, userId: string, dto: CreateGroupExpenseDto): Promise<GroupExpenseResult> {
    const group = await this.repo.findByIdAndUser(groupId, userId);
    if (!group) throw new AppError('Group not found', 404);

    const memberIds = new Set(group.members.map((m) => m.id));
    for (const share of dto.shares) {
      if (!memberIds.has(share.groupMemberId)) {
        throw new AppError(`groupMemberId ${share.groupMemberId} does not belong to this group`, 422);
      }
    }

    return this.repo.createExpense({
      groupId,
      paidById: userId,
      amount: dto.amount,
      description: dto.description,
      occurredAt: dto.occurredAt,
      shares: dto.shares,
    });
  }
}
