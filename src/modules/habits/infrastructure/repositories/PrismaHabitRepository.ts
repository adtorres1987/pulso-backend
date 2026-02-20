import { HabitFrequency } from '@prisma/client';
import { prisma } from '../../../../config/prisma';
import {
  CreateHabitData,
  HabitLogResult,
  HabitResult,
  IHabitRepository,
  UpdateHabitData,
} from '../../domain/repositories/IHabitRepository';

const habitSelect = { id: true, name: true, frequency: true, active: true, createdAt: true };
const logSelect = { id: true, date: true, completed: true, createdAt: true };

export class PrismaHabitRepository implements IHabitRepository {
  async findAllByUser(userId: string, activeOnly?: boolean): Promise<HabitResult[]> {
    return prisma.habit.findMany({
      where: { userId, ...(activeOnly !== undefined && { active: activeOnly }) },
      select: habitSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<HabitResult | null> {
    return prisma.habit.findFirst({ where: { id, userId }, select: habitSelect });
  }

  async create(data: CreateHabitData): Promise<HabitResult> {
    return prisma.habit.create({
      data: { userId: data.userId, name: data.name, frequency: data.frequency as HabitFrequency },
      select: habitSelect,
    });
  }

  async update(id: string, data: UpdateHabitData): Promise<HabitResult> {
    return prisma.habit.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.frequency !== undefined && { frequency: data.frequency as HabitFrequency }),
        ...(data.active !== undefined && { active: data.active }),
      },
      select: habitSelect,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.habit.delete({ where: { id } });
  }

  async findLogsByHabit(habitId: string): Promise<HabitLogResult[]> {
    return prisma.habitLog.findMany({
      where: { habitId },
      select: logSelect,
      orderBy: { date: 'desc' },
    });
  }

  async upsertLog(habitId: string, date: Date, completed: boolean): Promise<HabitLogResult> {
    return prisma.habitLog.upsert({
      where: { habitId_date: { habitId, date } },
      create: { habitId, date, completed },
      update: { completed },
      select: logSelect,
    });
  }
}
