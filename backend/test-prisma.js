import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const inv = await prisma.invitation.findFirst();
    if(!inv) return console.log("No invitation found");
    console.log("Using invitation", inv.id);
    
    const event = await prisma.event.create({
      data: {
        type: 'akad',
        date: null,
        startTime: "",
        endTime: "",
        venueName: "",
        address: "",
        googleMapsUrl: "",
        lat: null,
        lng: null,
        invitationId: inv.id,
      },
    });
    console.log("Created event:", event);
  } catch(err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
