/** Shared portrait framing for all 34 authored packs, with theme-specific painted ground. */
const fs=require('./lib/scene-authoring-fs.cjs'),path=require('path'),root=path.resolve(__dirname,'..'),rows=require('../docs/TEMPLATE_SCAFFOLDS.json'),H=844,lens=750;
const slots={cover:{body:.428742,feet:.763355},hero:{body:.481234,feet:.81434}};
function place(a,body,feet,distance,cy){const b=a.bounds,w=body*H*distance/lens*a.aspect/(b.bottom-b.top);return{width:w,x:-((b.left+b.right)/2-.5)*w,y:cy+(feet-.5)*H*distance/lens-w/a.aspect*(b.bottom-.5)}}
for(const row of rows){const id=row.id,dir=path.join(root,'frontend/public/templates',id),file=path.join(dir,'config/invitation.json'),c=JSON.parse(fs.readFileSync(file));
 const base=c.composition.grounding.baseGuide||c.composition.grounding.guide;
 c.composition.grounding.baseGuide=base;c.composition.grounding.framingReference='ludora';
 for(const slot of ['cover','hero']){const k=slots[slot],depth=k.body/.68;const guide={...base,bodyFraction:k.body,footLine:k.feet,adultHeight:base.adultHeight*depth,groundY:.45+(base.groundY-.45)*depth};c.composition[slot].scaleGuide=guide;}
 if(row.engine!==3){
  if(row.engine===1)c.composition.cover.layers['stage-landscape'].scaleGuide=c.composition.cover.scaleGuide;
  for(const slot of ['cover','hero']){const p=place(c.composition.art[slot],slots[slot].body,slots[slot].feet,slot==='cover'?1160:1280,slot==='cover'?15:0);Object.assign(c.layout,{[slot+'Width']:p.width,[slot+'X']:p.x,[slot+'Y']:p.y});}
  if(row.engine===2)c.composition.book.coverBodyRatio=slots.cover.body/slots.hero.body;
 }else{const mf=path.join(dir,'landscape.json'),m=JSON.parse(fs.readFileSync(mf));
  for(const slot of ['cover','hero']){const char=m.characters[slot],stop=m.stops.find(s=>s.id===char.stop),area=m.areas.find(a=>a.id===stop.area),g=c.composition[slot].scaleGuide,pixels=Math.max(H*1.12,H*g.bodyFraction/g.adultHeight),distance=area.height*lens/pixels,z=m.world.z+distance,cy=(area.y||0)+(g.groundY-.5)*area.height-(g.footLine-.5)*H*distance/lens;
   Object.assign(stop,{z,x:0,y:cy});delete stop.fit;delete stop.minZ;
   const p=place(c.composition.art[slot],g.bodyFraction,g.footLine,z-(char.z||0),cy);Object.assign(c.layout,{[slot+'Width']:p.width,[slot+'X']:p.x,[slot+'Y']:p.y});char.width=p.width;char.y=p.y;
  }fs.writeFileSync(mf,JSON.stringify(m,null,2)+'\n');
 }
 for(const p of [file,path.join(root,'frontend/src/components/templates',id,'defaultConfig.json')])fs.writeFileSync(p,JSON.stringify(c,null,2)+'\n');
}
console.log('Applied Ludora-derived opening scale to 34 packs; closing and original six packs preserved.');
