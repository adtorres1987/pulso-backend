import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { buildMessage, sendPushNotifications } from '../services/ExpoPushService';

async function runJob(): Promise<void> {
  // Find goals that are 100% complete (currentAmount >= targetAmount)
  const completedGoals = await prisma.savingGoal.findMany({
    where: {
      // Prisma doesn't support field comparisons directly; filter in JS
    },
    include: {
      user: {
        select: {
          language: true,
          pushTokens: { select: { token: true } },
        },
      },
    },
  });

  const messages = [];

  for (const goal of completedGoals) {
    if (goal.user.pushTokens.length === 0) continue;
    if (Number(goal.currentAmount) < Number(goal.targetAmount)) continue;

    const tokens = goal.user.pushTokens.map((t) => t.token);
    const isEs = goal.user.language === 'es';

    const title = isEs ? '🎉 ¡Meta alcanzada!' : '🎉 Goal reached!';
    const body = isEs
      ? `¡Felicidades! Alcanzaste tu meta "${goal.name}".`
      : `Congratulations! You reached your goal "${goal.name}".`;

    messages.push(...buildMessage(tokens, title, body, { screen: 'saving-goals' }));
  }

  if (messages.length > 0) {
    console.log(`[goal-completion] Sending ${messages.length} notifications`);
    await sendPushNotifications(messages);
  }
}

export function startGoalCompletionJob(): void {
  // Every Sunday at 10:00 AM UTC
  cron.schedule('0 10 * * 0', () => {
    void runJob();
  });
  console.log('[goal-completion] Cron job scheduled (Sundays at 10:00 UTC)');
}
