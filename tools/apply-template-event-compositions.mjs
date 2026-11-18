/** Author countdown/event/rundown packs; does not launch the app or run tests. */
import fs from './lib/scene-authoring-fs.cjs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const rows=JSON.parse(fs.readFileSync(path.join(root,'docs/TEMPLATE_SCAFFOLDS.json'))),report=[];
function styles(slug){const s=`:root body.template-${slug}`;return `
/* Countdown, ceremony and rundown: one reading zone over the shared ivory wash. */
${s} #journey :is(#countdown,#akad,#rundown) .paper.scene-panel{
 position:fixed!important;left:50%!important;top:48%!important;width:min(460px,calc(100% - 36px))!important;
 max-width:none!important;max-height:calc(100svh - 146px)!important;margin:0!important;padding:18px 18px!important;
 transform:translate(-50%,calc(-50% + var(--panel-lift,0px)))!important;opacity:var(--panel-opacity,0)!important;
 overflow:auto;overscroll-behavior:contain;text-align:center;background:none!important;border:0!important;box-shadow:none!important;
}
${s} :is(#countdown,#akad,#rundown) .paper>.kicker{font-size:11px!important;letter-spacing:0!important;line-height:1.5;text-transform:none!important;margin:0 0 12px!important}
${s} :is(#countdown,#akad,#rundown) .paper>h2{font-size:34px!important;line-height:1.12;letter-spacing:-.02em;margin:0 0 14px!important;text-wrap:balance}
${s} :is(#countdown,#akad,#rundown) .paper>p{font-size:11px!important;line-height:1.75;letter-spacing:0!important;margin:10px auto 16px;max-width:360px;text-transform:none!important}
${s} #countdown .paper>.ornament{display:none}
${s} #countdown .save-the-date-immersia{max-width:340px;width:100%;margin:0 auto}
${s} #countdown :is(.countdown,.save-the-date-countdown){display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;width:100%;margin:16px auto 0;border-block:1px solid color-mix(in srgb,currentColor 28%,transparent)}
${s} #countdown :is(.countdown,.save-the-date-countdown)>div{min-width:0;padding:12px 2px;border-right:1px solid color-mix(in srgb,currentColor 20%,transparent)}
${s} #countdown :is(.countdown,.save-the-date-countdown)>div:last-child{border-right:0}
${s} #countdown :is(.countdown,.save-the-date-countdown) strong{display:block;font-size:42px!important;line-height:1.05;letter-spacing:-.02em;font-variant-numeric:tabular-nums;font-weight:400}
${s} #countdown :is(.countdown,.save-the-date-countdown) span{display:block;font-size:11px!important;line-height:1.3;letter-spacing:0!important;text-transform:none!important;margin-top:6px}
${s} #countdown .save-the-date-calendar{margin:16px auto 12px;width:100%;max-width:340px}
${s} #countdown .save-the-date-month{font-size:18px!important;line-height:1.3;text-transform:none!important;letter-spacing:0!important;margin-bottom:10px}
${s} #countdown .save-the-date-week{font-size:11px!important;line-height:1.4;padding-bottom:6px}
${s} #countdown .save-the-date-days span{font-size:11px!important;line-height:1.2;min-height:26px}
${s} #countdown .save-the-date-days span.is-selected{height:26px;min-height:26px;width:27px}
${s} :is(#countdown .save-the-date-button,#countdown #calendar,#akad .event-map-button,#akad .configured){
 display:inline-flex;align-items:center;justify-content:center;min-height:40px;max-width:100%;padding:10px 20px!important;
 font-size:11px!important;line-height:1.4;letter-spacing:0!important;text-transform:none!important;font-weight:500;text-decoration:none;
 border:1px solid color-mix(in srgb,currentColor 38%,transparent);border-radius:999px;
 color:var(--cms-ink,var(--ink,#526745));background:rgba(255,253,244,.62);box-shadow:none;
}
${s} #countdown .save-the-date-button{display:flex;width:fit-content;margin:16px auto 0}
${s} :is(#countdown .save-the-date-button,#countdown #calendar,#akad .event-map-button):hover{background:rgba(255,253,244,.84);filter:none}
${s} #countdown .mini{display:none!important}
${s} #akad :is(.event-day,.event-date){font-size:11px!important;line-height:1.6;letter-spacing:0!important;text-transform:none!important}
${s} #akad .event-details{margin:18px auto 0!important;padding:16px 0!important;border-block:1px solid color-mix(in srgb,currentColor 22%,transparent)}
${s} #akad :is(.event-schedules,.ceremony-times:not(.event-details)){display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:stretch}
${s} #akad .event-schedule{min-width:0;padding:0 6px;display:flex;flex-direction:column}
${s} #akad .event-schedule+.event-schedule{border-left:1px solid color-mix(in srgb,currentColor 22%,transparent)}
${s} #akad :is(.event-schedule .event-subtitle,.ceremony-times:not(.event-details)>div>span){font-family:var(--garden-heading,'Cormorant Garamond',serif);font-size:24px!important;line-height:1.15;letter-spacing:0!important;text-transform:none!important;font-weight:500;margin:0 0 12px}
${s} #akad :is(.event-time,.ceremony-times strong){font-size:13px!important;line-height:1.6;font-variant-numeric:tabular-nums;font-family:inherit;white-space:normal;margin:0 0 12px}
${s} #akad :is(.event-location,.event-location p,.event-venue){font-size:11px!important;line-height:1.75;overflow-wrap:anywhere}
${s} #akad .event-location p{margin:6px auto 14px!important}
${s} #akad .event-venue{font-weight:600}
${s} #akad .same-location>.event-location{max-width:340px;margin:20px auto 0}
${s} #akad .event-schedules .event-location{display:flex;flex-direction:column;align-items:center;flex:1;width:100%}
${s} #akad .event-schedules .event-map-button{margin-top:auto;padding-inline:14px!important}
${s} #rundown .schedule-list{display:block;width:100%;max-width:390px;margin:18px auto 0!important;text-align:left}
${s} #rundown .schedule-list>div{display:grid;grid-template-columns:minmax(92px,.85fr) minmax(0,1.45fr);gap:16px;align-items:start;padding:15px 0;border-bottom:1px solid color-mix(in srgb,currentColor 20%,transparent)}
${s} #rundown .schedule-list>div:last-child{border-bottom:0}
${s} #rundown .schedule-list :is(time,strong){font-family:inherit;font-size:13px!important;font-weight:500;line-height:1.6;letter-spacing:0!important;overflow-wrap:anywhere}
${s} #rundown .schedule-list time{font-variant-numeric:tabular-nums;color:inherit}
${s} #rundown .schedule-list strong{display:block}
${s} #rundown .schedule-list small{display:block;font-size:11px!important;line-height:1.75;letter-spacing:0;margin-top:5px;white-space:pre-line;overflow-wrap:anywhere}
${s} #rundown .schedule-list small:empty{display:none}
${s} #rundown .schedule-list>p{font-size:11px;line-height:1.75;text-align:center}
${s} :is(#countdown,#akad,#rundown) :is(.world-next,.placeholder){display:none!important}
@media(min-width:900px){
 ${s} #journey :is(#countdown,#akad,#rundown) .paper.scene-panel{width:min(540px,72vw)!important;padding:24px 26px!important}
 ${s} #countdown .save-the-date-immersia{max-width:360px}
 ${s} :is(#countdown,#akad,#rundown) .paper>h2{font-size:38px!important}
}
@media(max-height:700px){
 ${s} #journey :is(#countdown,#akad,#rundown) .paper.scene-panel{top:48%!important;max-height:calc(100svh - 116px)!important;padding:12px 14px!important}
 ${s} :is(#countdown,#akad,#rundown) .paper>.kicker{margin-bottom:8px!important}
 ${s} :is(#countdown,#akad,#rundown) .paper>h2{font-size:29px!important;margin-bottom:10px!important}
 ${s} :is(#countdown,#akad,#rundown) .paper>p{margin:8px auto 12px}
 ${s} #countdown :is(.countdown,.save-the-date-countdown)>div{padding:8px 2px}
 ${s} #countdown :is(.countdown,.save-the-date-countdown) strong{font-size:36px!important}
 ${s} #countdown .save-the-date-calendar{margin:12px auto 8px}
 ${s} #countdown .save-the-date-days span{min-height:22px}
 ${s} #countdown .save-the-date-days span.is-selected{height:22px;min-height:22px}
 ${s} #rundown .schedule-list>div{padding:12px 0}
}
@media(max-width:359px){
 ${s} #akad .event-schedules{gap:8px}
 ${s} #akad .event-schedule{padding-inline:4px}
 ${s} #akad .event-schedules .event-map-button{padding-inline:10px!important}
 ${s} #rundown .schedule-list>div{grid-template-columns:minmax(80px,.9fr) minmax(0,1.3fr);gap:12px}
}
`;}
for(const row of rows){
 const dir=path.join(root,'frontend/public/templates',row.id),runtime=path.join(dir,'config/invitation.json'),c=JSON.parse(fs.readFileSync(runtime));
 c.composition.stage=c.composition.finale?'all-sections-authored':c.composition.social?'cover-hero-intro-events-social':'cover-hero-quote-profiles-events';
 c.composition.events={entryMs:6200,exitMs:5400,localMs:4000,overviewDepth:70,readingTop:.48,readingWidthMobile:460,sameLocation:'shared-venue',rundown:'preserve-editor-order'};
 const x=Math.round((c.composition.targets.hero.center-.5)*160);
 const views={countdown:{x:x-16,y:-15,z:1380},akad:{x:x+16,y:5,z:1280},rundown:{x:x-8,y:20,z:1200}};
 for(const [id,p]of Object.entries(views)){
  const camera=c.cameras.find(s=>s.id===id);
  for(const mode of ['mobile','wide'])camera[mode]={...p,yaw:0,pitch:0,roll:0};
 }
 if(row.engine===3){
  const mapFile=path.join(dir,'landscape.json'),map=JSON.parse(fs.readFileSync(mapFile));
  const area=map.stops.find(s=>s.id==='countdown').area;
  for(const [id,xOffset,yOffset]of [['countdown',-80,-45],['akad',0,5],['rundown',80,40]]){
   const stop=map.stops.find(s=>s.id===id);Object.assign(stop,{area,x:xOffset,y:yOffset,fit:'landmark',panel:'center'});delete stop.z;stop.minZ=1500;
  }
  fs.writeFileSync(mapFile,JSON.stringify(map,null,2)+'\n');
 }
 fs.writeFileSync(runtime,JSON.stringify(c,null,2)+'\n');fs.writeFileSync(path.join(root,'frontend/src/components/templates',row.id,'defaultConfig.json'),JSON.stringify(c,null,2)+'\n');
 fs.writeFileSync(path.join(dir,'event-composition.css'),styles(row.id));
 const index=path.join(dir,'index.html');let html=fs.readFileSync(index,'utf8');
 if(!html.includes('id="shared-save-date-css"'))html=html.replace('</head>','<link id="shared-save-date-css" rel="stylesheet" href="/templates/shared/save-the-date.css"></head>');
 if(!html.includes('href="event-composition.css"'))html=html.replace('</head>','<link rel="stylesheet" href="event-composition.css"></head>');fs.writeFileSync(index,html);
 const readme=path.join(root,'frontend/src/components/templates',row.id,'README.md');let text=fs.readFileSync(readme,'utf8');const marker='\n## Countdown, acara, dan rundown\n';if(text.includes(marker))text=text.slice(0,text.indexOf(marker));text+=marker+'\n- Tata letak: `event-composition.css` di folder runtime.\n- Kamera: `cameras` dalam kedua konfigurasi; engine 3 memakai tiga stop dalam area yang sama di `landscape.json`.\n- Durasi: `composition.events` (gerakan lokal 4 detik).\n- Kalender tetap memakai komponen SaveTheDate; lokasi sama tetap memakai renderEventDetails bersama.\n- Rundown mengikuti urutan editor; jam dan nama acara sama-sama 13 px, deskripsi 11 px.\n- Teks panjang dapat digulir di panel; tombol lokasi memakai gaya ivory tanpa ikon.\n';fs.writeFileSync(readme,text);
 row.compositionStatus='cover-hero-intro-events-authored';report.push({template:row.id,engine:row.engine,views,motion:c.composition.events});
}
fs.writeFileSync(path.join(root,'docs/TEMPLATE_SCAFFOLDS.json'),JSON.stringify(rows,null,2)+'\n');
fs.writeFileSync(path.join(root,'output/template-composition/event-placements.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({templates:report.length,sections:['countdown','akad','rundown']}));
