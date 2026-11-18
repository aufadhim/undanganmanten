/** Theme-independent opening/closing stage configuration. Coordinates are scene units. */
export const restPose=Object.freeze({x:0,y:15,z:1160,yaw:0,pitch:0,roll:0});
export const openingPath=[{t:0,x:-110,y:-80,z:2150,yaw:-2.4,pitch:-.3,roll:-.6},{t:2.8,x:55,y:-20,z:1530,yaw:.7,pitch:.1,roll:.25},{t:5.6,...restPose}];
export const closingPose=Object.freeze({x:0,y:-30,z:1340,yaw:0,pitch:0,roll:0});
export function mixPose(a,b,p){const q=Math.max(0,Math.min(1,p)),e=q*q*q*(q*(q*6-15)+10);return Object.fromEntries(['x','y','z','yaw','pitch','roll'].map(k=>[k,a[k]+(b[k]-a[k])*e]));}
export function stagePack(config,mist,shadow=mist){const floorY=config.layout.coverY+config.layout.coverWidth*.75;return {layers:[
 {id:'stage-landscape',src:config.assets.stageLandscape,fit:'background',z:-2200},
 {id:'stage-ground',src:config.assets.stageGround,width:2600,height:5000,ground:true,y:floorY,z:-1550,opacity:.86},
 {id:'stage-mist-back',src:mist,fit:'stage',z:-550,opacity:.12,drift:35,float:9,speed:.11},
 {id:'stage-pair-shadow',src:shadow,width:390,height:240,ground:true,x:config.layout.coverX,y:floorY-.3,z:-8,opacity:.18},
 {id:'stage-pair',src:config.assets.coverCouple,width:config.layout.coverWidth,footY:config.layout.coverFootY??1,preserveAspect:true,x:config.layout.coverX,y:config.layout.coverY,z:0},
 {id:'stage-pillar-shadow',src:shadow,width:350,height:300,ground:true,x:-360,y:floorY-.3,z:95,opacity:.22},
 {id:'stage-pillar',src:config.assets.stageArch,width:280,preserveAspect:true,anchor:'bottom',x:-360,y:floorY,z:100,opacity:1},
 {id:'stage-mist-front',src:mist,fit:'stage',z:400,opacity:.055,drift:45,float:5,speed:.09},
 {id:'stage-flowers',src:config.assets.stageFlowers,width:300,preserveAspect:true,anchor:'bottom',x:330,y:floorY,z:200,opacity:.7,sway:.12,speed:.17}
 ].filter(layer=>config.composition?.cover?.mode!=='grounded-environment'||['stage-landscape','stage-pair-shadow','stage-pair'].includes(layer.id)).map(layer=>({...layer,...(config.composition?.cover?.layers?.[layer.id]||{})})),intro:openingPath};}
