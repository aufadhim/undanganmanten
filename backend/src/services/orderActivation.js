import { prisma } from '../lib/prisma.js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function getPackageExpiresAt(weddingDate) {
  const eventTime = new Date(weddingDate).getTime();
  if (!Number.isFinite(eventTime)) throw new Error('Tanggal pernikahan tidak valid.');
  return new Date(eventTime + THIRTY_DAYS_MS);
}

export async function activateOrder(order) {
  const expiresAt = getPackageExpiresAt(order.invitation.weddingDate);
  const addons = Array.isArray(order.addons) ? order.addons : [];
  const giftEnabled = order.packageType === 'PREMIUM' || addons.includes('AMPLOP_DIGITAL');
  const livestreamEnabled = order.packageType === 'PREMIUM';

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'SUCCESS', paidAt: new Date() },
    });
    await tx.invitation.update({
      where: { id: order.invitationId },
      // Pembayaran mengaktifkan paket; publikasi dilakukan terpisah setelah checklist konten lolos.
      data: { packageType: order.packageType, status: 'draft', expiresAt },
    });
    await tx.invitationFeatures.upsert({
      where: { invitationId: order.invitationId },
      update: { giftEnabled, livestreamEnabled },
      create: {
        invitationId: order.invitationId,
        rsvpEnabled: true,
        giftEnabled,
        livestreamEnabled,
      },
    });
  });

  return expiresAt;
}
