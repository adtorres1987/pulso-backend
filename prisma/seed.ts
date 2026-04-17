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

  console.log('\nSeed complete. Credentials:');
  console.log('  superadmin@pulso.com / Admin123!');
  console.log('  admin@pulso.com      / Admin123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
