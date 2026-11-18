const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'../..'),tool=path.join(root,'tools/sync-template-registry.cjs');
if(fs.existsSync(tool)){const result=spawnSync(process.execPath,[tool],{stdio:'inherit'});process.exit(result.status??1)}
else if(!fs.existsSync(path.resolve(__dirname,'../src/config/templateRegistry.generated.js')))throw Error('Generated template registry is missing. Run npm run registry:sync from the repository root.');
