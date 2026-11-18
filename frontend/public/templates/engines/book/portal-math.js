/** A single perspective camera preserves all book/page proportions. */
export function pageFit(rect,width,height){
 if(rect.width<=0||rect.height<=0||width<=0||height<=0)throw new RangeError('Page and viewport must have positive dimensions');
 const scale=Math.max(width/rect.width,height/rect.height)*1.025;
 return {x:rect.left+rect.width/2,y:rect.top+rect.height/2,scale,tx:width/2-(rect.left+rect.width/2),ty:height/2-(rect.top+rect.height/2),pageWidth:rect.width,pageHeight:rect.height,width,height};
}
export const ease=p=>{p=Math.max(0,Math.min(1,p));return p*p*p*(p*(p*6-15)+10)};
export function cameraFrame(progress,g){
 const p=ease(progress),scale=Math.exp(Math.log(g.scale)*p),aim=ease(Math.min(1,progress/ .78));
 const initialX=Math.min(1,(g.pageWidth/g.pageHeight)/(g.width/g.height)),initialY=Math.min(1,(g.width/g.height)/(g.pageWidth/g.pageHeight));
 const reveal=ease(Math.max(0,(progress-.45)/.55));
 return {scale,x:(g.x-g.width/2)*aim,y:(g.y-g.height/2)*aim,z:1000/scale,uvX:initialX+(g.pageWidth*g.scale/g.width-initialX)*reveal,uvY:initialY+(g.pageHeight*g.scale/g.height-initialY)*reveal};
}
export function portalTransform(p,g){const f=cameraFrame(p,g);return `translate(${(g.width/2-g.x)*ease(Math.min(1,p/.78))}px,${(g.height/2-g.y)*ease(Math.min(1,p/.78))}px) scale(${f.scale})`}
