/** Compatibility adapter for authoring scripts: their old output paths now target the canonical scene.
 * Does not monkey-patch node:fs. Other reads/writes keep normal filesystem behavior. */
const fs=require('fs'),scene=require('./scene-config.cjs');
module.exports={...fs,
 readFileSync(file,options){const target=typeof file==='string'?scene.resolveOutput(file):null;if(!target)return fs.readFileSync(file,options);const text=JSON.stringify(scene.read(target.t)[target.section],null,2)+'\n';return(typeof options==='string'||options?.encoding)?text:Buffer.from(text)},
 writeFileSync(file,data,options){const target=typeof file==='string'?scene.resolveOutput(file):null;if(!target)return fs.writeFileSync(file,data,options);scene.writeSection(target.t,target.section,JSON.parse(String(data)))}
};
