/** Trim transparent margins without stretching the character; keep a small safety border. */
export async function prepareCharacter(file){
 if(!['image/png','image/webp'].includes(file.type)||file.size>5*1048576)throw Error('Gunakan PNG atau WebP transparan maksimal 5 MB. Foto biasa bisa diajukan sebagai referensi.');
 const bitmap=await createImageBitmap(file);
 try{
 if(bitmap.width*bitmap.height>24000000)throw Error('Gambar terlalu besar. Gunakan gambar maksimal 24 megapiksel.');
 const canvas=document.createElement('canvas');const factor=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*factor);canvas.height=Math.round(bitmap.height*factor);const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);const {data}=ctx.getImageData(0,0,canvas.width,canvas.height);let left=canvas.width,top=canvas.height,right=-1,bottom=-1,transparent=0;
 for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const alpha=data[(y*canvas.width+x)*4+3];if(alpha<16)transparent++;if(alpha>16){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}}
 if(right<0)throw Error('Gambar kosong. Pilih ilustrasi yang terlihat.');if(transparent<canvas.width*canvas.height*.02)throw Error('Latar gambar belum transparan. Gunakan ilustrasi tanpa latar atau ajukan ilustrasi dari foto.');
 const pad=8;left=Math.max(0,left-pad);top=Math.max(0,top-pad);right=Math.min(canvas.width-1,right+pad);bottom=Math.min(canvas.height-1,bottom+pad);const w=right-left+1,h=bottom-top+1,scale=Math.min(1,1200/Math.max(w,h)),out=document.createElement('canvas');out.width=Math.round(w*scale);out.height=Math.round(h*scale);out.getContext('2d').drawImage(canvas,left,top,w,h,0,0,out.width,out.height);const blob=await new Promise(resolve=>out.toBlob(resolve,'image/webp',.9));if(!blob)throw Error('Gambar belum dapat diproses.');return {file:new File([blob],'karakter-pasangan.webp',{type:'image/webp'}),aspect:out.width/out.height};
 }finally{bitmap.close()}
}
