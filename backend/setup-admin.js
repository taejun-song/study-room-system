const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating admin user...');

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        role: 'ADMIN',
        name: 'Admin User',
        phone: '+821012345678',
        email: 'admin@example.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        status: 'ACTIVE',
      },
    });

    console.log('✅ Admin user created!');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');

    // Create join codes
    console.log('\nCreating join codes...');

    const studentCode = await prisma.joinCode.create({
      data: {
        code: 'STUDENT2024',
        roleScope: 'STUDENT',
        maxUses: 100,
        usedCount: 0,
      },
    });

    const parentCode = await prisma.joinCode.create({
      data: {
        code: 'PARENT2024',
        roleScope: 'PARENT',
        maxUses: 100,
        usedCount: 0,
      },
    });

    const mentorCode = await prisma.joinCode.create({
      data: {
        code: 'MENTOR2024',
        roleScope: 'MENTOR',
        maxUses: 100,
        usedCount: 0,
      },
    });

    console.log('✅ Join codes created!');
    console.log('   Student code: STUDENT2024');
    console.log('   Parent code:  PARENT2024');
    console.log('   Mentor code:  MENTOR2024');

    console.log('\n🎉 Setup complete! You can now sign up with these codes.');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ User or join code already exists. Skipping...');
    } else {
      console.error('Error:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
