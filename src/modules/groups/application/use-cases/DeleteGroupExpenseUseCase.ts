import { AppError } from '../../../../middlewares/errorHandler';
import { IGroupRepository } from '../../domain/repositories/IGroupRepository';

export class DeleteGroupExpenseUseCase {
  constructor(private readonly repo: IGroupRepository) {}

  async execute(groupId: string, expenseId: string, userId: string): Promise<void> {
    const group = await this.repo.findByIdAndUser(groupId, userId);
    if (!group) throw new AppError('Group not found', 404);

    const expense = await this.repo.findExpenseByIdAndGroup(expenseId, groupId);
    if (!expense) throw new AppError('Expense not found', 404);

    const isOwner = group.members.some((m) => m.userId === userId && m.role === 'owner');
    if (expense.paidById !== userId && !isOwner) {
      throw new AppError('Only the expense payer or a group owner can delete this expense', 403);
    }

    await this.repo.deleteExpense(expenseId);
  }
}
