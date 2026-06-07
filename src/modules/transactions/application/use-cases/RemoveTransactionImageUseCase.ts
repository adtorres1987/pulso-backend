import { cloudinaryService } from '../../../../services/cloudinary.service';
import { AppError } from '../../../../middlewares/errorHandler';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';

export class RemoveTransactionImageUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(imageId: string, transactionId: string, userId: string): Promise<void> {
    const transaction = await this.transactionRepository.findByIdAndUser(transactionId, userId);
    if (!transaction) throw new AppError('Transaction not found', 404);

    const image = transaction.images.find((img) => img.id === imageId);
    if (!image) throw new AppError('Image not found', 404);

    await Promise.all([
      cloudinaryService.delete(image.publicId),
      this.transactionRepository.removeImage(imageId),
    ]);
  }
}
