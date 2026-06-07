import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../../../config/prisma';
import {
  CreateSavingGoalData,
  ISavingGoalRepository,
  PaginatedSavingGoals,
  SavingGoalResult,
  UpdateSavingGoalData,
} from '../../domain/repositories/ISavingGoalRepository';

const goalSelect = {
  id: true,
  name: true,
  targetAmount: true,
  currentAmount: true,
  targetDate: true,
  createdAt: true,
};

function computeProjectedDate(current: Decimal, target: Decimal, createdAt: Date): string | null {
  const cur = parseFloat(current.toString());
  const tgt = parseFloat(target.toString());
  if (cur >= tgt || cur <= 0) return null;
  const now = new Date();
  const daysElapsed = (now.getTime() - createdAt.getTime()) / 86400000;
  if (daysElapsed < 1) return null;
  const dailyRate = cur / daysElapsed;
  const daysToComplete = (tgt - cur) / dailyRate;
  const projected = new Date(now.getTime() + daysToComplete * 86400000);
  return projected.toISOString().slice(0, 10);
}

const toResult = (raw: {
  id: string;
  name: string;
  targetAmount: Decimal;
  currentAmount: Decimal;
  targetDate: Date | null;
  createdAt: Date;
}): SavingGoalResult => ({
  ...raw,
  targetAmount: raw.targetAmount.toString(),
  currentAmount: raw.currentAmount.toString(),
  projectedCompletionDate: computeProjectedDate(raw.currentAmount, raw.targetAmount, raw.createdAt),
});

export class PrismaSavingGoalRepository implements ISavingGoalRepository {
  async findAllByUser(userId: string, page = 1, limit = 20): Promise<PaginatedSavingGoals> {
    const where = { userId };
    const [rows, total] = await prisma.$transaction([
      prisma.savingGoal.findMany({ where, select: goalSelect, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.savingGoal.count({ where }),
    ]);
    return { items: rows.map(toResult), total };
  }

  async findByIdAndUser(id: string, userId: string): Promise<SavingGoalResult | null> {
    const row = await prisma.savingGoal.findFirst({ where: { id, userId }, select: goalSelect });
    return row ? toResult(row) : null;
  }

  async create(data: CreateSavingGoalData): Promise<SavingGoalResult> {
    const row = await prisma.savingGoal.create({
      data: { userId: data.userId, name: data.name, targetAmount: data.targetAmount, targetDate: data.targetDate },
      select: goalSelect,
    });
    return toResult(row);
  }

  async update(id: string, data: UpdateSavingGoalData): Promise<SavingGoalResult> {
    const row = await prisma.savingGoal.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
        ...(data.targetDate !== undefined && { targetDate: data.targetDate }),
      },
      select: goalSelect,
    });
    return toResult(row);
  }

  async deposit(id: string, amount: number): Promise<SavingGoalResult> {
    const row = await prisma.savingGoal.update({
      where: { id },
      data: { currentAmount: { increment: amount } },
      select: goalSelect,
    });
    return toResult(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.savingGoal.delete({ where: { id } });
  }
}
