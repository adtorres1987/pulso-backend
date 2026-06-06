import { BudgetResult, IBudgetRepository } from '../../domain/repositories/IBudgetRepository';

export class GetAllBudgetsUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(userId: string, month: string): Promise<BudgetResult[]> {
    return this.budgetRepository.findAllByUserAndMonth(userId, month);
  }
}
