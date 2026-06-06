import { AppError } from '../../../../middlewares/errorHandler';
import { IRecurringTransactionRepository } from '../../domain/repositories/IRecurringTransactionRepository';

export class DeleteRecurringTransactionUseCase {
  constructor(private readonly repo: IRecurringTransactionRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const existing = await this.repo.findByIdAndUser(id, userId);
    if (!existing) throw new AppError('Recurring transaction not found', 404);
    return this.repo.delete(id);
  }
}
