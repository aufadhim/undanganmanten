import { createHash, randomBytes } from 'node:crypto';
import { sendPlannerInvitation } from '../utils/email.js';
import { env } from '../config/env.js';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const router = Router({ mergeParams: true });
router.use((_req, res, next) => { res.set('Cache-Control', 'private, no-store'); next(); });
const inviteLimit = rateLimit({ windowMs: 3600000, limit: 10, keyGenerator: req => req.userId, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Terlalu banyak undangan. Coba lagi nanti.' } });
const day = 86400000;
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(value);
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value && +date >= +new Date('1900-01-01');
}, 'Tanggal tidak valid.').transform(value => new Date(value));
const taskSchema = z.object({ title: z.string().trim().min(1).max(140), dueDate: dateOnly, done: z.boolean().optional(), category: z.string().trim().min(1).max(50).optional(), owner: z.string().trim().max(100).optional() });
const presets = [
  ['documents', 'Siapkan dokumen pernikahan', 75, 'Administrasi'],
  ['venue', 'Tentukan lokasi dan kapasitas acara', 90, 'Vendor'],
  ['catering', 'Bandingkan paket katering', 75, 'Vendor'],
  ['prewedding', 'Jadwalkan sesi foto prewedding', 60, 'Prewedding'],
  ['attire', 'Jadwalkan fitting busana pengantin', 30, 'Pengantin'],
  ['gifts', 'Periksa seserahan dan mahar', 14, 'Seserahan'],
  ['day-of', 'Konfirmasi rundown dan PIC acara', 3, 'Hari H'],
  ['details', 'Lengkapi informasi acara', 45],
  ['guests', 'Susun daftar tamu', 35],
  ['preview', 'Periksa pratinjau dan terbitkan undangan', 30],
  ['share', 'Bagikan undangan pribadi', 21],
  ['rsvp', 'Cek RSVP dan konfirmasi jumlah tamu', 7],
];

function owned(handler) {
  return async (req, res) => {
    try {
      const wedding = await prisma.wedding.findFirst({
        where: { id: req.params.id, user: { suspendedAt: null }, OR: [{ userId: req.userId }, { plannerMembers: { some: { userId: req.userId, acceptedAt: { not: null } } } }] },
      });
      if (!wedding) return res.status(404).json({ error: 'Pernikahan tidak ditemukan.' });
      const actor = await prisma.user.findUnique({ where: { id: req.userId }, select: { email: true } });
      req.plannerActor = actor.email;
      await handler(req, res, wedding);
    } catch (error) {
      console.error('Wedding planner:', error.code || error.name);
      if (!res.headersSent) res.status(500).json({ error: 'Planner belum bisa diproses. Coba lagi.' });
    }
  };
}

router.get('/', owned(async (_req, res, wedding) => {
  const tasks = await prisma.weddingPlannerTask.findMany({
    where: { weddingId: wedding.id }, orderBy: [{ dueDate: 'asc' }, { id: 'asc' }],
  });
  res.json({ tasks });
}));

router.post('/starter', owned(async (_req, res, wedding) => {
  const date = new Date(wedding.weddingDate.toISOString().slice(0, 10));
  await prisma.weddingPlannerTask.createMany({
    data: presets.map(([preset, title, days, category = 'Undangan dan Tamu']) => ({
      weddingId: wedding.id, updatedBy: _req.plannerActor, preset, title, category, dueDate: new Date(+date - days * day),
    })),
    skipDuplicates: true,
  });
  res.status(204).end();
}));

router.post('/', owned(async (req, res, wedding) => {
  const input = taskSchema.safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Isi nama tugas dan tanggal yang valid.' });
  const task = await prisma.weddingPlannerTask.create({ data: { ...input.data, updatedBy: req.plannerActor, weddingId: wedding.id } });
  res.status(201).json({ task });
}));

const label = z.string().trim().min(1).max(140);
const short = z.string().trim().max(140).default('');
const notes = z.string().trim().max(2000).default('');
const amount = z.number().int().min(0).max(1e12).default(0);
const due = dateOnly.transform(value => value.toISOString().slice(0, 10)).or(z.literal('')).default('');
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const referenceUrl = z.string().trim().max(2000).refine(value => {
  if (!value) return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}, 'Tautan harus memakai http atau https.').default('');
