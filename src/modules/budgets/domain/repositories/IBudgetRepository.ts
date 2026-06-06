export interface BudgetResult {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  amount: string;
  month: string;
  spent: string;
  percentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBudgetData {
  userId: string;
  categoryId?: string;
  amount: number;
  month: string;
}

export interface UpdateBudgetData {
  amount: number;
}

export interface IBudgetRepository {
  findAllByUserAndMonth(userId: string, month: string): Promise<BudgetResult[]>;
  findByIdAndUser(id: string, userId: string): Promise<BudgetResult | null>;
  create(data: CreateBudgetData): Promise<BudgetResult>;
  update(id: string, data: UpdateBudgetData): Promise<BudgetResult>;
  delete(id: string): Promise<void>;
}
