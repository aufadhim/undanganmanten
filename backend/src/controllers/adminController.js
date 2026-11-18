import {prisma} from '../lib/prisma.js';
import {activateOrder,getPackageExpiresAt} from '../services/orderActivation.js';
import {THEME_PRESETS} from '../utils/themePresets.js';
import {ADMIN_THEMES,reasonSchema,userAdminSchema,invitationAdminSchema,assertAdminRemains} from '../utils/adminPolicy.js';
import {ACCOUNT_BYTES,INVITATION_BYTES,MAX_INVITATIONS} from '../utils/storagePolicy.js';
const userSelect={id:true,email:true,phone:true,role:true,isVerified:true,createdAt:true,suspendedAt:true,suspensionReason:true,_count:{select:{invitation:true,weddings:true}}};
const fail=(res,e)=>res.status(e.status|| (e.code==='P2034'?409:500)).json({error:e.status?e.message:e.code==='P2034'?'Ada perubahan bersamaan. Muat ulang dan coba lagi.':'Data admin belum dapat diproses.'});
const audit=(tx,req,action,type,id,reason,before,after)=>tx.adminAuditLog.create({data:{actorId:req.userId,action,targetType:type,targetId:id,reason,...(before==null?{}:{before:JSON.parse(JSON.stringify(before))}),...(after==null?{}:{after:JSON.parse(JSON.stringify(after))})}});
const page=req=>({take:50,skip:(Math.min(100000,Math.max(1,parseInt(req.query.page,10)||1))-1)*50});
async function activationCutoff(){const rows=await prisma.$queryRaw`SELECT finished_at FROM _prisma_migrations WHERE migration_name = '20261029060000_admin_operations'`;return rows[0]?.finished_at||new Date();}
const reportedSource=(order,cutoff)=>order.activationSource==='gateway'&&order.status==='SUCCESS'&&(!order.paidAt||new Date(order.paidAt)<cutoff)?'legacy':order.activationSource;
export async function getAdminStats(req,res){try{
 const [users,inv,orders,assets]=await Promise.all([prisma.user.count(),prisma.invitation.findMany({select:{status:true,suspendedAt:true,packageType:true,expiresAt:true,user:{select:{suspendedAt:true}}}}),prisma.order.findMany({select:{status:true,amount:true,paidAt:true,createdAt:true,activationSource:true}}),prisma.uploadedAsset.aggregate({_sum:{bytes:true},_count:true})]);
 const cutoff=await activationCutoff();for(const o of orders)o.activationSource=reportedSource(o,cutoff);
 const success=orders.filter(o=>o.status==='SUCCESS'&&o.activationSource==='gateway');
 const chartData=Array.from({length:6},(_,i)=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-5+i);return {month:d.toLocaleDateString('id-ID',{month:'short',year:'numeric'}),revenue:success.filter(o=>o.paidAt&&new Date(o.paidAt).getMonth()===d.getMonth()&&new Date(o.paidAt).getFullYear()===d.getFullYear()).reduce((n,o)=>n+o.amount,0)}});
 res.json({stats:{totalUsers:users,totalInvitations:inv.length,publishedInvitations:inv.filter(i=>i.status==='published'&&!i.suspendedAt&&!i.user.suspendedAt&&i.expiresAt>new Date()).length,draftInvitations:inv.filter(i=>i.status==='draft').length,suspendedInvitations:inv.filter(i=>i.suspendedAt).length,totalRevenue:success.reduce((n,o)=>n+o.amount,0),legacyRevenue:orders.filter(o=>o.status==='SUCCESS'&&o.activationSource==='legacy').reduce((n,o)=>n+o.amount,0),manualActivations:orders.filter(o=>o.status==='SUCCESS'&&o.activationSource==='manual').length,pendingOrders:orders.filter(o=>o.status==='PENDING').length,failedOrders:orders.filter(o=>['FAILED','EXPIRED'].includes(o.status)).length,storageBytes:assets._sum.bytes||0,assetCount:assets._count,chartData}});
 }catch(e){fail(res,e)}}
