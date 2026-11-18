/** Contact stays on the same image plane as the feet, including while resizing or travelling. */
export function syncContactShadow(pair,shadow,{widthRatio=.8,opacity=.75}={}){
 if(!pair?.layer||!shadow?.layer)return;
 const p=pair.layer,l=shadow.layer;
 if(!Number.isFinite(p.width)||!Number.isFinite(p.height))return;
 l.x=p.x||0;l.y=(p.y||0)+p.height*((p.footY??1)-.5)-p.width*.008;l.z=(p.z||0)-2;
 l.width=p.width*widthRatio;l.height=l.width*.16;
 shadow.opacity=(pair.opacity??1)*opacity;
}
/** Resizing a cutout keeps its foot line; yOffset is an intentional move by the editor. */
export function groundedCenter(baseY,baseWidth,width,aspect,yOffset=0,footY=1){
 return baseY+(baseWidth-width)*aspect*(footY-.5)+yOffset;
}

/** Fixed painted plane, calibrated at a reference camera; moving the camera preserves depth. */
export function environmentPlane(guide,{width,height,focal,aspect,z=-1600}){
 const reference=guide.referencePose||{x:0,y:0,z:1280};
 const distance=reference.z-z;
 // Cover both edges around the floor anchor, not merely the image's centre.
 const margin=.12,ground=Math.max(.05,Math.min(.95,guide.groundY));
 const anchoredCoverage=Math.max((guide.footLine+margin)/ground,(1+margin-guide.footLine)/(1-ground));
 const pixels=Math.max(height*(guide.minimumCoverage??1.12),height*anchoredCoverage,height*guide.bodyFraction/guide.adultHeight,width/aspect*1.24);
 const paintedHeight=pixels*distance/focal;
 return {width:paintedHeight*aspect,height:paintedHeight,y:reference.y+(guide.footLine-.5)*height*distance/focal-(guide.groundY-.5)*paintedHeight};
}
/** Image center from a visible body height and visible foot anchor, not transparent padding. */
export function placeCharacter(art,{bodyFraction,footLine,viewportHeight=844,focal=750,camera={x:0,y:0,z:1280},z=0}){
 const b=art.bounds,distance=camera.z-z;
 const height=viewportHeight*bodyFraction*distance/focal/(b.bottom-b.top),width=height*art.aspect;
 return {width,height,x:camera.x-((b.left+b.right)/2-.5)*width,y:camera.y+(footLine-.5)*viewportHeight*distance/focal-height*(b.bottom-.5),footY:b.bottom};
}

/** Painted stair riser, transferred along one floor perspective to the subject's feet. */
export function humanHeightAtGround({riserHeight,riserGroundY,horizonY,groundY,humanMetres=1.68,riserMetres=.16}){
 if(!(riserHeight>0&&riserGroundY>horizonY&&groundY>horizonY&&riserMetres>0))throw Error('Invalid painted floor reference');
 return riserHeight*(humanMetres/riserMetres)*(groundY-horizonY)/(riserGroundY-horizonY);
}
