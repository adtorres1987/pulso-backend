import { prisma } from '../../../../config/prisma';
import { IMeRepository, MeResult, UpdateProfileData } from '../../domain/repositories/IMeRepository';

const userSelect = {
  id: true,
  email: true,
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

export class PrismaMeRepository implements IMeRepository {
  async findById(userId: string): Promise<MeResult | null> {
    return prisma.user.findUnique({ where: { id: userId }, select: userSelect });
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<MeResult> {
    return prisma.user.update({
      where: { id: userId },
      data: {
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
      },
      select: userSelect,
    });
  }

  async findPasswordHash(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    return user?.passwordHash ?? null;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }
}
