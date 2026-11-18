import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const rundownSchema = z.object({
  time: z.string().trim().min(1, 'Waktu wajib diisi').max(100),
  activity: z.string().trim().min(1, 'Kegiatan wajib diisi').max(150),
  description: z.string().trim().max(1000).optional(),
  order: z.number().int().min(0).max(10000).optional().default(0),
});

export const bulkRundownSchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), order: z.number().int().min(0).max(10000) })).max(100),
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

    const items=parsed.data.items;
    if(new Set(items.map(i=>i.id)).size!==items.length||new Set(items.map(i=>i.order)).size!==items.length)return res.status(400).json({error:'Urutan kegiatan tidak valid.'});
    const valid=await prisma.$transaction(async tx=>{
      const rows=await tx.rundown.findMany({where:{invitationId:invitation.id},select:{id:true}});
      if(rows.length!==items.length||!items.every(item=>rows.some(r=>r.id===item.id)))return false;
      for(const item of items)await tx.rundown.updateMany({where:{id:item.id,invitationId:invitation.id},data:{order:item.order}});
      return true;
    });
    if(!valid)return res.status(409).json({error:'Daftar kegiatan berubah. Muat ulang sebelum mengatur urutan.'});
    return res.json({ message: 'Urutan rundown diperbarui' });
  } catch (err) {
    console.error('Error reorderRundowns:', err);
    return res.status(500).json({ error: 'Gagal mengubah urutan rundown.' });
  }
}
