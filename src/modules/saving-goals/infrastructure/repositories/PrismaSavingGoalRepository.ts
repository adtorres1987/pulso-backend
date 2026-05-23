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
