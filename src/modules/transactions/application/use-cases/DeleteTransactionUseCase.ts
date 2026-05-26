import { AppError } from '../../../../middlewares/errorHandler';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { IGroupRepository } from '../../../groups/domain/repositories/IGroupRepository';

export class DeleteTransactionUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly groupRepository: IGroupRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const transaction = await this.transactionRepository.findByIdAndUser(id, userId);
    if (!transaction) throw new AppError('Transaction not found', 404);
    await this.groupRepository.unlinkShareByTransactionId(id);
    await this.transactionRepository.delete(id);
  }
}
