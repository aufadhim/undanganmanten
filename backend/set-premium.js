import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.invitation.updateMany({
    data: { packageType: 'PREMIUM' }
  });
  console.log('All invitations updated to PREMIUM');
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
