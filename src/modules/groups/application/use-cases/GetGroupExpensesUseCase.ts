import { AppError } from '../../../../middlewares/errorHandler';
import { GroupExpenseResult, IGroupRepository } from '../../domain/repositories/IGroupRepository';

export class GetGroupExpensesUseCase {
  constructor(private readonly repo: IGroupRepository) {}

  async execute(groupId: string, userId: string): Promise<GroupExpenseResult[]> {
    const group = await this.repo.findByIdAndUser(groupId, userId);
    if (!group) throw new AppError('Group not found', 404);
    return this.repo.findExpensesByGroup(groupId);
  }
}
