import { AppError } from '../../../../middlewares/errorHandler';
import { ICategoryRepository, CategoryResult } from '../../domain/repositories/ICategoryRepository';
import { UpdateCategoryDto } from '../dtos/CategoryDto';

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string, dto: UpdateCategoryDto, userId?: string): Promise<CategoryResult> {
    const category = userId
      ? await this.categoryRepository.findByIdForUser(id, userId)
      : await this.categoryRepository.findById(id);

    if (!category) throw new AppError('Category not found', 404);

    if (dto.name) {
      const nameConflict = await this.categoryRepository.existsByName(dto.name, userId, id);
      if (nameConflict) throw new AppError('A category with this name already exists (global or your own)', 409);
    }

    return this.categoryRepository.update(id, dto);
  }
}
