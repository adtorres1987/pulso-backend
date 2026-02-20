import { ITransactionRepository, TransactionFilters, TransactionResult } from '../../domain/repositories/ITransactionRepository';

export class GetAllTransactionsUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(userId: string, filters: TransactionFilters): Promise<TransactionResult[]> {
    return this.transactionRepository.findAllByUser(userId, filters);
  }
}
