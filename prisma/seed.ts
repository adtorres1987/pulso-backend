import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@pulso.com' },
    update: {},
    create: {
      email: 'admin@pulso.com',
      name: 'Admin',
      password: hashedPassword,
    },
  });

  console.log('Seeded user:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
