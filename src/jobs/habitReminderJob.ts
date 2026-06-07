import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { buildMessage, sendPushNotifications } from '../services/ExpoPushService';

function todayDateOnly(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

async function runJob(): Promise<void> {
  const today = todayDateOnly();

  // Find users who have active daily habits not yet completed today
  const usersWithPending = await prisma.habit.findMany({
    where: {
      active: true,
      frequency: 'daily',
      logs: {
        none: {
          date: today,
          completed: true,
        },
      },
    },
    select: {
      userId: true,
      user: {
        select: {
          pushTokens: { select: { token: true } },
          language: true,
        },
      },
    },
    distinct: ['userId'],
  });

  const messages = usersWithPending.flatMap(({ user }) => {
    const tokens = user.pushTokens.map((t) => t.token);
    const isEs = user.language === 'es';
    return buildMessage(
      tokens,
      isEs ? '¡No olvides tus hábitos! 🔥' : 'Don\'t forget your habits! 🔥',
      isEs
        ? 'Tienes hábitos pendientes por completar hoy.'
        : 'You have habits to complete today.',
      { screen: 'habits' },
    );
  });

  if (messages.length > 0) {
    console.log(`[habit-reminder] Sending ${messages.length} notifications`);
    await sendPushNotifications(messages);
  }
}

export function startHabitReminderJob(): void {
  // Every day at 9:00 AM UTC
  cron.schedule('0 9 * * *', () => {
    void runJob();
  });
  console.log('[habit-reminder] Cron job scheduled (daily at 09:00 UTC)');
}
