import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.invitation.updateMany({
    data: {
      packageType: 'PREMIUM'
    }
  });
  console.log("Semua undangan telah diupgrade ke paket PREMIUM!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
