/** Author the final reading group; no app, build or tests are launched. */
import fs from './lib/scene-authoring-fs.cjs';import path from 'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),rows=JSON.parse(fs.readFileSync(path.join(root,'docs/TEMPLATE_SCAFFOLDS.json'))),report=[];
for(const row of rows){
 const dir=path.join(root,'frontend/public/templates',row.id),file=path.join(dir,'config/invitation.json'),c=JSON.parse(fs.readFileSync(file));
 c.composition.stage='all-sections-authored';c.composition.finale={ids:['gift','rsvp','penutup'],entryMs:6200,exitMs:5400,localMs:4200,overviewDepth:60};
 for(const [id,x,y,z]of [['gift',-18,-10,1360],['rsvp',18,8,1320]]){const cam=c.cameras.find(v=>v.id===id);for(const mode of ['mobile','wide'])cam[mode]={x,y,z,yaw:0,pitch:0,roll:0};}
 let distance=1320,cameraY=0,map;
 if(row.engine===3){const p=path.join(dir,'landscape.json');map=JSON.parse(fs.readFileSync(p));const end=map.stops.find(v=>v.id==='penutup');for(const [id,x,y]of [['gift',-100,-25],['rsvp',0,0]]){const stop=map.stops.find(v=>v.id===id);Object.assign(stop,{area:end.area,x,y,fit:'landmark',panel:'center',minZ:1500});delete stop.z;}
  distance=end.z-(map.characters.closing.z||0);cameraY=end.y||0;
 }else if(row.engine===1){const cam=c.cameras.find(v=>v.id==='penutup');for(const mode of ['mobile','wide'])cam[mode]={x:0,y:0,z:1320,yaw:0,pitch:0,roll:0};}
 const art=c.composition.art.hero,b=art.bounds,projection=750/distance;
 const width=Math.min(.43*844/projection*art.aspect/(b.bottom-b.top),.86*390/projection/(b.right-b.left));
 const x=-((b.left+b.right)/2-.5)*width,y=cameraY+.42*844/projection-width/art.aspect*(b.bottom-.5);
 if(row.engine!==2){Object.assign(c.layout,{closingWidth:+width.toFixed(3),closingX:+x.toFixed(3),closingY:row.engine===3?0:+y.toFixed(3),closingFootY:b.bottom,closingOpacity:1});
 if(map){map.characters.closing.y=+y.toFixed(3);map.characters.closing.width=+width.toFixed(3);fs.writeFileSync(path.join(dir,'landscape.json'),JSON.stringify(map,null,2)+'\n');}else c.composition.closing={absolutePosition:true};}
 for(const p of [file,path.join(root,'frontend/src/components/templates',row.id,'defaultConfig.json')])fs.writeFileSync(p,JSON.stringify(c,null,2)+'\n');
 const s=`:root body.template-${row.id}`;
 fs.writeFileSync(path.join(dir,'final-composition.css'),`
/* Final reading group: shared disclosure, confirmation and brand components. */
${s} #journey #gift .paper.scene-panel{position:fixed!important;left:50%!important;top:46%!important;width:min(460px,calc(100% - 36px))!important;max-width:none!important;max-height:calc(100svh - 140px)!important;padding:18px!important;margin:0!important;transform:translate(-50%,calc(-50% + var(--panel-lift,0px)))!important;opacity:var(--panel-opacity,0)!important;overflow:auto;overscroll-behavior:contain;box-sizing:border-box;text-align:center}
${s} :is(#gift,#rsvp,#penutup) .paper>h2{font-size:34px!important;line-height:1.12;letter-spacing:-.02em;margin:10px 0 16px!important;text-wrap:balance}
${s} :is(#gift,#rsvp) .paper>.kicker{font-size:11px!important;line-height:1.5;letter-spacing:0!important;text-transform:none!important;margin:0 0 10px!important}
${s} :is(#gift,#rsvp,#penutup) .paper>p,${s} .gift-details,${s} .guest-confirmation{font-size:11px!important;line-height:1.8;letter-spacing:0!important;text-transform:none!important}
${s} :is(#gift,#rsvp,#penutup) :is(.placeholder,.world-next,.paper>.ornament){display:none!important}
${s} #gift .gift-details-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-top:20px}
${s} #gift .gift-details-reveal{max-height:none;overflow:visible;padding:4px 0 12px}
${s} #gift .gift-details-reveal h3{font-size:18px;line-height:1.3}
${s} :is(.gift-details button,.guest-confirmation button,#back-cover){min-height:40px;padding:10px 18px;font-size:11px!important;line-height:1.4;letter-spacing:0!important;text-transform:none!important;border:1px solid color-mix(in srgb,currentColor 38%,transparent);border-radius:999px;color:var(--cms-ink,var(--ink,#526745));background:rgba(255,253,244,.65);box-shadow:none;text-decoration:none}
${s} #journey #rsvp .paper.scene-panel{left:50%!important;top:max(66px,8svh)!important;width:calc(100% - 24px)!important;max-width:900px!important;height:calc(100svh - max(66px,8svh) - 76px)!important;max-height:none!important;padding:14px 18px 28px!important;transform:translate(-50%,var(--panel-lift,0px))!important;opacity:var(--panel-opacity,0)!important;overflow:auto;overscroll-behavior:contain;box-sizing:border-box}
${s} #rsvp .immersia-confirmation{max-height:none;overflow:visible}
${s} #rsvp .guest-confirmation-wishes{max-height:none;overflow:visible;padding-bottom:24px}
${s} #rsvp .guest-confirmation :is(input,select,textarea){font-size:12px!important;line-height:1.5;min-height:40px}
${s} #rsvp .guest-confirmation textarea{min-height:90px}
${s} #rsvp .guest-confirmation-wishes article{padding:16px 0}
${s} #rsvp .guest-confirmation-wishes article p{font-size:11px!important;line-height:1.8}
${s} #rsvp .confirmation-subtitle{margin:0 0 20px!important;text-align:center}
${s} #journey #penutup .paper.scene-panel{position:fixed!important;left:50%!important;top:max(66px,8svh)!important;width:min(520px,calc(100% - 32px))!important;height:auto!important;max-height:43svh!important;padding:8px 16px!important;margin:0!important;transform:translate(-50%,var(--panel-lift,0px))!important;opacity:var(--panel-opacity,0)!important;display:flex;flex-direction:column;align-items:center;gap:8px;overflow:auto;box-sizing:border-box;text-align:center}
${s} #penutup .paper.scene-panel>*{margin:0!important}
${s} #penutup .paper>.kicker,${s} #penutup .mini{display:none!important}
${s} #penutup .signature{font-size:28px!important;line-height:1.15;text-wrap:balance}
${s} #penutup .cover-date{font-size:11px!important;line-height:1.5;letter-spacing:0!important;text-transform:none!important}
${s} #penutup #closing-brand{font-size:11px!important;letter-spacing:0!important;margin-top:4px!important}
@media(max-height:700px){${s} :is(#gift,#rsvp,#penutup) .paper>h2{font-size:29px!important}${s} #journey #penutup .paper.scene-panel{max-height:43svh!important;gap:5px;padding:6px 12px!important}${s} #penutup .signature{font-size:24px!important}${s} #penutup #back-cover{min-height:32px;padding:6px 14px}}
`);
 const index=path.join(dir,'index.html');let html=fs.readFileSync(index,'utf8');if(!html.includes('href="final-composition.css"'))html=html.replace('</head>','<link rel="stylesheet" href="final-composition.css"></head>');fs.writeFileSync(index,html);
 const readme=path.join(root,'frontend/src/components/templates',row.id,'README.md');fs.appendFileSync(readme,'\n## Hadiah, RSVP, dan penutup\n\nTampilan: `final-composition.css`. Perjalanan: `composition.finale`. Hadiah tetap memakai disclosure bersama, RSVP dan ucapan satu ruang gulir. Penutup teks di atas, pasangan bawah; engine 2 tetap kembali ke ruang buku di luar. Belum diperiksa di browser.\n');
 row.compositionStatus='all-sections-authored';report.push({template:row.id,engine:row.engine,closing:row.engine===2?'outside-book':{width,x,y}});
}
fs.writeFileSync(path.join(root,'docs/TEMPLATE_SCAFFOLDS.json'),JSON.stringify(rows,null,2)+'\n');fs.writeFileSync(path.join(root,'output/template-composition/final-placements.json'),JSON.stringify(report,null,2)+'\n');console.log(`Authored final sections for ${rows.length} templates; no tests/build run.`);
