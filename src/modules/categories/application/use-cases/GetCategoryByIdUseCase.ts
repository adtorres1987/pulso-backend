import { AppError } from '../../../../middlewares/errorHandler';
import { ICategoryRepository, CategoryResult } from '../../domain/repositories/ICategoryRepository';

export class GetCategoryByIdUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string): Promise<CategoryResult> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }
}
