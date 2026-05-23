import { AppError } from '../../../../middlewares/errorHandler';
import { IGroupRepository, PaginatedGroupExpenses } from '../../domain/repositories/IGroupRepository';

export class GetGroupExpensesUseCase {
  constructor(private readonly repo: IGroupRepository) {}

  async execute(groupId: string, userId: string, page: number, limit: number): Promise<PaginatedGroupExpenses> {
    const group = await this.repo.findByIdAndUser(groupId, userId);
    if (!group) throw new AppError('Group not found', 404);
    return this.repo.findExpensesByGroup(groupId, page, limit);
  }
}
