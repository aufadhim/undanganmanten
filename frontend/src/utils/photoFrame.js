export function framePhotoRect(photoWidth,photoHeight,frameWidth,frameHeight,zoom=1,x=0,y=0){
 const scale=Math.max(frameWidth/photoWidth,frameHeight/photoHeight)*zoom,width=photoWidth*scale,height=photoHeight*scale;
 return {width,height,x:(frameWidth-width)/2+Math.max(-1,Math.min(1,x))*(width-frameWidth)/2,y:(frameHeight-height)/2+Math.max(-1,Math.min(1,y))*(height-frameHeight)/2};
}
export function loadFrameImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.crossOrigin='anonymous';image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Gambar belum dapat dimuat. Coba lagi.'));image.src=src})}
export async function preparePhotoFrame(file){
 if(!['image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Gunakan PNG atau WebP transparan maksimal 5 MB.');
 const src=URL.createObjectURL(file);try{const img=await loadFrameImage(src);if(img.width<100||img.height<100)throw Error('Bingkai terlalu kecil. Gunakan gambar minimal 100 × 100 px.');
 const canvas=document.createElement('canvas'),ratio=Math.min(1,1600/Math.max(img.width,img.height));canvas.width=Math.round(img.width*ratio);canvas.height=Math.round(img.height*ratio);const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let clear=0,paint=0;for(let i=3;i<pixels.length;i+=4){if(pixels[i]<32)clear++;if(pixels[i]>128)paint++}if(clear<pixels.length/4*.05||paint<pixels.length/4*.01)throw Error('Bingkai harus memiliki area transparan untuk foto dan dekorasi yang terlihat.');
 return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob&&blob.size<=5*1024*1024?resolve(new File([blob],'bingkai-foto.png',{type:'image/png'})):reject(Error('Bingkai terlalu besar setelah diproses. Gunakan ilustrasi yang lebih sederhana.')),'image/png'));
 }finally{URL.revokeObjectURL(src)}
}
