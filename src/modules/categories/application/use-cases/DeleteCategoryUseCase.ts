import { AppError } from '../../../../middlewares/errorHandler';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string, userId?: string): Promise<void> {
    const category = userId
      ? await this.categoryRepository.findByIdForUser(id, userId)
      : await this.categoryRepository.findById(id);

    if (!category) throw new AppError('Category not found', 404);

    await this.categoryRepository.delete(id);
  }
}
