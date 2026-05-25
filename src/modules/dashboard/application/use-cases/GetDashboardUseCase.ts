import { IDashboardRepository, DashboardResult } from '../../domain/repositories/IDashboardRepository';

export class GetDashboardUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async execute(userId: string, month: string, page: number, limit: number): Promise<DashboardResult> {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
    const endDate = new Date(Date.UTC(year, monthNum, 1));

    const data = await this.dashboardRepository.getDashboard(userId, startDate, endDate, page, limit);

    return {
      month,
      ...data,
      transactions: { ...data.transactions, page, limit },
    };
  }
}
