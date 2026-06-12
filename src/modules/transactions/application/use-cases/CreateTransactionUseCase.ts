import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { ITransactionRepository, TransactionResult } from '../../domain/repositories/ITransactionRepository';
import { CreateTransactionDto } from '../dtos/TransactionDto';

export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(userId: string, dto: CreateTransactionDto): Promise<TransactionResult> {
    const { imageType: _, ...data } = dto;

    if (!data.emotionTag && data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (category?.emotionTag) {
        data.emotionTag = category.emotionTag as 'need' | 'impulse' | 'emotional';
      }
    }

    return this.transactionRepository.create({ userId, ...data });
  }
}
