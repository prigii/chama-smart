const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating admin user...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@chamasmart.com' },
    update: {},
    create: {
      email: 'admin@chamasmart.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '+254712345678',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('Email:', admin.email);
  console.log('Password: admin123');
  console.log('\nYou can now sign in at http://localhost:3000');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
