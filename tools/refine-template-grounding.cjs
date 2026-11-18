/** Composition revision: no tests/build/browser automation. */
const fs=require('./lib/scene-authoring-fs.cjs'),path=require('path'),sharp=require('../backend/node_modules/sharp');
const root=path.resolve(__dirname,'..'),rows=require('../docs/TEMPLATE_SCAFFOLDS.json');
const asset=(slug,file)=>`/templates/${slug}/assets/${file}`;
const lens=750,W=390,H=844;
function placement(art,span,feet,z,cy=0){const b=art.bounds,scale=lens/z,width=Math.min(span*H/scale*art.aspect/(b.bottom-b.top),.9*W/scale/(b.right-b.left));return{width,x:-((b.left+b.right)/2-.5)*width,y:cy+(feet-.5)*H/scale-width/art.aspect*(b.bottom-.5)}}
async function main(){
const generated={'urban-editorial':'exec-d274a92c-c5b8-4389-8c70-54eebb62b4eb.png',mural:'exec-c81bfba1-8821-4f40-8594-4976a5ac496c.png',monokrom:'exec-f1c24a3a-2fa9-41d1-a2ed-fcf099263891.png'};
for(const row of rows){const slug=row.id,dir=path.join(root,'frontend/public/templates',slug),file=path.join(dir,'config/invitation.json'),c=JSON.parse(fs.readFileSync(file)),engine=row.engine;let map=engine===3?JSON.parse(fs.readFileSync(path.join(dir,'landscape.json'))):null;
 if(generated[slug]){const source=path.join('/Users/auf/.codex/generated_images/01a16a39-eee7-7df1-b814-a6557115cea7',generated[slug]);await sharp(source).resize(2160,720,{fit:'fill'}).webp({quality:84}).toFile(path.join(dir,'assets/environment-v2.webp'));
  for(let i=0;i<4;i++)await sharp(source).resize(2160,720,{fit:'fill'}).extract({left:i*480,top:0,width:720,height:720}).webp({quality:84}).toFile(path.join(dir,`assets/environment-zone-${i+1}-v2.webp`));
  c.assets.room1=asset(slug,'environment-zone-1-v2.webp');c.assets.room2=asset(slug,'environment-zone-2-v2.webp');c.assets.room3=asset(slug,'environment-zone-3-v2.webp');c.assets.room4=asset(slug,'environment-zone-4-v2.webp');c.assets.stageLandscape=c.assets.room1;c.assets.galleryGarden=c.assets.room1;
  if(map){c.assets.panorama=asset(slug,'environment-v2.webp');['landscapeGarden','landscapeRiver','landscapeBridge','landscapeLake'].forEach((key,i)=>c.assets[key]=asset(slug,`environment-zone-${i+1}-v2.webp`));map.world.width=28800;map.world.height=9600;map.areas.forEach((a,i)=>{a.x=-9600+i*6400;a.width=9600;a.height=9600;a.landmark={x:.5,y:.58,width:.25,height:.25};});}
  const manifest=path.join(dir,'assets/manifest.json'),m=JSON.parse(fs.readFileSync(manifest));m.environmentRevision={style:'watercolor',files:['environment-v2.webp',...Array.from({length:4},(_,i)=>`environment-zone-${i+1}-v2.webp`)]};fs.writeFileSync(manifest,JSON.stringify(m,null,2)+'\n');
 }
 c.composition.grounding={version:2,headingOffsetPx:30,bodyScreenHeight:.58,footLine:.9,removeFloatingFrames:true};
 // Rectangular cutout props cannot be used as floating scenery in these packs.
 c.composition.hero.foreground={...c.composition.hero.foreground,opacity:0};c.composition.hero.backgroundFitScale=.82;c.composition.hero.viewportFill=true;
 if(engine===1){c.composition.cover.mode='grounded-environment';c.composition.cover.layers={'stage-landscape':{viewportFill:true,fitScale:.82},'stage-pair-shadow':{opacity:.25}};}
 if(engine!==3){const p=placement(c.composition.art.cover,.55,.87,1160,15),h=placement(c.composition.art.hero,.60,.92,1280);Object.assign(c.layout,{coverWidth:p.width,coverX:p.x,coverY:p.y,heroWidth:h.width,heroX:h.x,heroY:h.y});
  if(engine===1){const closing=placement(c.composition.art.cover,.46,.94,1340,-30);Object.assign(c.layout,{closingWidth:closing.width,closingX:closing.x,closingY:closing.y});c.composition.closing={absolutePosition:true};}
 }else{
  for(const slot of ['cover','hero','closing']){const char=map.characters[slot],stop=map.stops.find(s=>s.id===char.stop);const distance=(stop.z||1700)-(char.z||0),art=c.composition.art[slot==='cover'?'cover':'hero'],p=placement(art,slot==='closing'?.46:.60,slot==='closing'?.94:.91,distance,stop.y||0);Object.assign(c.layout,{[slot+'Width']:p.width,[slot+'X']:p.x,[slot+'Y']:slot==='closing'?0:p.y,[slot+'FootY']:art.bounds.bottom});char.width=p.width;char.y=p.y;}
  // Painted floor is the ground; remove oversized extra mats/foliage frames.
  map.decorations=map.decorations.filter(d=>d.attachment?.contact);
  fs.writeFileSync(path.join(dir,'landscape.json'),JSON.stringify(map,null,2)+'\n');
 }
 for(const p of [file,path.join(root,'frontend/src/components/templates',slug,'defaultConfig.json')])fs.writeFileSync(p,JSON.stringify(c,null,2)+'\n');
 const scope=`:root body.template-${slug}`;
 fs.writeFileSync(path.join(dir,'grounding-v2.css'),`/* Heading offset is additive at every responsive breakpoint. */\n${scope} #cover .cover-heading,${scope} #journey .hero-heading{top:calc(10.5% + 30px)!important;translate:none!important}\n@media(min-width:900px){${scope} #cover .cover-heading,${scope} #journey .hero-heading{top:calc(8.5% + 30px)!important}}\n@media(max-height:700px){${scope} #cover .cover-heading,${scope} #journey .hero-heading{top:calc(7% + 30px)!important}}\n${slug==='monokrom'?`${scope}{--cms-ink:#3d3b39;--cms-accent:#686664}${scope} .primary{background:#686664!important}${scope} #cover h1 em,${scope} .hero-heading h2 em{color:#73706c!important}`:''}\n`);
 const index=path.join(dir,'index.html');let html=fs.readFileSync(index,'utf8');if(!html.includes('href="grounding-v2.css"'))html=html.replace('</head>','<link rel="stylesheet" href="grounding-v2.css"></head>');fs.writeFileSync(index,html);
}
}
main().catch(e=>{console.error(e);process.exitCode=1});