export async function getAdminOrders(req,res){try{const where=req.query.q?{OR:[{midtransOrderId:{contains:req.query.q,mode:'insensitive'}},{invitation:{user:{email:{contains:req.query.q,mode:'insensitive'}}}}]}:{};const [orders,total]=await Promise.all([prisma.order.findMany({where,...page(req),include:{invitation:{select:{id:true,slug:true,user:{select:{id:true,email:true}},coupleProfile:{select:{brideName:true,groomName:true}}}}},orderBy:{createdAt:'desc'}}),prisma.order.count({where})]);const cutoff=await activationCutoff();res.json({orders:orders.map(o=>({...o,activationSource:reportedSource(o,cutoff)})),total})}catch(e){fail(res,e)}}
export async function manualActivateOrder(req,res){try{const parsed=reasonSchema.safeParse(req.body.reason);if(!parsed.success)return res.status(400).json({error:'Alasan aktivasi minimal 8 karakter.'});const order=await prisma.order.findUnique({where:{id:req.params.orderId},include:{invitation:{select:{weddingDate:true}}}});if(!order)return res.status(404).json({error:'Order tidak ditemukan.'});if(order.tripay?.mode==='sandbox')return res.status(409).json({error:'Pesanan sandbox tidak bisa mengaktifkan paket.'});if(order.status==='SUCCESS')return res.status(409).json({error:'Order sudah berhasil; tidak diaktifkan ulang.'});await activateOrder(order,{actorId:req.userId,reason:parsed.data});res.json({message:'Paket diaktifkan manual, publikasi tetap terpisah. Aktivasi ini tidak dihitung sebagai omzet gateway.'})}catch(e){fail(res,e)}}
export async function getAdminInvitations(req,res){try{const q=req.query.q;const where=q?{OR:[{slug:{contains:q,mode:'insensitive'}},{user:{email:{contains:q,mode:'insensitive'}}}]}:{};const [invitations,total]=await Promise.all([prisma.invitation.findMany({where,...page(req),include:{user:{select:{id:true,email:true,suspendedAt:true}},coupleProfile:{select:{brideName:true,groomName:true}},wedding:{select:{id:true,title:true,_count:{select:{guests:true}}}},_count:{select:{wishes:true}}},orderBy:{createdAt:'desc'}}),prisma.invitation.count({where})]);res.json({invitations,total})}catch(e){fail(res,e)}}
export async function updateAdminInvitation(req,res){try{const p=invitationAdminSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.issues[0].message});const {reason,suspended,extendDays,unpublish}=p.data;await prisma.$transaction(async tx=>{await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${req.params.invitationId} FOR UPDATE`;const before=await tx.invitation.findUnique({where:{id:req.params.invitationId}});if(!before)throw Object.assign(Error('Undangan tidak ditemukan.'),{status:404});const after=await tx.invitation.update({where:{id:before.id},data:{...(suspended!==undefined?{suspendedAt:suspended?new Date():null,suspensionReason:suspended?reason:null}:{}),...(unpublish?{status:'draft'}:{}),...(extendDays?{expiresAt:new Date(Math.max(Date.now(),before.expiresAt.getTime())+extendDays*86400000)}:{})}});await audit(tx,req,'invitation.update','invitation',before.id,reason,{status:before.status,suspendedAt:before.suspendedAt,expiresAt:before.expiresAt},{status:after.status,suspendedAt:after.suspendedAt,expiresAt:after.expiresAt})});res.json({message:'Perubahan undangan tersimpan dan tercatat.'})}catch(e){fail(res,e)}}
export async function getAdminUsers(req,res){try{const where=req.query.q?{email:{contains:req.query.q,mode:'insensitive'}}:{};const [users,total,assets]=await Promise.all([prisma.user.findMany({where,...page(req),select:userSelect,orderBy:{createdAt:'desc'}}),prisma.user.count({where}),prisma.uploadedAsset.groupBy({by:['ownerId'],_sum:{bytes:true},_count:true})]);res.json({users:users.map(u=>({...u,storageBytes:assets.find(a=>a.ownerId===u.id)?._sum.bytes||0})),total,limits:{invitations:MAX_INVITATIONS,accountBytes:ACCOUNT_BYTES,invitationBytes:INVITATION_BYTES}})}catch(e){fail(res,e)}}
export async function getAdminUserDetail(req,res){try{const user=await prisma.user.findUnique({where:{id:req.params.userId},select:{...userSelect,weddings:{select:{id:true,title:true,_count:{select:{guests:true}}}},invitation:{select:{id:true,slug:true,status:true,themeId:true,packageType:true,expiresAt:true,suspendedAt:true}}}});if(!user)return res.status(404).json({error:'Pengguna tidak ditemukan.'});const assets=await prisma.uploadedAsset.findMany({where:{ownerId:user.id},select:{id:true,bytes:true,state:true,backend:true,uploadedForId:true,invitationIds:true,createdAt:true}});res.json({user,assets,limits:{invitations:MAX_INVITATIONS,accountBytes:ACCOUNT_BYTES,invitationBytes:INVITATION_BYTES}})}catch(e){fail(res,e)}}
export async function updateUserRole(req,res){try{const p=userAdminSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.issues[0].message});const {role,suspended,reason}=p.data;await prisma.$transaction(async tx=>{await tx.$queryRaw`SELECT id FROM users WHERE role = 'ADMIN' ORDER BY id FOR UPDATE`;const before=await tx.user.findUnique({where:{id:req.params.userId},select:userSelect});if(!before)throw Object.assign(Error('Pengguna tidak ditemukan.'),{status:404});const data={...(role?{role}:{}),...(suspended!==undefined?{suspendedAt:suspended?new Date():null,suspensionReason:suspended?reason:null}:{})};assertAdminRemains(before,{...before,...data},await tx.user.count({where:{role:'ADMIN',suspendedAt:null}}));if(before.id===req.userId&&(role==='USER'||suspended))throw Object.assign(Error('Gunakan admin lain untuk menonaktifkan akses akun Anda.'),{status:409});const after=await tx.user.update({where:{id:before.id},data,select:userSelect});await audit(tx,req,'user.update','user',before.id,reason,before,after)},{isolationLevel:'Serializable'});res.json({message:'Kewenangan/status akun diperbarui dan tercatat.'})}catch(e){fail(res,e)}}
export async function getAdminTemplates(req,res){try{const settings=await prisma.templateAvailability.findMany();const usage=await prisma.invitation.groupBy({by:['themeId'],_count:true});res.json({templates:THEME_PRESETS.filter(t=>ADMIN_THEMES.includes(t.id)).map(t=>({id:t.id,name:t.name,hidden:!!settings.find(s=>s.id===t.id)?.hidden,usage:usage.find(u=>u.themeId===t.id)?._count||0}))})}catch(e){fail(res,e)}}
export async function updateAdminTemplate(req,res){try{const reason=reasonSchema.safeParse(req.body.reason);if(!reason.success||typeof req.body.hidden!=='boolean'||!ADMIN_THEMES.includes(req.params.id))return res.status(400).json({error:'Tema, status, atau alasan tidak valid.'});await prisma.$transaction(async tx=>{const before=await tx.templateAvailability.findUnique({where:{id:req.params.id}});const after=await tx.templateAvailability.upsert({where:{id:req.params.id},create:{id:req.params.id,hidden:req.body.hidden},update:{hidden:req.body.hidden}});await audit(tx,req,'template.visibility','template',req.params.id,reason.data,before,after)});res.json({message:'Ketersediaan diperbarui. Undangan lama tetap dapat memakai tema ini.'})}catch(e){fail(res,e)}}
export async function getAdminAudit(req,res){try{const q=req.query.q;const where=q?{OR:[{targetId:{contains:q}},{action:{contains:q}},{actorId:{contains:q}}]}:{};const [logs,total]=await Promise.all([prisma.adminAuditLog.findMany({where,...page(req),orderBy:{createdAt:'desc'}}),prisma.adminAuditLog.count({where})]);const actors=await prisma.user.findMany({where:{id:{in:[...new Set(logs.map(l=>l.actorId))]}},select:{id:true,email:true}});res.json({logs:logs.map(l=>({...l,actor:actors.find(a=>a.id===l.actorId)?.email||l.actorId})),total})}catch(e){fail(res,e)}}
export async function getAdminOperations(req,res){try{const [storage,accounts,db]=await Promise.all([prisma.uploadedAsset.groupBy({by:['state','backend'],_sum:{bytes:true},_count:true}),prisma.user.count({where:{suspendedAt:{not:null}}}),prisma.$queryRaw`SELECT pg_database_size(current_database())::text AS bytes`]);res.json({database:{connected:true,bytes:Number(db[0].bytes)},storage, suspendedAccounts:accounts,services:{r2Configured:!!(process.env.R2_ACCOUNT_ID&&process.env.R2_BUCKET_NAME&&process.env.R2_ACCESS_KEY_ID&&process.env.R2_SECRET_ACCESS_KEY),paymentsConfigured:!!process.env.MIDTRANS_SERVER_KEY},limits:{invitations:3,accountBytes:ACCOUNT_BYTES,invitationBytes:INVITATION_BYTES,accountFiles:100,invitationFiles:40},note:'Storage adalah ledger unggahan aplikasi, bukan seluruh bucket R2. Status konfigurasi bukan pemeriksaan konektivitas penyedia.'})}catch(e){fail(res,e)}}

export async function grantInvitationAccess(req, res) {
  try {
    const reason = reasonSchema.safeParse(req.body?.reason);
    const { packageType, qrGuestbook } = req.body || {};
    if (!reason.success || !['KEEP', 'STANDARD', 'PREMIUM'].includes(packageType) ||
        typeof qrGuestbook !== 'boolean' || (packageType === 'KEEP' && !qrGuestbook)) {
      return res.status(400).json({ error: 'Pilih akses dan isi alasan minimal 8 karakter.' });
    }
    await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${req.params.invitationId} FOR UPDATE`;
      const invitation = await tx.invitation.findUnique({ where: { id: req.params.invitationId } });
      if (!invitation) throw Object.assign(Error('Undangan tidak ditemukan.'), { status: 404 });
      if (qrGuestbook && !invitation.weddingId) {
        throw Object.assign(Error('Undangan belum terhubung ke pernikahan.'), { status: 409 });
      }
      if (packageType === 'STANDARD' && invitation.packageType === 'PREMIUM' && invitation.expiresAt > new Date()) {
        throw Object.assign(Error('Premium masih aktif. Pilih pertahankan paket untuk menambahkan QR.'), { status: 409 });
      }
      const before = { packageType: invitation.packageType, expiresAt: invitation.expiresAt };
      const after = { ...before };
      if (packageType !== 'KEEP') {
        const expiresAt = getPackageExpiresAt(invitation.weddingDate);
        after.packageType = packageType;
        after.expiresAt = invitation.expiresAt > expiresAt && invitation.packageType !== 'TRIAL' ? invitation.expiresAt : expiresAt;
        if (after.expiresAt <= new Date()) {
          throw Object.assign(Error('Masa aktif H+30 sudah lewat. Periksa tanggal acara.'), { status: 409 });
        }
        await tx.invitation.update({ where: { id: invitation.id }, data: after });
      }
      if (qrGuestbook) {
        const where = { weddingId_addon: { weddingId: invitation.weddingId, addon: 'QR_GUESTBOOK' } };
        const existing = await tx.weddingAddon.findUnique({ where });
        before.qrGuestbook = Boolean(existing && !existing.revokedAt);
        await tx.weddingAddon.upsert({ where, create: where.weddingId_addon, update: { revokedAt: null } });
        after.qrGuestbook = true;
      }
      await audit(tx, req, 'invitation.grant_access', 'invitation', invitation.id, reason.data, before, after);
    });
    res.json({ message: 'Akses diberikan tanpa tagihan. Publikasi tetap dilakukan dari dashboard pengguna.' });
  } catch (error) {
    fail(res, error);
  }
}
