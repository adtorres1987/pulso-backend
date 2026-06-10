import { EmotionTag, Prisma, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../../../config/prisma';
import { IDashboardRepository, DashboardData, MonthlyBreakdown, BudgetBreakdown, CategoryTrendData } from '../../domain/repositories/IDashboardRepository';
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
  accountId: true,
  account: { select: { id: true, name: true, type: true } },
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
  accountId: string | null;
  account: { id: string; name: string; type: string } | null;
}): TransactionResult => ({ ...raw, amount: raw.amount.toString(), images: [] });

export class PrismaDashboardRepository implements IDashboardRepository {
  async getDashboard(userId: string, startDate: Date, endDate: Date, page: number, limit: number, accountId?: string): Promise<DashboardData> {
    const dateFilter = { gte: startDate, lt: endDate };
    const where = { userId, occurredAt: dateFilter, ...(accountId ? { accountId } : {}) };
    const accountFilter = accountId ? Prisma.sql`AND "accountId" = ${accountId}` : Prisma.empty;

    const year = startDate.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

    const month = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}`;

    const [transactions, total, incomeAgg, expenseAgg, emotionGroups, categoryGroups, monthlyRows, budgetRows] = await Promise.all([
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
          ${accountFilter}
        GROUP BY month, type
        ORDER BY month ASC
      `,
      prisma.budget.findMany({
        where: { userId, month },
        select: {
          id: true,
          categoryId: true,
          amount: true,
          category: { select: { name: true, icon: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
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

    // Build budgets with spent amounts
    const budgets: BudgetBreakdown[] = await Promise.all(
      budgetRows.map(async (b) => {
        const spentAgg = await prisma.transaction.aggregate({
          where: {
            userId,
            type: TransactionType.expense,
            categoryId: b.categoryId ?? undefined,
            ...(b.categoryId === null && { categoryId: null }),
            occurredAt: dateFilter,
          },
          _sum: { amount: true },
        });
        const spent = Number(spentAgg._sum.amount ?? 0);
        const limit = Number(b.amount);
        return {
          id: b.id,
          categoryId: b.categoryId,
          categoryName: b.category?.name ?? null,
          categoryIcon: b.category?.icon ?? null,
          amount: b.amount.toString(),
          spent: spent.toFixed(2),
          percentage: limit > 0 ? Math.round((spent / limit) * 100) : 0,
        };
      }),
    );

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
      budgets,
    };
  }

  async getCategoryTrend(userId: string, months: number): Promise<CategoryTrendData> {
    const now = new Date();
    // Start of the oldest month we need
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));
    const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    // Build month labels for all N months
    const monthLabels: string[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      monthLabels.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
    }

    // Fetch per-month, per-category totals (expenses only for category trend)
    const [expenseRows, incomeExpenseRows] = await Promise.all([
      prisma.$queryRaw<Array<{ month: string; categoryId: string | null; total: Decimal }>>`
        SELECT
          TO_CHAR("occurredAt" AT TIME ZONE 'UTC', 'YYYY-MM') AS month,
          "categoryId",
          SUM(amount) AS total
        FROM transactions
        WHERE "userId" = ${userId}
          AND "occurredAt" >= ${startDate}
          AND "occurredAt" < ${endDate}
          AND type = 'expense'
        GROUP BY month, "categoryId"
      `,
      prisma.$queryRaw<Array<{ month: string; type: string; total: Decimal }>>`
        SELECT
          TO_CHAR("occurredAt" AT TIME ZONE 'UTC', 'YYYY-MM') AS month,
          type::text,
          SUM(amount) AS total
        FROM transactions
        WHERE "userId" = ${userId}
          AND "occurredAt" >= ${startDate}
          AND "occurredAt" < ${endDate}
        GROUP BY month, type
      `,
    ]);

    // Build monthly trend (income / expenses / balance per month)
    const monthlyMap = new Map<string, { income: Decimal; expenses: Decimal }>();
    for (const row of incomeExpenseRows) {
      const entry = monthlyMap.get(row.month) ?? { income: new Decimal(0), expenses: new Decimal(0) };
      if (row.type === 'income') entry.income = new Decimal(row.total);
      else entry.expenses = new Decimal(row.total);
      monthlyMap.set(row.month, entry);
    }

    const monthlyTrend = monthLabels.map(m => {
      const entry = monthlyMap.get(m) ?? { income: new Decimal(0), expenses: new Decimal(0) };
      return {
        month: m,
        income: entry.income.toString(),
        expenses: entry.expenses.toString(),
        balance: entry.income.sub(entry.expenses).toString(),
      };
    });

    // Find top 5 categories by total expense across the window
    const catTotals = new Map<string | null, Decimal>();
    for (const row of expenseRows) {
      const key = row.categoryId ?? null;
      catTotals.set(key, (catTotals.get(key) ?? new Decimal(0)).add(new Decimal(row.total)));
    }
    const top5Keys = [...catTotals.entries()]
      .sort((a, b) => Number(b[1].sub(a[1])))
      .slice(0, 5)
      .map(([id]) => id);

    // Fetch category metadata
    const catIds = top5Keys.filter((id): id is string => id !== null);
    const categories = catIds.length > 0
      ? await prisma.category.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true, icon: true } })
      : [];
    const catMeta = new Map(categories.map(c => [c.id, c]));

    // Build per-category per-month totals
    const expenseIndex = new Map<string, Map<string | null, Decimal>>();
    for (const row of expenseRows) {
      if (!expenseIndex.has(row.month)) expenseIndex.set(row.month, new Map());
      expenseIndex.get(row.month)!.set(row.categoryId ?? null, new Decimal(row.total));
    }

    const categoryTrend = top5Keys.map(catId => {
      const meta = catId ? catMeta.get(catId) : undefined;
      return {
        categoryId: catId,
        categoryName: meta?.name ?? null,
        categoryIcon: meta?.icon ?? null,
        byMonth: monthLabels.map(m => ({
          month: m,
          total: (expenseIndex.get(m)?.get(catId) ?? new Decimal(0)).toString(),
        })),
      };
    });

    return { monthlyTrend, categoryTrend };
  }
}
