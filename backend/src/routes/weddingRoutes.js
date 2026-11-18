import weddingPlannerRoutes from './weddingPlannerRoutes.js';
import {guestSchema} from '../utils/validators.js';
import {Router} from 'express';import {authenticate} from '../middlewares/auth.js';import {prisma} from '../lib/prisma.js';
const router=Router();router.use(authenticate);
router.use('/:id/planner', weddingPlannerRoutes);
router.get('/',async(req,res)=>{try{const weddings=await prisma.wedding.findMany({where:{userId:req.userId},include:{_count:{select:{guests:true,invitations:true}},invitations:{select:{id:true,slug:true,status:true,coupleProfile:true}}},orderBy:{createdAt:'desc'}});res.json({weddings})}catch(e){res.status(500).json({error:'Daftar pernikahan belum dapat dimuat.'})}});
router.get('/:id/guests',async(req,res)=>{try{const wedding=await prisma.wedding.findFirst({where:{id:req.params.id,userId:req.userId}});if(!wedding)return res.status(404).json({error:'Pernikahan tidak ditemukan.'});const guests=await prisma.guest.findMany({where:{weddingId:wedding.id},include:{rsvp:true},orderBy:{name:'asc'}});res.json({wedding,guests})}catch(e){res.status(500).json({error:'Daftar tamu belum dapat dimuat.'})}});
router.post('/:id/guests',async(req,res)=>{try{
 const wedding=await prisma.wedding.findFirst({where:{id:req.params.id,userId:req.userId},include:{invitations:{select:{packageType:true}},_count:{select:{guests:true}}}});if(!wedding)return res.status(404).json({error:'Pernikahan tidak ditemukan.'});
 const parsed=guestSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:parsed.error.issues[0].message});
 const limit=wedding.invitations.some(i=>i.packageType==='PREMIUM')?null:wedding.invitations.some(i=>i.packageType==='STANDARD')?100:10;
 if(limit!==null&&wedding._count.guests>=limit)return res.status(403).json({error:'Kuota tamu tercapai. Aktifkan paket melalui salah satu undangan untuk menambah kapasitas.'});
 const guest=await prisma.guest.create({data:{weddingId:wedding.id,...parsed.data}});res.status(201).json({guest})
 }catch(e){res.status(500).json({error:'Tamu belum dapat ditambahkan.'})}});
router.delete('/:id/guests/:guestId',async(req,res)=>{try{
 const wedding=await prisma.wedding.findFirst({where:{id:req.params.id,userId:req.userId}});if(!wedding)return res.status(404).json({error:'Pernikahan tidak ditemukan.'});
 const guest=await prisma.guest.findFirst({where:{id:req.params.guestId,weddingId:wedding.id}});if(!guest)return res.status(404).json({error:'Tamu tidak ditemukan.'});await prisma.guest.delete({where:{id:guest.id}});res.json({message:'Tamu dihapus.'})
 }catch(e){res.status(500).json({error:'Tamu belum dapat dihapus.'})}});
export default router;
