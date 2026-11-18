import 'dotenv/config';import fs from 'node:fs';import path from 'node:path';import{PrismaClient,Prisma}from'@prisma/client';import{S3Client,ListObjectsV2Command,DeleteObjectCommand}from'@aws-sdk/client-s3';
const prisma=new PrismaClient(),root=path.resolve('..'),apply=process.argv.includes('--apply');
const report={at:new Date().toISOString(),configured:Boolean(process.env.R2_ACCOUNT_ID&&process.env.R2_ACCESS_KEY_ID&&process.env.R2_SECRET_ACCESS_KEY&&process.env.R2_BUCKET_NAME),candidates:[],deleted:[],skipped:0};
try{
 if(!report.configured)throw Error('R2 configuration is incomplete');
 // Read every persisted business model before considering any object unreferenced.
 // UploadedAsset is an inventory, not a consumer reference; audit logs retain history only.
 const refs=new Set(),text=[];let ledger=[],settings=[];
 for(const model of Prisma.dmmf.datamodel.models){const key=model.name[0].toLowerCase()+model.name.slice(1),rows=await prisma[key].findMany();if(model.name==='UploadedAsset'){ledger=rows;continue}if(model.name==='AdminAuditLog')continue;if(model.name==='ThemeSettings')settings=rows;for(const row of rows)text.push(JSON.stringify(row));}
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','dist','.git'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(json|jsx?|css|html|svg)$/.test(e.name))text.push(fs.readFileSync(p,'utf8'));}}
 walk(path.join(root,'frontend/src'));walk(path.join(root,'frontend/public'));
 const joined=text.join('\n');const s3=new S3Client({region:'auto',endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,credentials:{accessKeyId:process.env.R2_ACCESS_KEY_ID,secretAccessKey:process.env.R2_SECRET_ACCESS_KEY},maxAttempts:2}),Bucket=process.env.R2_BUCKET_NAME;let token;let objects=[];
 do{const page=await s3.send(new ListObjectsV2Command({Bucket,ContinuationToken:token}));objects.push(...(page.Contents||[]));token=page.IsTruncated?page.NextContinuationToken:undefined}while(token);
 for(const object of objects){const key=object.Key;if(!key)continue;const asset=ledger.find(a=>a.backend==='r2'&&a.key===key),url=asset?.url||`${(process.env.R2_PUBLIC_URL||'').replace(/\/$/,'')}/${key}`;
 // Only application uploads, never unrelated bucket content; protect in-progress uploads.
 if(!/^(invitations|uploads)\//.test(key)||!object.LastModified||Date.now()-object.LastModified.getTime()<86400000||joined.includes(key)||joined.includes(url)||asset?.state==='reserved'){report.skipped++;continue}
 report.candidates.push({key,bytes:object.Size||0,assetId:asset?.id||null});
 }
 report.bytes=report.candidates.reduce((n,a)=>n+a.bytes,0);
 if(apply)for(const a of report.candidates){await s3.send(new DeleteObjectCommand({Bucket,Key:a.key}));if(a.assetId)await prisma.uploadedAsset.delete({where:{id:a.assetId}});report.deleted.push(a.key)}
 report.modelsRead=Prisma.dmmf.datamodel.models.length;report.objects=objects.length;
}catch(e){report.error=e.message;process.exitCode=1}finally{const out=path.join(root,'output/asset-cleanup');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,apply?'r2-cleanup-result.json':'r2-cleanup-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({configured:report.configured,candidates:report.candidates.length,bytes:report.bytes,deleted:report.deleted.length,error:report.error}));await prisma.$disconnect()}
