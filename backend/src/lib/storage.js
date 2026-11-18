import {S3Client,PutObjectCommand,DeleteObjectCommand,ListObjectsV2Command,GetObjectCommand} from '@aws-sdk/client-s3';
import {randomUUID} from 'crypto';
import fs from 'node:fs/promises';import path from 'node:path';
import {env} from '../config/env.js';import {prisma} from './prisma.js';
import {uploadBudget,stringsIn,INVITATION_BYTES,ACCOUNT_BYTES} from '../utils/storagePolicy.js';
const configured=Boolean(process.env.R2_ACCOUNT_ID&&process.env.R2_ACCESS_KEY_ID&&process.env.R2_SECRET_ACCESS_KEY&&process.env.R2_BUCKET_NAME);
const r2=configured?new S3Client({region:'auto',endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,credentials:{accessKeyId:process.env.R2_ACCESS_KEY_ID,secretAccessKey:process.env.R2_SECRET_ACCESS_KEY},maxAttempts:2}):null;
const bucket=process.env.R2_BUCKET_NAME;
const publicRoot=(process.env.R2_PUBLIC_URL||'').replace(/\/$/,'');
const canonical=value=>{try{const url=new URL(value,env.backendUrl);url.search='';url.hash='';return url.href}catch{return value}};
const includes={illustrationRequest:true,illustrationGenerations:true,coupleProfile:true,themeSettings:true,galleryMedia:true,timelineStories:true};
const indexed=new Map();
const storageError=(message,status=503)=>Object.assign(new Error(message),{status});
async function list(prefix){let token,objects=[];do{const page=await r2.send(new ListObjectsV2Command({Bucket:bucket,Prefix:prefix,ContinuationToken:token}));objects.push(...(page.Contents||[]));token=page.IsTruncated?page.NextContinuationToken:null}while(token);return objects}
/** Register existing objects too, so older uploads cannot bypass the byte allowance. */
export async function indexLegacyAssets(ownerId){
 const cached=indexed.get(ownerId);if(cached&&cached.until>Date.now())return cached.promise;
 const promise=(async()=>{const invitations=await prisma.invitation.findMany({where:{userId:ownerId},include:includes});
 for(const inv of invitations){
  if(r2){for(const obj of await list(`invitations/${inv.id}/`)){if(!obj.Key||!obj.Size)continue;const url=canonical(`${publicRoot}/${obj.Key}`);await prisma.uploadedAsset.upsert({where:{url},update:{},create:{ownerId,uploadedForId:inv.id,invitationIds:[inv.id],url,key:obj.Key,backend:'r2',bytes:obj.Size,state:'ready'}})}}
  for(const url of stringsIn(inv)){let file;try{const parsed=new URL(url,env.backendUrl),base=new URL(env.backendUrl);if(parsed.origin===base.origin&&/^\/uploads\/[a-zA-Z0-9._-]+$/.test(parsed.pathname))file=path.basename(parsed.pathname)}catch{}if(!file)continue;
   try{const info=await fs.stat(path.join(process.cwd(),'uploads',file));await prisma.uploadedAsset.upsert({where:{url:canonical(url)},update:{},create:{ownerId,uploadedForId:inv.id,invitationIds:[inv.id],url:canonical(url),key:file,backend:'local',bytes:info.size,state:'ready'}})}catch(e){if(e.code!=='ENOENT')throw e}
  }
 }
 })();indexed.set(ownerId,{promise,until:Date.now()+300000});try{await promise}catch(e){indexed.delete(ownerId);throw storageError('Penyimpanan lama belum dapat diperiksa. Coba unggah lagi nanti.')}
}
async function removePhysical(asset){if(asset.backend==='r2'){if(!r2)throw Error('R2 belum terkonfigurasi untuk pembersihan.');await r2.send(new DeleteObjectCommand({Bucket:bucket,Key:asset.key}))}else{if(path.basename(asset.key)!==asset.key)throw Error('Nama berkas tidak valid');await fs.unlink(path.join(process.cwd(),'uploads',asset.key)).catch(e=>{if(e.code!=='ENOENT')throw e})}}
export async function uploadToR2({buffer,mimeType,folder='',originalName='file.webp',ownerId,invitationId}){
 if(!ownerId||!invitationId)throw storageError('Pemilik unggahan tidak ditemukan.',400);
 await indexLegacyAssets(ownerId);
 const ext=({'image/webp':'webp','image/jpeg':'jpg','image/png':'png','video/mp4':'mp4','video/quicktime':'mov','audio/mpeg':'mp3','audio/mp3':'mp3','audio/wav':'wav','audio/aac':'aac'}[mimeType]||'bin'),file=`${randomUUID()}.${ext}`,key=r2?`${folder}/${file}`:file,backend=r2?'r2':'local',url=r2?`${publicRoot}/${key}`:`${env.backendUrl}/uploads/${file}`;
 let asset;
 try{asset=await prisma.$transaction(async tx=>{
  const rows=await tx.uploadedAsset.findMany({where:{ownerId},select:{bytes:true,invitationIds:true,uploadedForId:true}});
  if(rows.length>=100)throw storageError('Maksimal 100 file tersimpan per akun. Hapus media yang tidak dipakai.',413);
  if(rows.filter(a=>a.uploadedForId===invitationId||a.invitationIds.includes(invitationId)).length>=40)throw storageError('Maksimal 40 file tersimpan per undangan.',413);
  const issue=uploadBudget(rows.reduce((n,a)=>n+a.bytes,0),rows.filter(a=>a.uploadedForId===invitationId||a.invitationIds.includes(invitationId)).reduce((n,a)=>n+a.bytes,0),buffer.length);
  if(issue)throw storageError(issue,413);
  return tx.uploadedAsset.create({data:{ownerId,uploadedForId:invitationId,invitationIds:[invitationId],key,url,backend,bytes:buffer.length}})
 },{isolationLevel:'Serializable',timeout:20000,maxWait:10000})}catch(e){if(e.code==='P2034')throw storageError('Ada unggahan bersamaan. Silakan coba lagi.',409);throw e}
 try{
  if(r2)await r2.send(new PutObjectCommand({Bucket:bucket,Key:key,Body:buffer,ContentType:mimeType}));
  else{await fs.mkdir(path.join(process.cwd(),'uploads'),{recursive:true});await fs.writeFile(path.join(process.cwd(),'uploads',file),buffer)}
  await prisma.uploadedAsset.update({where:{id:asset.id},data:{state:'ready'}});return url;
 }catch(e){await prisma.uploadedAsset.update({where:{id:asset.id},data:{state:'cleanup'}});try{await removePhysical(asset);await prisma.uploadedAsset.delete({where:{id:asset.id}})}catch{}throw storageError('Unggahan gagal. Silakan coba kembali.')}
}
/** Reconcile exact URL references across all invitations before removing any owned file. */
export async function cleanupOwnerAssets(ownerId,{releasedUrls=[]}={}){
 const assets=await prisma.uploadedAsset.findMany({where:{ownerId}});if(!assets.length)return {pending:0};
 const invitations=await prisma.invitation.findMany({include:includes});const references=invitations.map(inv=>({id:inv.id,urls:new Set([...stringsIn(inv)].map(canonical))}));let pending=0;
 for(const asset of assets){
  const used=references.filter(inv=>inv.urls.has(canonical(asset.url))).map(inv=>inv.id);
  if(used.length){if(used.length!==asset.invitationIds.length||used.some(id=>!asset.invitationIds.includes(id)))await prisma.uploadedAsset.update({where:{id:asset.id},data:{invitationIds:used}});continue}
  const originExists=invitations.some(inv=>inv.id===asset.uploadedForId);
  // New, unattached uploads may still be waiting for the editor's save request.
  if(originExists&&!releasedUrls.includes(asset.url)&&asset.state!=='cleanup'&&Date.now()-asset.createdAt.getTime()<86400000)continue;
  await prisma.uploadedAsset.update({where:{id:asset.id},data:{state:'cleanup',invitationIds:[]}});
  try{await removePhysical(asset);await prisma.uploadedAsset.delete({where:{id:asset.id}})}catch(e){pending++;console.error('Storage cleanup queued:',asset.id,e.message)}
 }return {pending};
}
export async function storageUsage(ownerId){await indexLegacyAssets(ownerId);const rows=await prisma.uploadedAsset.findMany({where:{ownerId}});return {usedBytes:rows.reduce((n,a)=>n+a.bytes,0),maxBytes:ACCOUNT_BYTES,perInvitationBytes:INVITATION_BYTES,pendingCleanup:rows.filter(a=>a.state==='cleanup').length}}

