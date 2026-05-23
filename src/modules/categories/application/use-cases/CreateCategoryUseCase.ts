import { AppError } from '../../../../middlewares/errorHandler';
import { ICategoryRepository, CategoryResult } from '../../domain/repositories/ICategoryRepository';
import { CreateCategoryDto } from '../dtos/CategoryDto';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(dto: CreateCategoryDto, userId?: string, isSystem = false): Promise<CategoryResult> {
    const nameConflict = await this.categoryRepository.existsByName(dto.name, userId);
    if (nameConflict) {
      throw new AppError('A category with this name already exists (global or your own)', 409);
    }
    return this.categoryRepository.create({ ...dto, userId, isSystem });
  }
}
