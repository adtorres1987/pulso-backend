export interface SubscriptionPlanResult {
  id: string;
  name: string;
  description: string | null;
  priceAmount: string;
  currency: string;
  intervalDays: number;
  isActive: boolean;
  stripePriceId: string | null;
  createdAt: Date;
}

export interface CreateSubscriptionPlanData {
  name: string;
  description?: string;
  priceAmount: number;
  currency?: string;
  intervalDays?: number;
  stripePriceId?: string;
}

export interface UpdateSubscriptionPlanData {
  name?: string;
  description?: string;
  priceAmount?: number;
  currency?: string;
  intervalDays?: number;
  isActive?: boolean;
  stripePriceId?: string;
}

export interface ISubscriptionPlanRepository {
  findAll(): Promise<SubscriptionPlanResult[]>;
  findById(id: string): Promise<SubscriptionPlanResult | null>;
  findActiveDefault(): Promise<SubscriptionPlanResult | null>;
  create(data: CreateSubscriptionPlanData): Promise<SubscriptionPlanResult>;
  update(id: string, data: UpdateSubscriptionPlanData): Promise<SubscriptionPlanResult>;
  delete(id: string): Promise<void>;
}
