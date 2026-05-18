import { PrismaClient, RoleType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Upsert roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: RoleType.super_admin },
    update: {},
    create: {
      name: RoleType.super_admin,
      description: 'Full access to all resources',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: RoleType.admin },
    update: {},
    create: {
      name: RoleType.admin,
      description: 'Admin access to roles and categories',
    },
  });

  console.log('Roles seeded:', superAdminRole.name, adminRole.name);

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // 2. Super admin user
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@pulso.com' },
    update: {},
    create: {
      email: 'superadmin@pulso.com',
      passwordHash: hashedPassword,
      timezone: 'America/Los_Angeles',
      language: 'es',
      roleId: superAdminRole.id,
      person: {
        create: {
          firstName: 'Super',
          lastName: 'Admin',
        },
      },
    },
  });

  console.log('Super admin seeded:', superAdminUser.email);

  // 3. Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pulso.com' },
    update: {},
    create: {
      email: 'admin@pulso.com',
      passwordHash: hashedPassword,
      timezone: 'America/Los_Angeles',
      language: 'es',
      roleId: adminRole.id,
      person: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
        },
      },
    },
  });

  console.log('Admin seeded:', adminUser.email);

  // 4. Default subscription plan
  const plan = await prisma.subscriptionPlan.upsert({
    where: { id: 'seed-default-plan' },
    update: {},
    create: {
      id: 'seed-default-plan',
      name: 'Pulso Pro',
      priceAmount: 9.99,
      currency: 'USD',
      intervalDays: 30,
      isActive: true,
    },
  });

  // 5. Test user with active trial
  const trialDays = 14;
  const now = new Date();
  const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
  const hashedUserPassword = await bcrypt.hash('Test123!', 10);

  const testUser = await prisma.user.upsert({
    where: { email: 'davidt1987@gmail.com' },
    update: {},
    create: {
      email: 'davidt1987@gmail.com',
      passwordHash: hashedUserPassword,
      timezone: 'America/Mexico_City',
      language: 'es',
      person: {
        create: {
          firstName: 'David',
          lastName: 'Torres',
        },
      },
      subscription: {
        create: {
          planId: plan.id,
          status: 'trial',
          trialEndsAt: trialEnd,
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
        },
      },
    },
  });

  console.log('Test user seeded:', testUser.email);

  console.log('\nSeed complete. Credentials:');
  console.log('  superadmin@pulso.com / Admin123!');
  console.log('  admin@pulso.com      / Admin123!');
  console.log('  davidt1987@gmail.com / Test123!  (trial activo 14 días)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
