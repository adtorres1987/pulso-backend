export interface AdminUserResult {
  id: string;
  email: string;
  isActive: boolean;
  language: string;
  timezone: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  person: {
    firstName: string;
    lastName: string;
    phone: string | null;
    birthDate: Date | null;
    country: string | null;
    avatarUrl: string | null;
  } | null;
  role: { id: string; name: string } | null;
  subscription: {
    id: string;
    status: string;
    trialEndsAt: Date;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    discountPercent: unknown; // Prisma Decimal — serialized as string by toJSON()
    cancelledAt: Date | null;
    createdAt: Date;
    plan: {
      id: string;
      name: string;
      priceAmount: unknown; // Prisma Decimal
      currency: string;
      intervalDays: number;
    };
  } | null;
  groupMemberships: Array<{
    id: string;
    role: string;
    group: { id: string; name: string };
  }>;
}

export interface AdminUserListResult {
  data: AdminUserResult[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUserFilters {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateAdminUserData {
  email?: string;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: Date;
  country?: string;
  avatarUrl?: string;
}

export interface IAdminUserRepository {
  findClientUsers(
    filters: AdminUserFilters,
    page: number,
    limit: number,
  ): Promise<AdminUserListResult>;
  findClientUserById(id: string): Promise<AdminUserResult | null>;
  updateClientUser(id: string, data: UpdateAdminUserData): Promise<AdminUserResult>;
  resetPassword(id: string, hashedPassword: string): Promise<void>;
}
