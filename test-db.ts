import { prisma } from './packages/db/src';

async function main() {
  try {
    console.log('--- DB CONNECTION TEST ---');
    const userCount = await prisma.user.count();
    console.log(`Connection successful. Current user count: ${userCount}`);
    
    console.log('--- CREATING TEST USER ---');
    const testUser = await prisma.user.upsert({
      where: { username: 'test_admin' },
      update: {},
      create: {
        username: 'test_admin',
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=admin',
      },
    });
    console.log(`Test user verified: ${testUser.username} (ID: ${testUser.id})`);
    
    console.log('--- DB TEST COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('DB TEST FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
