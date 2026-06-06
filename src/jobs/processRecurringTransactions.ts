import cron from 'node-cron';
import { prisma } from '../config/prisma';
import {
  PrismaRecurringTransactionRepository,
  computeNextRunDate,
} from '../modules/recurring-transactions/infrastructure/repositories/PrismaRecurringTransactionRepository';

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function runJob(): Promise<void> {
  const repo = new PrismaRecurringTransactionRepository();
  const today = todayISO();
  const due = await repo.findDue(today);

  if (due.length === 0) return;

  console.log(`[recurring] Processing ${due.length} due recurring transactions for ${today}`);

  for (const rt of due) {
    try {
      await prisma.transaction.create({
        data: {
          userId: rt.userId,
          type: rt.type,
          amount: rt.amount,
          categoryId: rt.categoryId,
          note: rt.note,
          emotionTag: rt.emotionTag as never,
          occurredAt: new Date(`${today}T12:00:00`),
        },
      });

      const next = computeNextRunDate(rt.nextRunDate, rt.frequency);
      const expired = rt.endDate !== null && next > rt.endDate;

      if (expired) {
        await repo.deactivate(rt.id);
      } else {
        await repo.updateNextRunDate(rt.id, next);
      }
    } catch (err) {
      console.error(`[recurring] Error processing recurring transaction ${rt.id}:`, err);
    }
  }
}

export function startRecurringTransactionJob(): void {
  // Runs every day at 00:05
  cron.schedule('5 0 * * *', () => {
    void runJob();
  });
  console.log('[recurring] Cron job scheduled (daily at 00:05)');
}
