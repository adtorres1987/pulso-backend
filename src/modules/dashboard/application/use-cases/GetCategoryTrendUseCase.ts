import { IDashboardRepository, CategoryTrendData } from '../../domain/repositories/IDashboardRepository';

export class GetCategoryTrendUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async execute(userId: string, months: number): Promise<CategoryTrendData> {
    return this.dashboardRepository.getCategoryTrend(userId, months);
  }
}