export async function retryStorageCleanup(){const owners=await prisma.uploadedAsset.findMany({select:{ownerId:true},distinct:['ownerId']});for(const {ownerId} of owners)await cleanupOwnerAssets(ownerId).catch(e=>console.error('Storage cleanup retry:',ownerId,e.message))}

/** Read only ledger-owned uploads, never an arbitrary user URL. */
export async function readOwnedImage(ownerId,url){
 const asset=await prisma.uploadedAsset.findFirst({where:{ownerId,url}});
 if(!asset||asset.bytes>5*1024*1024)throw storageError('Foto referensi tidak tersedia atau terlalu besar.',400);
 if(asset.backend==='r2'){if(!r2)throw storageError('Penyimpanan belum tersedia.',503);const object=await r2.send(new GetObjectCommand({Bucket:bucket,Key:asset.key}));return Buffer.from(await object.Body.transformToByteArray())}
 if(asset.backend==='local'&&/^[a-zA-Z0-9._-]+$/.test(asset.key))return fs.readFile(path.join(process.cwd(),'uploads',asset.key));
 throw storageError('Sumber foto referensi tidak didukung.',400);
}

// Keep remote reconciliation off the editor's save/preset response path.
const cleanupJobs=new Map();
export function scheduleOwnerAssetCleanup(ownerId,{releasedUrls=[]}={}){
 let job=cleanupJobs.get(ownerId);if(job){for(const url of releasedUrls)job.urls.add(url);job.again=true;return}
 job={urls:new Set(releasedUrls),again:false};cleanupJobs.set(ownerId,job);
 const run=async()=>{try{do{job.again=false;const urls=[...job.urls];job.urls.clear();await cleanupOwnerAssets(ownerId,{releasedUrls:urls});}while(job.again)}catch(e){console.error('Deferred storage cleanup:',e.message)}finally{cleanupJobs.delete(ownerId)}};
 setTimeout(run,300).unref();
}

export function galleryPhotoKey(url) {
 const prefix = publicRoot + '/';
 if (!r2 || !publicRoot || typeof url !== 'string' || !url.startsWith(prefix)) return null;
 const key = url.slice(prefix.length);
 return /^invitations\/[a-z0-9-]+\/gallery\/[a-z0-9-]+\.(webp|png|jpe?g)$/i.test(key) ? key : null;
}

export async function openGalleryPhoto(key) {
 return r2.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
}

export function invitationMusicKey(url) {
 if (!r2 || !publicRoot || typeof url !== 'string' || !url.startsWith(publicRoot + '/')) return null;
 const key = url.slice(publicRoot.length + 1);
 return /^invitations\/[a-z0-9-]+\/(?:assets|music)\/[a-z0-9-]+\.(mp3|wav|aac)$/i.test(key) ? key : null;
}
export function openInvitationMusic(key, range) {
 return r2.send(new GetObjectCommand({Bucket:bucket, Key:key, Range:range}));
}
