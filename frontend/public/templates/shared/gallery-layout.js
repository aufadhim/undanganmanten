import {grabScroll} from './grab-scroll.js';
export const GALLERY_LAYOUTS=['editorial','grid','masonry','carousel','collage','wall'];
const observers=new WeakMap();
export function youtubeId(value){try{const u=new URL(value);if(!['http:','https:'].includes(u.protocol))return null;const host=u.hostname.toLowerCase().replace(/^www\./,'');const id=host==='youtu.be'?u.pathname.split('/')[1]:['youtube.com','m.youtube.com','youtube-nocookie.com'].includes(host)?u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]:null;return /^[\w-]{11}$/.test(id||'')?id:null}catch{return null}}
/** Return every thumbnail's bounds, fitted within the available viewport. */
export function fitGallery(ratios,layout,width,height){
 if(!ratios.length||width<=0||height<=0)return {width:0,height:0,scale:1,rects:[]};
 let best=null;const count=ratios.length,gap=12,unit=160;
 const choices=layout==='collage'?[3]:Array.from({length:Math.min(count,8)},(_,i)=>i+1);
 for(const columns of choices){const rects=[],levels=Array(columns).fill(0),occupied=[];
  for(let i=0;i<count;i++){
   if(layout==='collage'){
    const col=i%3,base=Math.min(unit,Math.max(42,(height/width)*(3*unit+2*gap)/(Math.ceil(count/3)+.5)));
    const h=base*[1.03,1.26,.88,1.2,.92,1.1,.91,1.17,1.04][i%9];
    const y=levels[col]||[10,0,18][col];
    rects.push({x:col*(unit+gap),y,width:unit,height:h});levels[col]=y+h+gap;continue;
   }
   if(layout==='masonry'){const col=levels.indexOf(Math.min(...levels)),h=unit/Math.max(.25,Math.min(4,ratios[i]||1));rects.push({x:col*(unit+gap),y:levels[col],width:unit,height:h});levels[col]+=h+gap;continue}
   let sx=1,sy=1;
   if(layout==='editorial'&&columns>1&&i%5===0){sx=2;sy=2}
   // Other layouts use cell spans; Collage is composed in three staggered columns above.
   let row=0,col=0,found=false;
   while(!found){for(col=0;col<=columns-sx;col++){let free=true;for(let y=0;y<sy;y++)for(let x=0;x<sx;x++)if(occupied[row+y]?.[col+x])free=false;if(free){found=true;break}}if(!found)row++}
   for(let y=0;y<sy;y++){occupied[row+y]??=[];for(let x=0;x<sx;x++)occupied[row+y][col+x]=true}
   const rowHeight=layout==='carousel'?110:layout==='wall'?185:unit;
   rects.push({x:col*(unit+gap),y:row*(rowHeight+gap),width:sx*unit+(sx-1)*gap,height:sy*rowHeight+(sy-1)*gap});
  }
  const w=Math.max(...rects.map(r=>r.x+r.width)),h=Math.max(...rects.map(r=>r.y+r.height)),padding=layout==='wall'?14:layout==='collage'?10:2;
  const scale=Math.min(width/(w+padding*2),height/(h+padding*2)),score=Math.min(...rects.map(r=>r.width*r.height))*scale*scale;
  if(!best||score>best.score)best={width:w+padding*2,height:h+padding*2,scale,score,rects:rects.map(r=>({...r,x:r.x+padding,y:r.y+padding}))};
 }
 return best;
}
export function splitGalleryMedia(items=[]){return {photos:items.map((item,index)=>({item,index})).filter(({item})=>item.type!=='video'),videos:items.map((item,index)=>({item,index})).filter(({item})=>item.type==='video')}}
export function disposeGallery(container){observers.get(container)?.disconnect();observers.delete(container)}
export function renderGallery(container,items=[],layout='editorial',options={}){
 if(!container)return;disposeGallery(container);container.parentElement?.classList.add('standard-gallery-scope');
 const doc=container.ownerDocument,win=doc.defaultView,node=(tag,text)=>{const n=doc.createElement(tag);if(text)n.textContent=text;return n};
 if (!doc.querySelector('link[data-gallery-layout]')) {
  const stylesheet = node('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = '/templates/shared/gallery-layout.css?v=20';
  stylesheet.dataset.galleryLayout = '';
  doc.head.append(stylesheet);
 }
 const selected=GALLERY_LAYOUTS.includes(layout)?layout:'editorial';container.dataset.layout=selected;container.replaceChildren();
 if(!items.length){container.append(node('p','Galeri kenangan akan hadir di sini.'));return}
 const {photos,videos}=splitGalleryMedia(items);container.dataset.hasPhotos=String(photos.length>0);
 const photoViewport=node('div');photoViewport.className='gallery-photo-viewport';photoViewport.hidden=!photos.length;container.append(photoViewport);
 const sheet=node('div');sheet.className='gallery-sheet';sheet.dataset.layout=selected;sheet.dataset.pendingLayout='true';photoViewport.append(sheet);
 const ratios=photos.map(()=>1),cards=[];
 let frame=0,disposed=false;
 const measure=()=>{frame=0;if(disposed||!photos.length)return;
  if(photoViewport.clientWidth<=0||photoViewport.clientHeight<=0)return;
  delete sheet.dataset.pendingLayout;
  if(selected==='carousel'){
   const viewportWidth=photoViewport.clientWidth;
   const width=Math.max(1,viewportWidth*.72),height=photoViewport.clientHeight,gap=5;
   const gutter=(viewportWidth-width)/2;
   Object.assign(sheet.style,{position:'relative',left:'0',top:'0',width:((width+gap)*cards.length-gap+2*gutter)+'px',height:height+'px',transform:'none'});
   cards.forEach((card,i)=>Object.assign(card.style,{left:(gutter+i*(width+gap))+'px',top:'0',width:width+'px',height:height+'px'}));return;
  }
  const fit=fitGallery(ratios,selected,photoViewport.clientWidth,photoViewport.clientHeight);sheet.style.width=fit.width+'px';sheet.style.height=fit.height+'px';sheet.style.transform=`translate(-50%,-50%) scale(${fit.scale})`;fit.rects.forEach((r,i)=>Object.assign(cards[i].style,{left:r.x+'px',top:r.y+'px',width:r.width+'px',height:r.height+'px'}));
 };
 const schedule=()=>{if(!frame&&!disposed)frame=win.requestAnimationFrame(measure)};
 const open=index=>{if(items[index].type==='video')doc.querySelectorAll('audio').forEach(audio=>audio.pause());if(options.onOpen){options.onOpen(index);return}win.parent.postMessage({type:'garden:gallery',index},win.location.origin)};
 photos.forEach(({item,index},photoIndex)=>{
  const card=node('button');card.type='button';card.className='gallery-item';card.setAttribute('aria-label',`Perbesar foto ${index+1}`);
  const img=node('img');img.loading='lazy';img.fetchPriority='low';img.src=item.url;img.alt=`Kenangan mempelai ${index+1}`;img.decoding='async';img.onerror=()=>{img.hidden=true;card.append(node('span','Foto belum bisa dimuat'));};img.onload=()=>{if(img.naturalWidth){ratios[photoIndex]=img.naturalWidth/img.naturalHeight;schedule()}};card.append(img);card.onclick=()=>open(index);cards.push(card);sheet.append(card);
 });
 const videoObserver=win.IntersectionObserver?new win.IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const video=entry.target;videoObserver.unobserve(video);video.src=video.dataset.src;delete video.dataset.src;}},{rootMargin:'200px'}):null;
 if(videos.length){
  const section=node('section');section.className='gallery-videos';section.setAttribute('aria-label','Video kenangan');
  const strip=node('div');strip.className='gallery-video-strip';section.append(strip);container.append(section);
  videos.forEach(({item,index})=>{const card=node('button');card.type='button';card.className='gallery-video-card';card.setAttribute('aria-label',`Putar video ${index+1}`);const id=youtubeId(item.url);
   if(id){const img=node('img');img.src=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;img.alt='Thumbnail video YouTube';img.loading='lazy';card.append(img)}
   else{const preview=node('video');if(videoObserver){preview.dataset.src=item.url;videoObserver.observe(preview)}else preview.src=item.url;preview.muted=true;preview.playsInline=true;preview.preload='metadata';preview.tabIndex=-1;preview.addEventListener('loadedmetadata',()=>{if(Number.isFinite(preview.duration)&&preview.duration>0)preview.currentTime=Math.min(.2,preview.duration/2)},{once:true});card.append(preview)}
   const play=node('div','▶');play.className='gallery-video-play';play.setAttribute('aria-hidden','true');card.append(play);card.onclick=()=>open(index);strip.append(card);
  });
 }
 const releaseScroll = [...(layout === 'carousel' ? [photoViewport] : []), ...container.querySelectorAll('.gallery-video-strip')].map(element => grabScroll(element));
 const observer=win.ResizeObserver?new win.ResizeObserver(schedule):null;
 observer?.observe(photoViewport);
 win.addEventListener('resize',schedule);
 doc.addEventListener('visibilitychange',schedule);
 observers.set(container,{disconnect(){disposed=true;releaseScroll.forEach(release=>release());observer?.disconnect();videoObserver?.disconnect();win.removeEventListener('resize',schedule);doc.removeEventListener('visibilitychange',schedule);win.cancelAnimationFrame(frame)}});
 schedule();
}
