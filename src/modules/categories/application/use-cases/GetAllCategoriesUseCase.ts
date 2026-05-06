import { ICategoryRepository, CategoryResult } from '../../domain/repositories/ICategoryRepository';

export class GetAllCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  execute(userId?: string): Promise<CategoryResult[]> {
    return this.categoryRepository.findAll(userId);
  }
}
