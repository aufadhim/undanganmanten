import { prisma } from '../lib/prisma.js';

export function calculateEntitlements(packageType, addonList = []) {
  const addons = new Set(Array.isArray(addonList) ? addonList : []);
  const isPremium = packageType === 'PREMIUM';
  const isStandard = packageType === 'STANDARD';

  return {
    maxGallery: (isPremium ? 30 : 10) + (addons.has('EXTRA_GALLERY_10') ? 10 : 0),
    maxGuests: isPremium ? null : (isStandard ? 100 : 10) + (addons.has('EXTRA_GUESTS_100') ? 100 : 0),
    giftEnabled: true,
    livestreamEnabled: true,
  };
}

export async function getEntitlements(invitation) {
  const orders = await prisma.order.findMany({
    where: { invitationId: invitation.id, status: 'SUCCESS' },
    select: { addons: true },
  });
  return calculateEntitlements(
    invitation.packageType,
    orders.flatMap((order) => Array.isArray(order.addons) ? order.addons : []),
  );
}
