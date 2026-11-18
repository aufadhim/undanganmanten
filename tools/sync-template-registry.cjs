/** The only editable source is shared/template-registry.json. Outputs work in separate Docker contexts. */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'shared/template-registry.json'),'utf8'),r=JSON.parse(source),ids=new Set(),aliases=new Set();
if(r.schemaVersion!==1||!Array.isArray(r.templates))throw Error('Unknown registry schema');
for(const t of r.templates){if(!/^[a-z0-9-]+$/.test(t.id)||ids.has(t.id)||![null,1,2,3].includes(t.engine)||typeof t.active!=='boolean')throw Error('Invalid/duplicate theme ID: '+t.id);ids.add(t.id);if(!r.categories.includes(t.category)||!r.presets[t.preset])throw Error('Missing category/preset: '+t.id);if(!fs.existsSync(path.join(root,'frontend/src/components/templates',t.folder,t.component)))throw Error('Missing component: '+t.id);for(const a of t.aliases||[]){if(aliases.has(a))throw Error('Duplicate alias: '+a);aliases.add(a)}}
if(!ids.has(r.fallbackThemeId)||[...aliases].some(x=>ids.has(x)))throw Error('Invalid fallback/alias');
const revision=crypto.createHash('sha256').update(source).digest('hex').slice(0,16),banner=`// GENERATED from shared/template-registry.json; do not edit. Revision ${revision}\n`;
// The public catalog module deliberately excludes palette data and component loaders.
const sceneRevisions=require('./lib/scene-config.cjs').syncScenes();
const metadata=r.templates.map(({preset,sceneSource,...t})=>t),active=metadata.filter(t=>t.active);
const helpers=`export const ACTIVE_TEMPLATES=TEMPLATES.filter(t=>t.active);\nexport const ACTIVE_THEME_IDS=ACTIVE_TEMPLATES.map(t=>t.id);\nexport const IMMERSIVE_THEME_IDS=ACTIVE_TEMPLATES.filter(t=>t.engine!==null).map(t=>t.id);\nconst byId=new Map(TEMPLATES.flatMap(t=>[[t.id,t],...(t.aliases||[]).map(a=>[a,t])]));\nexport const getTemplate=id=>byId.get(id)||null;\nexport const isImmersiveTemplate=id=>Boolean(getTemplate(id)?.active&&getTemplate(id)?.engine);\nexport const normalizeThemeId=id=>{const t=getTemplate(id);return t?.active?t.id:FALLBACK_THEME_ID};\n`;
const metaCode=banner+`export const REGISTRY_REVISION=${JSON.stringify(revision)};\nexport const FALLBACK_THEME_ID=${JSON.stringify(r.fallbackThemeId)};\nexport const THEME_CATEGORIES=${JSON.stringify(r.categories)};\nexport const TEMPLATES=${JSON.stringify(metadata,null,2)};\n`+helpers;
function write(file,content){const p=path.join(root,file);if(fs.existsSync(p)&&fs.readFileSync(p,'utf8')===content)return;fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,content)}
for(const target of ['frontend/src/config/templateRegistry.generated.js','backend/src/config/templateRegistry.generated.js'])write(target,metaCode);
const presetIds=Object.fromEntries(r.templates.map(t=>[t.id,t.preset]));
for(const target of ['frontend/src/config/templateSettings.generated.js','backend/src/config/templateSettings.generated.js'])write(target,banner+`const PRESETS=${JSON.stringify(r.presets,null,2)};\nconst PRESET_IDS=${JSON.stringify(presetIds)};\nexport const TEMPLATE_SETTINGS=Object.fromEntries(Object.entries(PRESET_IDS).map(([id,preset])=>[id,PRESETS[preset]]));\n`);
write('frontend/src/config/templateLoaders.generated.js',banner+'export const TEMPLATE_LOADERS={\n'+active.map(t=>`${JSON.stringify(t.id)}:()=>import(${JSON.stringify('../components/templates/'+t.folder+'/'+t.component)}),`).join('\n')+'\n};\n');
write('frontend/src/config/sceneSources.generated.json',JSON.stringify(sceneRevisions,null,2)+'\n');
console.log(`Registry synced: ${active.length} active templates (${revision}).`);
