import { prisma } from '../lib/prisma.js';

export function calculateEntitlements(packageType, addonList = []) {
  const addons = new Set(Array.isArray(addonList) ? addonList : []);
  const isPremium = packageType === 'PREMIUM';
  const isStandard = packageType === 'STANDARD';

  return {
    maxGallery: (isPremium ? 30 : 10) + (addons.has('EXTRA_GALLERY_10') ? 10 : 0),
    maxGuests: isPremium ? null : (isStandard ? 100 : 10) + (addons.has('EXTRA_GUESTS_100') ? 100 : 0),
    qrGuestbook: addons.has('QR_GUESTBOOK'),
    giftEnabled: true,
    livestreamEnabled: true,
  };
}

export async function getEntitlements(invitation, db = prisma) {
  const orders = await db.order.findMany({
    where: { invitationId: invitation.id, status: 'SUCCESS' },
    select: { addons: true },
  });
  const result = calculateEntitlements(
    invitation.packageType,
    orders.flatMap((order) => Array.isArray(order.addons) ? order.addons : []),
  );
  if(invitation.weddingId){const grant=await db.weddingAddon.findUnique({where:{weddingId_addon:{weddingId:invitation.weddingId,addon:'QR_GUESTBOOK'}}});if(grant)result.qrGuestbook=!grant.revokedAt;else if(!result.qrGuestbook)result.qrGuestbook=Boolean(await db.order.findFirst({where:{status:'SUCCESS',invitation:{weddingId:invitation.weddingId,userId:invitation.userId},addons:{array_contains:['QR_GUESTBOOK']}},select:{id:true}}))}
  return result;
}
