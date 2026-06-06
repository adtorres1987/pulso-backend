import { AppError } from '../../../../middlewares/errorHandler';
import { IRecurringTransactionRepository, RecurringTransactionResult } from '../../domain/repositories/IRecurringTransactionRepository';
import { UpdateRecurringTransactionDto } from '../dtos/RecurringTransactionDto';

export class UpdateRecurringTransactionUseCase {
  constructor(private readonly repo: IRecurringTransactionRepository) {}

  async execute(id: string, userId: string, dto: UpdateRecurringTransactionDto): Promise<RecurringTransactionResult> {
    const existing = await this.repo.findByIdAndUser(id, userId);
    if (!existing) throw new AppError('Recurring transaction not found', 404);
    return this.repo.update(id, dto);
  }
}
