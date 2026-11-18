import { prisma } from '../lib/prisma.js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function getPackageExpiresAt(weddingDate) {
  const eventTime = new Date(weddingDate).getTime();
  if (!Number.isFinite(eventTime)) throw new Error('Tanggal pernikahan tidak valid.');
  return new Date(eventTime + THIRTY_DAYS_MS);
}

export async function activateOrder(order, {actorId,reason}={}) {
  const expiresAt = getPackageExpiresAt(order.invitation.weddingDate);
  const giftEnabled = true;
  const livestreamEnabled = true;

  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM orders WHERE id = ${order.id} FOR UPDATE`;
    const latest=await tx.order.findUnique({where:{id:order.id}});
    if(latest.status==='SUCCESS'){
      if(!actorId && latest.activationSource!=='gateway'){
        await tx.order.update({where:{id:order.id},data:{activationSource:'gateway',paidAt:new Date()}});
        await tx.adminAuditLog.create({data:{actorId:'system:payment-gateway',action:'order.payment_confirmed',targetType:'order',targetId:order.id,reason:'Notifikasi pembayaran gateway terverifikasi setelah aktivasi sebelumnya.',before:{activationSource:latest.activationSource},after:{activationSource:'gateway'}}});
      }
      return;
    }
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'SUCCESS', paidAt: new Date(),activationSource:actorId?'manual':'gateway',activationReason:reason||null },
    });
    if(actorId)await tx.adminAuditLog.create({data:{actorId,action:'order.activate',targetType:'order',targetId:order.id,reason,before:{status:latest.status},after:{status:'SUCCESS',activationSource:'manual'}}});
    const current=await tx.invitation.findUnique({where:{id:order.invitationId}});
    if (latest.kind !== 'ADDON') await tx.invitation.update({
      where: { id: order.invitationId },
      // Pembayaran mengaktifkan paket; publikasi dilakukan terpisah setelah checklist konten lolos.
      data: { packageType: order.packageType, status: ['archived','trashed','published'].includes(current?.status)?current.status:'draft', expiresAt },
    });
    if(current?.weddingId && Array.isArray(latest.addons) && latest.addons.includes('QR_GUESTBOOK')) {
      await tx.weddingAddon.upsert({where:{weddingId_addon:{weddingId:current.weddingId,addon:'QR_GUESTBOOK'}},create:{weddingId:current.weddingId,addon:'QR_GUESTBOOK'},update:{revokedAt:null}});
    }
    await tx.invitationFeatures.upsert({
      where: { invitationId: order.invitationId },
      update: {},
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
