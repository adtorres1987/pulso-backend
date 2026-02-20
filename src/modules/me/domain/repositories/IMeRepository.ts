export interface MeResult {
  id: string;
  email: string;
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

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: Date;
  country?: string;
  avatarUrl?: string;
}

export interface IMeRepository {
  findById(userId: string): Promise<MeResult | null>;
  updateProfile(userId: string, data: UpdateProfileData): Promise<MeResult>;
  findPasswordHash(userId: string): Promise<string | null>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}
