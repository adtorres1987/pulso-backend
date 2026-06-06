import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { startRecurringTransactionJob } from './jobs/processRecurringTransactions';

async function main() {
  await prisma.$connect();
  console.log('Database connected');

  startRecurringTransactionJob();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
