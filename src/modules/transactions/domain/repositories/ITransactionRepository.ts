export interface TransactionImageResult {
  id: string;
  transactionId: string;
  url: string;
  publicId: string;
  createdAt: Date;
}

export interface TransactionResult {
  id: string;
  amount: string;
  type: string;
  emotionTag: string | null;
  note: string | null;
  occurredAt: Date;
  createdAt: Date;
  categoryId: string | null;
  category: { id: string; name: string; icon: string | null } | null;
  accountId: string | null;
  account: { id: string; name: string; type: string } | null;
  images: TransactionImageResult[];
}

export interface TransactionFilters {
  type?: 'expense' | 'income';
  categoryId?: string;
  accountId?: string;
  emotionTag?: 'need' | 'impulse' | 'emotional';
  startDate?: Date;
  endDate?: Date;
  search?: string;
  minAmount?: string;
  maxAmount?: string;
}

export interface CreateTransactionData {
  userId: string;
  amount: number;
  type: 'expense' | 'income';
  emotionTag?: 'need' | 'impulse' | 'emotional';
  note?: string;
  occurredAt: Date;
  categoryId?: string;
  accountId?: string;
  dailySnapshotId?: string;
}

export interface UpdateTransactionData {
  amount?: number;
  type?: 'expense' | 'income';
  emotionTag?: 'need' | 'impulse' | 'emotional';
  note?: string;
  occurredAt?: Date;
  categoryId?: string;
  accountId?: string | null;
}

export interface PaginatedTransactions {
  items: TransactionResult[];
  total: number;
}

export interface ITransactionRepository {
  findAllByUser(userId: string, filters: TransactionFilters, page: number, limit: number): Promise<PaginatedTransactions>;
  findByIdAndUser(id: string, userId: string): Promise<TransactionResult | null>;
  create(data: CreateTransactionData): Promise<TransactionResult>;
  update(id: string, data: UpdateTransactionData): Promise<TransactionResult>;
  delete(id: string): Promise<void>;
  addImage(transactionId: string, url: string, publicId: string): Promise<TransactionImageResult>;
  removeImage(imageId: string): Promise<TransactionImageResult>;
}
