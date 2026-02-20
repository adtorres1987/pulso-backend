export interface RegisterUserData {
  email: string;
  passwordHash: string;
  language: 'es' | 'en';
  timezone: string;
  firstName: string;
  lastName: string;
}

export interface RegisteredUser {
  id: string;
  email: string;
  language: string;
  timezone: string;
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
}

export interface IUserRepository {
  existsByEmail(email: string): Promise<boolean>;
  findByEmail(email: string): Promise<AuthUser | null>;
  register(data: RegisterUserData): Promise<RegisteredUser>;
}
