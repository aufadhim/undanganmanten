import { request as httpsRequest } from 'node:https';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import {checkoutPlan} from '../utils/checkoutPlan.js';
import midtransClient from 'midtrans-client';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { getEntitlements } from '../utils/entitlements.js';
import { activateOrder, getPackageExpiresAt } from '../services/orderActivation.js';

// Setup konfigurasi midtrans
const snap = new midtransClient.Snap({
  isProduction: env.midtransIsProduction,
  serverKey: env.midtransServerKey || 'SB-Mid-server-YOUR_SERVER_KEY',
  clientKey: env.midtransClientKey || 'SB-Mid-client-YOUR_CLIENT_KEY'
});

const tripay = env.tripay;
// The merchant whitelist applies to the server's outbound address.
function tripayRequest(url, { method = 'GET', headers, signal, body }) {
  return new Promise((resolve, reject) => {
    const requestHeaders = body ? { ...headers, 'Content-Length': Buffer.byteLength(body) } : headers;
    const req = httpsRequest(url, { method, headers: requestHeaders, signal, family: 4 }, response => {
      response.setEncoding('utf8');
      let data = '';
      response.on('data', chunk => { data += chunk; });
      response.on('error', reject);
      response.on('end', () => {
        try { resolve({ status: response.statusCode, ok: response.statusCode >= 200 && response.statusCode < 300, json: JSON.parse(data) }); }
        catch (error) { reject(error); }
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}
const live = tripay.mode === 'production';
export const tripayEnabled = Boolean(
  tripay.apiKey && tripay.privateKey && tripay.merchantCode && tripay.method &&
  (live || tripay.mode === 'sandbox')
);
const canUseSandbox = account => account?.role === 'ADMIN' ||
  Boolean(account?.email && tripay.sandboxAccounts.includes(account.email.toLowerCase()));

async function availableMethods() {
  try {
    const response = await tripayRequest('https://tripay.co.id/' + (live ? 'api' : 'api-sandbox') + '/merchant/payment-channel', {
      headers: { Authorization: 'Bearer ' + tripay.apiKey },
      signal: AbortSignal.timeout(5000),
    });
    const result = response.json;
    if (response.ok && result.success && Array.isArray(result.data)) {
      return [...new Set(result.data.filter(channel => [true, 1, '1'].includes(channel.active) && /^[A-Z0-9_]{2,32}$/.test(channel.code)).map(channel => channel.code))];
    }
  } catch (error) {
    console.warn('Tripay channel check failed:', error.name);
  }
  return [];
}

export async function paymentAvailability(req, res) {
  const sandbox = tripayEnabled && !live;
  const account = sandbox ? await prisma.user.findUnique({ where: { id: req.userId }, select: { role: true, email: true } }) : null;
  const enabled = tripayEnabled && (live || canUseSandbox(account));
  const methods = enabled ? await availableMethods() : [];
  return res.json({ enabled: methods.length > 0, sandbox: enabled && sandbox, methods });
}
const signature = value => createHmac('sha256', tripay.privateKey).update(value).digest('hex');
const checkoutLink = order => ({
  payment: order.tripay, checkoutUrl: order.tripay.checkoutUrl, orderId: order.midtransOrderId, amount: order.amount,
});

export const PACKAGES = {
  STANDARD: {
    name: 'Paket Standard (Semua Fitur Utama)',
    price: 99000,
    maxGallery: 10,
  },
  PREMIUM: {
    name: 'Undangan Digital Premium',
    price: 129000,
    maxGallery: 30,
  }
};

export const ADDONS = {
  QR_GUESTBOOK: {
    id: 'QR_GUESTBOOK',
    name: 'Add-on Buku Tamu QR Code Scanner',
    price: 20000,
  },
  AMPLOP_DIGITAL: {
    id: 'AMPLOP_DIGITAL',
    name: 'Add-on Amplop Digital & Hadiah',
    price: 20000,
  },
  EXTRA_GUESTS_100: {
    id: 'EXTRA_GUESTS_100',
    name: 'Add-on +100 Kuota WA Blast Tamu',
    price: 15000,
  },
  EXTRA_GALLERY_10: {
    id: 'EXTRA_GALLERY_10',
    name: 'Add-on +10 Foto Galeri Tambahan',
    price: 15000,
  }
};

// Helper mengambil data undangan aktif milik user
async function getInvitation(req) {
  const invitationId =
    (typeof req === 'object' && req !== null ? req.params?.id || req.params?.invitationId || req.headers?.['x-invitation-id'] || req.query?.invitationId || req.body?.invitationId : null) ||
    (typeof req === 'string' ? req : null);

  return prisma.invitation.findFirst({
    where: {
      userId: typeof req === 'object' ? req.userId : req,
      status: { notIn: ['archived','trashed'] },
      ...(invitationId ? { id: invitationId } : {}),
    },
    include: { user: true, invitationFeatures: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOrders(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) {
      return res.status(404).json({ error: 'Undangan belum dibuat.' });
    }
    const orders = await prisma.order.findMany({
      where: { invitationId: invitation.id },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ orders: orders.map(order => order.tripay?.sandboxPaidAt
      ? { ...order, status: 'SUCCESS', paidAt: order.tripay.sandboxPaidAt }
      : order) });
  } catch (err) {
    console.error('Error getOrders:', err);
    return res.status(500).json({ error: 'Gagal mengambil riwayat transaksi.' });
  }
}

export async function createCheckout(req, res) {
  if (!tripayEnabled) return res.status(503).json({ error: 'Pembayaran online belum tersedia.' });
  let preparingOrderId;
  try {
    const invitation = await getInvitation(req);
    if (!invitation) {
      return res.status(404).json({ error: 'Undangan belum dibuat.' });
    }
    if (!live && !canUseSandbox(invitation.user)) {
      return res.status(403).json({ error: 'Checkout sandbox hanya tersedia untuk akun pengujian.' });
    }
    const methods = await availableMethods();
    const method = req.body?.method ?? (methods.includes(tripay.method) ? tripay.method : methods[0]);
    if (!methods.includes(method)) {
      return res.status(400).json({ error: 'Metode pembayaran tidak tersedia.' });
    }
    if (getPackageExpiresAt(invitation.weddingDate) <= new Date()) {
      return res.status(400).json({ error: 'Tanggal H+30 undangan sudah berlalu. Perbarui tanggal acara sebelum melakukan pembayaran.' });
    }

    let plan;
    try{plan=checkoutPlan(invitation,await getEntitlements(invitation),req.body,{packages:PACKAGES,addons:ADDONS})}catch(e){return res.status(e.status||400).json({error:e.message})}
    const addonOnly=plan.kind==='ADDON',targetPackage=plan.packageType,validAddons=plan.addons,itemDetails=plan.items,totalAmount=plan.amount;

    const orderId = `TP-${randomUUID()}`;

    // Simpan Order ke DB dengan status PENDING
    const order = await prisma.$transaction(async tx=>{
      if(invitation.weddingId)await tx.$queryRaw`SELECT id FROM weddings WHERE id = ${invitation.weddingId} FOR UPDATE`;
      else await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${invitation.id} FOR UPDATE`;
      if(validAddons.includes('QR_GUESTBOOK') && (await getEntitlements(invitation,tx)).qrGuestbook)throw new Error('QR_ACTIVE');
      const pending=await tx.order.findMany({where:{invitation:invitation.weddingId?{weddingId:invitation.weddingId,userId:req.userId}:{id:invitation.id},status:'PENDING',createdAt:{gt:new Date(Date.now()-86400000)}},orderBy:{createdAt:'desc'}});
      const same=pending.find(o=>!o.tripay?.sandboxPaidAt&&o.midtransOrderId.startsWith('TP-')&&o.tripay?.mode===tripay.mode&&(o.tripay?.method || tripay.method)===method&&o.invitationId===invitation.id&&o.kind===(addonOnly?'ADDON':'PACKAGE')&&o.amount===totalAmount&&JSON.stringify([...(o.addons||[])].sort())===JSON.stringify([...validAddons].sort()));
      if(same){if(same.tripay?.checkoutUrl)return same;throw new Error('PREPARING')}
      if(live&&validAddons.includes('QR_GUESTBOOK')&&pending.some(o=>!o.tripay?.sandboxPaidAt&&(live?o.tripay?.mode!=='sandbox':o.tripay?.mode==='sandbox')&&o.addons?.includes('QR_GUESTBOOK')))throw new Error('PENDING_QR');
      return tx.order.create({data:{invitationId:invitation.id,packageType:addonOnly?invitation.packageType:targetPackage,kind:addonOnly?'ADDON':'PACKAGE',addons:validAddons,amount:totalAmount,midtransOrderId:orderId,status:'PENDING',tripay:{mode:tripay.mode,method}}});
    });
    if (order.tripay.checkoutUrl) return res.json(checkoutLink(order));
    preparingOrderId = order.id;
    const frontend = new URL(env.frontendUrl);
    const returnUrl = new URL('/dashboard', frontend);
    returnUrl.searchParams.set('section', 'billing');
    returnUrl.searchParams.set('invitation', invitation.id);
    const response = await tripayRequest('https://tripay.co.id/' + (live ? 'api' : 'api-sandbox') + '/transaction/create', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + tripay.apiKey, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        method, merchant_ref: orderId, amount: totalAmount,
        customer_name: live ? invitation.user.email.split('@')[0] : 'Penguji Samavaya',
        customer_email: live ? invitation.user.email : 'sandbox@example.com',
        ...(live && invitation.user.phone ? { customer_phone: invitation.user.phone } : {}),
        order_items: itemDetails.map(({ id, ...item }) => ({ sku: id, ...item })),
        callback_url: new URL('/api/payments/tripay/callback', frontend).href,
        return_url: returnUrl.href,
        expired_time: Math.floor(Date.now() / 1000) + 3600,
        signature: signature(tripay.merchantCode + orderId + totalAmount),
      }),
    });
    const result = response.json;
    if (!response.ok || !result.success || !result.data?.reference) {
      const message = String(result.message || '');
      const reason = /whitelist|unauthorized ip/i.test(message) ? 'IP_WHITELIST'
        : /signature|private key/i.test(message) ? 'SIGNATURE'
        : /customer_phone|nomor (?:hp|telepon)|phone number/i.test(message) ? 'PHONE'
        : /expired_time|expiration|kedaluwarsa/i.test(message) ? 'EXPIRY'
        : 'REJECTED';
      console.warn('Tripay create rejected:', response.status, method, reason);
      throw new Error('TRIPAY_CREATE_' + reason);
    }
    const url = new URL(result.data.checkout_url);
    if (url.protocol !== 'https:' || !['tripay.co.id', 'payment.tripay.co.id'].includes(url.hostname)) {
      throw new Error('TRIPAY_CHECKOUT_URL');
    }
    const fee = Number(result.data.fee_customer);
    if (!Number.isSafeInteger(fee) || fee < 0) throw new Error('TRIPAY_FEE');
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { tripay: { mode: tripay.mode, reference: result.data.reference, checkoutUrl: url.href, fee, method, payCode: result.data.pay_code || null, qrString: result.data.qr_string || null, expiresAt: Number(result.data.expired_time) || null } },
    });
    return res.json(checkoutLink(updated));
  } catch (err) {
    if(['QR_ACTIVE','PREPARING','PENDING_QR'].includes(err.message))return res.status(409).json({error:{QR_ACTIVE:'Buku tamu QR sudah aktif.',PREPARING:'Pembayaran sedang disiapkan. Coba lagi sebentar.',PENDING_QR:'Sudah ada pembayaran buku tamu yang menunggu. Selesaikan pembayaran sebelumnya.'}[err.message]});
    if(preparingOrderId)await prisma.order.updateMany({where:{id:preparingOrderId,status:'PENDING',snapToken:null},data:{status:'FAILED'}}).catch(()=>{});
    const messages = {
      TRIPAY_CREATE_PHONE: 'Metode ini memerlukan nomor HP yang valid. Perbarui nomor di Profil Akun atau pilih metode lain.',
      TRIPAY_CREATE_SIGNATURE: 'Tripay belum dapat memverifikasi konfigurasi pembayaran Samavaya. Hubungi bantuan Samavaya.',
      TRIPAY_CREATE_IP_WHITELIST: 'Koneksi pembayaran Samavaya belum dapat diverifikasi oleh Tripay. Coba lagi nanti.',
      TRIPAY_CREATE_EXPIRY: 'Batas waktu tagihan ditolak oleh kanal pembayaran. Pilih metode lain atau hubungi bantuan Samavaya.',
    };
    console.error('Tripay checkout failed:', /^TRIPAY_[A-Z_]+$/.test(err.message) ? err.message : err.name);
    return res.status(502).json({ error: messages[err.message] || 'Tagihan belum berhasil dibuat. Coba lagi atau hubungi bantuan Samavaya.' });
  }
}

// Endpoint webhook yang dipanggil oleh server Midtrans
export async function midtransWebhook(req, res) {
  if (!env.midtransServerKey) return res.status(503).json({ error: 'Pembayaran online belum tersedia.' });
  try {
    const statusResponse = await snap.transaction.notification(req.body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let orderStatus = 'PENDING';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        orderStatus = 'SUCCESS';
      }
    } else if (transactionStatus === 'settlement') {
      orderStatus = 'SUCCESS';
    } else if (transactionStatus === 'expire') {
      orderStatus = 'EXPIRED';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny') {
      orderStatus = 'FAILED';
    }

    const order = await prisma.order.findUnique({
      where: { midtransOrderId: orderId },
      include: { invitation: { select: { weddingDate: true } } },
    });
    if (!order || order.tripay) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    // Order yang sudah final tidak boleh diturunkan statusnya oleh notifikasi terlambat.
    if (order.status !== 'PENDING' && !(orderStatus==='SUCCESS'&&order.status==='SUCCESS'&&order.activationSource!=='gateway')) {
      return res.status(200).json({ message: 'OK' });
    }

    if (orderStatus === 'SUCCESS') {
      await activateOrder(order);
    } else if (orderStatus === 'FAILED' || orderStatus === 'EXPIRED') {
      await prisma.order.updateMany({
        where: { id: order.id, status:'PENDING' },
        data: { status: orderStatus }
      });
    }

    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('Midtrans Webhook error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function tripayCallback(req, res) {
  if (!tripayEnabled) return res.sendStatus(503);
  const header = req.get('X-Callback-Signature') || '';
  if (!req.tripayRawBody || !/^[0-9a-f]{64}$/i.test(header) ||
      !timingSafeEqual(Buffer.from(header, 'hex'), Buffer.from(signature(req.tripayRawBody), 'hex'))) {
    return res.status(401).json({ success: false });
  }
  if (req.get('X-Callback-Event') !== 'payment_status') return res.status(400).json({ success: false });
  const event = req.body;
  if (typeof event?.merchant_ref !== 'string') return res.status(400).json({ success: false });
  try {
    const order = await prisma.order.findUnique({
      where: { midtransOrderId: event.merchant_ref },
      include: { invitation: { select: { weddingDate: true } } },
    });
    const gateway = order?.tripay;
    if (!gateway?.reference || gateway.mode !== tripay.mode || gateway.reference !== event.reference ||
        Number(event.is_closed_payment) !== 1 || Number(event.total_amount) !== order.amount + gateway.fee) {
      return res.status(409).json({ success: false });
    }
    await applyTripayStatus(order, event.status);
    return res.json({ success: true });
  } catch (error) {
    console.error('Tripay callback failed:', error.name);
    return res.status(500).json({ success: false });
  }
}

async function applyTripayStatus(order, status) {
    const gateway = order.tripay;
    if (!live && status === 'PAID') {
      if (order.status === 'PENDING' && !gateway.sandboxPaidAt) {
        await prisma.order.updateMany({
          where: { id: order.id, status: 'PENDING', tripay: { equals: gateway } },
          data: { tripay: { ...gateway, sandboxPaidAt: new Date().toISOString() } },
        });
      }
      return;
    }
    if (!live && gateway.sandboxPaidAt) return;
    if (status === 'PAID' && !gateway.refundedAt && ['PENDING', 'SUCCESS'].includes(order.status)) {
      await activateOrder(order);
    } else if (['FAILED', 'EXPIRED'].includes(status)) {
      await prisma.order.updateMany({ where: { id: order.id, status: 'PENDING' }, data: { status: status } });
    } else if (status === 'REFUND' && order.status === 'SUCCESS' && !gateway.refundedAt) {
      await prisma.order.update({ where: { id: order.id }, data: {
        tripay: { ...gateway, refundedAt: new Date().toISOString() },
      } });
    }
}

export async function refreshTripayOrder(req, res) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.orderId, invitation: { userId: req.userId } },
      include: { invitation: { select: { weddingDate: true } } },
    });
    if (!order) return res.sendStatus(404);
    const gateway = order.tripay;
    if (!tripayEnabled || !gateway?.reference || gateway.mode !== tripay.mode) {
      return res.status(409).json({ error: 'Transaksi ini tidak bisa diperiksa lewat koneksi Tripay saat ini.' });
    }
    const url = new URL('https://tripay.co.id/' + (live ? 'api' : 'api-sandbox') + '/transaction/detail');
    url.searchParams.set('reference', gateway.reference);
    const response = await tripayRequest(url, {
      headers: { Authorization: 'Bearer ' + tripay.apiKey },
      signal: AbortSignal.timeout(10000),
    });
    const { success, data } = response.json;
    if (!response.ok || !success || !data || data.reference !== gateway.reference ||
        data.merchant_ref !== order.midtransOrderId || Number(data.amount) !== order.amount + gateway.fee) {
      return res.status(502).json({ error: 'Detail pembayaran dari Tripay belum dapat diverifikasi.' });
    }
    await applyTripayStatus(order, data.status);
    return res.json({ status: data.status });
  } catch (error) {
    console.warn('Tripay status check failed:', error.name);
    return res.status(503).json({ error: 'Tripay belum bisa dihubungi. Coba cek status lagi.' });
  }
}
