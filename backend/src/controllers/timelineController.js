import { prisma } from '../lib/prisma.js';
import { timelineStorySchema } from '../utils/validators.js';

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
    orderBy: { createdAt: 'desc' },
  });
}

// GET /api/invitations/me/timeline
export async function listTimeline(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const stories = await prisma.timelineStory.findMany({
      where: { invitationId: invitation.id },
      orderBy: { order: 'asc' },
    });

    return res.json({ stories });
  } catch (err) {
    console.error('Error listTimeline:', err);
    return res.status(500).json({ error: 'Gagal mengambil daftar cerita timeline.' });
  }
}

// POST /api/invitations/me/timeline
export async function createTimelineStory(req, res) {
  try {
    const parsed = timelineStorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const count = await prisma.timelineStory.count({
      where: { invitationId: invitation.id },
    });

    const story = await prisma.timelineStory.create({
      data: {
        ...parsed.data,
        order: parsed.data.order ?? count,
        invitationId: invitation.id,
      },
    });

    return res.status(201).json({ message: 'Cerita berhasil ditambahkan.', story });
  } catch (err) {
    console.error('Error createTimelineStory:', err);
    return res.status(500).json({ error: 'Gagal menambahkan cerita.' });
  }
}

// PATCH /api/invitations/me/timeline/:storyId
export async function updateTimelineStory(req, res) {
  try {
    const parsed = timelineStorySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const { storyId } = req.params;
    const story = await prisma.timelineStory.findFirst({
      where: { id: storyId, invitationId: invitation.id },
    });

    if (!story) return res.status(404).json({ error: 'Cerita tidak ditemukan.' });

    const updated = await prisma.timelineStory.update({
      where: { id: storyId },
      data: parsed.data,
    });

    return res.json({ message: 'Cerita berhasil diperbarui.', story: updated });
  } catch (err) {
    console.error('Error updateTimelineStory:', err);
    return res.status(500).json({ error: 'Gagal memperbarui cerita.' });
  }
}

// DELETE /api/invitations/me/timeline/:storyId
export async function deleteTimelineStory(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const { storyId } = req.params;
    const story = await prisma.timelineStory.findFirst({
      where: { id: storyId, invitationId: invitation.id },
    });

    if (!story) return res.status(404).json({ error: 'Cerita tidak ditemukan.' });

    await prisma.timelineStory.delete({ where: { id: storyId } });
    return res.json({ message: 'Cerita berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleteTimelineStory:', err);
    return res.status(500).json({ error: 'Gagal menghapus cerita.' });
  }
}