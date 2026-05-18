export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';

export interface SubscriptionResult {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  trialEndsAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  discountPercent: string;
  cancelledAt: Date | null;
  createdAt: Date;
  plan: {
    id: string;
    name: string;
    priceAmount: string;
    currency: string;
    intervalDays: number;
  };
}

export interface CreateSubscriptionData {
  userId: string;
  planId: string;
  trialDays: number;
}

export interface StripeData {
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export interface ISubscriptionRepository {
  findByUserId(userId: string): Promise<SubscriptionResult | null>;
  create(data: CreateSubscriptionData): Promise<SubscriptionResult>;
  activate(userId: string): Promise<SubscriptionResult>;
  cancel(userId: string): Promise<SubscriptionResult>;
  applyGroupDiscount(userId: string, discountPercent: number): Promise<void>;
  countActiveGroupMembers(groupId: string): Promise<number>;
  syncGroupDiscounts(groupId: string, discountPercent: number, minMembers: number): Promise<void>;
  // Stripe
  findStripeData(userId: string): Promise<StripeData | null>;
  findUserIdByStripeSubscriptionId(stripeSubscriptionId: string): Promise<string | null>;
  setStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void>;
  linkStripeSubscription(userId: string, stripeSubscriptionId: string): Promise<void>;
  renewPeriod(userId: string, currentPeriodStart: Date, currentPeriodEnd: Date): Promise<SubscriptionResult>;
}
