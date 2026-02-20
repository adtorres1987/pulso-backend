export interface CategoryResult {
  id: string;
  name: string;
  icon: string | null;
  type: string;
  isSystem: boolean;
}

export interface CreateCategoryData {
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
  findAll(): Promise<CategoryResult[]>;
  findById(id: string): Promise<CategoryResult | null>;
  create(data: CreateCategoryData): Promise<CategoryResult>;
  update(id: string, data: UpdateCategoryData): Promise<CategoryResult>;
  delete(id: string): Promise<void>;
}
