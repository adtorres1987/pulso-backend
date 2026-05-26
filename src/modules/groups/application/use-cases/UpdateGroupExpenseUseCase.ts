import { AppError } from '../../../../middlewares/errorHandler';
import { GroupExpenseResult, IGroupRepository } from '../../domain/repositories/IGroupRepository';
import { UpdateGroupExpenseDto } from '../dtos/GroupDto';

export class UpdateGroupExpenseUseCase {
  constructor(private readonly repo: IGroupRepository) {}

  async execute(groupId: string, expenseId: string, userId: string, dto: UpdateGroupExpenseDto): Promise<GroupExpenseResult> {
    const group = await this.repo.findByIdAndUser(groupId, userId);
    if (!group) throw new AppError('Group not found', 404);

    const expense = await this.repo.findExpenseByIdAndGroup(expenseId, groupId);
    if (!expense) throw new AppError('Expense not found', 404);

    const isOwner = group.members.some((m) => m.userId === userId && m.role === 'owner');
    if (expense.paidById !== userId && !isOwner) {
      throw new AppError('Only the expense payer or a group owner can update this expense', 403);
    }

    if (dto.shares) {
      const memberIds = new Set(group.members.map((m) => m.id));
      for (const share of dto.shares) {
        if (!memberIds.has(share.groupMemberId)) {
          throw new AppError(`groupMemberId ${share.groupMemberId} does not belong to this group`, 422);
        }
      }
    }

    return this.repo.updateExpense(expenseId, dto);
  }
}
