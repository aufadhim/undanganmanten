/** Author the quote/bride/groom group; no application execution or test runner. */
import fs from './lib/scene-authoring-fs.cjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fullBodyProfileCamera} from '../frontend/public/templates/shared/profile-framing.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const rows=JSON.parse(fs.readFileSync(path.join(root,'docs/TEMPLATE_SCAFFOLDS.json')));
const entries=[];
function styles(slug){const s=`:root body.template-${slug}`;return `
/* Intro group: one room, compact ivory readings, whole-body profile framing. */
${s} #journey #arrum-content.scene-panel{
 position:fixed!important;left:50%!important;top:49%!important;width:min(420px,calc(100% - 48px))!important;
 max-width:none!important;max-height:calc(100svh - 160px)!important;margin:0!important;padding:18px 20px!important;
 transform:translate(-50%,calc(-50% + var(--panel-lift,0px)))!important;opacity:var(--panel-opacity,0)!important;
 overflow:auto;overscroll-behavior:contain;text-align:center;background:none!important;box-shadow:none!important;border:0!important;
}
${s} #arrum-content .arrum-flourish{font-size:22px;line-height:1.3;margin:0 0 12px}
${s} #arrum-content>.kicker{font-size:11px!important;text-transform:none!important;letter-spacing:0!important;line-height:1.6;margin:0 0 18px!important}
${s} #arrum-content .arrum-meaning{font-size:11px!important;line-height:1.85;letter-spacing:0;max-width:360px;margin:0 auto!important;text-wrap:pretty;overflow-wrap:anywhere}
${s} #arrum-content :is(.arrum-reference,.arrum-next){display:none!important}
${s} #journey .paper.scene-panel:is(#bride-detail,#groom-detail){
 position:fixed!important;left:var(--profile-left,73%)!important;top:49%!important;width:50%!important;max-width:340px!important;
 max-height:calc(100svh - 150px)!important;margin:0!important;padding:16px 10px!important;
 transform:translate(-50%,calc(-50% + var(--panel-lift,0px)))!important;opacity:var(--panel-opacity,0)!important;
 overflow:auto;overscroll-behavior:contain;text-align:center;background:none!important;box-shadow:none!important;border:0!important;
}
${s} #journey #groom-detail{--profile-left:27%}
${s} .person-detail .person-kicker{font-size:11px!important;text-transform:none!important;letter-spacing:0!important;line-height:1.6}
${s} #journey .person-detail h2{font-size:30px!important;line-height:1.12;letter-spacing:-.02em;margin:12px auto 14px!important;text-wrap:balance;overflow-wrap:anywhere}
${s} .person-detail h2 em{font-size:inherit;line-height:inherit;margin-top:2px}
${s} .person-detail .person-rule{width:34px;margin:14px auto}
${s} .person-detail :is(.person-family,.person-family strong,.person-bio){font-size:11px!important;line-height:1.75;letter-spacing:0;overflow-wrap:anywhere;max-width:100%}
${s} .person-detail .person-family{margin:12px auto!important}
${s} .person-detail .person-family span{font-size:17px;line-height:1.4;margin:4px auto}
${s} .person-detail .person-bio{margin:12px auto 0;text-wrap:pretty}
${s} .person-detail .person-instagram{font-size:11px!important;letter-spacing:0;min-height:38px;max-width:100%;padding:9px 16px;margin-top:14px}
${s} .person-detail :is(.person-next,.person-placeholder){display:none!important}
@media(min-width:900px){
 ${s} #journey #arrum-content.scene-panel{width:min(520px,70vw)!important;padding:24px 28px!important}
 ${s} #arrum-content .arrum-meaning{max-width:440px}
 ${s} #journey .paper.scene-panel:is(#bride-detail,#groom-detail){max-width:400px!important;padding:20px!important}
 ${s} #journey .person-detail h2{font-size:36px!important}
}
@media(max-height:700px){
 ${s} #journey #arrum-content.scene-panel{top:49%!important;max-height:calc(100svh - 120px)!important;padding:12px 16px!important}
 ${s} #arrum-content .arrum-flourish{margin-bottom:8px}
 ${s} #arrum-content>.kicker{margin-bottom:12px!important}
 ${s} #journey .paper.scene-panel:is(#bride-detail,#groom-detail){top:48%!important;max-height:calc(100svh - 110px)!important;padding:10px 8px!important}
 ${s} #journey .person-detail h2{font-size:27px!important;margin:8px auto 10px!important}
 ${s} .person-detail .person-rule{margin:10px auto}
}
`;}
for(const row of rows){
 const dir=path.join(root,'frontend/public/templates',row.id),runtime=path.join(dir,'config/invitation.json');
 const c=JSON.parse(fs.readFileSync(runtime)),art=c.composition.art.hero;
 const b=art.bounds,layout=c.layout;
 Object.assign(layout,{profileBodyFraming:1,profileBodyTop:b.top,profileBodyBottom:b.bottom,profileBodyLeft:b.left,profileBodyRight:b.right,profileHeight:.70,profileFootLine:.88,profileEdgeInset:.025});
 c.composition.stage=c.composition.finale?'all-sections-authored':c.composition.social?'cover-hero-intro-events-social':c.composition.events?'cover-hero-quote-profiles-events':'cover-hero-quote-profiles';
 c.composition.intro={quoteMs:4000,profileMs:5000,returnMs:3400,quoteOpacity:.12,profiles:{bodyFraming:true,singlePair:true,readingColumn:'opposite-subject',mobilePanelWidth:.50}};
 const heroCamera=c.cameras.find(x=>x.id==='hero');
 const quote=c.cameras.find(x=>x.id==='janji');
 for(const mode of ['mobile','wide'])quote[mode]={...heroCamera[mode],x:layout.heroX,y:heroCamera[mode].y-145,z:Math.round(heroCamera[mode].z*.88),yaw:0,pitch:0,roll:0};
 let pairZ=0,map;
 if(row.engine===3){
  map=JSON.parse(fs.readFileSync(path.join(dir,'landscape.json')));pairZ=map.characters.hero.z||0;
  const hero=map.stops.find(s=>s.id==='hero'),q=map.stops.find(s=>s.id==='janji');
  Object.assign(q,{area:hero.area,x:hero.x||0,y:(hero.y||0)-layout.heroWidth/art.aspect*.12,z:Math.round(hero.z-(hero.z-pairZ)*.14)});delete q.fit;delete q.panel;
  for(const id of ['wanita','pria']){const stop=map.stops.find(s=>s.id===id);Object.assign(stop,{area:hero.area,x:hero.x||0,y:hero.y||0,z:hero.z});delete stop.fit;delete stop.panel;}
  fs.writeFileSync(path.join(dir,'landscape.json'),JSON.stringify(map,null,2)+'\n');
 }
 const pair={x:layout.heroX,y:layout.heroY,z:pairZ,width:layout.heroWidth,height:layout.heroWidth/art.aspect};
 for(const id of ['wanita','pria']){
  const camera=c.cameras.find(x=>x.id===id);
  for(const [mode,w,h]of [['mobile',390,844],['wide',1280,900]]){
   const lens=1000*Math.min(w/(w<600?520:850),h/1050);
   camera[mode]=fullBodyProfileCamera(pair,layout,id,w,h,lens);
  }
 }
 fs.writeFileSync(runtime,JSON.stringify(c,null,2)+'\n');
 fs.writeFileSync(path.join(root,'frontend/src/components/templates',row.id,'defaultConfig.json'),JSON.stringify(c,null,2)+'\n');
 fs.writeFileSync(path.join(dir,'intro-composition.css'),styles(row.id));
 const index=path.join(dir,'index.html'),html=fs.readFileSync(index,'utf8');fs.writeFileSync(index,html.includes('href="intro-composition.css"')?html:html.replace('</head>','<link rel="stylesheet" href="intro-composition.css"></head>'));
 const readme=path.join(root,'frontend/src/components/templates',row.id,'README.md');let text=fs.readFileSync(readme,'utf8');const marker='\n## Kutipan dan profil\n';if(text.includes(marker))text=text.slice(0,text.indexOf(marker));text+=marker+'\n- Teks dan kolom baca: `intro-composition.css` di folder runtime.\n- Durasi/reveal dan opacity kutipan: `composition.intro` dalam kedua konfigurasi.\n- Framing badan: `layout.profileBody*`, `profileHeight`, `profileFootLine`.\n- Penanda kepala tetap memilih sisi orang pada SATU ilustrasi pasangan; tidak menambah ilustrasi profil.\n- Gerakan antarprofil mundur ke komposisi pasangan sebelum bergeser ke orang berikutnya.\n- Nilai kamera mobile/wide disimpan pada `cameras`; engine 3 juga mempunyai stop dalam `landscape.json`.\n';fs.writeFileSync(readme,text);
 row.compositionStatus='cover-hero-quote-profiles-authored';
 entries.push({template:row.id,engine:row.engine,cameras:c.cameras.filter(x=>['hero','janji','wanita','pria'].includes(x.id)),motion:c.composition.intro});
}
fs.writeFileSync(path.join(root,'docs/TEMPLATE_SCAFFOLDS.json'),JSON.stringify(rows,null,2)+'\n');
fs.writeFileSync(path.join(root,'output/template-composition/intro-placements.json'),JSON.stringify(entries,null,2)+'\n');
console.log(JSON.stringify({templates:entries.length,sections:['janji','wanita','pria'],groupTransitions:'via hero in same room'}));
