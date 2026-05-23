import { ITransactionRepository, PaginatedTransactions, TransactionFilters } from '../../domain/repositories/ITransactionRepository';

export class GetAllTransactionsUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(userId: string, filters: TransactionFilters, page: number, limit: number): Promise<PaginatedTransactions> {
    return this.transactionRepository.findAllByUser(userId, filters, page, limit);
  }
}
