export interface InvestmentProfileResult {
  id: string;
  strategy: string;
  monthlyAmount: string;
  expectedReturn: string;
  createdAt: Date;
}

export interface CreateInvestmentProfileData {
  userId: string;
  strategy: 'conservative' | 'balanced' | 'long_term';
  monthlyAmount: number;
  expectedReturn: number;
}

export interface UpdateInvestmentProfileData {
  strategy?: 'conservative' | 'balanced' | 'long_term';
  monthlyAmount?: number;
  expectedReturn?: number;
}

export interface IInvestmentProfileRepository {
  findAllByUser(userId: string): Promise<InvestmentProfileResult[]>;
  findByIdAndUser(id: string, userId: string): Promise<InvestmentProfileResult | null>;
  create(data: CreateInvestmentProfileData): Promise<InvestmentProfileResult>;
  update(id: string, data: UpdateInvestmentProfileData): Promise<InvestmentProfileResult>;
  delete(id: string): Promise<void>;
}
