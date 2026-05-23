import { ICategoryRepository, PaginatedCategories } from '../../domain/repositories/ICategoryRepository';

export class GetAllCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  execute(userId?: string, page = 1, limit = 10): Promise<PaginatedCategories> {
    return this.categoryRepository.findAll(userId, page, limit);
  }
}
