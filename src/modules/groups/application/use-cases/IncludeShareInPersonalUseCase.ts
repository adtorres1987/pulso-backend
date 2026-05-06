import { AppError } from '../../../../middlewares/errorHandler';
import { prisma } from '../../../../config/prisma';
import { GroupExpenseShareResult, IGroupRepository } from '../../domain/repositories/IGroupRepository';

export class IncludeShareInPersonalUseCase {
  constructor(private readonly repo: IGroupRepository) {}

  async execute(groupId: string, expenseId: string, shareId: string, userId: string): Promise<GroupExpenseShareResult> {
    const group = await this.repo.findByIdAndUser(groupId, userId);
    if (!group) throw new AppError('Group not found', 404);

    // Verify the share belongs to the requesting user's membership
    const member = group.members.find((m) => m.userId === userId);
    if (!member) throw new AppError('Not a member of this group', 403);

    const share = await prisma.groupExpenseShare.findFirst({
      where: { id: shareId, groupExpenseId: expenseId, groupMemberId: member.id },
    });
    if (!share) throw new AppError('Share not found', 404);
    if (share.transactionId) throw new AppError('Share is already linked to a personal transaction', 409);

    // Create a personal transaction from this share
    const expense = await prisma.groupExpense.findUniqueOrThrow({ where: { id: expenseId } });
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: share.amount,
        type: 'expense',
        note: expense.description,
        occurredAt: expense.occurredAt,
      },
    });

    return this.repo.includeShareInPersonal(shareId, transaction.id);
  }
}
