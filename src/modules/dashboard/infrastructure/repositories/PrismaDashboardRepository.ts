import { EmotionTag, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../../../config/prisma';
import { IDashboardRepository, DashboardData, MonthlyBreakdown } from '../../domain/repositories/IDashboardRepository';
import { TransactionResult } from '../../../transactions/domain/repositories/ITransactionRepository';

const transactionSelect = {
  id: true,
  amount: true,
  type: true,
  emotionTag: true,
  note: true,
  occurredAt: true,
  createdAt: true,
  categoryId: true,
  category: { select: { id: true, name: true, icon: true } },
};

const toResult = (raw: {
  id: string;
  amount: Decimal;
  type: TransactionType;
  emotionTag: EmotionTag | null;
  note: string | null;
  occurredAt: Date;
  createdAt: Date;
  categoryId: string | null;
  category: { id: string; name: string; icon: string | null } | null;
}): TransactionResult => ({ ...raw, amount: raw.amount.toString() });

export class PrismaDashboardRepository implements IDashboardRepository {
  async getDashboard(userId: string, startDate: Date, endDate: Date, page: number, limit: number): Promise<DashboardData> {
    const dateFilter = { gte: startDate, lt: endDate };
    const where = { userId, occurredAt: dateFilter };

    const year = startDate.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

    const [transactions, total, incomeAgg, expenseAgg, emotionGroups, categoryGroups, monthlyRows] = await Promise.all([
      prisma.transaction.findMany({
        where,
        select: transactionSelect,
        orderBy: { occurredAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.aggregate({ where: { ...where, type: TransactionType.income }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { ...where, type: TransactionType.expense }, _sum: { amount: true } }),
      prisma.transaction.groupBy({
        by: ['emotionTag'],
        where: { ...where, type: TransactionType.expense },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.transaction.groupBy({
        by: ['categoryId', 'type'],
        where,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.$queryRaw<Array<{ month: string; type: string; total: Decimal }>>`
        SELECT
          TO_CHAR("occurredAt" AT TIME ZONE 'UTC', 'YYYY-MM') AS month,
          type::text,
          SUM(amount) AS total
        FROM transactions
        WHERE "userId" = ${userId}
          AND "occurredAt" >= ${yearStart}
          AND "occurredAt" < ${yearEnd}
        GROUP BY month, type
        ORDER BY month ASC
      `,
    ]);

    const catIds = [
      ...new Set(categoryGroups.map(g => g.categoryId).filter((id): id is string => id !== null)),
    ];
    const categories = catIds.length > 0
      ? await prisma.category.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true, icon: true } })
      : [];
    const catMap = new Map(categories.map(c => [c.id, c]));

    const totalIncome = (incomeAgg._sum.amount ?? new Decimal(0)).toString();
    const totalExpenses = (expenseAgg._sum.amount ?? new Decimal(0)).toString();
    const balance = new Decimal(totalIncome).sub(new Decimal(totalExpenses)).toString();

    // Build byMonth: all 12 months of the year, with zeros for months without data
    const monthlyMap = new Map<string, { income: Decimal; expenses: Decimal }>();
    for (const row of monthlyRows) {
      const entry = monthlyMap.get(row.month) ?? { income: new Decimal(0), expenses: new Decimal(0) };
      if (row.type === 'income') entry.income = new Decimal(row.total);
      else entry.expenses = new Decimal(row.total);
      monthlyMap.set(row.month, entry);
    }

    const byMonth: MonthlyBreakdown[] = Array.from({ length: 12 }, (_, i) => {
      const m = `${year}-${String(i + 1).padStart(2, '0')}`;
      const entry = monthlyMap.get(m) ?? { income: new Decimal(0), expenses: new Decimal(0) };
      return {
        month: m,
        income: entry.income.toString(),
        expenses: entry.expenses.toString(),
        balance: entry.income.sub(entry.expenses).toString(),
      };
    });

    return {
      totalIncome,
      totalExpenses,
      balance,
      transactions: { items: transactions.map(toResult), total },
      byEmotionTag: emotionGroups.map(g => ({
        emotionTag: g.emotionTag as 'need' | 'impulse' | 'emotional' | null,
        total: (g._sum.amount ?? new Decimal(0)).toString(),
        count: g._count._all,
      })),
      byCategory: categoryGroups.map(g => {
        const cat = g.categoryId ? catMap.get(g.categoryId) : undefined;
        return {
          categoryId: g.categoryId,
          categoryName: cat?.name ?? null,
          categoryIcon: cat?.icon ?? null,
          type: g.type as 'expense' | 'income',
          total: (g._sum.amount ?? new Decimal(0)).toString(),
          count: g._count._all,
        };
      }),
      byMonth,
    };
  }
}
