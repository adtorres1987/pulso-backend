import { AppError } from '../../../../middlewares/errorHandler';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';

export class DeleteTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const transaction = await this.transactionRepository.findByIdAndUser(id, userId);
    if (!transaction) throw new AppError('Transaction not found', 404);
    await this.transactionRepository.delete(id);
  }
}
