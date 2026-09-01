import midtransClient from 'midtrans-client';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { activateOrder, getPackageExpiresAt } from '../services/orderActivation.js';

// Setup konfigurasi midtrans
const snap = new midtransClient.Snap({
  isProduction: env.midtransIsProduction,
  serverKey: env.midtransServerKey || 'SB-Mid-server-YOUR_SERVER_KEY',
  clientKey: env.midtransClientKey || 'SB-Mid-client-YOUR_CLIENT_KEY'
});

export const PACKAGES = {
  STANDARD: {
    name: 'Paket Standard (Semua Fitur Utama)',
    price: 79000,
    maxGallery: 10,
  },
  PREMIUM: {
    name: 'Undangan Digital Premium',
    price: 119000,
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
    (typeof req === 'object' && req !== null ? req.headers?.['x-invitation-id'] || req.query?.invitationId || req.body?.invitationId || req.params?.invitationId : null) ||
    (typeof req === 'string' ? req : null);

  return prisma.invitation.findFirst({
    where: {
      userId: typeof req === 'object' ? req.userId : req,
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

    return res.json({ orders });
  } catch (err) {
    console.error('Error getOrders:', err);
    return res.status(500).json({ error: 'Gagal mengambil riwayat transaksi.' });
  }
}

export async function createCheckout(req, res) {
  try {
    const { packageType, selectedAddons = [] } = req.body;
    const targetPackage = packageType || 'PREMIUM';

    if (targetPackage !== 'PREMIUM') {
      return res.status(400).json({ error: 'Saat ini hanya Paket Premium yang tersedia.' });
    }
    if (!Array.isArray(selectedAddons) || selectedAddons.some((addon) => addon !== 'QR_GUESTBOOK')) {
      return res.status(400).json({ error: 'Add-on yang dipilih tidak tersedia.' });
    }

    const invitation = await getInvitation(req);
    if (!invitation) {
      return res.status(404).json({ error: 'Undangan belum dibuat.' });
    }
    if (getPackageExpiresAt(invitation.weddingDate) <= new Date()) {
      return res.status(400).json({ error: 'Tanggal H+30 undangan sudah berlalu. Perbarui tanggal acara sebelum melakukan pembayaran.' });
    }

    // Kalkulasi Rincian Item & Total Harga
    const itemDetails = [];
    let totalAmount = 0;

    // 1. Paket Utama
    const basePkg = PACKAGES[targetPackage];
    itemDetails.push({
      id: `PKG-${targetPackage}`,
      price: basePkg.price,
      quantity: 1,
      name: basePkg.name,
    });
    totalAmount += basePkg.price;

    // 2. Add-on opsional dapat dipilih bersama paket aktif.
    const validAddons = [];
    for (const addonKey of selectedAddons) {
      const addonObj = ADDONS[addonKey];
      itemDetails.push({
        id: addonObj.id,
        price: addonObj.price,
        quantity: 1,
        name: addonObj.name,
      });
      totalAmount += addonObj.price;
      validAddons.push(addonKey);
    }

    const orderId = `UM-${Date.now()}-${invitation.id.substring(0, 8)}`;

    // Simpan Order ke DB dengan status PENDING
    const order = await prisma.order.create({
      data: {
        invitationId: invitation.id,
        packageType: targetPackage,
        addons: validAddons,
        amount: totalAmount,
        midtransOrderId: orderId,
        status: 'PENDING'
      }
    });

    // Parameter yang dikirim ke Midtrans
    const params = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount
      },
      customer_details: {
        email: invitation.user.email,
        phone: invitation.user.phone || ''
      },
      item_details: itemDetails
    };

    const transaction = await snap.createTransaction(params);

    // Update snap token ke DB
    await prisma.order.update({
      where: { id: order.id },
      data: { snapToken: transaction.token }
    });

    return res.json({ token: transaction.token, snapToken: transaction.token, orderId, amount: totalAmount });
  } catch (err) {
    console.error('Midtrans createTransaction error:', err);
    return res.status(500).json({ error: 'Gagal membuat transaksi pembayaran.' });
  }
}

// Endpoint webhook yang dipanggil oleh server Midtrans
export async function midtransWebhook(req, res) {
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
    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    // Order yang sudah final tidak boleh diturunkan statusnya oleh notifikasi terlambat.
    if (order.status !== 'PENDING') {
      return res.status(200).json({ message: 'OK' });
    }

    if (orderStatus === 'SUCCESS') {
      await activateOrder(order);
    } else if (orderStatus === 'FAILED' || orderStatus === 'EXPIRED') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: orderStatus }
      });
    }

    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('Midtrans Webhook error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
