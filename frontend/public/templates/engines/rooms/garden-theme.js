const config=window.InvitationConfig;
const coverGroundY=config.layout.coverY;
const heroGroundY=config.layout.heroY;
function contactShadow(width,x,y){return [{id:'contact-shadow',src:'/templates/viridarium/assets/contact-shadow.svg',width:width*.8,height:width*.15,x,y:y+width*(1400/933)/2-12,z:-2,opacity:.75}]}

/** Swap this data pack to change the art direction without replacing the renderer or navigation. */
export const basePose=Object.freeze({x:0,y:0,z:1280,yaw:0,pitch:0,roll:0});
export const gardens=[
 {id:1,name:'The Secret Garden',src:config.assets.room1},
 {id:2,name:'The Fountain Court',src:config.assets.room2},
 {id:3,name:'The Rose Walk',src:config.assets.room3},
 {id:4,name:'The Lantern Garden',src:config.assets.room4}
];
export const foreground=config.assets.foreground;
// Hidden room backgrounds must remain loaded for later camera transitions.
export function heroLayers(){return [...gardens.map((g,i)=>({id:'garden-'+g.id,room:g.id,src:g.src,fit:'background',fitScale:config.composition?.hero?.backgroundFitScale??1,viewportFill:config.composition?.hero?.viewportFill??false,scaleGuide:i===3&&config.composition?.grounding?.paintingScale?.scenes?.closing&&!config.assets.stageLandscape?(config.composition.closing.scaleGuide||config.composition.hero.scaleGuide):config.composition?.hero?.scaleGuide,z:-1600,opacity:i?0:1})),...contactShadow(config.layout.heroWidth,config.layout.heroX,heroGroundY),{id:'couple',src:config.assets.heroCouple,footY:config.layout.heroFootY??1,width:config.layout.heroWidth,preserveAspect:true,x:config.layout.heroX,y:heroGroundY,z:0,opacity:1},{id:'canopy',src:foreground,fit:'foreground',z:260,opacity:.82,sway:.12,speed:.16,...(config.composition?.hero?.foreground||{})}].filter(layer=>layer.room||layer.opacity!==0)}
export const coverConfig={lens:1000,layers:[{id:'entrance',src:gardens[0].src,fit:'background',scaleGuide:config.composition?.cover?.scaleGuide,z:-1600},...contactShadow(config.layout.coverWidth,config.layout.coverX,coverGroundY),{id:'couple',src:config.assets.coverCouple,footY:config.layout.coverFootY??1,width:config.layout.coverWidth,preserveAspect:true,x:config.layout.coverX,y:coverGroundY,z:0},{id:'canopy',src:foreground,fit:'foreground',z:260,opacity:.9,sway:.18,speed:.16}].filter(layer=>Boolean(layer.src)),intro:[{t:0,x:-22,y:-25,z:1430,yaw:-.6,pitch:0,roll:-.3},{t:5.8,...basePose}]};
export function cameraPose(i,wide){return {...config.cameras[i][wide?'wide':'mobile']}}
