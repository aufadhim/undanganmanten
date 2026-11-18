/** Keep the entire character plane inside the safe reading height; markers select the horizontal subject only. */
export function fullBodyProfileCamera(pair,layout,id,width,height,lens){
 const bride=id==='wanita',key=bride?'Bride':'Groom',other=bride?'Groom':'Bride';
 const headX=layout['hero'+key+'HeadX']??(bride?.68:.3),otherX=layout['hero'+other+'HeadX']??(bride?.3:.68);
 // Authored packs frame the selected BODY beside the reading column. The same
 // couple plane is moved past the viewport edge; no extra cutout or mask is used.
 if(layout.profileBodyFraming===1){
  const right=headX>=otherX,split=(headX+otherX)/2;
  const top=layout.profileBodyTop??0,bottom=layout.profileBodyBottom??1;
  const edge=right?(layout.profileBodyRight??1):(layout.profileBodyLeft??0);
  const subjectWidth=Math.abs(edge-split)*pair.width;
  const distance=Math.max(pair.height*(bottom-top)*lens/(height*(layout.profileHeight??.70)),subjectWidth*lens/(width*(width<600?.43:.29)));
  const boundary=pair.x+(split-.5)*pair.width;
  const inset=layout.profileEdgeInset??.025;
  const foot=pair.y+(bottom-.5)*pair.height;
  return {x:boundary+(right?1:-1)*(.5-inset)*width*distance/lens,
   y:foot-((layout.profileFootLine??.88)-.5)*height*distance/lens,
   z:pair.z+distance,yaw:0,pitch:0,roll:0};
 }
 const targetX=headX>=otherX?.08:.92;
 // Reserve space for the island/top edge and navigation at the feet.
 const distance=Math.max(pair.height*lens/(height*.72),pair.width*.48*lens/(width*.42));
 return {x:pair.x+(headX-.5)*pair.width-(targetX-.5)*width*distance/lens,
  y:pair.y-(.51-.5)*height*distance/lens,z:pair.z+distance,yaw:0,pitch:0,roll:0};
}

