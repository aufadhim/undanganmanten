/** Ludora-derived portrait framing; retain painted perspective by moving the foot plane too. */
const fs=require('./lib/scene-authoring-fs.cjs'),path=require('path'),root=path.resolve(__dirname,'..'),H=844,lens=750;
const slots={cover:{body:.428742,feet:.763355},hero:{body:.481234,feet:.81434},closing:{body:.40,feet:.94}};
function place(a,body,feet,distance,cy){const b=a.bounds,w=body*H*distance/lens*a.aspect/(b.bottom-b.top);return{width:w,x:-((b.left+b.right)/2-.5)*w,y:cy+(feet-.5)*H*distance/lens-w/a.aspect*(b.bottom-.5)}}
for(const id of ['sabana','urban-editorial','mural','monokrom']){const dir=path.join(root,'frontend/public/templates',id),file=path.join(dir,'config/invitation.json'),c=JSON.parse(fs.readFileSync(file));
const previous=c.composition.grounding.guide;
// Idempotent: recover the v3 reference guide if this step is repeated.
const base=c.composition.grounding.baseGuide||previous;
c.composition.grounding.baseGuide=base;c.composition.grounding.framingReference='ludora';
function guide(slot){const r=slots[slot].body/.68;return{...base,bodyFraction:slots[slot].body,footLine:slots[slot].feet,adultHeight:base.adultHeight*r,groundY:.45+(base.groundY-.45)*r}}
c.composition.hero.scaleGuide=guide('hero');c.composition.cover.scaleGuide=guide('cover');c.composition.closing={...c.composition.closing,scaleGuide:guide('closing')};
if(id==='monokrom'){
c.composition.cover.layers['stage-landscape'].scaleGuide=guide('cover');
for(const slot of ['cover','hero','closing']){const distance=slot==='cover'?1160:slot==='hero'?1280:1340,cy=slot==='cover'?15:slot==='hero'?0:-30,a=c.composition.art[slot==='hero'?'hero':'cover'],p=place(a,slots[slot].body,slots[slot].feet,distance,cy);Object.assign(c.layout,{[slot+'Width']:p.width,[slot+'X']:p.x,[slot+'Y']:p.y});}
}else{const mf=path.join(dir,'landscape.json'),m=JSON.parse(fs.readFileSync(mf));
for(const slot of ['cover','hero','closing']){const char=m.characters[slot],stop=m.stops.find(s=>s.id===char.stop),area=m.areas.find(a=>a.id===stop.area),g=guide(slot),pixels=Math.max(H*1.12,H*g.bodyFraction/g.adultHeight),distance=area.height*lens/pixels,z=m.world.z+distance,cy=(area.y||0)+(g.groundY-.5)*area.height-(g.footLine-.5)*H*distance/lens;
Object.assign(stop,{z,x:0,y:cy});delete stop.fit;delete stop.minZ;const art=c.composition.art[slot==='cover'?'cover':'hero'],p=place(art,g.bodyFraction,g.footLine,z-(char.z||0),cy);Object.assign(c.layout,{[slot+'Width']:p.width,[slot+'X']:p.x,[slot+'Y']:slot==='closing'?0:p.y});char.width=p.width;char.y=p.y;
}fs.writeFileSync(mf,JSON.stringify(m,null,2)+'\n');}
for(const p of [file,path.join(root,'frontend/src/components/templates',id,'defaultConfig.json')])fs.writeFileSync(p,JSON.stringify(c,null,2)+'\n');
}
