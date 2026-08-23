import { prisma } from '../lib/prisma.js';

// 1. Get Admin Dashboard Statistics (Omzet, Total Users, Total Invitations, Active/Draft counts, Monthly breakdown)
export async function getAdminStats(req, res) {
  try {
    const totalUsers = await prisma.user.count();
    const totalInvitations = await prisma.invitation.count();
    const publishedInvitations = await prisma.invitation.count({ where: { status: 'published' } });
    const draftInvitations = await prisma.invitation.count({ where: { status: 'draft' } });

    // Success orders & Omzet
    const successfulOrders = await prisma.order.findMany({
      where: { status: 'SUCCESS' },
      select: { amount: true, createdAt: true, packageType: true }
    });

    const totalRevenue = successfulOrders.reduce((sum, order) => sum + order.amount, 0);
    const totalOrdersCount = await prisma.order.count();

    // Stats Distribusi Paket
    const standardCount = await prisma.invitation.count({ where: { packageType: 'STANDARD' } });
    const premiumCount = await prisma.invitation.count({ where: { packageType: 'PREMIUM' } });
    const trialCount = await prisma.invitation.count({ where: { packageType: 'TRIAL' } });

    // 6 Bulan Terakhir Revenue Chart Data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const label = `${monthNames[mIdx]} ${yr}`;

      const revenueInMonth = successfulOrders
        .filter((o) => {
          const od = new Date(o.createdAt);
          return od.getMonth() === mIdx && od.getFullYear() === yr;
        })
        .reduce((sum, o) => sum + o.amount, 0);

      chartData.push({ month: label, revenue: revenueInMonth });
    }

    return res.json({
      stats: {
        totalUsers,
        totalInvitations,
        publishedInvitations,
        draftInvitations,
        totalRevenue,
        totalOrdersCount,
        distribution: { trialCount, standardCount, premiumCount },
        chartData,
      }
    });
  } catch (err) {
    console.error('Error getAdminStats:', err);
    return res.status(500).json({ error: 'Gagal mengambil statistik admin.' });
  }
}

// 2. List All Orders
export async function getAdminOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        invitation: {
          include: {
            user: { select: { id: true, email: true, phone: true } },
            coupleProfile: { select: { brideName: true, groomName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ orders });
  } catch (err) {
    console.error('Error getAdminOrders:', err);
    return res.status(500).json({ error: 'Gagal mengambil daftar order admin.' });
  }
}

// 3. Manual Activation Order / Override Payment
export async function manualActivateOrder(req, res) {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan.' });
    }

    // Update status order ke SUCCESS
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'SUCCESS', paidAt: new Date() }
    });

    // Aktifkan paket invitation & perpanjang 1 tahun
    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
    const newExpiresAt = new Date(Date.now() + ONE_YEAR_MS);

    await prisma.invitation.update({
      where: { id: order.invitationId },
      data: {
        packageType: order.packageType,
        status: 'published',
        expiresAt: newExpiresAt
      }
    });

    // Aktifkan fitur pendukung
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

    return res.json({ message: 'Order berhasil diaktifkan secara manual oleh Admin.' });
  } catch (err) {
    console.error('Error manualActivateOrder:', err);
    return res.status(500).json({ error: 'Gagal mengaktifkan order.' });
  }
}

// 4. List All Invitations Across Platform
export async function getAdminInvitations(req, res) {
  try {
    const invitations = await prisma.invitation.findMany({
      include: {
        user: { select: { id: true, email: true, phone: true, role: true } },
        coupleProfile: true,
        _count: { select: { guests: true, wishes: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ invitations });
  } catch (err) {
    console.error('Error getAdminInvitations:', err);
    return res.status(500).json({ error: 'Gagal mengambil daftar undangan.' });
  }
}

// 5. Update Invitation Status (Publish / Unpublish / Extend Expiry)
export async function updateAdminInvitation(req, res) {
  try {
    const { invitationId } = req.params;
    const { status, packageType, extendDays } = req.body;

    const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invitation) return res.status(404).json({ error: 'Undangan tidak ditemukan.' });

    const updateData = {};
    if (status) updateData.status = status;
    if (packageType) updateData.packageType = packageType;
    if (extendDays) {
      const currentExpiry = new Date(invitation.expiresAt).getTime();
      const addedMs = parseInt(extendDays) * 24 * 60 * 60 * 1000;
      updateData.expiresAt = new Date(currentExpiry + addedMs);
    }

    const updated = await prisma.invitation.update({
      where: { id: invitationId },
      data: updateData,
      include: { coupleProfile: true, user: true }
    });

    return res.json({ message: 'Undangan berhasil diperbarui oleh Admin.', invitation: updated });
  } catch (err) {
    console.error('Error updateAdminInvitation:', err);
    return res.status(500).json({ error: 'Gagal memperbarui undangan.' });
  }
}

// 6. List All Users & Change Role
export async function getAdminUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: { select: { invitation: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ users });
  } catch (err) {
    console.error('Error getAdminUsers:', err);
    return res.status(500).json({ error: 'Gagal mengambil daftar pengguna.' });
  }
}

// 7. Toggle User Role (Make Admin / Make User)
export async function updateUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true }
    });

    return res.json({ message: `Role user ${updatedUser.email} diubah menjadi ${role}.`, user: updatedUser });
  } catch (err) {
    console.error('Error updateUserRole:', err);
    return res.status(500).json({ error: 'Gagal memperbarui role pengguna.' });
  }
}
