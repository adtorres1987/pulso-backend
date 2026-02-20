import { ICategoryRepository, CategoryResult } from '../../domain/repositories/ICategoryRepository';

export class GetAllCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(): Promise<CategoryResult[]> {
    return this.categoryRepository.findAll();
  }
}
