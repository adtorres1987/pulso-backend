import { AppError } from '../../../../middlewares/errorHandler';
import { BudgetResult, IBudgetRepository } from '../../domain/repositories/IBudgetRepository';
import { UpdateBudgetDto } from '../dtos/BudgetDto';

export class UpdateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(id: string, userId: string, dto: UpdateBudgetDto): Promise<BudgetResult> {
    const existing = await this.budgetRepository.findByIdAndUser(id, userId);
    if (!existing) throw new AppError('Budget not found', 404);
    return this.budgetRepository.update(id, dto);
  }
}
