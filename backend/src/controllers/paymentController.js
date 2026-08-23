import midtransClient from 'midtrans-client';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

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
    name: 'Paket Premium (All-Inclusive + Addons)',
    price: 129000,
    maxGallery: 30,
  }
};

export const ADDONS = {
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
    const targetPackage = packageType || 'STANDARD';

    if (!['STANDARD', 'PREMIUM'].includes(targetPackage)) {
      return res.status(400).json({ error: 'Paket yang dipilih tidak valid.' });
    }

    const invitation = await getInvitation(req);
    if (!invitation) {
      return res.status(404).json({ error: 'Undangan belum dibuat.' });
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

    // 2. Add-ons Opsional (Jika memilih Paket STANDARD)
    const validAddons = [];
    if (targetPackage === 'STANDARD' && Array.isArray(selectedAddons)) {
      for (const addonKey of selectedAddons) {
        if (ADDONS[addonKey]) {
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
      }
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

    return res.json({ token: transaction.token, orderId: orderId, amount: totalAmount });
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
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      orderStatus = 'FAILED';
    }

    const order = await prisma.order.findUnique({ where: { midtransOrderId: orderId } });
    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    if (order.status === 'PENDING' && orderStatus === 'SUCCESS') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'SUCCESS', paidAt: new Date() }
      });

      const invitation = await prisma.invitation.findUnique({
        where: { id: order.invitationId },
        include: { invitationFeatures: true }
      });

      const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
      const newExpiresAt = new Date(Date.now() + ONE_YEAR_MS);

      // Aktifkan Paket & Status Publish
      await prisma.invitation.update({
        where: { id: order.invitationId },
        data: {
          packageType: order.packageType,
          status: 'published',
          expiresAt: newExpiresAt
        }
      });

      // Aktifkan Fitur berdasarkan Paket atau Add-ons yang dibeli
      const addons = Array.isArray(order.addons) ? order.addons : [];
      const hasAmplopAddon = addons.includes('AMPLOP_DIGITAL') || order.packageType === 'PREMIUM';

      await prisma.invitationFeatures.upsert({
        where: { invitationId: order.invitationId },
        update: {
          giftEnabled: hasAmplopAddon,
          livestreamEnabled: order.packageType === 'PREMIUM',
        },
        create: {
          invitationId: order.invitationId,
          rsvpEnabled: true,
          giftEnabled: hasAmplopAddon,
          livestreamEnabled: order.packageType === 'PREMIUM',
        }
      });
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
