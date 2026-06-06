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

// ─── Date helpers ─────────────────────────────────────────────────────────────

function dateISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysToISO(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Number of Monday-aligned weeks since Unix epoch
function weekSerial(iso: string): number {
  const d = new Date(iso + 'T00:00:00Z');
  const day = d.getUTCDay(); // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d.getTime() + mondayOffset * 86400000);
  return Math.floor(monday.getTime() / (7 * 86400000));
}

// ─── Streak computation ───────────────────────────────────────────────────────

function computeStreaks(
  logs: { date: Date }[],
  frequency: string,
): { currentStreak: number; longestStreak: number; completedDates: string[] } {
  if (logs.length === 0) return { currentStreak: 0, longestStreak: 0, completedDates: [] };

  const today = todayISO();
  const thirtyDaysAgo = addDaysToISO(today, -29);

  const allDates = [...new Set(logs.map((l) => dateISO(l.date)))].sort((a, b) => b.localeCompare(a));
  const completedDates = allDates.filter((d) => d >= thirtyDaysAgo && d <= today);

  if (frequency === 'daily') {
    const dateSet = new Set(allDates);
    const yesterday = addDaysToISO(today, -1);

    let currentStreak = 0;
    if (dateSet.has(today) || dateSet.has(yesterday)) {
      let d = dateSet.has(today) ? today : yesterday;
      while (dateSet.has(d)) {
        currentStreak++;
        d = addDaysToISO(d, -1);
      }
    }

    let longestStreak = 0;
    let run = 1;
    for (let i = 1; i < allDates.length; i++) {
      if (allDates[i] === addDaysToISO(allDates[i - 1]!, -1)) {
        run++;
      } else {
        longestStreak = Math.max(longestStreak, run);
        run = 1;
      }
    }
    longestStreak = Math.max(longestStreak, run);

    return { currentStreak, longestStreak, completedDates };
  } else {
    // Weekly
    const allWeekSerials = [...new Set(allDates.map(weekSerial))].sort((a, b) => b - a);
    if (allWeekSerials.length === 0) return { currentStreak: 0, longestStreak: 0, completedDates };

    const currentWeekSerial = weekSerial(today);
    const weekSet = new Set(allWeekSerials);

    let currentStreak = 0;
    if (weekSet.has(currentWeekSerial) || weekSet.has(currentWeekSerial - 1)) {
      let w = weekSet.has(currentWeekSerial) ? currentWeekSerial : currentWeekSerial - 1;
      while (weekSet.has(w)) {
        currentStreak++;
        w--;
      }
    }

    let longestStreak = 0;
    let run = 1;
    for (let i = 1; i < allWeekSerials.length; i++) {
      if (allWeekSerials[i] === allWeekSerials[i - 1]! - 1) {
        run++;
      } else {
        longestStreak = Math.max(longestStreak, run);
        run = 1;
      }
    }
    longestStreak = Math.max(longestStreak, run);

    return { currentStreak, longestStreak, completedDates };
  }
}

// ─── Selects & mappers ────────────────────────────────────────────────────────

const habitBaseSelect = { id: true, name: true, frequency: true, active: true, createdAt: true };
const logSelect = { id: true, date: true, completed: true, createdAt: true };

function toHabitResult(row: {
  id: string;
  name: string;
  frequency: string;
  active: boolean;
  createdAt: Date;
}): HabitResult {
  return { ...row, currentStreak: 0, longestStreak: 0, completedDates: [] };
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class PrismaHabitRepository implements IHabitRepository {
  async findAllByUser(userId: string, activeOnly: boolean | undefined, page = 1, limit = 20): Promise<PaginatedHabits> {
    const where = { userId, ...(activeOnly !== undefined && { active: activeOnly }) };
    const [rows, total] = await prisma.$transaction([
      prisma.habit.findMany({
        where,
        select: {
          ...habitBaseSelect,
          logs: { where: { completed: true }, select: { date: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.habit.count({ where }),
    ]);

    const items: HabitResult[] = rows.map((h) => {
      const { currentStreak, longestStreak, completedDates } = computeStreaks(h.logs, h.frequency);
      return { id: h.id, name: h.name, frequency: h.frequency, active: h.active, createdAt: h.createdAt, currentStreak, longestStreak, completedDates };
    });

    return { items, total };
  }

  async findByIdAndUser(id: string, userId: string): Promise<HabitResult | null> {
    const row = await prisma.habit.findFirst({ where: { id, userId }, select: habitBaseSelect });
    return row ? toHabitResult(row) : null;
  }

  async create(data: CreateHabitData): Promise<HabitResult> {
    const row = await prisma.habit.create({
      data: { userId: data.userId, name: data.name, frequency: data.frequency as HabitFrequency },
      select: habitBaseSelect,
    });
    return toHabitResult(row);
  }

  async update(id: string, data: UpdateHabitData): Promise<HabitResult> {
    const row = await prisma.habit.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.frequency !== undefined && { frequency: data.frequency as HabitFrequency }),
        ...(data.active !== undefined && { active: data.active }),
      },
      select: habitBaseSelect,
    });
    return toHabitResult(row);
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
