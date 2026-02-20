import { ICategoryRepository, CategoryResult } from '../../domain/repositories/ICategoryRepository';
import { CreateCategoryDto } from '../dtos/CategoryDto';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(dto: CreateCategoryDto): Promise<CategoryResult> {
    return this.categoryRepository.create(dto);
  }
}
