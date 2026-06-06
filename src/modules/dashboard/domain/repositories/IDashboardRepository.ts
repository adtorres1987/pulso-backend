import { TransactionResult } from '../../../transactions/domain/repositories/ITransactionRepository';

export interface EmotionTagBreakdown {
  emotionTag: 'need' | 'impulse' | 'emotional' | null;
  total: string;
  count: number;
}

export interface CategoryBreakdown {
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  type: 'expense' | 'income';
  total: string;
  count: number;
}

export interface MonthlyBreakdown {
  month: string;    // "YYYY-MM"
  income: string;
  expenses: string;
  balance: string;
}

export interface BudgetBreakdown {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  amount: string;
  spent: string;
  percentage: number;
}

export interface DashboardData {
  totalIncome: string;
  totalExpenses: string;
  balance: string;
  transactions: { items: TransactionResult[]; total: number };
  byEmotionTag: EmotionTagBreakdown[];
  byCategory: CategoryBreakdown[];
  byMonth: MonthlyBreakdown[];
  budgets: BudgetBreakdown[];
}

export interface DashboardResult {
  month: string;
  totalIncome: string;
  totalExpenses: string;
  balance: string;
  transactions: { items: TransactionResult[]; total: number; page: number; limit: number };
  byEmotionTag: EmotionTagBreakdown[];
  byCategory: CategoryBreakdown[];
  byMonth: MonthlyBreakdown[];
  budgets: BudgetBreakdown[];
}

export interface IDashboardRepository {
  getDashboard(
    userId: string,
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
  ): Promise<DashboardData>;
}
