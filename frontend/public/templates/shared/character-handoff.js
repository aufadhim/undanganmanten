import {ease} from './transition-motion.js';
/** Project one decoded illustration into screen space across two scene renderers. */
export function projectedCharacter(scene,node,pose){
 const l=node.layer,z=l.z||0,x=l.x||0,y=l.y||0;
 const point=(a,b)=>{const p=scene.project(a,b,z,pose);return [scene.width/2+p[0]*scene.focal/p[2],scene.height/2+p[1]*scene.focal/p[2]]};
 const center=point(x,y),left=point(x-l.width/2,y),right=point(x+l.width/2,y),top=point(x,y-l.height/2),bottom=point(x,y+l.height/2);
 return {x:center[0],y:center[1],width:Math.hypot(right[0]-left[0],right[1]-left[1]),height:Math.hypot(bottom[0]-top[0],bottom[1]-top[1]),angle:Math.atan2(right[1]-left[1],right[0]-left[0])*180/Math.PI};
}
export function bridgeCharacter(outgoing,incoming){
 const a=outgoing?.nodes.find(n=>['couple','stage-pair'].includes(n.layer.id));
 const b=incoming?.nodes.find(n=>['couple','stage-pair'].includes(n.layer.id));
 if(!a||!b||a.opacity<.05||a.img.src!==b.img.src)return {paint(){},finish(){}};
 const oldA=a.opacity,oldB=b.opacity,image=a.img.cloneNode();
 image.alt='';image.setAttribute('aria-hidden','true');image.className='character-handoff';
 image.style.cssText='position:fixed;left:0;top:0;z-index:9;pointer-events:none;max-width:none;max-height:none;object-fit:contain;transform-origin:center;will-change:transform,width,height;';
 document.body.append(image);a.opacity=0;b.opacity=0;
 function paint(progress){
  const from=projectedCharacter(outgoing,a,outgoing.overridePose||outgoing.pose),to=projectedCharacter(incoming,b,incoming.overridePose||incoming.pose),p=ease(progress);
  const rect=Object.fromEntries(Object.keys(from).map(k=>[k,from[k]+(to[k]-from[k])*p]));
  image.style.width=rect.width+'px';image.style.height=rect.height+'px';image.style.transform=`translate(${rect.x-rect.width/2}px,${rect.y-rect.height/2}px) rotate(${rect.angle}deg)`;
 }
 paint(0);
 return {paint,finish(){a.opacity=oldA;b.opacity=oldB;incoming.draw(incoming.overridePose||incoming.pose);image.remove()}};
}
