import {readOwnedImage} from '../lib/storage.js';
import sharp from 'sharp';
import {ILLUSTRATION_SYSTEM_PROMPT} from '../utils/illustrationPolicy.js';
export function imageProviderReady(){return process.env.ILLUSTRATION_PROVIDER==='gemini'&&Boolean(process.env.GEMINI_API_KEY)&&Boolean(process.env.GEMINI_IMAGE_MODEL)&&Number(process.env.ILLUSTRATION_GLOBAL_DAILY_LIMIT)>0}
const MATTES=[[255,0,255],[0,255,0],[0,255,255],[255,255,0]];
/** Gemini returns opaque output: request a known matte, never mistake a painted checkerboard for alpha. */
export async function renderWatercolor({ownerId,urls}){
 const counts=MATTES.map(()=>0);let samples=0;const referenceParts=[];
 for(const url of urls){const bytes=await readOwnedImage(ownerId,url),image=await sharp(bytes,{limitInputPixels:24000000}).rotate().resize({width:1536,height:1536,fit:'inside',withoutEnlargement:true}).jpeg({quality:90}).toBuffer();const raw=await sharp(image).removeAlpha().raw().toBuffer();for(let i=0;i<raw.length;i+=48){samples++;MATTES.forEach((c,n)=>{if(Math.hypot(raw[i]-c[0],raw[i+1]-c[1],raw[i+2]-c[2])<120)counts[n]++})}referenceParts.push({inlineData:{mimeType:'image/jpeg',data:image.toString('base64')}})}
 const index=counts.indexOf(Math.min(...counts));if(counts[index]/samples>.001)throw new Error('Warna foto memerlukan pembersihan latar manual agar pakaian tidak terpotong.');const matte=MATTES[index];
 const parts=[{text:ILLUSTRATION_SYSTEM_PROMPT.replace('Keep the background fully transparent with clean soft alpha edges; no paper rectangle, scenery, text, frame, watermark, or extra people.','Use a perfectly flat, solid RGB(255,0,255) magenta background ONLY outside the two people, for a later background-removal step. No texture, shadows, scenery, gradients, or checkerboard on that background. Keep watercolor texture inside the subjects. Do not change any clothing colors to the matte color. No text, frame, watermark, or extra people.').replace('RGB(255,0,255) magenta',`RGB(${matte.join(',')})`)} ,...referenceParts];

 const model=process.env.GEMINI_IMAGE_MODEL;if(!/^[a-zA-Z0-9._-]+$/.test(model))throw new Error('Konfigurasi model gambar tidak valid.');
 let response;try{response=await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`,{method:'POST',headers:{'x-goog-api-key':process.env.GEMINI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:{candidateCount:1,responseModalities:['TEXT','IMAGE'],imageConfig:{aspectRatio:'2:3',...(model.includes('2.5-flash')?{}:{imageSize:'1K'})}}}),signal:AbortSignal.timeout(240000)})}catch{throw Object.assign(new Error('Status penyedia belum pasti; admin perlu memeriksa sebelum mencoba ulang.'),{uncertain:true})}
 if(!response.ok){const reason=response.status===429?'Batas pemakaian atau saldo Gemini belum mencukupi.':response.status===401||response.status===403?'Akses Gemini ditolak. Periksa API key dan izin layanan.':response.status===404?'Model Gemini belum tersedia untuk akun ini.':response.status===400?'Gemini menolak pengaturan permintaan gambar.':'Gemini sedang bermasalah.';throw Object.assign(new Error(reason),{publicMessage:reason})}
 let data;try{data=await response.json()}catch{throw Object.assign(new Error('Jawaban Gemini belum dapat dipastikan. Admin perlu memeriksa.'),{uncertain:true})}
 const image=data.candidates?.[0]?.content?.parts?.find(p=>!p.thought&&p.inlineData?.mimeType?.startsWith('image/'))?.inlineData;if(!image?.data)throw new Error('Gemini tidak mengembalikan hasil gambar.');
 return {bytes:Buffer.from(image.data,'base64'),matte};
}
