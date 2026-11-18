import {ensureIllustrationQuota} from './illustrationQuota.js';
import {cleanIllustrationMatte} from '../utils/illustrationMatte.js';
import {prisma} from '../lib/prisma.js';
import {uploadToR2} from '../lib/storage.js';
import {renderWatercolor,imageProviderReady} from './illustrationProvider.js';
import {canGenerate,jakartaDayStart,ILLUSTRATION_STYLE_VERSION} from '../utils/illustrationPolicy.js';
import sharp from 'sharp';
const issue=(message,status=409)=>Object.assign(new Error(message),{status});
export async function reserveGeneration(userId,invitationId,requestKey){
 return prisma.$transaction(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(773431)`;
  const old=await tx.illustrationGeneration.findUnique({where:{invitationId_requestKey:{invitationId,requestKey}}});if(old)return old;
  if(!imageProviderReady())throw issue('Generate AI belum aktif. Penyedia dan API key perlu dikonfigurasi admin.',503);
  const inv=await tx.invitation.findFirst({where:{id:invitationId,userId},include:{illustrationRequest:true,illustrationWallet:true}});if(!inv)throw issue('Undangan tidak ditemukan.',404);
  if(!canGenerate(inv.illustrationRequest?.referenceDetails))throw issue('Tambahkan referensi yang memperlihatkan tubuh lengkap kedua mempelai. Sistem tidak mengarang bagian tubuh yang tidak terlihat.',422);
  const wallet=await ensureIllustrationQuota(tx,invitationId);
  if(!wallet.remaining)throw issue('Kuota 3 generate untuk undangan ini sudah habis. Kuota tidak diisi ulang.');
  if(await tx.illustrationGeneration.count({where:{invitationId,status:{in:['queued','processing','uncertain']}}}))throw issue('Masih ada proses gambar yang perlu diselesaikan.');
  const since=jakartaDayStart();
  if(await tx.illustrationGeneration.count({where:{createdAt:{gte:since}}})>=Number(process.env.ILLUSTRATION_GLOBAL_DAILY_LIMIT))throw issue('Batas layanan hari ini telah tercapai. Coba lagi besok.');
  await tx.illustrationWallet.update({where:{invitationId},data:{remaining:{decrement:1}}});
  return tx.illustrationGeneration.create({data:{invitationId,ownerId:userId,requestKey,referenceUrls:inv.illustrationRequest.references,styleVersion:ILLUSTRATION_STYLE_VERSION}});
 },{timeout:15000});
}
export async function refundGeneration(id,error,transaction){const run=async tx=>{
 const found=await tx.illustrationGeneration.findUnique({where:{id}});if(!found||found.refunded||found.status==='completed')return;
 const changed=await tx.illustrationGeneration.updateMany({where:{id,refunded:false,status:{not:'completed'}},data:{status:'failed',referenceUrls:[],error,refunded:true}});if(changed.count)await tx.illustrationWallet.updateMany({where:{invitationId:found.invitationId||'deleted'},data:{remaining:{increment:1}}});return changed.count;
};return transaction?run(transaction):prisma.$transaction(run)}
let ticking=false;
export async function processIllustrationQueue(){if(ticking||!imageProviderReady())return;ticking=true;let claimed=false;try{
 await prisma.illustrationGeneration.updateMany({where:{invitationId:null,status:{in:['queued','processing','uncertain']}},data:{status:'failed',referenceUrls:[],error:'Undangan dihapus.',refunded:true}});
 // A process that disappeared mid-request must never automatically send the same paid request again.
 await prisma.illustrationGeneration.updateMany({where:{status:'processing',updatedAt:{lt:new Date(Date.now()-10*60000)}},data:{status:'uncertain',error:'Proses terputus. Admin perlu memeriksa hasil dan kredit sebelum mencoba lagi.'}});
 const job=await prisma.illustrationGeneration.findFirst({where:{status:'queued',invitationId:{not:null}},orderBy:{createdAt:'asc'},include:{invitation:{select:{userId:true}}}});if(!job)return;
 const claim=await prisma.illustrationGeneration.updateMany({where:{id:job.id,status:'queued'},data:{status:'processing'}});if(!claim.count)return;claimed=true;
 try{const rendered=await renderWatercolor({ownerId:job.ownerId,urls:job.referenceUrls}),bytes=await cleanIllustrationMatte(rendered.bytes,rendered.matte),meta=await sharp(bytes,{limitInputPixels:24000000}).metadata();if(!meta.hasAlpha||(await sharp(bytes).stats()).channels.at(-1).min===255)throw new Error('Hasil belum memiliki latar transparan. Kredit dikembalikan.');
 const {data,info}=await sharp(bytes).trim().resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:90}).toBuffer({resolveWithObject:true});const url=await uploadToR2({buffer:data,mimeType:'image/webp',folder:`invitations/${job.invitationId}/characters`,originalName:'watercolor-couple.webp',ownerId:job.ownerId,invitationId:job.invitationId});
 await prisma.$transaction([prisma.illustrationGeneration.update({where:{id:job.id},data:{status:'completed',referenceUrls:[],resultUrl:url,aspect:info.width/info.height}}),prisma.illustrationRequest.update({where:{invitationId:job.invitationId},data:{status:'review',resultCover:url,resultHero:null,resultMeta:{cover:info.width/info.height},adminNote:'Tinjau kemiripan wajah, bentuk tubuh, pakaian, dan bagian tubuh sebelum menggunakan hasil.'}})]);
 }catch(e){if(e.uncertain)await prisma.illustrationGeneration.update({where:{id:job.id},data:{status:'uncertain',error:e.message}});else await refundGeneration(job.id,e.publicMessage||'Ilustrasi belum berhasil dibuat atau latarnya belum bisa dipisahkan. Kuota dikembalikan.');}
 }catch(e){console.error('Illustration queue:',e.code||e.name)}finally{ticking=false;if(claimed)setImmediate(processIllustrationQueue)}}
export function startIllustrationWorker(){const start=setTimeout(processIllustrationQueue,1000),recovery=setTimeout(processIllustrationQueue,10*60000);start.unref();recovery.unref();return [start,recovery]}
