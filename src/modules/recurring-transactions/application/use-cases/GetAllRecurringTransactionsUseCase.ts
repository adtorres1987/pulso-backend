import { IRecurringTransactionRepository, RecurringTransactionResult } from '../../domain/repositories/IRecurringTransactionRepository';

export class GetAllRecurringTransactionsUseCase {
  constructor(private readonly repo: IRecurringTransactionRepository) {}

  async execute(userId: string): Promise<RecurringTransactionResult[]> {
    return this.repo.findAllByUser(userId);
  }
}
