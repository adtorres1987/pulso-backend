import { prisma } from '../../../../config/prisma';
import {
  CreateRecurringTransactionData,
  DueRecurringTransaction,
  IRecurringTransactionRepository,
  RecurringFrequency,
  RecurringTransactionResult,
  UpdateRecurringTransactionData,
} from '../../domain/repositories/IRecurringTransactionRepository';

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function computeNextRunDate(from: string, frequency: RecurringFrequency): string {
  const [y, m, d] = from.split('-').map(Number);
  const date = new Date(y!, m! - 1, d!);
  switch (frequency) {
    case 'daily':   date.setDate(date.getDate() + 1); break;
    case 'weekly':  date.setDate(date.getDate() + 7); break;
    case 'monthly': date.setMonth(date.getMonth() + 1); break;
    case 'yearly':  date.setFullYear(date.getFullYear() + 1); break;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const recurringSelect = {
  id: true,
  userId: true,
  type: true,
  amount: true,
  categoryId: true,
  note: true,
  emotionTag: true,
  frequency: true,
  startDate: true,
  endDate: true,
  nextRunDate: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true, icon: true } },
};

function toResult(row: {
  id: string;
  userId: string;
  type: string;
  amount: { toString(): string };
  categoryId: string | null;
  note: string | null;
  emotionTag: string | null;
  frequency: string;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: { name: string; icon: string | null } | null;
}): RecurringTransactionResult {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as 'expense' | 'income',
    amount: row.amount.toString(),
    categoryId: row.categoryId,
    categoryName: row.category?.name ?? null,
    categoryIcon: row.category?.icon ?? null,
    note: row.note,
    emotionTag: row.emotionTag,
    frequency: row.frequency as RecurringFrequency,
    startDate: row.startDate,
    endDate: row.endDate,
    nextRunDate: row.nextRunDate,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaRecurringTransactionRepository implements IRecurringTransactionRepository {
  async findAllByUser(userId: string): Promise<RecurringTransactionResult[]> {
    const rows = await prisma.recurringTransaction.findMany({
      where: { userId },
      select: recurringSelect,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toResult);
  }

  async findByIdAndUser(id: string, userId: string): Promise<RecurringTransactionResult | null> {
    const row = await prisma.recurringTransaction.findFirst({ where: { id, userId }, select: recurringSelect });
    return row ? toResult(row) : null;
  }

  async create(data: CreateRecurringTransactionData): Promise<RecurringTransactionResult> {
    const today = todayISO();
    const isPast = data.startDate <= today;
    const firstNextRunDate = isPast
      ? computeNextRunDate(data.startDate, data.frequency)
      : data.startDate;

    const row = await prisma.$transaction(async (tx) => {
      const recurring = await tx.recurringTransaction.create({
        data: {
          userId: data.userId,
          type: data.type,
          amount: data.amount,
          categoryId: data.categoryId ?? null,
          note: data.note ?? null,
          emotionTag: (data.emotionTag as never) ?? null,
          frequency: data.frequency,
          startDate: data.startDate,
          endDate: data.endDate ?? null,
          nextRunDate: firstNextRunDate,
        },
        select: recurringSelect,
      });

      if (isPast) {
        await tx.transaction.create({
          data: {
            userId: data.userId,
            type: data.type,
            amount: data.amount,
            categoryId: data.categoryId ?? null,
            note: data.note ?? null,
            emotionTag: (data.emotionTag as never) ?? null,
            occurredAt: new Date(`${data.startDate}T12:00:00`),
          },
        });
      }

      return recurring;
    });

    return toResult(row);
  }

  async update(id: string, data: UpdateRecurringTransactionData): Promise<RecurringTransactionResult> {
    const row = await prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.note !== undefined && { note: data.note }),
        ...(data.emotionTag !== undefined && { emotionTag: data.emotionTag as never }),
        ...(data.frequency !== undefined && { frequency: data.frequency }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: recurringSelect,
    });
    return toResult(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.recurringTransaction.delete({ where: { id } });
  }

  async findDue(today: string): Promise<DueRecurringTransaction[]> {
    const rows = await prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        nextRunDate: { lte: today },
      },
      select: {
        id: true,
        userId: true,
        type: true,
        amount: true,
        categoryId: true,
        note: true,
        emotionTag: true,
        nextRunDate: true,
        frequency: true,
        endDate: true,
      },
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      type: r.type as 'expense' | 'income',
      amount: r.amount.toString(),
      categoryId: r.categoryId,
      note: r.note,
      emotionTag: r.emotionTag,
      nextRunDate: r.nextRunDate,
      frequency: r.frequency as RecurringFrequency,
      endDate: r.endDate,
    }));
  }

  async updateNextRunDate(id: string, nextRunDate: string): Promise<void> {
    await prisma.recurringTransaction.update({ where: { id }, data: { nextRunDate } });
  }

  async deactivate(id: string): Promise<void> {
    await prisma.recurringTransaction.update({ where: { id }, data: { isActive: false } });
  }
}

export { computeNextRunDate };
