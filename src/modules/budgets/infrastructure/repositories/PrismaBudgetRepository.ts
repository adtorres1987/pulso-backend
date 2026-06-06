import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../../../config/prisma';
import {
  BudgetResult,
  CreateBudgetData,
  IBudgetRepository,
  UpdateBudgetData,
} from '../../domain/repositories/IBudgetRepository';

function monthToRange(month: string): { gte: Date; lte: Date } {
  const [y, m] = month.split('-').map(Number);
  const start = new Date(y!, m! - 1, 1);
  const end = new Date(y!, m!, 0, 23, 59, 59, 999);
  return { gte: start, lte: end };
}

async function attachSpent(
  budgets: Array<{
    id: string;
    categoryId: string | null;
    amount: Decimal;
    month: string;
    createdAt: Date;
    updatedAt: Date;
    category: { name: string; icon: string | null } | null;
  }>,
  userId: string,
): Promise<BudgetResult[]> {
  return Promise.all(
    budgets.map(async (b) => {
      const range = monthToRange(b.month);
      const agg = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'expense',
          categoryId: b.categoryId ?? undefined,
          ...(b.categoryId === null && { categoryId: null }),
          occurredAt: range,
        },
        _sum: { amount: true },
      });
      const spent = Number(agg._sum.amount ?? 0);
      const limit = Number(b.amount);
      return {
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.category?.name ?? null,
        categoryIcon: b.category?.icon ?? null,
        amount: b.amount.toString(),
        month: b.month,
        spent: spent.toFixed(2),
        percentage: limit > 0 ? Math.round((spent / limit) * 100) : 0,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    }),
  );
}

const budgetSelect = {
  id: true,
  categoryId: true,
  amount: true,
  month: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true, icon: true } },
};

export class PrismaBudgetRepository implements IBudgetRepository {
  async findAllByUserAndMonth(userId: string, month: string): Promise<BudgetResult[]> {
    const rows = await prisma.budget.findMany({
      where: { userId, month },
      select: budgetSelect,
      orderBy: { createdAt: 'asc' },
    });
    return attachSpent(rows, userId);
  }

  async findByIdAndUser(id: string, userId: string): Promise<BudgetResult | null> {
    const row = await prisma.budget.findFirst({ where: { id, userId }, select: budgetSelect });
    if (!row) return null;
    const [result] = await attachSpent([row], userId);
    return result!;
  }

  async create(data: CreateBudgetData): Promise<BudgetResult> {
    const row = await prisma.budget.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId ?? null,
        amount: data.amount,
        month: data.month,
      },
      select: budgetSelect,
    });
    const [result] = await attachSpent([row], data.userId);
    return result!;
  }

  async update(id: string, data: UpdateBudgetData): Promise<BudgetResult> {
    const row = await prisma.budget.update({
      where: { id },
      data: { amount: data.amount },
      select: budgetSelect,
    });
    const budget = await prisma.budget.findUnique({ where: { id }, select: { userId: true } });
    const [result] = await attachSpent([row], budget!.userId);
    return result!;
  }

  async delete(id: string): Promise<void> {
    await prisma.budget.delete({ where: { id } });
  }
}
