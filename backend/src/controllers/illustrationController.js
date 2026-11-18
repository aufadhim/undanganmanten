import {generationSummary} from './illustrationGenerationController.js';
import {referenceDetailsSchema} from '../utils/illustrationPolicy.js';
import sharp from 'sharp';
import {z} from 'zod';
import {Prisma} from '@prisma/client';
import {prisma} from '../lib/prisma.js';
import {uploadToR2,cleanupOwnerAssets} from '../lib/storage.js';
const fail=(res,e)=>res.status(e.status||500).json({error:e.status?e.message:'Ilustrasi belum dapat diproses.'});
const bad=(message,status=400)=>Object.assign(new Error(message),{status});
async function owned(req){const inv=await prisma.invitation.findFirst({where:{id:req.headers['x-invitation-id'],userId:req.userId},include:{themeSettings:true,illustrationRequest:true}});if(!inv)throw bad('Undangan tidak ditemukan.',404);return inv}
const draft=z.object({references:z.array(z.string().max(2048)).min(1).max(3),brief:z.string().trim().max(2000).default(''),referenceDetails:referenceDetailsSchema.optional()});
export async function getMyIllustration(req,res){try{const inv=await owned(req);res.json({request:inv.illustrationRequest,...await generationSummary(req.userId,inv.id)})}catch(e){fail(res,e)}}
export async function submitIllustration(req,res){try{
 const parsed=draft.safeParse(req.body);if(!parsed.success)throw bad('Tambahkan 1–3 foto referensi dan arahan minimal 10 karakter.');
 const inv=await owned(req);if(await prisma.illustrationGeneration.count({where:{invitationId:inv.id,status:{in:['queued','processing','uncertain']}}}))throw bad('Selesaikan proses gambar yang masih berjalan terlebih dahulu.',409);if(inv.illustrationRequest&&inv.illustrationRequest.status==='processing')throw bad('Pengajuan sedang diproses. Tunggu hasilnya sebelum mengirim ulang.',409);
 const rows=await prisma.uploadedAsset.findMany({where:{ownerId:req.userId,url:{in:parsed.data.references}}});if(rows.length!==new Set(parsed.data.references).size)throw bad('Gunakan foto referensi milik akun ini.');
 const data={...parsed.data,brief:parsed.data.brief||'Pertahankan penampilan pasangan persis seperti referensi; ubah hanya gaya menjadi cat air.',...(parsed.data.referenceDetails?{}:{referenceDetails:Prisma.JsonNull}),status:'submitted',adminNote:null};
 const request=await prisma.illustrationRequest.upsert({where:{invitationId:inv.id},create:{invitationId:inv.id,...data},update:data});await cleanupOwnerAssets(req.userId).catch(()=>{});res.json({request});
 }catch(e){fail(res,e)}}
export async function approveIllustration(req,res){try{
 const inv=await owned(req),r=inv.illustrationRequest;if(r?.status!=='review'||!r.resultCover)throw bad('Hasil belum siap ditinjau.',409);
 const [request,themeSettings]=await prisma.$transaction([prisma.illustrationRequest.update({where:{id:r.id},data:{status:'approved'}}),prisma.themeSettings.update({where:{invitationId:inv.id},data:{coverImageUrl:r.resultCover,coverSecondImageUrl:r.resultHero||r.resultCover,characterSettings:{mode:'custom',separatePose:Boolean(r.resultHero),cover:{scale:1,x:0,y:0,...(r.resultMeta?.cover?{aspect:r.resultMeta.cover}:{})},hero:{scale:1,x:0,y:0,...(r.resultMeta?.hero?{aspect:r.resultMeta.hero}:{})}}}})]);res.json({request,themeSettings});
 }catch(e){fail(res,e)}}
export async function adminIllustrations(req,res){try{const requests=await prisma.illustrationRequest.findMany({take:100,orderBy:{updatedAt:'desc'},include:{invitation:{select:{slug:true,user:{select:{email:true}},illustrationWallet:true,illustrationGenerations:{orderBy:{createdAt:'desc'},take:5,select:{id:true,status:true,error:true,refunded:true}}}}}});res.json({requests})}catch(e){fail(res,e)}}
export async function adminIllustrationUpdate(req,res){try{
 const p=z.object({status:z.enum(['processing','review']),note:z.string().max(1000).optional(),reason:z.string().trim().min(8).max(500)}).safeParse(req.body);if(!p.success)throw bad('Isi status dan alasan minimal 8 karakter.');
 const r=await prisma.illustrationRequest.findUnique({where:{id:req.params.id}});if(!r)throw bad('Pengajuan tidak ditemukan.',404);if(p.data.status==='review'&&!r.resultCover)throw bad('Unggah ilustrasi sampul sebelum mengirim hasil.');
 if(r.status==='approved')throw bad('Hasil sudah disetujui pemilik.',409);
 const request=await prisma.$transaction(async tx=>{const updated=await tx.illustrationRequest.update({where:{id:r.id},data:{status:p.data.status,adminNote:p.data.note||''}});await tx.adminAuditLog.create({data:{actorId:req.userId,action:'illustration.status',targetType:'illustration',targetId:r.id,reason:p.data.reason,before:JSON.parse(JSON.stringify(r)),after:JSON.parse(JSON.stringify(updated))}});return updated});res.json({request});
 }catch(e){fail(res,e)}}
export async function adminIllustrationUpload(req,res){try{
 const r=await prisma.illustrationRequest.findUnique({where:{id:req.params.id},include:{invitation:{select:{userId:true}}}});if(!r)throw bad('Pengajuan tidak ditemukan.',404);if(r.status==='approved')throw bad('Pengajuan sudah disetujui.',409);if(!req.file?.buffer||!['cover','hero'].includes(req.params.side))throw bad('Pilih gambar hasil dan letaknya.');
 const meta=await sharp(req.file.buffer).metadata();if(!meta.hasAlpha)throw bad('Hasil ilustrasi harus memiliki latar transparan.');const stats=await sharp(req.file.buffer).stats();if(stats.channels.at(-1).min===255)throw bad('Latar hasil ilustrasi belum transparan.');
 const url=await uploadToR2({ownerId:r.invitation.userId,invitationId:r.invitationId,buffer:req.file.buffer,mimeType:req.file.mimetype,folder:`invitations/${r.invitationId}/characters`,originalName:req.file.originalname});
 const request=await prisma.$transaction(async tx=>{const updated=await tx.illustrationRequest.update({where:{id:r.id},data:{[req.params.side==='cover'?'resultCover':'resultHero']:url,resultMeta:{...(r.resultMeta||{}),[req.params.side]:meta.width/meta.height}}});await tx.adminAuditLog.create({data:{actorId:req.userId,action:'illustration.result.upload',targetType:'illustration',targetId:r.id,reason:'Unggah hasil ilustrasi untuk ditinjau pemilik',after:{url,side:req.params.side}}});return updated});res.json({request});
 }catch(e){fail(res,e)}}
export async function reviseIllustration(req,res){try{
 const note=z.string().trim().min(10).max(1000).safeParse(req.body.note);if(!note.success)throw bad('Tuliskan revisi minimal 10 karakter.');const inv=await owned(req),r=inv.illustrationRequest;if(r?.status!=='review')throw bad('Hasil belum dalam tahap tinjauan.',409);
 const request=await prisma.illustrationRequest.update({where:{id:r.id},data:{status:'submitted',brief:`${r.brief}\n\nRevisi pemilik (${new Date().toISOString()}): ${note.data}`.slice(-8000)}});res.json({request});
 }catch(e){fail(res,e)}}
