import {Router} from 'express';
import {createHash,randomBytes} from 'node:crypto';
import rateLimit from 'express-rate-limit';
import {prisma} from '../lib/prisma.js';
import {authenticate} from '../middlewares/auth.js';
import {getEntitlements} from '../utils/entitlements.js';
import {guestScope} from '../utils/weddingGuests.js';
import {checkInGuest,undoCheckInGuest} from '../controllers/guestController.js';
const router=Router();
const hash=value=>createHash('sha256').update(value).digest('hex');
const publicFields={id:true,label:true,expiresAt:true,revokedAt:true,createdAt:true};
async function owned(req,res,next){try{
 const invitation=await prisma.invitation.findFirst({where:{id:req.params.invitationId,userId:req.userId}});
 if(!invitation)return res.status(404).json({error:'Undangan tidak ditemukan.'});
 req.deskInvitation=invitation;next();
}catch{res.status(503).json({error:'Akses buku tamu belum tersedia.'})}}
router.get('/access/:invitationId',authenticate,owned,async(req,res)=>{
 try{res.json({accesses:await prisma.guestDeskAccess.findMany({where:{invitationId:req.deskInvitation.id},select:publicFields,orderBy:{createdAt:'desc'},take:30})})}catch{res.status(503).json({error:'Daftar akses belum tersedia.'})}
});
router.post('/access/:invitationId',authenticate,owned,async(req,res)=>{try{
 const i=req.deskInvitation;
 if(!(await getEntitlements(i)).qrGuestbook)return res.status(403).json({error:'Aktifkan buku tamu QR terlebih dahulu.'});
 const label=String(req.body.label||'').trim(),hours=Number(req.body.hours??24);
 if(!label||label.length>60||!Number.isInteger(hours)||hours<1||hours>168)return res.status(400).json({error:'Isi nama petugas (maksimal 60 karakter) dan durasi 1–168 jam.'});
 const expiresAt=new Date(Math.min(Date.now()+hours*3600000,new Date(i.weddingDate).getTime()+30*86400000));
 if(expiresAt<=new Date()||i.suspendedAt)return res.status(403).json({error:'Masa akses acara sudah berakhir atau undangan ditangguhkan.'});
 const token=randomBytes(32).toString('hex');
 const access=await prisma.$transaction(async tx=>{
  // Serialize issuance per invitation so the active-access cap cannot be raced.
  await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${i.id} FOR UPDATE`;
  if(await tx.guestDeskAccess.count({where:{invitationId:i.id,revokedAt:null,expiresAt:{gt:new Date()}}})>=10)throw new Error('LIMIT');
  const row=await tx.guestDeskAccess.create({data:{invitationId:i.id,ownerId:req.userId,label,tokenHash:hash(token),expiresAt},select:publicFields});
  await tx.adminAuditLog.create({data:{actorId:req.userId,action:'guestdesk.access.create',targetType:'invitation',targetId:i.id,reason:`Akses petugas: ${label}`,after:{id:row.id,expiresAt:expiresAt.toISOString()}}});return row;
 });res.status(201).json({access,token});
}catch(e){res.status(e.message==='LIMIT'?409:503).json({error:e.message==='LIMIT'?'Maksimal 10 akses petugas aktif. Cabut akses lama dahulu.':'Akses petugas belum dapat dibuat.'})}});
router.delete('/access/:invitationId/:accessId',authenticate,owned,async(req,res)=>{try{
 await prisma.$transaction(async tx=>{const row=await tx.guestDeskAccess.updateMany({where:{id:req.params.accessId,invitationId:req.deskInvitation.id,ownerId:req.userId,revokedAt:null},data:{revokedAt:new Date()}});if(row.count)await tx.adminAuditLog.create({data:{actorId:req.userId,action:'guestdesk.access.revoke',targetType:'invitation',targetId:req.deskInvitation.id,reason:'Pemilik mencabut akses petugas.',after:{id:req.params.accessId}}})});res.json({message:'Akses petugas dicabut.'});
}catch{res.status(503).json({error:'Akses belum dapat dicabut.'})}});
router.delete('/access/:invitationId/:accessId/history',authenticate,owned,async(req,res)=>{try{
 const removed=await prisma.guestDeskAccess.deleteMany({where:{id:req.params.accessId,invitationId:req.deskInvitation.id,ownerId:req.userId,OR:[{revokedAt:{not:null}},{expiresAt:{lte:new Date()}}]}});
 if(!removed.count)return res.status(409).json({error:'Hanya akses yang sudah berakhir atau dicabut yang bisa dihapus.'});
 res.json({message:'Akses petugas dihapus.'});
}catch{res.status(503).json({error:'Akses belum dapat dihapus.'})}});
async function hasQrAccess(invitation){
 if(invitation.weddingId){
  const grant=await prisma.weddingAddon.findUnique({where:{weddingId_addon:{weddingId:invitation.weddingId,addon:'QR_GUESTBOOK'}},select:{revokedAt:true}});
  if(grant)return !grant.revokedAt;
 }
 return Boolean(await prisma.order.findFirst({
  where:{status:'SUCCESS',addons:{array_contains:['QR_GUESTBOOK']},OR:[
   {invitationId:invitation.id},
   ...(invitation.weddingId?[{invitation:{weddingId:invitation.weddingId,userId:invitation.userId}}]:[]),
  ]},select:{id:true},
 }));
}
const limiter=rateLimit({windowMs:60000,max:120,standardHeaders:true,legacyHeaders:false});
async function staff(req,res,next){try{
 const token=req.headers['x-guestdesk-token'];
 if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))return res.status(401).json({error:'Tautan petugas tidak valid.'});
 const access=await prisma.guestDeskAccess.findUnique({where:{tokenHash:hash(token)},include:{invitation:{include:{user:{select:{suspendedAt:true}}}}}});
 if(!access||access.revokedAt||access.expiresAt<=new Date())return res.status(401).json({error:'Akses petugas berakhir atau sudah dicabut.'});
 const i=access.invitation;
 if(i.suspendedAt||i.user.suspendedAt||new Date(i.weddingDate).getTime()+30*86400000<=Date.now()||!(await hasQrAccess(i)))return res.status(403).json({error:'Buku tamu tidak aktif.'});
 req.userId=access.ownerId;req.deskAccessId=access.id;req.deskInvitation=i;
 req.headers['x-invitation-id']=i.id;next();
}catch{res.status(503).json({error:'Buku tamu belum dapat diakses.'})}}
router.get('/session',limiter,staff,async(req,res)=>{try{
 const i=req.deskInvitation;
 const [coupleProfile,guests]=await Promise.all([prisma.coupleProfile.findUnique({where:{invitationId:i.id},select:{brideName:true,groomName:true}}),prisma.guest.findMany({where:guestScope(i),select:{id:true,name:true,groupName:true,paxLimit:true,checkedIn:true,checkedInAt:true,checkInCount:true},orderBy:{name:'asc'}})]);
 res.set('Cache-Control','no-store').json({invitation:{id:i.id,slug:i.slug,weddingDate:i.weddingDate,coupleProfile},guests});
}catch{res.status(503).json({error:'Daftar kedatangan belum tersedia.'})}});
router.post('/guests/:guestId/checkin',limiter,staff,checkInGuest);
router.delete('/guests/:guestId/checkin',limiter,staff,undoCheckInGuest);
export default router;
