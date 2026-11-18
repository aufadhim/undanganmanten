/** Original painting coordinates, never screen percentages. */
export function resolvePaintedHumanHeight({horizonY,footY,humanMetres=1.68,landmarks}){
 if(!Number.isFinite(horizonY)||!(footY>horizonY)||!(humanMetres>0))throw Error('Invalid floor perspective');
 const candidates=(landmarks||[]).filter(r=>r.enabled!==false).map(r=>{
  if(!(r.height>0&&r.metres>0&&r.groundY>horizonY&&r.weight>0))throw Error('Invalid scale landmark: '+r.id);
  return {id:r.id,weight:r.weight,height:r.height*humanMetres/r.metres*(footY-horizonY)/(r.groundY-horizonY)};
 }).sort((a,b)=>a.height-b.height);
 if(!candidates.length)throw Error('A painting needs measured scale landmarks');
 const total=candidates.reduce((n,r)=>n+r.weight,0);let sum=0;
 const chosen=candidates.find(r=>(sum+=r.weight)>=total/2);
 return {height:chosen.height,reference:chosen.id,candidates};
}
/** Preserve the same projected size/contact despite different picture and cutout depths. */
export function placePairInPainting({art,plane,environmentZ,camera,characterZ=0,humanHeight,footX=.5,footY}){
 const b=art.bounds,depth=(camera.z-characterZ)/(camera.z-environmentZ);
 if(!(depth>0&&humanHeight>0&&b.bottom>b.top))throw Error('Invalid scene scale');
 const height=plane.height*humanHeight*depth/(b.bottom-b.top),width=height*art.aspect;
 const floorX=(plane.x||0)+(footX-.5)*plane.width,floorY=plane.y+(footY-.5)*plane.height;
 return {width,height,x:camera.x+(floorX-camera.x)*depth-((b.left+b.right)/2-.5)*width,y:camera.y+(floorY-camera.y)*depth-(b.bottom-.5)*height,z:characterZ,footY:b.bottom};
}
