export interface RegisterUserData {
  email: string;
  passwordHash: string;
  language: 'es' | 'en';
  timezone: string;
  firstName: string;
  lastName: string;
  roleName?: string;
}

export interface RegisteredUser {
  id: string;
  email: string;
  language: string;
  timezone: string;
  role: string | null;
  person: {
    firstName: string;
    lastName: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  language: string;
  timezone: string;
  role: string | null;
}

export interface PasswordResetTokenData {
  userId: string;
  expiresAt: Date;
}

export interface IUserRepository {
  existsByEmail(email: string): Promise<boolean>;
  findByEmail(email: string): Promise<AuthUser | null>;
  register(data: RegisterUserData): Promise<RegisteredUser>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  findPasswordResetToken(token: string): Promise<PasswordResetTokenData | null>;
  deletePasswordResetTokensByUserId(userId: string): Promise<void>;
  deletePasswordResetToken(token: string): Promise<void>;
}
