import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial admin user directly to Supabase...');
  try {
    const defaultTenant = await prisma.tenant.upsert({
      where: { domain: 'default' },
      update: {},
      create: {
        domain: 'default',
        name: 'Default Vendor'
      }
    });

    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@nestely.com' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const admin = await prisma.user.create({
        data: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@nestely.com',
          passwordHash: hashedPassword,
          role: 'ADMIN',
          tenantId: defaultTenant.id,
          active: true
        }
      });
      console.log('Admin user successfully created! 🚀');
      console.log('Email: admin@nestely.com');
      console.log('Password: password123');
    } else {
      console.log('Admin user already exists in Supabase. ✅');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
