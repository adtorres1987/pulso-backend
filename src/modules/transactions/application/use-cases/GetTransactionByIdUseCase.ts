import { AppError } from '../../../../middlewares/errorHandler';
import { ITransactionRepository, TransactionResult } from '../../domain/repositories/ITransactionRepository';

export class GetTransactionByIdUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(id: string, userId: string): Promise<TransactionResult> {
    const transaction = await this.transactionRepository.findByIdAndUser(id, userId);
    if (!transaction) throw new AppError('Transaction not found', 404);
    return transaction;
  }
}
