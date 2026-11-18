import {fitIvoryWash,readingBounds,observeReadingSurface} from '../../shared/ivory-wash.js';
/** Like Viridarium, keep pigment separate from the scrolling text surface. */
export function attachReadingWashes(panels){
 const washes=new Map();
 for(const [id,panel] of panels){
  if(id==='hero')continue;
  const wash=document.createElement('div');wash.className='landscape-ivory-wash';wash.hidden=true;wash.setAttribute('aria-hidden','true');wash.dataset.for=id;
  document.querySelector('#journey').append(wash);
  const fit=()=>{if(panel.hidden)return;const box=readingBounds(panel);if(!box.width||!box.height)return;fitIvoryWash(wash,box)};
  observeReadingSurface(panel,fit);washes.set(id,{wash,fit});
 }
 return (id,opacity)=>{const item=washes.get(id);if(!item)return;item.wash.hidden=opacity<=0;item.wash.style.opacity=String(opacity);if(opacity===0||opacity===1)item.fit()};
}
