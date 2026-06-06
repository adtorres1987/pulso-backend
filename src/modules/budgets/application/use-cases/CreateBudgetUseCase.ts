import { BudgetResult, IBudgetRepository } from '../../domain/repositories/IBudgetRepository';
import { CreateBudgetDto } from '../dtos/BudgetDto';

export class CreateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(userId: string, dto: CreateBudgetDto): Promise<BudgetResult> {
    return this.budgetRepository.create({ userId, ...dto });
  }
}
