import {Router} from 'express';
import rateLimit from 'express-rate-limit';
import {createHash} from 'node:crypto';
import {authenticate} from '../middlewares/auth.js';
import {prisma} from '../lib/prisma.js';
const router=Router();
const hash=t=>createHash('sha256').update(t).digest('hex');
router.use(rateLimit({windowMs:60000,limit:100,standardHeaders:'draft-8',legacyHeaders:false}));
router.get('/rundown/:token',async(req,res)=>{
 res.set('Cache-Control','no-store').set('Referrer-Policy','no-referrer').set('X-Robots-Tag','noindex, nofollow');
 try{
 const share=/^[a-f0-9]{64}$/.test(req.params.token) && await prisma.plannerShare.findUnique({where:{tokenHash:hash(req.params.token)},include:{wedding:{select:{id:true,title:true,weddingDate:true,user:{select:{suspendedAt:true}}}}}});
 if(!share || share.expiresAt<new Date() || share.wedding.user.suspendedAt)return res.status(404).json({error:'Tautan berakhir atau sudah dicabut.'});
 const entries=await prisma.weddingPlannerEntry.findMany({where:{weddingId:share.weddingId,module:'schedule'},select:{id:true,details:true,updatedAt:true},orderBy:{createdAt:'asc'}});
 res.json({wedding:{title:share.wedding.title,weddingDate:share.wedding.weddingDate},entries,expiresAt:share.expiresAt});
 }catch{res.status(503).json({error:'Rundown belum dapat dimuat.'});}
});
router.use(authenticate);
router.use((_req,res,next)=>{res.set('Cache-Control','private, no-store');next();});
router.get('/weddings',async(req,res)=>{try{
 const weddings=await prisma.wedding.findMany({where:{user:{suspendedAt:null},OR:[{userId:req.userId},{plannerMembers:{some:{userId:req.userId,acceptedAt:{not:null}}}}]},select:{id:true,title:true,weddingDate:true,userId:true},orderBy:{createdAt:'desc'}});
 res.json({weddings:weddings.map(({userId,...w})=>({...w,role:userId===req.userId?'owner':'member'}))});
 }catch{res.status(503).json({error:'Pernikahan belum dapat dimuat.'});}});
router.post('/invite/:token',async(req,res)=>{try{
 const user=await prisma.user.findUnique({where:{id:req.userId},select:{email:true,isVerified:true}});
 if(!user.isVerified)return res.status(403).json({error:'Verifikasi email akun sebelum menerima undangan.'});
 const invite=/^[a-f0-9]{64}$/.test(req.params.token) && await prisma.plannerMember.findUnique({where:{tokenHash:hash(req.params.token)}});
 if(!invite || invite.expiresAt<new Date() || invite.email.toLowerCase()!==user.email.toLowerCase())return res.status(403).json({error:'Undangan berakhir atau email akun berbeda dari penerima.'});
 const result=await prisma.plannerMember.updateMany({where:{id:invite.id,tokenHash:hash(req.params.token)},data:{userId:req.userId,acceptedAt:invite.acceptedAt||new Date()}});
 if(!result.count)return res.status(404).json({error:'Undangan sudah dicabut.'});
 res.json({weddingId:invite.weddingId});
 }catch{res.status(503).json({error:'Undangan belum dapat diterima.'});}});
export default router;
