import { AppError } from '../../../../middlewares/errorHandler';
import { ICategoryRepository, CategoryResult } from '../../domain/repositories/ICategoryRepository';
import { UpdateCategoryDto } from '../dtos/CategoryDto';

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string, dto: UpdateCategoryDto): Promise<CategoryResult> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new AppError('Category not found', 404);
    return this.categoryRepository.update(id, dto);
  }
}
