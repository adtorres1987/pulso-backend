import { cloudinaryService } from '../../../../services/cloudinary.service';
import { AppError } from '../../../../middlewares/errorHandler';
import { GroupExpenseImageResult, IGroupRepository } from '../../domain/repositories/IGroupRepository';

export class AddGroupExpenseImageUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(groupId: string, expenseId: string, userId: string, buffer: Buffer): Promise<GroupExpenseImageResult> {
    const group = await this.groupRepository.findByIdAndUser(groupId, userId);
    if (!group) throw new AppError('Group not found', 404);

    const expense = await this.groupRepository.findExpenseByIdAndGroup(expenseId, groupId);
    if (!expense) throw new AppError('Expense not found', 404);

    const { url, publicId } = await cloudinaryService.upload(buffer, 'group_expense_images');
    return this.groupRepository.addExpenseImage(expenseId, url, publicId);
  }
}
