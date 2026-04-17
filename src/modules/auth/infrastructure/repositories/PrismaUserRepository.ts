import { Language } from '@prisma/client';
import { prisma } from '../../../../config/prisma';
import {
  AuthUser,
  IUserRepository,
  PasswordResetTokenData,
  RegisterUserData,
  RegisteredUser,
} from '../../domain/repositories/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: { select: { name: true } } },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      language: user.language,
      timezone: user.timezone,
      role: user.role?.name ?? null,
    };
  }

  async register(data: RegisterUserData): Promise<RegisteredUser> {
    const result = await prisma.$transaction(async (tx) => {
      let roleId: string | undefined;
      let roleName: string | null = null;

      if (data.roleName) {
        const role = await tx.role.findFirst({
          where: { name: data.roleName as any, deletedAt: null },
          select: { id: true, name: true },
        });
        if (!role) throw new Error(`Role '${data.roleName}' not found`);
        roleId = role.id;
        roleName = role.name;
      }

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          language: data.language as Language,
          timezone: data.timezone,
          ...(roleId && { roleId }),
        },
      });

      const person = await tx.person.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      return { user, person, roleName };
    });

    return {
      id: result.user.id,
      email: result.user.email,
      language: result.user.language,
      timezone: result.user.timezone,
      role: result.roleName,
      person: {
        firstName: result.person.firstName,
        lastName: result.person.lastName,
      },
    };
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await prisma.passwordResetToken.create({ data: { userId, token, expiresAt } });
  }

  async findPasswordResetToken(token: string): Promise<PasswordResetTokenData | null> {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: { userId: true, expiresAt: true },
    });
    return record;
  }

  async deletePasswordResetTokensByUserId(userId: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await prisma.passwordResetToken.delete({ where: { token } });
  }
}
