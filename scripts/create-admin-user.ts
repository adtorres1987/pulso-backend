import { PrismaClient, RoleType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function parseArgs(): { email: string; password: string; role: 'super_admin' | 'admin' } {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : undefined;
  };

  const email = get('--email');
  const password = get('--password');
  const role = get('--role') as 'super_admin' | 'admin' | undefined;

  if (!email || !password || !role) {
    console.error('Usage: tsx scripts/create-admin-user.ts --email <email> --password <password> --role <super_admin|admin>');
    process.exit(1);
  }

  if (!['super_admin', 'admin'].includes(role)) {
    console.error('--role must be "super_admin" or "admin"');
    process.exit(1);
  }

  return { email, password, role };
}

async function main() {
  const { email, password, role } = parseArgs();

  const roleRecord = await prisma.role.upsert({
    where: { name: role as RoleType },
    update: {},
    create: { name: role as RoleType, description: role === 'super_admin' ? 'Full access' : 'Admin access' },
  });

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const updated = await prisma.user.update({
      where: { email },
      data: { roleId: roleRecord.id },
    });
    console.log(`✓ Role "${role}" assigned to existing user: ${updated.email} (id: ${updated.id})`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      timezone: 'America/Mexico_City',
      language: 'es',
      roleId: roleRecord.id,
    },
  });

  console.log(`✓ Created ${role}: ${user.email} (id: ${user.id})`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
