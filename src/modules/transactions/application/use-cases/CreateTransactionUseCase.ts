import { ITransactionRepository, TransactionResult } from '../../domain/repositories/ITransactionRepository';
import { CreateTransactionDto } from '../dtos/TransactionDto';

export class CreateTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(userId: string, dto: CreateTransactionDto): Promise<TransactionResult> {
    return this.transactionRepository.create({ userId, ...dto });
  }
}
