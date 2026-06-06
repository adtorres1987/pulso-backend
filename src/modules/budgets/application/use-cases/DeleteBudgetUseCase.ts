import { AppError } from '../../../../middlewares/errorHandler';
import { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';

export class DeleteBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const existing = await this.budgetRepository.findByIdAndUser(id, userId);
    if (!existing) throw new AppError('Budget not found', 404);
    await this.budgetRepository.delete(id);
  }
}
