import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const rundownSchema = z.object({
  time: z.string().min(1, 'Waktu wajib diisi'),
  activity: z.string().min(1, 'Kegiatan wajib diisi'),
  order: z.number().optional().default(0),
});

export const bulkRundownSchema = z.object({
  items: z.array(z.object({ id: z.string(), order: z.number() })),
});

async function getInvitation(req) {
    const invitationId = req.body?.invitationId || req.query?.invitationId || req.headers?.['x-invitation-id'];
    return prisma.invitation.findFirst({
        where: {
            userId: req.userId,
            ...(invitationId ? { id: invitationId } : {}),
        }
    });
}

// POST /api/invitations/me/rundowns
export async function createRundown(req, res) {
  try {
    const parsed = rundownSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Undangan tidak ditemukan.' });

    const rundown = await prisma.rundown.create({
      data: {
        invitationId: invitation.id,
        ...parsed.data,
      },
    });
    return res.status(201).json({ message: 'Rundown ditambahkan', rundown });
  } catch (err) {
    console.error('Error createRundown:', err);
    return res.status(500).json({ error: 'Gagal menambah rundown.' });
  }
}

// PATCH /api/invitations/me/rundowns/:id
export async function updateRundown(req, res) {
  try {
    const { id } = req.params;
    const parsed = rundownSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Undangan tidak ditemukan.' });

    const rundown = await prisma.rundown.findFirst({ where: { id, invitationId: invitation.id } });
    if (!rundown) return res.status(404).json({ error: 'Rundown tidak ditemukan' });

    const updated = await prisma.rundown.update({
      where: { id },
      data: parsed.data,
    });
    return res.json({ message: 'Rundown diperbarui', rundown: updated });
  } catch (err) {
    console.error('Error updateRundown:', err);
    return res.status(500).json({ error: 'Gagal memperbarui rundown.' });
  }
}

// DELETE /api/invitations/me/rundowns/:id
export async function deleteRundown(req, res) {
  try {
    const { id } = req.params;
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Undangan tidak ditemukan.' });

    const rundown = await prisma.rundown.findFirst({ where: { id, invitationId: invitation.id } });
    if (!rundown) return res.status(404).json({ error: 'Rundown tidak ditemukan' });

    await prisma.rundown.delete({ where: { id } });
    return res.json({ message: 'Rundown dihapus' });
  } catch (err) {
    console.error('Error deleteRundown:', err);
    return res.status(500).json({ error: 'Gagal menghapus rundown.' });
  }
}

// POST /api/invitations/me/rundowns/reorder
export async function reorderRundowns(req, res) {
  try {
    const parsed = bulkRundownSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Undangan tidak ditemukan.' });

    const updates = parsed.data.items.map(item =>
      prisma.rundown.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    );

    await prisma.$transaction(updates);
    return res.json({ message: 'Urutan rundown diperbarui' });
  } catch (err) {
    console.error('Error reorderRundowns:', err);
    return res.status(500).json({ error: 'Gagal mengubah urutan rundown.' });
  }
}
