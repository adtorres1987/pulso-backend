export interface CategoryResult {
  id: string;
  userId: string | null;
  name: string;
  icon: string | null;
  type: string;
  isSystem: boolean;
}

export interface CreateCategoryData {
  userId?: string;
  name: string;
  icon?: string;
  type: 'expense' | 'income';
}

export interface UpdateCategoryData {
  name?: string;
  icon?: string;
  type?: 'expense' | 'income';
}

export interface ICategoryRepository {
  findAll(userId?: string): Promise<CategoryResult[]>;
  findById(id: string): Promise<CategoryResult | null>;
  findByIdForUser(id: string, userId: string): Promise<CategoryResult | null>;
  existsByName(name: string, userId?: string, excludeId?: string): Promise<boolean>;
  create(data: CreateCategoryData): Promise<CategoryResult>;
  update(id: string, data: UpdateCategoryData): Promise<CategoryResult>;
  delete(id: string): Promise<void>;
}