const schemas = {
  savings: z.object({ title: label, contributor: short, value: amount, date: due, notes }),
  documents: z.object({ title: label, authority: short, owner: short, due, status: z.enum(['Belum diurus','Dalam proses','Lengkap']), url: referenceUrl, notes }),
  uniforms: z.object({ title: label, group: short, size: short, fabric: short, tailor: short, quantity: z.number().int().min(1).max(100000), due, status: z.enum(['Belum dipesan','Dipesan','Dijahit','Siap','Dibagikan']), notes }),
  songs: z.object({ title: label, artist: short, moment: short, start: time.or(z.literal('')).default(''), owner: short, url: referenceUrl, ready: z.boolean().default(false), notes }),
  moodboard: z.object({ title: label, category: short, imageUrl: referenceUrl, url: referenceUrl, owner: short, selected: z.boolean().default(false), notes }),
  shots: z.object({ title: label, moment: short, people: short, location: short, owner: short, done: z.boolean().default(false), notes }),
  budget: z.object({ title: label, category: short, estimate: amount, actual: amount, paid: amount, due, notes }),
  vendors: z.object({ title: label, category: short, contact: short, package: notes, url: referenceUrl, status: z.enum(['Riset','Dihubungi','Dipesan','Selesai']).default('Riset'), capacity: z.number().int().min(0).max(100000).default(0), estimate: amount, actual: amount, paid: amount, due, selected: z.boolean().default(false), notes }),
  gifts: z.object({ title: label, category: z.enum(['Seserahan', 'Mahar']), url: referenceUrl, package: notes, status: z.enum(['Riset','Dipesan','Diterima','Siap']).default('Riset'), quantity: z.number().int().min(1).max(100000), estimate: amount, owner: short, ready: z.boolean().default(false), notes }),
  schedule: z.object({ title: label, event: label, date: due, start: time, end: time.or(z.literal('')).default(''), location: short, owner: short, notes }).refine(row => !row.end || row.end >= row.start, 'Jam selesai harus setelah jam mulai.'),
};
function parseEntry(req) {
  return Object.hasOwn(schemas, req.params.module) ? schemas[req.params.module].safeParse(req.body) : null;
}
router.get('/entries', owned(async (_req, res, wedding) => {
  const [entries, guests, responses, attendance] = await Promise.all([
    prisma.weddingPlannerEntry.findMany({ where: { weddingId: wedding.id }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }),
    prisma.guest.count({ where: { weddingId: wedding.id } }),
    prisma.guest.count({ where: { weddingId: wedding.id, rsvp: { isNot: null } } }),
    prisma.rsvpResponse.aggregate({ where: { attending: true, guest: { weddingId: wedding.id } }, _sum: { guestCount: true } }),
  ]);
  res.json({ settings: wedding.plannerSettings, role: wedding.userId === _req.userId ? "owner" : "member", entries, guests, responses, attending: attendance._sum.guestCount ?? 0 });
}));
router.post('/entries/:module', owned(async (req, res, wedding) => {
  const input = parseEntry(req);
  if (!input?.success) return res.status(400).json({ error: 'Periksa kembali isian.' });
  const entry = await prisma.weddingPlannerEntry.create({ data: { weddingId: wedding.id, module: req.params.module, updatedBy: req.plannerActor, details: input.data } });
  res.status(201).json({ entry });
}));
router.put('/entries/:module/:entryId', owned(async (req, res, wedding) => {
  const input = parseEntry(req);
  if (!input?.success) return res.status(400).json({ error: 'Periksa kembali isian.' });
  const result = await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM wedding_planner_entries WHERE id=${req.params.entryId} AND wedding_id=${wedding.id} FOR UPDATE`;
    const existing = await tx.weddingPlannerEntry.findFirst({ where: { id: req.params.entryId, weddingId: wedding.id, module: req.params.module } });
    if (!existing) return { count: 0 };
    if (['budget','vendors'].includes(req.params.module) && Object.hasOwn(existing.details, 'payments')) {
      input.data.payments = existing.details.payments;
      input.data.paid = existing.details.payments.reduce((sum, row) => sum + row.value, 0);
    }
    return tx.weddingPlannerEntry.updateMany({ where: { id: existing.id, weddingId: wedding.id }, data: { details: input.data, updatedBy: req.plannerActor } });
  });
  if (!result.count) return res.status(404).json({ error: 'Data tidak ditemukan.' });
  res.status(204).end();
}));
router.delete('/entries/:module/:entryId', owned(async (req, res, wedding) => {
  const result = await prisma.weddingPlannerEntry.deleteMany({ where: { id: req.params.entryId, weddingId: wedding.id, module: req.params.module } });
  if (!result.count) return res.status(404).json({ error: 'Data tidak ditemukan.' });
  res.status(204).end();
}));


const hash = token => createHash('sha256').update(token).digest('hex');
router.put('/settings', owned(async (req,res,wedding) => {
 const input = z.object({ budgetTarget: amount, savingsTarget: amount, categories: z.array(z.object({ title: label, limit: amount })).max(100).refine(rows => new Set(rows.map(r => r.title.toLowerCase())).size === rows.length, 'Nama kategori harus unik.') }).safeParse(req.body);
 if (!input.success) return res.status(400).json({error:'Target tidak valid.'});
 await prisma.wedding.update({where:{id:wedding.id},data:{plannerSettings:{...input.data,updatedBy:req.plannerActor,updatedAt:new Date().toISOString()}}});
 res.status(204).end();
}));
router.post('/payments/:entryId', owned(async(req,res,wedding) => {
 const input=z.object({value:z.number().int().positive().max(1e12),date:dateOnly.transform(d=>d.toISOString().slice(0,10)),notes}).safeParse(req.body);
 if(!input.success)return res.status(400).json({error:'Isi nominal dan tanggal pembayaran.'});
 const payments = await prisma.$transaction(async tx=>{
  const rows=await tx.$queryRaw`SELECT id FROM wedding_planner_entries WHERE id=${req.params.entryId} AND wedding_id=${wedding.id} FOR UPDATE`;
  const entry=rows.length && await tx.weddingPlannerEntry.findUnique({where:{id:req.params.entryId}});
  if(!entry || !['budget','vendors'].includes(entry.module)) return null;
  const payments=[...(entry.details.payments || (entry.details.paid ? [{id:randomBytes(12).toString('hex'),value:entry.details.paid,date:'',notes:'Saldo pembayaran sebelumnya',by:entry.updatedBy}] : [])),{...input.data,id:randomBytes(12).toString('hex'),by:req.plannerActor}];
  await tx.weddingPlannerEntry.update({where:{id:entry.id},data:{details:{...entry.details,payments,paid:payments.reduce((s,p)=>s+p.value,0)},updatedBy:req.plannerActor}});
  return payments;
 });
 if (!payments) return res.status(404).json({error:'Pos biaya tidak ditemukan.'});
 res.status(201).json({payments});
}));
router.delete('/payments/:entryId/:paymentId', owned(async(req,res,wedding)=>{
 const removed = await prisma.$transaction(async tx=>{
  const rows=await tx.$queryRaw`SELECT id FROM wedding_planner_entries WHERE id=${req.params.entryId} AND wedding_id=${wedding.id} FOR UPDATE`;
  const entry=rows.length && await tx.weddingPlannerEntry.findUnique({where:{id:req.params.entryId}});
  if(!entry || !['budget','vendors'].includes(entry.module)) return false;
  const payments=(entry.details.payments||[]).filter(p=>p.id!==req.params.paymentId);
  await tx.weddingPlannerEntry.update({where:{id:entry.id},data:{details:{...entry.details,payments,paid:payments.reduce((s,p)=>s+p.value,0)},updatedBy:req.plannerActor}});
  return true;
 });
 if (!removed) return res.status(404).json({error:'Data tidak ditemukan.'});
 res.status(204).end();
}));
router.get('/access', owned(async(req,res,wedding)=>{
 if(wedding.userId!==req.userId)return res.status(403).json({error:'Hanya pemilik dapat mengelola akses.'});
 const members=await prisma.plannerMember.findMany({where:{weddingId:wedding.id},select:{id:true,email:true,acceptedAt:true,expiresAt:true}});
 const shares=await prisma.plannerShare.findMany({where:{weddingId:wedding.id},select:{id:true,expiresAt:true}});
 res.json({members,shares});
}));
router.post('/access', inviteLimit, owned(async(req,res,wedding)=>{
 if(wedding.userId!==req.userId)return res.status(403).json({error:'Hanya pemilik dapat mengundang pasangan.'});
 const input=z.object({email:z.string().trim().toLowerCase().email().max(254)}).safeParse(req.body);
 if(!input.success || input.data.email===req.plannerActor)return res.status(400).json({error:'Masukkan email pasangan yang berbeda.'});
 if(await prisma.plannerMember.count({where:{weddingId:wedding.id}})>=10 && !await prisma.plannerMember.findUnique({where:{weddingId_email:{weddingId:wedding.id,email:input.data.email}}}))return res.status(400).json({error:'Maksimal 10 anggota.'});
 const existing=await prisma.plannerMember.findUnique({where:{weddingId_email:{weddingId:wedding.id,email:input.data.email}}});
 if(existing?.acceptedAt)return res.status(409).json({error:'Anggota sudah memiliki akses.'});
 const token=randomBytes(32).toString('hex');
 const member=await prisma.plannerMember.upsert({where:{weddingId_email:{weddingId:wedding.id,email:input.data.email}},create:{weddingId:wedding.id,email:input.data.email,tokenHash:hash(token),expiresAt:new Date(Date.now()+7*86400000)},update:{tokenHash:hash(token),expiresAt:new Date(Date.now()+7*86400000)}});
 try{await sendPlannerInvitation(input.data.email,env.frontendUrl+'/planner/invite/'+token);res.status(201).json({message:'Undangan dikirim. Berlaku 7 hari.'});}
 catch{await prisma.plannerMember.deleteMany({where:{id:member.id,tokenHash:hash(token)}});res.status(502).json({error:'Email belum terkirim. Coba undang kembali.'});}
}));
router.delete('/access/:memberId', owned(async(req,res,wedding)=>{
 if(wedding.userId!==req.userId)return res.status(403).json({error:'Akses ditolak.'});
 await prisma.plannerMember.deleteMany({where:{id:req.params.memberId,weddingId:wedding.id}});res.status(204).end();
}));
router.post('/shares', owned(async(req,res,wedding)=>{
 if(wedding.userId!==req.userId)return res.status(403).json({error:'Hanya pemilik dapat membagikan rundown.'});
 if(await prisma.plannerShare.count({where:{weddingId:wedding.id,expiresAt:{gt:new Date()}}})>=20)return res.status(400).json({error:'Cabut tautan lama sebelum membuat yang baru.'});
 const token=randomBytes(32).toString('hex'),expiresAt=new Date(Date.now()+30*86400000);
 await prisma.plannerShare.create({data:{weddingId:wedding.id,tokenHash:hash(token),expiresAt}});
 res.status(201).json({url:env.frontendUrl+'/planner/rundown/'+token,expiresAt});
}));
router.delete('/shares/:shareId', owned(async(req,res,wedding)=>{
 if(wedding.userId!==req.userId)return res.status(403).json({error:'Akses ditolak.'});
 await prisma.plannerShare.deleteMany({where:{id:req.params.shareId,weddingId:wedding.id}});res.status(204).end();
}));

router.patch('/:taskId', owned(async (req, res, wedding) => {
  const input = taskSchema.partial().safeParse(req.body);
  if (!input.success || !Object.keys(input.data).length) return res.status(400).json({ error: 'Perubahan tugas tidak valid.' });
  const result = await prisma.weddingPlannerTask.updateMany({ where: { id: req.params.taskId, weddingId: wedding.id }, data: { ...input.data, updatedBy: req.plannerActor } });
  if (!result.count) return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
  res.status(204).end();
}));

router.delete('/:taskId', owned(async (req, res, wedding) => {
  const result = await prisma.weddingPlannerTask.deleteMany({ where: { id: req.params.taskId, weddingId: wedding.id } });
  if (!result.count) return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
  res.status(204).end();
}));

export default router;
