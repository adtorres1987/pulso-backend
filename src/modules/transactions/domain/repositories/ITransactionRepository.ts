export interface TransactionResult {
  id: string;
  amount: string;
  type: string;
  emotionTag: string | null;
  note: string | null;
  occurredAt: Date;
  createdAt: Date;
  category: { id: string; name: string; icon: string | null } | null;
}

export interface TransactionFilters {
  type?: 'expense' | 'income';
  categoryId?: string;
  emotionTag?: 'need' | 'impulse' | 'emotional';
  startDate?: Date;
  endDate?: Date;
}

export interface CreateTransactionData {
  userId: string;
  amount: number;
  type: 'expense' | 'income';
  emotionTag?: 'need' | 'impulse' | 'emotional';
  note?: string;
  occurredAt: Date;
  categoryId?: string;
  dailySnapshotId?: string;
}

export interface UpdateTransactionData {
  amount?: number;
  type?: 'expense' | 'income';
  emotionTag?: 'need' | 'impulse' | 'emotional';
  note?: string;
  occurredAt?: Date;
  categoryId?: string;
}

export interface ITransactionRepository {
  findAllByUser(userId: string, filters: TransactionFilters): Promise<TransactionResult[]>;
  findByIdAndUser(id: string, userId: string): Promise<TransactionResult | null>;
  create(data: CreateTransactionData): Promise<TransactionResult>;
  update(id: string, data: UpdateTransactionData): Promise<TransactionResult>;
  delete(id: string): Promise<void>;
}
