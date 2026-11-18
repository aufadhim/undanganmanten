#!/usr/bin/env python3
"""Repeatable source handoff. Never copies env, uploads, database, Git or personal portraits."""
from pathlib import Path
import shutil, hashlib, json, zipfile
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/handoff'
DEST=OUT/'undanganmanten-template-engines'
if DEST.exists(): shutil.rmtree(DEST)
DEST.mkdir(parents=True,exist_ok=True)
def copy(rel):
    src=ROOT/rel; dst=DEST/rel
    if not src.exists(): return
    if src.is_dir():
        shutil.copytree(src,dst,ignore=shutil.ignore_patterns('node_modules','.git','.env*','env.example','uploads','dist','coverage','test-results','playwright-report','*.log','*.sqlite*','*.db','*.pem','*.key','qa','__pycache__'))
    else:
        dst.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(src,dst)
for rel in ['frontend/src','frontend/public','frontend/tests','frontend/scripts','backend/src','backend/prisma','backend/tests','docs/handoff']:
    copy(rel)
for rel in ['frontend/package.json','frontend/package-lock.json','frontend/index.html','frontend/vite.config.js','frontend/playwright.config.ts','frontend/playwright.templates.config.ts','backend/package.json','backend/package-lock.json','frontend/src/components/templates/README.md']:
    copy(rel)
for name in ['ENGINE_3_RIVIERA.md','ENGINE_3_ART_PROMPTS.md','COVER_AMBIENCE.md','LUDORA.md','LUDORA_ART_PROMPTS.md','WASESA.md','PANDUAN_EDIT_VIRIDARIUM.md','QA_TEMPLATE_AKTIF.md','TEMPLATE_SPATIAL_SCALE.md','IVORY_WASH_STANDARD.md']:
    copy('docs/'+name)
# Keep exported config names/geometry/tests stable but replace private likeness pixels.
generic=ROOT/'frontend/public/templates/ludora/assets/couple-playful.webp'
for name in ['couple-sampul-v2.webp','couple-hero-v2.webp']:
    shutil.copy2(generic,DEST/'frontend/public/templates/ludora/assets'/name)
lab='''import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import Template from './src/components/templates/viridarium/ViridariumTemplate.jsx';
import a from './src/components/templates/viridarium/defaultConfig.json';
import b from './src/components/templates/sekar-jawa/defaultConfig.json';
import c from './src/components/templates/pramaya/defaultConfig.json';
import d from './src/components/templates/riviera/defaultConfig.json';
import e from './src/components/templates/wasesa/defaultConfig.json';
import f from './src/components/templates/ludora/defaultConfig.json';
const packs={viridarium:a,'sekar-jawa':b,pramaya:c,riviera:d,wasesa:e,ludora:f};
const wanted=new URLSearchParams(location.search).get('theme');const theme=packs[wanted]?wanted:'viridarium';
const invitation={id:'portable-demo',slug:'demo',themeId:theme==='viridarium'?'garden-canvas':theme,weddingDate:'2026-12-20',themeSettings:{characterSettings:{mode:'default'}},coupleProfile:{brideName:'Alina',groomName:'Raka',brideFullName:'Alina Putri',groomFullName:'Raka Pratama',brideFather:'Budi',brideMother:'Sari',groomFather:'Adi',groomMother:'Dewi'},invitationFeatures:{igFilterEnabled:false,rsvpEnabled:true,wishesEnabled:true},wishes:[]};
function App(){const[wide,W]=useState(false),[key,K]=useState(0);return <main style={{padding:16,minHeight:'100vh',boxSizing:'border-box',background:'#eee9dd',font:'14px sans-serif'}}><nav style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:16}}><select value={theme} onChange={ev=>location.search='?theme='+ev.target.value}>{Object.keys(packs).map(t=><option key={t}>{t}</option>)}</select><button onClick={()=>W(!wide)}>HP / Lebar</button><button onClick={()=>K(key+1)}>Reload preview</button><span>Demo lokal · tidak menyimpan RSVP ke server</span></nav><div style={{position:'relative',margin:'auto',width:wide?'100%':390,maxWidth:'100%',height:wide?'calc(100vh - 100px)':844}}><Template key={key} invitation={invitation} editorPreview scenePack={packs[theme]} entryPath={'/templates/'+theme+'/index.html'} templateName={theme}/></div></main>};createRoot(document.getElementById('root')).render(<App/>);
'''
(DEST/'frontend/template-lab.jsx').write_text(lab)
(DEST/'frontend/template-lab.html').write_text('<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>UndanganManten Template Lab</title><body style="margin:0"><div id="root"></div><script type="module" src="/template-lab.jsx"></script></body></html>')
shutil.copy2(ROOT/'docs/handoff/START_HERE.md',DEST/'README.md')
report={'version':'2026-11-01','purpose':'Portable engine source and demo lab; not production backup','excluded':['.env and env examples','credentials','Git history','user uploads','database contents','node_modules','build outputs','personal output and QA screenshots'],'sanitized':['Ludora couple-sampul-v2.webp and couple-hero-v2.webp replaced with generic sample pixels; originals unchanged'],'requires':['Node.js 22 LTS','npm ci internet access','backend credentials only for full CMS, not lab']}
(DEST/'EXPORT_REPORT.json').write_text(json.dumps(report,indent=2))
files=sorted(p for p in DEST.rglob('*') if p.is_file())
(DEST/'MANIFEST.sha256').write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.relative_to(DEST).as_posix()+'\n' for p in files))
archive=OUT/'undanganmanten-template-engines-2026-11-01.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in sorted(DEST.rglob('*')):
        if p.is_file(): z.write(p,p.relative_to(OUT))
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert not any('/.env' in n or '/uploads/' in n or '/node_modules/' in n for n in z.namelist())
print(json.dumps({'archive':str(archive),'files':len(files)+1,'megabytes':round(archive.stat().st_size/1024**2,2)}))
