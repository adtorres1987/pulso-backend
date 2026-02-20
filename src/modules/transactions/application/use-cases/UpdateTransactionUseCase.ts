import { AppError } from '../../../../middlewares/errorHandler';
import { ITransactionRepository, TransactionResult } from '../../domain/repositories/ITransactionRepository';
import { UpdateTransactionDto } from '../dtos/TransactionDto';

export class UpdateTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(id: string, userId: string, dto: UpdateTransactionDto): Promise<TransactionResult> {
    const transaction = await this.transactionRepository.findByIdAndUser(id, userId);
    if (!transaction) throw new AppError('Transaction not found', 404);
    return this.transactionRepository.update(id, dto);
  }
}
