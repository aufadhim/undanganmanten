import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const invs = await prisma.invitation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  
  if (invs.length > 0) {
    const inv = invs[0];
    const background = { primary: '#fafaf9', secondary: '#f5f5f4' };
    const bodyText = { primary: '#292524', secondary: '#1c1917', tertiary: '#292524' };
    const button = { primary: '#292524', text: '#fafaf9' };
    
    await prisma.invitation.update({
      where: { id: inv.id },
      data: {
        themeSettings: {
          update: {
            background,
            bodyText,
            button
          }
        }
      }
    });
    console.log('Fixed theme colors for invitation:', inv.id);
  } else {
    console.log('No invitations found.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
