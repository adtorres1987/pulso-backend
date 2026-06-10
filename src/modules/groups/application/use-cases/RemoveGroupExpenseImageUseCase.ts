import { cloudinaryService } from '../../../../services/cloudinary.service';
import { AppError } from '../../../../middlewares/errorHandler';
import { IGroupRepository } from '../../domain/repositories/IGroupRepository';

export class RemoveGroupExpenseImageUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(groupId: string, expenseId: string, imageId: string, userId: string): Promise<void> {
    const group = await this.groupRepository.findByIdAndUser(groupId, userId);
    if (!group) throw new AppError('Group not found', 404);

    const expense = await this.groupRepository.findExpenseByIdAndGroup(expenseId, groupId);
    if (!expense) throw new AppError('Expense not found', 404);

    const image = expense.images.find((img) => img.id === imageId);
    if (!image) throw new AppError('Image not found', 404);

    await Promise.all([
      cloudinaryService.delete(image.publicId),
      this.groupRepository.removeExpenseImage(imageId),
    ]);
  }
}
