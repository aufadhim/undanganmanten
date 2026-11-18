import sharp from 'sharp';
/** Remove ONLY a controlled magenta matte; never threshold white clothes or skin. */
export async function cleanIllustrationMatte(bytes,matte=[255,0,255]){
 const {data,info}=await sharp(bytes,{limitInputPixels:24000000}).ensureAlpha().raw().toBuffer({resolveWithObject:true});let border=0,matched=0,removed=0,visible=0;
 const distance=i=>Math.hypot(data[i]-matte[0],data[i+1]-matte[1],data[i+2]-matte[2]);
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const i=(y*info.width+x)*4,d=distance(i);if(x<3||y<3||x>=info.width-3||y>=info.height-3){border++;if(d<100)matched++}if(d<50){data[i+3]=0;removed++}else if(d<115){data[i+3]=Math.round(data[i+3]*(d-50)/65);visible++}else visible++}
 if(matched/border<.75||removed/(info.width*info.height)<.03||visible/(info.width*info.height)<.05)throw new Error('Latar hasil belum bisa dibersihkan dengan aman. Kredit dikembalikan.');
 return sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).png().toBuffer();
}
