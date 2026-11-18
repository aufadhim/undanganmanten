export const DRAFT_KEY='garden-canvas-draft-v1';
export function draftDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('garden-canvas-editor',1);r.onupgradeneeded=()=>r.result.createObjectStore('drafts');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
export async function readDraft(){const db=await draftDB();try{return await new Promise((resolve,reject)=>{const r=db.transaction('drafts').objectStore('drafts').get(DRAFT_KEY);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}finally{db.close()}}
export async function saveDraft(config){const db=await draftDB();try{await new Promise((resolve,reject)=>{const t=db.transaction('drafts','readwrite');t.objectStore('drafts').put(config,DRAFT_KEY);t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error)})}finally{db.close()}}
export async function clearDraft(){const db=await draftDB();try{await new Promise((resolve,reject)=>{const t=db.transaction('drafts','readwrite');t.objectStore('drafts').delete(DRAFT_KEY);t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}finally{db.close()}}
export function mergeConfig(defaults,input){
 if(!input||input.schemaVersion!==1||input.template!==defaults.template||!['garden-canvas-v1','mental-canvas-3'].includes(input.template))throw Error('Format proyek tidak sesuai kontrak template.');
 const c=structuredClone(defaults);
 for(const group of ['identity','event','links','gift','assets','style','motion','layout'])for(const key of Object.keys(c[group]))if(input[group]?.[key]!==undefined){const v=input[group][key];if(typeof c[group][key]!==typeof v)throw Error('Jenis nilai tidak valid: '+group+'.'+key);c[group][key]=v}
 if(c.composition?.singleCouple)c.assets.heroCouple=c.assets.coverCouple;
 for(const key of Object.keys(c.copy))if(typeof input.copy?.[key]?.value==='string')c.copy[key].value=input.copy[key].value;
 for(const s of c.sections){const v=input.sections?.find(x=>x.id===s.id);if(typeof v?.title==='string')s.title=v.title}
 for(const key of ['sameRoomMs','crossRoomMs','autoplayMs'])if(!Number.isFinite(c.motion[key])||c.motion[key]<180||c.motion[key]>60000)throw Error('Durasi animasi harus 180–60000 ms.');
 if(!Number.isFinite(c.style.musicVolume)||c.style.musicVolume<0||c.style.musicVolume>1)throw Error('Volume musik harus 0–1.');
 for(const key of ['start','end'])if(!Number.isFinite(Date.parse(c.event[key])))throw Error('Tanggal acara tidak valid.');
 if(Date.parse(c.event.end)<=Date.parse(c.event.start))throw Error('Waktu selesai harus setelah waktu mulai.');
 for(const v of Object.values(c.links))if(v&&!/^https?:\/\//i.test(v))throw Error('Tautan harus diawali https:// atau http://.');
 for(const [k,v] of Object.entries(c.assets))if(!(/^(\/templates\/[a-z0-9-]+\/assets\/[a-z0-9_./-]+|assets\/[a-z0-9_./-]+|https?:\/\/\S+|data:(image\/(png|jpeg|webp)|audio\/[a-z0-9.+-]+);base64,[a-z0-9+/=\s]+)$/i.test(v)||(input.template==='mental-canvas-3'&&/^\/templates\/[a-z0-9-]+\/assets\/[a-z0-9_./-]+$/i.test(v)))||v.includes('..'))throw Error('Sumber aset tidak valid: '+k);
 for(const key of ['ink','accent'])if(!/^#[a-f0-9]{6}$/i.test(c.style[key]))throw Error('Warna harus format #rrggbb.');
 if(input.cameras!==undefined){if(!Array.isArray(input.cameras)||input.cameras.length!==c.sections.length)throw Error('Jumlah titik kamera harus sesuai sesi.');for(let i=0;i<c.sections.length;i++)for(const mode of ['mobile','wide'])for(const key of ['x','y','z','yaw','pitch','roll']){const n=input.cameras[i]?.[mode]?.[key];if(!Number.isFinite(n)||Math.abs(n)>10000||(key==='z'&&n<100))throw Error('Titik kamera tidak valid.');c.cameras[i][mode][key]=n}}
 for(const n of Object.values(c.layout))if(!Number.isFinite(n)||Math.abs(n)>5000)throw Error('Posisi / ukuran pasangan tidak valid.');
 if(c.layout.coverWidth<50||c.layout.heroWidth<50)throw Error('Lebar pasangan minimal 50.');
 for(const key of Object.keys(c.assets))c.assets[key]=c.assets[key].replace(/^\/templates\/garden-canvas\//,'/templates/viridarium/');
 return c;
}
