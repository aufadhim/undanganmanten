import {fitIvoryWash,readingBounds,observeReadingSurface} from '../ivory-wash.js';
/** Pigment beds follow panel geometry; legacy export names preserve the scene API. */
const assignments={janji:'quote',wanita:'bride',pria:'groom',countdown:'closing',akad:'event',rundown:'event',cerita:'event',galeri:'gallery',dresscode:'gallery',livestream:'closing',filter:'gallery',gift:'event',rsvp:'form',penutup:'closing'};
const beds=new Map(),fits=new Map();
export function attachClouds(chapters,panels){
 for(let i=1;i<chapters.length;i++){
  const panel=panels[i],kind=assignments[chapters[i].id],bed=document.createElement('div');
  bed.className='cloud-backdrop pigment-backdrop';bed.hidden=true;bed.setAttribute('aria-hidden','true');bed.dataset.kind=kind;bed.dataset.for=chapters[i].id;
  document.querySelector('#journey').append(bed);beds.set(i,bed);
  const fit=()=>{if(panel.hidden)return;const box=readingBounds(panel);if(!box.width||!box.height)return;fitIvoryWash(bed,box);};
  fits.set(i,fit);observeReadingSurface(panel,fit);fit();
 }
}
export function paintCloud(i,opacity){const bed=beds.get(i);if(!bed)return;bed.hidden=opacity<=0;bed.style.opacity=opacity;bed.style.setProperty('--cloud-lift',(1-opacity)*8+'px');bed.style.setProperty('--wash-scale',.975+opacity*.025);if(opacity===1)fits.get(i)?.();}
export function hideClouds(){for(const bed of beds.values()){bed.hidden=true;bed.style.opacity=0;}}
