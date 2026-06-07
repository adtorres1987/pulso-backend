export interface SavingGoalResult {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: Date | null;
  createdAt: Date;
  projectedCompletionDate: string | null; // YYYY-MM-DD
}

export interface CreateSavingGoalData {
  userId: string;
  name: string;
  targetAmount: number;
  targetDate?: Date;
}

export interface UpdateSavingGoalData {
  name?: string;
  targetAmount?: number;
  targetDate?: Date;
}

export interface PaginatedSavingGoals {
  items: SavingGoalResult[];
  total: number;
}

export interface ISavingGoalRepository {
  findAllByUser(userId: string, page: number, limit: number): Promise<PaginatedSavingGoals>;
  findByIdAndUser(id: string, userId: string): Promise<SavingGoalResult | null>;
  create(data: CreateSavingGoalData): Promise<SavingGoalResult>;
  update(id: string, data: UpdateSavingGoalData): Promise<SavingGoalResult>;
  deposit(id: string, amount: number): Promise<SavingGoalResult>;
  delete(id: string): Promise<void>;
}
