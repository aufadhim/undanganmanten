/** Author cover/hero packs from measured cutout bounds. Does not launch the app or run checks. */
const fs=require('./lib/scene-authoring-fs.cjs'),path=require('path');
const root=path.resolve(__dirname,'..'),sharp=require(path.join(root,'backend/node_modules/sharp'));
const rows=JSON.parse(fs.readFileSync(path.join(root,'docs/TEMPLATE_SCAFFOLDS.json')));
// Normalized foot positions follow the open paving/ground seen in each artwork.
const centers={
 'melayu-balairung':[.46,.47],'melayu-hikayat':[.50,.49],'sunda-pendopo':[.50,.50],
 'sunda-parahyangan':[.48,.49],'bali-pekarangan':[.52,.51],'bali-subak':[.47,.48],
 'banjar':[.49,.49],'dayak':[.51,.50],'bugis-makassar':[.51,.50],'toraja':[.49,.49],
 'sumba':[.48,.49],'flores':[.51,.51],'maluku':[.48,.49],'papua':[.47,.48],
 'minangkabau':[.51,.51],'masjid-taman':[.51,.51],'masjid-manuskrip':[.50,.50],
 'katedral':[.49,.49],'katedral-album':[.51,.51],'taman-tionghoa':[.52,.51],
 'peranakan':[.50,.50],'chateau':[.48,.49],'edinburgh':[.51,.50],'paris':[.50,.50],
 'london':[.49,.49],'elegant-ivory':[.50,.50],'elegant-velvet':[.48,.49],
 'kaligrafi':[.50,.50],'cinema':[.51,.50],'kingdom':[.49,.49],
 'sabana':[.48,.49],'urban-editorial':[.49,.50],'mural':[.51,.51],'monokrom':[.50,.50],
};
const phone={width:390,height:844,lens:750};
async function metrics(url){
 const file=path.join(root,'frontend/public',url);
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=0,bottom=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>64){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1)}
 return {width:info.width,height:info.height,aspect:info.width/info.height,bounds:{left:left/info.width,top:top/info.height,right:right/info.width,bottom:bottom/info.height}};
}
function placement(art,{center,foot,span,distance,cameraY=0,maxWidth=.88}){
 const b=art.bounds,projection=phone.lens/distance;
 const width=Math.min(span*phone.height/projection*art.aspect/(b.bottom-b.top),maxWidth*phone.width/projection/(b.right-b.left));
 const height=width/art.aspect;
 return {width:+width.toFixed(3),x:+(((center-.5)*phone.width/projection)-((b.left+b.right)/2-.5)*width).toFixed(3),y:+(cameraY+(foot-.5)*phone.height/projection-height*(b.bottom-.5)).toFixed(3),footY:+b.bottom.toFixed(6)};
}
function css(slug,engine){
 const scope=`:root body.template-${slug}`;
 return `/* ${slug}: cover/hero composition only; shared ivory and typography remain reusable. */
${scope} #cover .cover-heading{top:10.5%!important;left:5%!important;right:5%!important;width:90%!important;max-width:420px!important;margin-inline:auto;text-align:center}
${scope} #cover h1{font-size:46px!important;line-height:1.06!important;letter-spacing:-.02em!important;margin:10px 0!important;text-wrap:balance}
${scope} #cover h1 em{display:inline!important;font-size:.6em!important;margin:0 5px!important;line-height:inherit!important}
${scope} #cover .cover-date{margin:10px auto!important;justify-content:center;gap:12px}
${scope} #cover .cover-response{left:50%!important;right:auto!important;bottom:4%!important;top:auto!important;transform:translateX(-50%)!important;width:min(340px,90vw)!important;max-width:none!important;padding:10px 18px!important;text-align:center}
${scope} #cover .guest{font-size:11px!important;line-height:1.5}
${scope} #cover .guest strong{font-size:12px!important;line-height:1.45;margin:6px 0 12px!important}
${scope} #cover #open{min-height:46px;padding:13px 20px!important;font-size:12px!important;letter-spacing:.06em}
${scope} #cover .cover-note{font-size:11px!important;line-height:1.45;margin:10px auto 0!important;max-width:300px}
${scope} #journey .hero-heading{left:5%!important;right:5%!important;top:10.5%!important;max-width:420px!important;width:90%!important;margin-inline:auto;text-align:center}
${scope} #journey .hero-heading h2{font-size:46px!important;line-height:1.06!important;letter-spacing:-.02em!important;margin:10px 0!important;text-wrap:balance}
${scope} #journey .hero-heading h2 :is(span,em){display:inline!important;margin:0!important}
${scope} #journey .hero-heading h2 span{font-size:.6em!important;padding:0 5px}
${scope} #journey .hero-heading>p{display:none!important}
${scope} #journey .hero-heading .cover-date{justify-content:center;margin:10px auto!important;gap:12px}
${scope} :is(#cover .cover-heading,#journey .hero-heading) :is(.kicker,.cover-date,.cover-date span){font-size:11px!important;text-transform:none!important;letter-spacing:0!important}
${scope} #journey .hero-content{background:none!important}
${engine===2?`${scope} .storybook{top:51.5%!important;width:min(98vw,900px)!important;aspect-ratio:3/2}
${scope} .book-inscription{gap:7px}
${scope} .book-inscription strong{font-size:clamp(17px,4vw,32px);text-wrap:balance}
${scope} .book-inscription em{font-size:10px;line-height:1.4}
`:''}
@media(min-width:900px){
 ${scope} #cover .cover-heading,${scope} #journey .hero-heading{top:8.5%!important;max-width:580px!important}
 ${scope} #cover .cover-response{width:360px!important;bottom:3%!important}
 ${engine===2?`${scope} .storybook{top:53%!important;width:min(76vw,900px)!important}`:''}
}
@media(max-height:700px){
 ${scope} #cover .cover-heading,${scope} #journey .hero-heading{top:7%!important}
 ${scope} #cover h1,${scope} #journey .hero-heading h2{font-size:40px!important;margin:6px 0!important}
 ${scope} #cover .cover-response{bottom:3%!important;padding:6px 14px!important}
 ${scope} #cover .cover-note{margin-top:6px!important}
 ${scope} #cover #open{min-height:40px;padding:10px 18px!important}
}
`;
}
(async()=>{
 const result=[];
 for(const row of rows){
  const slug=row.id,engine=row.engine,dir=path.join(root,'frontend/public/templates',slug),file=path.join(dir,'config/invitation.json');
  const c=JSON.parse(fs.readFileSync(file));const cover=await metrics(c.assets.coverCouple),hero=await metrics(c.assets.heroCouple);
  const target={cover:{center:centers[slug][0],foot:.76,span:engine===3?.43:.42,maxWidth:.80},hero:{center:centers[slug][1],foot:.90,span:engine===3?.55:.54,maxWidth:.88}};
  let coverCamera={distance:1160,cameraY:15},heroCamera={distance:1280,cameraY:0};let map;
  if(engine===3){
   map=JSON.parse(fs.readFileSync(path.join(dir,'landscape.json')));
   const a=map.stops.find(s=>s.id==='cover'),b=map.stops.find(s=>s.id==='hero');
   coverCamera={distance:a.z-(map.characters.cover.z||0),cameraY:a.y||0};heroCamera={distance:b.z-(map.characters.hero.z||0),cameraY:b.y||0};
  }
  const p=placement(cover,{...target.cover,...coverCamera}),h=placement(hero,{...target.hero,...heroCamera});
  Object.assign(c.layout,{coverWidth:p.width,coverX:p.x,coverY:p.y,coverFootY:p.footY,heroWidth:h.width,heroX:h.x,heroY:h.y,heroFootY:h.footY});
  // Head markers are metadata on the same pair, never separate individual assets.
  c.layout.heroGroomHeadX=+(hero.bounds.left+(hero.bounds.right-hero.bounds.left)*.25).toFixed(4);
  c.layout.heroBrideHeadX=+(hero.bounds.left+(hero.bounds.right-hero.bounds.left)*.73).toFixed(4);
  c.layout.heroGroomHeadY=+(hero.bounds.top+.075).toFixed(4);c.layout.heroBrideHeadY=+(hero.bounds.top+.11).toFixed(4);
  const floor=h.y+h.width/hero.aspect*(h.footY-.5),heroForeground={fit:null,width:h.width*1.32,preserveAspect:true,anchor:'bottom',x:h.x,y:floor+120,z:110,opacity:.48};
  const authoredIntro=c.composition?.intro;
  const authoredEvents=c.composition?.events;
  const authoredSocial=c.composition?.social;
  const authoredFinale=c.composition?.finale,authoredClosing=c.composition?.closing;
  c.composition={version:1,stage:authoredFinale?'all-sections-authored':authoredSocial?'cover-hero-intro-events-social':authoredEvents?'cover-hero-quote-profiles-events':authoredIntro?'cover-hero-quote-profiles':'cover-hero',...(authoredIntro?{intro:authoredIntro}:{}),...(authoredEvents?{events:authoredEvents}:{}),...(authoredSocial?{social:authoredSocial}:{}),...(authoredFinale?{finale:authoredFinale}:{}),...(authoredClosing?{closing:authoredClosing}:{}),referenceViewport:phone,targets:target,art:{cover,hero},cover:{layers:{}},hero:{backgroundFitScale:.82,foreground:heroForeground}};
  if(engine===1&&c.assets.stageArch&&c.assets.stageFlowers){
   const arch=await metrics(c.assets.stageArch),flowers=await metrics(c.assets.stageFlowers),bodyH=p.width/cover.aspect*(cover.bounds.bottom-cover.bounds.top);
   const postW=bodyH*.82*arch.aspect/(arch.bounds.bottom-arch.bounds.top),flowersW=bodyH*.32*flowers.aspect/(flowers.bounds.bottom-flowers.bounds.top);
   c.composition.cover.layers={
    'stage-landscape':{fitScale:.94},
    'stage-ground':{width:1450,height:2900,opacity:.30},
    'stage-pillar':{x:p.x-325,width:+postW.toFixed(2),opacity:.76},
    'stage-pillar-shadow':{x:p.x-325,width:210,height:170,opacity:.12},
    'stage-flowers':{x:p.x+320,width:+flowersW.toFixed(2),opacity:.74},
    'stage-pair-shadow':{opacity:.16},
   };
  }
  if(engine===2)c.composition.book={coverPortrait:true,centerY:.515,widthVw:98,page:{left:.535,top:.18,width:.37,height:.65}};
  if(engine===3){
   // Match plane aspect to each generated painting, never stretch it into a copied ratio.
   const pano=await sharp(path.join(root,'frontend/public',c.assets[map.world.asset])).metadata();map.world.height=map.world.width*pano.height/pano.width;
   for(const area of map.areas){const m=await sharp(path.join(root,'frontend/public',c.assets[area.asset])).metadata();area.height=area.width*m.height/m.width}
   Object.assign(map.characters.cover,{width:p.width,y:p.y});Object.assign(map.characters.hero,{width:h.width,y:h.y});
   for(const d of map.decorations.filter(d=>d.area===map.characters.hero.stop.replace('hero','garden')&&!d.attachment))Object.assign(d,{x:h.x-h.width*.72,y:floor+85,width:h.width*.35,z:-1780,anchor:'bottom',opacity:.64});
   fs.writeFileSync(path.join(dir,'landscape.json'),JSON.stringify(map,null,2)+'\n');
  }
  fs.writeFileSync(file,JSON.stringify(c,null,2)+'\n');
  fs.writeFileSync(path.join(root,'frontend/src/components/templates',slug,'defaultConfig.json'),JSON.stringify(c,null,2)+'\n');
  fs.writeFileSync(path.join(dir,'composition.css'),css(slug,engine));
  const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');fs.writeFileSync(path.join(dir,'index.html'),html.includes('href="composition.css"')?html:html.replace('</head>','<link rel="stylesheet" href="composition.css"></head>'));
  const readme=path.join(root,'frontend/src/components/templates',slug,'README.md');let s=fs.readFileSync(readme,'utf8');const marker='\n## Komposisi sampul dan hero\n';if(s.includes(marker))s=s.slice(0,s.indexOf(marker));s+=marker+`\nSkala dan posisi pasangan mengikuti batas figur transparan yang diukur dari ilustrasi lokal.\n- Posisi pasangan: \`layout\` di \`defaultConfig.json\` dan \`config/invitation.json\` runtime.\n- Ornamen dan framing: \`composition\` di kedua berkas konfigurasi.\n- Posisi teks/responsif: \`frontend/public/templates/${slug}/composition.css\`.\n- ${engine===3?'Peta kamera sampul/hero: `landscape.json` di folder runtime.':engine===2?'Pose sampul ditampilkan pada halaman buku; pose hero digunakan setelah masuk.':'Pilar dan bunga diposisikan di tepi dengan alas mengikuti titik kaki pasangan.'}\n\nBelum diaktifkan di katalog; belum menjalankan pengujian aplikasi atau build.\n`;fs.writeFileSync(readme,s);
  result.push({template:slug,engine,cover:p,hero:h,targets:target});
 }
 fs.writeFileSync(path.join(root,'output/template-composition/placements.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({templates:result.length,engineCounts:result.reduce((out,r)=>(out[r.engine]=(out[r.engine]||0)+1,out),{})}));
})().catch(e=>{console.error(e);process.exit(1)});
