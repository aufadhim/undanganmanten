/** Compact bounds around readable content, not the full padded/scrolling panel. */
export function ivoryWashBounds(box){
 return {left:box.left+box.width/2,top:box.top+box.height/2,width:box.width+32,height:box.height+40};
}
export function unionReadingRects(rects,clip){
 const visible=rects.map(r=>({left:Math.max(r.left,clip.left),top:Math.max(r.top,clip.top),right:Math.min(r.right??r.left+r.width,clip.right??clip.left+clip.width),bottom:Math.min(r.bottom??r.top+r.height,clip.bottom??clip.top+clip.height)})).filter(r=>r.right>r.left&&r.bottom>r.top);
 if(!visible.length)return null;
 const left=Math.min(...visible.map(r=>r.left)),top=Math.min(...visible.map(r=>r.top));
 return {left,top,width:Math.max(...visible.map(r=>r.right))-left,height:Math.max(...visible.map(r=>r.bottom))-top};
}
export function readingBounds(panel){
 const clip=panel.getBoundingClientRect();if(!clip.width||!clip.height)return clip;
 const walker=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT),rects=[];
 let text;
 while((text=walker.nextNode())){
  const el=text.parentElement;if(!text.textContent.trim()||!el||el.closest('[hidden],script,style,.gallery-grid,.gallery-video-strip'))continue;
  const style=getComputedStyle(el);if(style.display==='none'||style.visibility==='hidden')continue;
  const range=document.createRange();range.selectNodeContents(text);rects.push(...range.getClientRects());
 }
 // Include editable controls, while leaving photos and illustration previews uncovered.
 for(const el of panel.querySelectorAll('input,textarea,select,button,a')){
  if(el.closest('[hidden],.gallery-grid,.gallery-video-strip'))continue;
  const style=getComputedStyle(el);if(style.display==='none'||style.visibility==='hidden')continue;
  rects.push(el.getBoundingClientRect());
 }
 return unionReadingRects(rects,clip)||{left:clip.left+clip.width/2,top:clip.top,width:0,height:0};
}
export function fitIvoryWash(wash,box){
 const bounds=ivoryWashBounds(box);
 for(const[key,value]of Object.entries(bounds))wash.style[key]=value+'px';
}
/** Coalesce content/size/font changes; no measuring every animation frame. */
export function observeReadingSurface(panel,fit){
 let pending=0;
 const schedule=()=>{if(!pending)pending=requestAnimationFrame(()=>{pending=0;fit()})};
 new ResizeObserver(schedule).observe(panel);
 new MutationObserver(schedule).observe(panel,{attributes:true,attributeFilter:['hidden','open'],childList:true,characterData:true,subtree:true});
 panel.addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
 document.fonts?.ready.then(schedule);document.fonts?.addEventListener('loadingdone',schedule);schedule();
}
export function mountIvoryReadability(){
 for(const panel of document.querySelectorAll('#cover .cover-heading,#journey .hero-heading,#cover .cover-response')){
  const fit=()=>{const outer=panel.getBoundingClientRect(),content=readingBounds(panel);if(!outer.width||!content.width)return;
   panel.style.setProperty('--reading-wash-left',(content.left-outer.left+content.width/2)+'px');
   panel.style.setProperty('--reading-wash-top',(content.top-outer.top-20)+'px');
   panel.style.setProperty('--reading-wash-width',(content.width+32)+'px');
   panel.style.setProperty('--reading-wash-height',(content.height+40)+'px');
  };
  observeReadingSurface(panel,fit);
 }
}
