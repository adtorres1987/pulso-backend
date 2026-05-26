import { AppError } from '../../../../middlewares/errorHandler';
import { GroupExpenseSummaryResult, IGroupRepository } from '../../domain/repositories/IGroupRepository';

export class GetGroupExpenseSummaryUseCase {
  constructor(private readonly repo: IGroupRepository) {}

  async execute(groupId: string, userId: string, month: string): Promise<GroupExpenseSummaryResult> {
    const group = await this.repo.findByIdAndUser(groupId, userId);
    if (!group) throw new AppError('Group not found', 404);

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
    const endDate = new Date(Date.UTC(year, monthNum, 1));

    const data = await this.repo.getExpenseSummary(groupId, startDate, endDate);
    return { month, ...data };
  }
}
