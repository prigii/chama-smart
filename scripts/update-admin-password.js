const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 resetting admin password...');

  // Use the same hashing logic as the application
  const hashedPassword = await bcrypt.hash('admin123', 10);

  try {
    const admin = await prisma.user.upsert({
      where: { email: 'admin@chamasmart.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'admin@chamasmart.com',
        password: hashedPassword,
        name: 'Admin User',
        phone: '+254712345678',
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin password reset successfully!');
    console.log('--------------------------------------------------');
    console.log('Email:    admin@chamasmart.com');
    console.log('Password: admin123');
    console.log('--------------------------------------------------');
    console.log('You can now sign in at http://localhost:3000');
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
