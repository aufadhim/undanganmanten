import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const updated = await prisma.invitation.updateMany({
        data: {
            status: 'published'
        }
    });
    console.log(`Updated ${updated.count} invitations to 'published'.`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
