import prisma from '@/lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    include: { roles: { include: { role: true } } },
  });
  console.log('Users:', users);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect(); // Cleanly disconnect the Prisma Client
  });
