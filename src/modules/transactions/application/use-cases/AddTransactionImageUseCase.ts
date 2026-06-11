import { cloudinaryService } from '../../../../services/cloudinary.service';
import { AppError } from '../../../../middlewares/errorHandler';
import { ITransactionRepository, TransactionImageResult } from '../../domain/repositories/ITransactionRepository';

export class AddTransactionImageUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(transactionId: string, userId: string, buffer: Buffer, imageType = 'image'): Promise<TransactionImageResult> {
    const transaction = await this.transactionRepository.findByIdAndUser(transactionId, userId);
    if (!transaction) throw new AppError('Transaction not found', 404);

    const { url, publicId } = await cloudinaryService.upload(buffer, 'transaction_images');
    return this.transactionRepository.addImage(transactionId, url, publicId, imageType);
  }
}
