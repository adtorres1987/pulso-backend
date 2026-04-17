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
