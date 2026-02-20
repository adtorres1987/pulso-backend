import { Mood } from '@prisma/client';
import { prisma } from '../../../../config/prisma';
import {
  CreateSnapshotData,
  ISnapshotRepository,
  SnapshotResult,
  UpdateSnapshotData,
} from '../../domain/repositories/ISnapshotRepository';

const snapshotSelect = {
  id: true,
  date: true,
  mood: true,
  reflection: true,
  consciousScore: true,
  createdAt: true,
};

export class PrismaSnapshotRepository implements ISnapshotRepository {
  async findAllByUser(userId: string): Promise<SnapshotResult[]> {
    return prisma.dailySnapshot.findMany({
      where: { userId },
      select: snapshotSelect,
      orderBy: { date: 'desc' },
    });
  }

  async findByUserAndDate(userId: string, date: Date): Promise<SnapshotResult | null> {
    return prisma.dailySnapshot.findUnique({
      where: { userId_date: { userId, date } },
      select: snapshotSelect,
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<SnapshotResult | null> {
    return prisma.dailySnapshot.findFirst({ where: { id, userId }, select: snapshotSelect });
  }

  async create(data: CreateSnapshotData): Promise<SnapshotResult> {
    return prisma.dailySnapshot.create({
      data: {
        userId: data.userId,
        date: data.date,
        mood: data.mood as Mood | undefined,
        reflection: data.reflection,
        consciousScore: data.consciousScore,
      },
      select: snapshotSelect,
    });
  }

  async update(id: string, data: UpdateSnapshotData): Promise<SnapshotResult> {
    return prisma.dailySnapshot.update({
      where: { id },
      data: {
        ...(data.mood !== undefined && { mood: data.mood as Mood }),
        ...(data.reflection !== undefined && { reflection: data.reflection }),
        ...(data.consciousScore !== undefined && { consciousScore: data.consciousScore }),
      },
      select: snapshotSelect,
    });
  }
}
