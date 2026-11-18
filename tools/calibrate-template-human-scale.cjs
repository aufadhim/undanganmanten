/** Human/environment scale authoring from visual reference points, not screen-size alone. */
const fs=require('./lib/scene-authoring-fs.cjs'),path=require('path'),rows=require('../docs/TEMPLATE_SCAFFOLDS.json'),root=path.resolve(__dirname,'..');
// Estimated adult height as fraction of the painted image at the foreground foot point.
// The named reference makes every art-direction decision editable independently.
const refs={
'melayu-balairung':[.63,.87,'pintu balairung dan tinggi pagar'], 'melayu-hikayat':[.62,.87,'pintu dan anak tangga'],
'sunda-pendopo':[.62,.87,'kolom pendopo dan tangga'], 'sunda-parahyangan':[.64,.87,'pagar batu tepi jalan'],
'bali-pekarangan':[.65,.88,'pintu pekarangan'], 'bali-subak':[.62,.88,'tembok tepi jalan dan tangga'],
'banjar':[.64,.88,'pagar rumah panggung'], 'dayak':[.66,.88,'pintu rumah panjang'],
'bugis-makassar':[.63,.88,'tangga rumah panggung'], 'toraja':[.64,.88,'pagar batu dan pintu'],
'sumba':[.62,.88,'rumah di kejauhan dan rumput depan'], 'flores':[.64,.88,'tembok batu jalan'],
'maluku':[.65,.88,'kolom dan pagar'], 'papua':[.62,.88,'pagar batu jalur depan'],
'minangkabau':[.65,.88,'pintu rumah dan tinggi tangga'], 'masjid-taman':[.64,.87,'pintu dan kolom pelataran'],
'masjid-manuskrip':[.63,.87,'kolom lorong'], 'katedral':[.66,.88,'pintu samping dan pagar'],
'katedral-album':[.66,.88,'pintu dan kolom lorong'], 'taman-tionghoa':[.64,.88,'pintu lingkaran dan pagar'],
'peranakan':[.67,.88,'pintu depan rumah'], 'chateau':[.62,.88,'pagar teras dan bangku'],
'edinburgh':[.66,.88,'pintu rumah dan lampu jalan'], 'paris':[.64,.88,'pagar teras'],
'london':[.66,.88,'pintu rumah dan lampu jalan'], 'elegant-ivory':[.65,.88,'pintu dan balustrade'],
'elegant-velvet':[.66,.88,'pintu lorong'], 'kaligrafi':[.64,.88,'pintu dan bangku lorong'],
'cinema':[.67,.88,'pintu bioskop'], 'kingdom':[.65,.88,'pintu kastel dan tangga'],
'sabana':[.61,.88,'tinggi semak dan lebar jalan'], 'urban-editorial':[.65,.88,'kursi kafe dan tiang pembatas'],
'mural':[.64,.88,'kursi studio dan sofa'], 'monokrom':[.66,.88,'kursi studio dan anak tangga']};
const H=844,W=390,lens=750;
function pair(art,screenH,feet,distance,cy){const b=art.bounds,width=screenH*distance/lens*art.aspect/(b.bottom-b.top);return{width,x:-((b.left+b.right)/2-.5)*width,y:cy+(feet-.5)*H*distance/lens-width/art.aspect*(b.bottom-.5)}}
for(const r of rows){const dir=path.join(root,'frontend/public/templates',r.id),file=path.join(dir,'config/invitation.json'),c=JSON.parse(fs.readFileSync(file)),[adult,floor,reference]=refs[r.id];
 const guide={adultHeight:adult,groundY:floor,footLine:.94,bodyFraction:.68};
 c.composition.grounding={...c.composition.grounding,version:3,reference,guide,notes:'Estimated from painted perspective; user placement offsets remain additive.'};
 c.composition.hero.scaleGuide=guide;c.composition.hero.foreground.opacity=0;
 c.composition.cover.scaleGuide={...guide,footLine:.93,bodyFraction:.64};
 if(r.engine===1){c.composition.cover.layers['stage-landscape']={viewportFill:true,scaleGuide:c.composition.cover.scaleGuide};}
 if(r.engine!==3){for(const slot of ['cover','hero']){const p=pair(c.composition.art[slot],H*(slot==='cover'?.64:.68),slot==='cover'?.93:.94,slot==='cover'?1160:1280,slot==='cover'?15:0);Object.assign(c.layout,{[slot+'Width']:p.width,[slot+'X']:p.x,[slot+'Y']:p.y});}
 if(r.engine===1){const p=pair(c.composition.art.cover,H*.48,.95,1340,-30);Object.assign(c.layout,{closingWidth:p.width,closingX:p.x,closingY:p.y});c.composition.closing={absolutePosition:true};}
 }else{
 const mf=path.join(dir,'landscape.json'),m=JSON.parse(fs.readFileSync(mf));
 for(const slot of ['cover','hero','closing']){const character=m.characters[slot],stop=m.stops.find(s=>s.id===character.stop),area=m.areas.find(a=>a.id===stop.area),body=slot==='closing'?.48:slot==='cover'?.64:.68,feet=slot==='closing'?.95:.94;
 // One perspective: actor height / image height = measured adult / painted image.
 const imagePixels=Math.max(H*1.12,H*body/adult),distance=area.height*lens/imagePixels;
 const z=m.world.z+distance,cy=(area.y||0)+(floor-.5)*area.height-(feet-.5)*H*distance/lens;
 Object.assign(stop,{z,x:0,y:cy});delete stop.fit;delete stop.minZ;
 // At the photo stops the entire painted height is visible; no landmark zoom crop.
 const art=c.composition.art[slot==='cover'?'cover':'hero'],p=pair(art,H*body,feet,z-(character.z||0),cy);
 Object.assign(c.layout,{[slot+'Width']:p.width,[slot+'X']:p.x,[slot+'Y']:slot==='closing'?0:p.y,[slot+'FootY']:art.bounds.bottom});character.width=p.width;character.y=p.y;
 }
 m.decorations=m.decorations.filter(d=>d.attachment?.contact);
 fs.writeFileSync(mf,JSON.stringify(m,null,2)+'\n');
 }
 for(const p of [file,path.join(root,'frontend/src/components/templates',r.id,'defaultConfig.json')])fs.writeFileSync(p,JSON.stringify(c,null,2)+'\n');
}
fs.writeFileSync(path.join(root,'output/template-composition/human-scale-references.json'),JSON.stringify(refs,null,2)+'\n');
