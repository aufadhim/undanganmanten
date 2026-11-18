import fs from 'node:fs';
import {calibrateTemplate} from './lib/calibrate-painted-scale.mjs';
const registry=JSON.parse(fs.readFileSync(new URL('../shared/template-registry.json',import.meta.url))),results=[];
for(const t of registry.templates.filter(t=>t.engine)){
 const scenes=await calibrateTemplate(t.id,{quiet:true});
 results.push({id:t.id,name:t.name,engine:t.engine,scenes});
 console.log(`${t.name}: ${Object.entries(scenes).map(([s,r])=>`${s} ${(r.bodyFraction*100).toFixed(1)}%`).join(', ')}`);
}
fs.writeFileSync(new URL('../docs/IMMERSIA_PAINTED_SCALE_RESULTS.json',import.meta.url),JSON.stringify({referenceViewport:{width:390,height:844},templates:results},null,2)+'\n');
