export type AccountType = 'cash' | 'debit' | 'credit' | 'savings';

export interface AccountResult {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  initialBalance: string;
  currentBalance: string;
  currency: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountData {
  userId: string;
  name: string;
  type: AccountType;
  initialBalance?: number;
  currency?: string;
  isDefault?: boolean;
}

export interface UpdateAccountData {
  name?: string;
  type?: AccountType;
  initialBalance?: number;
  currency?: string;
  isDefault?: boolean;
}

export interface IAccountRepository {
  findAllByUser(userId: string): Promise<AccountResult[]>;
  findByIdAndUser(id: string, userId: string): Promise<AccountResult | null>;
  create(data: CreateAccountData): Promise<AccountResult>;
  update(id: string, data: UpdateAccountData): Promise<AccountResult>;
  delete(id: string): Promise<void>;
}
