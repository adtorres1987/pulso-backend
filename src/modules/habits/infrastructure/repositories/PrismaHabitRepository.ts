import { HabitFrequency } from '@prisma/client';
import { prisma } from '../../../../config/prisma';
import {
  CreateHabitData,
  HabitLogResult,
  HabitResult,
  IHabitRepository,
  PaginatedHabitLogs,
  PaginatedHabits,
  UpdateHabitData,
} from '../../domain/repositories/IHabitRepository';

const habitSelect = { id: true, name: true, frequency: true, active: true, createdAt: true };
const logSelect = { id: true, date: true, completed: true, createdAt: true };

export class PrismaHabitRepository implements IHabitRepository {
  async findAllByUser(userId: string, activeOnly: boolean | undefined, page = 1, limit = 20): Promise<PaginatedHabits> {
    const where = { userId, ...(activeOnly !== undefined && { active: activeOnly }) };
    const [items, total] = await prisma.$transaction([
      prisma.habit.findMany({ where, select: habitSelect, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.habit.count({ where }),
    ]);
    return { items, total };
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

  async findLogsByHabit(habitId: string, page = 1, limit = 20): Promise<PaginatedHabitLogs> {
    const where = { habitId };
    const [items, total] = await prisma.$transaction([
      prisma.habitLog.findMany({ where, select: logSelect, orderBy: { date: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.habitLog.count({ where }),
    ]);
    return { items, total };
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
