export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransactionResult {
  id: string;
  userId: string;
  type: 'expense' | 'income';
  amount: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  note: string | null;
  emotionTag: string | null;
  frequency: RecurringFrequency;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRecurringTransactionData {
  userId: string;
  type: 'expense' | 'income';
  amount: number;
  categoryId?: string;
  note?: string;
  emotionTag?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
}

export interface UpdateRecurringTransactionData {
  amount?: number;
  categoryId?: string | null;
  note?: string | null;
  emotionTag?: string | null;
  frequency?: RecurringFrequency;
  endDate?: string | null;
  isActive?: boolean;
}

export interface DueRecurringTransaction {
  id: string;
  userId: string;
  type: 'expense' | 'income';
  amount: string;
  categoryId: string | null;
  note: string | null;
  emotionTag: string | null;
  nextRunDate: string;
  frequency: RecurringFrequency;
  endDate: string | null;
}

export interface IRecurringTransactionRepository {
  findAllByUser(userId: string): Promise<RecurringTransactionResult[]>;
  findByIdAndUser(id: string, userId: string): Promise<RecurringTransactionResult | null>;
  create(data: CreateRecurringTransactionData): Promise<RecurringTransactionResult>;
  update(id: string, data: UpdateRecurringTransactionData): Promise<RecurringTransactionResult>;
  delete(id: string): Promise<void>;
  findDue(today: string): Promise<DueRecurringTransaction[]>;
  updateNextRunDate(id: string, nextRunDate: string): Promise<void>;
  deactivate(id: string): Promise<void>;
}
