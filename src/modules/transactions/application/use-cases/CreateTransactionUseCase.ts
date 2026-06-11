import { ITransactionRepository, TransactionResult } from '../../domain/repositories/ITransactionRepository';
import { CreateTransactionDto } from '../dtos/TransactionDto';

export class CreateTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(userId: string, dto: CreateTransactionDto): Promise<TransactionResult> {
    const { imageType: _, ...data } = dto;
    return this.transactionRepository.create({ userId, ...data });
  }
}
