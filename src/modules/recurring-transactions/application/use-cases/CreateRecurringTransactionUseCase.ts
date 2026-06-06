import { IRecurringTransactionRepository, RecurringTransactionResult } from '../../domain/repositories/IRecurringTransactionRepository';
import { CreateRecurringTransactionDto } from '../dtos/RecurringTransactionDto';

export class CreateRecurringTransactionUseCase {
  constructor(private readonly repo: IRecurringTransactionRepository) {}

  async execute(userId: string, dto: CreateRecurringTransactionDto): Promise<RecurringTransactionResult> {
    return this.repo.create({ userId, ...dto });
  }
}
