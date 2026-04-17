import { prisma } from '../../../../config/prisma';
import {
  AdminUserFilters,
  AdminUserListResult,
  AdminUserResult,
  IAdminUserRepository,
  UpdateAdminUserData,
} from '../../domain/repositories/IAdminUserRepository';

const userSelect = {
  id: true,
  email: true,
  isActive: true,
  language: true,
  timezone: true,
  onboardingCompleted: true,
  createdAt: true,
  person: {
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      birthDate: true,
      country: true,
      avatarUrl: true,
    },
  },
};

export class PrismaAdminUserRepository implements IAdminUserRepository {
  async findClientUsers(
    filters: AdminUserFilters,
    page: number,
    limit: number,
  ): Promise<AdminUserListResult> {
    const where = {
      role: { name: 'user' as const },
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.email && {
        email: { contains: filters.email, mode: 'insensitive' as const },
      }),
      ...(filters.name && {
        person: {
          OR: [
            { firstName: { contains: filters.name, mode: 'insensitive' as const } },
            { lastName: { contains: filters.name, mode: 'insensitive' as const } },
          ],
        },
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { data: users as AdminUserResult[], total, page, limit };
  }

  async findClientUserById(id: string): Promise<AdminUserResult | null> {
    const user = await prisma.user.findFirst({
      where: { id, role: { name: 'user' } },
      select: userSelect,
    });
    return user as AdminUserResult | null;
  }

  async resetPassword(id: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { passwordHash: hashedPassword },
    });
  }

  async updateClientUser(id: string, data: UpdateAdminUserData): Promise<AdminUserResult> {
    const hasPersonFields =
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.phone !== undefined ||
      data.birthDate !== undefined ||
      data.country !== undefined ||
      data.avatarUrl !== undefined;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.email !== undefined && { email: data.email }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(hasPersonFields && {
          person: {
            update: {
              ...(data.firstName !== undefined && { firstName: data.firstName }),
              ...(data.lastName !== undefined && { lastName: data.lastName }),
              ...(data.phone !== undefined && { phone: data.phone }),
              ...(data.birthDate !== undefined && { birthDate: data.birthDate }),
              ...(data.country !== undefined && { country: data.country }),
              ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
            },
          },
        }),
      },
      select: userSelect,
    });
    return user as AdminUserResult;
  }
}
