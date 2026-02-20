import { Language } from '@prisma/client';
import { prisma } from '../../../../config/prisma';
import {
  AuthUser,
  IUserRepository,
  RegisterUserData,
  RegisteredUser,
} from '../../domain/repositories/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      language: user.language,
      timezone: user.timezone,
    };
  }

  async register(data: RegisterUserData): Promise<RegisteredUser> {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          language: data.language as Language,
          timezone: data.timezone,
        },
      });

      const person = await tx.person.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      return { user, person };
    });

    return {
      id: result.user.id,
      email: result.user.email,
      language: result.user.language,
      timezone: result.user.timezone,
      person: {
        firstName: result.person.firstName,
        lastName: result.person.lastName,
      },
    };
  }
}
