import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { buildMessage, sendPushNotifications } from '../services/ExpoPushService';

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthToRange(month: string): { gte: Date; lte: Date } {
  const [y, m] = month.split('-').map(Number);
  const start = new Date(y!, m! - 1, 1);
  const end = new Date(y!, m!, 0, 23, 59, 59, 999);
  return { gte: start, lte: end };
}

async function runJob(): Promise<void> {
  const month = currentMonth();
  const range = monthToRange(month);

  const budgets = await prisma.budget.findMany({
    where: { month },
    include: {
      category: { select: { name: true } },
      user: {
        select: {
          language: true,
          pushTokens: { select: { token: true } },
        },
      },
    },
  });

  const messages = [];

  for (const budget of budgets) {
    if (budget.user.pushTokens.length === 0) continue;

    const agg = await prisma.transaction.aggregate({
      where: {
        userId: budget.userId,
        type: 'expense',
        categoryId: budget.categoryId ?? undefined,
        ...(budget.categoryId === null && { categoryId: null }),
        occurredAt: range,
      },
      _sum: { amount: true },
    });

    const spent = Number(agg._sum.amount ?? 0);
    const limit = Number(budget.amount);
    const pct = limit > 0 ? (spent / limit) * 100 : 0;

    if (pct < 80) continue;

    const tokens = budget.user.pushTokens.map((t) => t.token);
    const isEs = budget.user.language === 'es';
    const catName = budget.category?.name ?? (isEs ? 'Sin categoría' : 'Uncategorized');
    const pctStr = Math.round(pct).toString();

    const title = isEs ? '⚠️ Alerta de presupuesto' : '⚠️ Budget alert';
    const body = isEs
      ? `Has usado el ${pctStr}% del presupuesto de "${catName}".`
      : `You've used ${pctStr}% of the "${catName}" budget.`;

    messages.push(...buildMessage(tokens, title, body, { screen: 'budgets' }));
  }

  if (messages.length > 0) {
    console.log(`[budget-alert] Sending ${messages.length} notifications`);
    await sendPushNotifications(messages);
  }
}

export function startBudgetAlertJob(): void {
  // Every day at 8:00 PM UTC
  cron.schedule('0 20 * * *', () => {
    void runJob();
  });
  console.log('[budget-alert] Cron job scheduled (daily at 20:00 UTC)');
}
