import { AppError } from '../../../../middlewares/errorHandler';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new AppError('Category not found', 404);
    await this.categoryRepository.delete(id);
  }
}
