/** A gentle cover establishing shot, followed by a breathing camera and pointer parallax. */
export function coverCameraPose(base,seconds,{motion=true,intro=true,pointer={x:0,y:0}}={}){
 if(!motion)return{...base};
 const t=intro?Math.min(1,Math.max(0,seconds/6)):1,eased=t*t*t*(t*(t*6-15)+10),entry=1-eased,ambient=Math.max(0,Math.min(1,(seconds-4)/2));
 return{...base,x:base.x+100*entry+(Math.sin(seconds*.26)*7+(pointer.x||0)*8)*ambient,y:base.y+65*entry+(Math.sin(seconds*.19)*4+(pointer.y||0)*4)*ambient,z:base.z*(1-.12*entry)+Math.sin(seconds*.17)*5*ambient,roll:(base.roll||0)-.65*entry+Math.sin(seconds*.13)*.04*ambient};
}
