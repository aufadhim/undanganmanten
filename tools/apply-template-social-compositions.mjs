/** Author the story/gallery/style/live/frame group without launching QA. */
import fs from './lib/scene-authoring-fs.cjs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const rows=JSON.parse(fs.readFileSync(path.join(root,'docs/TEMPLATE_SCAFFOLDS.json')));
const ids=['cerita','galeri','dresscode','livestream','filter'];
for(const row of rows){
 const dir=path.join(root,'frontend/public/templates',row.id),file=path.join(dir,'config/invitation.json'),c=JSON.parse(fs.readFileSync(file));
 c.composition.stage=c.composition.finale?'all-sections-authored':'cover-hero-intro-events-social';
 c.composition.social={ids,entryMs:6200,exitMs:5400,localMs:4200,overviewDepth:60};
 const views={};ids.forEach((id,i)=>{const p={x:(i-2)*24,y:(i-2)*12,z:1300-i*28,yaw:0,pitch:0,roll:0};views[id]=p;const cam=c.cameras.find(v=>v.id===id);for(const mode of ['mobile','wide'])cam[mode]={...p};});
 if(row.engine===3){const p=path.join(dir,'landscape.json'),m=JSON.parse(fs.readFileSync(p)),area=m.stops.find(v=>v.id==='cerita').area;ids.forEach((id,i)=>{const stop=m.stops.find(v=>v.id===id);Object.assign(stop,{area,x:(i-2)*110,y:(i-2)*25,fit:'landmark',panel:'center',minZ:1500});delete stop.z;});fs.writeFileSync(p,JSON.stringify(m,null,2)+'\n');}
 for(const p of [file,path.join(root,'frontend/src/components/templates',row.id,'defaultConfig.json')])fs.writeFileSync(p,JSON.stringify(c,null,2)+'\n');
 const s=`:root body.template-${row.id}`,g=':is(#cerita,#galeri,#dresscode,#livestream,#filter)';
 fs.writeFileSync(path.join(dir,'social-composition.css'),`
/* Shared components retain behavior; this pack owns reading composition only. */
${s} #journey ${g} .paper.scene-panel{position:fixed!important;left:50%!important;top:48%!important;width:min(460px,calc(100% - 36px))!important;max-width:none!important;max-height:calc(100svh - 140px)!important;padding:18px!important;margin:0!important;transform:translate(-50%,calc(-50% + var(--panel-lift,0px)))!important;opacity:var(--panel-opacity,0)!important;overflow:auto;overscroll-behavior:contain;text-align:center;background:none!important;border:0!important;box-shadow:none!important;box-sizing:border-box}
${s} ${g} .paper>.kicker{font-size:11px!important;line-height:1.5;letter-spacing:0!important;text-transform:none!important;margin:0 0 12px!important}
${s} ${g} .paper>h2{font-size:34px!important;line-height:1.12;margin:0 0 16px!important;letter-spacing:-.02em;text-wrap:balance}
${s} ${g} .paper>p{font-size:11px!important;line-height:1.8;letter-spacing:0!important;text-transform:none!important;margin:10px auto 18px;max-width:360px;overflow-wrap:anywhere}
${s} ${g} :is(.placeholder,.world-next,.paper>.ornament){display:none!important}
${s} ${g} :is(.secondary,.story-page-buttons button,.livestream-open,.photo-frame-button){font-size:11px!important;line-height:1.4;letter-spacing:0!important;text-transform:none!important;min-height:40px;padding:10px 20px;border:1px solid color-mix(in srgb,currentColor 38%,transparent);border-radius:999px;color:var(--cms-ink,var(--ink,#526745));background:rgba(255,253,244,.62);box-shadow:none;text-decoration:none}
${s} #cerita .story-presentation{max-width:360px;margin:16px auto 0!important}
${s} #cerita :is(.story-narrative,.story-chapter-date,.story-page-status,.timeline p,.timeline span){font-size:11px!important;line-height:1.8;letter-spacing:0!important;text-transform:none!important}
${s} #cerita :is(.story-chapter-title,.timeline h3){font-size:26px!important;line-height:1.2;margin:14px 0}
${s} #cerita .story-page-buttons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}
${s} #journey #galeri .paper.scene-panel{width:calc(100% - 24px)!important;max-height:calc(100svh - 128px)!important;padding:8px!important;overflow:hidden;display:flex;flex-direction:column}
${s} #galeri .standard-gallery-root{height:calc(100svh - 290px);min-height:180px;max-height:740px;flex:1;min-width:0}
${s} #galeri .gallery-grid{height:calc(100svh - 290px)!important;min-height:180px;max-height:740px;flex:1;width:100%}
${s} #galeri .paper>p{margin-bottom:12px}
${s} #dresscode :is(.dress-code-description,.dress-code-note,.mini,.swatches){font-size:11px!important;line-height:1.8}
${s} #dresscode .swatches{display:flex;justify-content:center;flex-wrap:wrap;gap:18px;margin:22px auto}
${s} #dresscode .swatches>div{min-width:48px}
${s} #dresscode .swatches span{width:38px;height:38px;margin:0 auto 8px;display:block;border-radius:50%}
${s} #dresscode .dress-guide{font-size:11px!important;line-height:1.8}
${s} #dresscode .dress-guide :is(p,small){font-size:11px!important;line-height:1.8}
${s} #dresscode .dress-guide-groups h3{font-size:20px!important;line-height:1.3}
${s} #dresscode .paper>h3{font-size:22px!important;line-height:1.3;margin:18px 0 10px}
${s} #livestream .livestream-poster{margin:18px auto 0;box-shadow:none;border-radius:8px}
${s} #livestream :is(.livestream-empty,.livestream-open,.stream-window){font-size:11px!important;line-height:1.8}
${s} #livestream .livestream-play{width:52px;height:52px}
${s} #filter .photo-frame{font-size:11px;line-height:1.8}
${s} #filter .photo-frame-preview{height:clamp(140px,33svh,300px);max-width:100%;margin:18px auto;object-fit:contain}
${s} #filter .photo-frame-button{margin:16px auto 0}
@media(min-width:900px){${s} #journey ${g} .paper.scene-panel{width:min(540px,72vw)!important;padding:24px!important}${s} #journey #galeri .paper.scene-panel{width:min(1000px,90vw)!important}${s} ${g} .paper>h2{font-size:38px!important}}
@media(max-height:700px){${s} #journey ${g} .paper.scene-panel{max-height:calc(100svh - 112px)!important;padding:12px!important}${s} ${g} .paper>h2{font-size:29px!important;margin-bottom:10px!important}${s} #galeri :is(.standard-gallery-root,.gallery-grid){height:calc(100svh - 250px)!important}${s} #filter .photo-frame-preview{height:26svh}}
`);
 const index=path.join(dir,'index.html');let html=fs.readFileSync(index,'utf8');if(!html.includes('href="social-composition.css"'))html=html.replace('</head>','<link rel="stylesheet" href="social-composition.css"></head>');fs.writeFileSync(index,html);
 const readme=path.join(root,'frontend/src/components/templates',row.id,'README.md');let text=fs.readFileSync(readme,'utf8');const marker='\n## Cerita, galeri, dress code, livestream, dan bingkai\n';if(text.includes(marker))text=text.slice(0,text.indexOf(marker));text+=marker+'\nTata letak: `social-composition.css`. Kamera: kedua konfigurasi; engine 3 memakai stop satu area pada `landscape.json`. Durasi lokal 4,2 detik melalui `composition.social`. Komponen galeri/lightbox, cerita, dress code, livestream, dan bingkai tetap dipakai bersama. Belum diperiksa di browser.\n';fs.writeFileSync(readme,text);
 row.compositionStatus='cover-hero-intro-events-social-authored';
}
fs.writeFileSync(path.join(root,'docs/TEMPLATE_SCAFFOLDS.json'),JSON.stringify(rows,null,2)+'\n');
console.log(`Authored social compositions for ${rows.length} templates; no tests/build run.`);
