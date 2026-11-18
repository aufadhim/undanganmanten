const pages=new WeakMap(),instances=new WeakMap();
export function storyPresentation({features={},stories=[],mainStory=''}){const journey=features.timelineEnabled===true||(features.timelineEnabled!==false&&stories.length>0);return journey?{mode:'journey',chapters:stories}:{mode:'short',text:mainStory}}
export function renderStory(container,payload){
 instances.get(container)?.destroy();
 const doc=container.ownerDocument,win=doc.defaultView,node=(tag,text,cls)=>{const el=doc.createElement(tag);if(text)el.textContent=text;if(cls)el.className=cls;return el},view=storyPresentation(payload);
 container.classList.add('story-presentation');container.replaceChildren();
 if(view.mode==='short'){const content=String(view.text||'');const plain=/<\/?[a-z][^>]*>/i.test(content)?new win.DOMParser().parseFromString(content,'text/html').body.textContent:content;container.append(node('p',plain||'Cerita perjalanan kami akan hadir di sini.','story-narrative'));return}
 if(!view.chapters.length){container.append(node('p','Cerita perjalanan kami akan hadir di sini.','story-narrative'));return}
 let index=Math.min(pages.get(container)||0,view.chapters.length-1),current,busy=false,reserved=0,animations=[],disposed=false;
 const viewport=node('div',null,'story-page-viewport'),status=node('p','','story-page-status'),nav=node('nav',null,'story-page-buttons');status.setAttribute('aria-live','polite');nav.setAttribute('aria-label','Bab cerita');
 const prev=node('button','Sebelumnya'),next=node('button','Berikutnya');for(const b of [prev,next])b.type='button';nav.append(prev,next);container.append(viewport);if(view.chapters.length>1)container.append(status,nav);
 const reduced=()=>win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 function reserve(stage){const height=Math.max(180,stage.offsetHeight);if(height<=reserved)return;const old=reserved;reserved=height;viewport.style.height=`${height}px`;if(old&&!reduced()&&viewport.animate){const a=viewport.animate([{height:`${old}px`},{height:`${height}px`}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'});animations.push(a)}}
 function page(i){const chapter=view.chapters[i],el=node('div',null,'story-page');if(chapter.dateLabel)el.append(node('span',chapter.dateLabel,'story-chapter-date'));else if(chapter.date&&Number.isFinite(Date.parse(chapter.date)))el.append(node('span',new Date(chapter.date).toLocaleDateString('id-ID',{month:'long',year:'numeric'}),'story-chapter-date'));el.append(node('h3',chapter.title||'Perjalanan kita','story-chapter-title'),node('p',chapter.description||chapter.story||'','story-narrative'));return el}
 function controls(){pages.set(container,index);container.dataset.storyPage=String(index+1);status.textContent=`Bab ${index+1} dari ${view.chapters.length}`;prev.disabled=index===0;next.disabled=index===view.chapters.length-1;nav.setAttribute('aria-busy',String(busy))}
 const observer=win.ResizeObserver?new win.ResizeObserver(entries=>{if(!disposed)for(const entry of entries)if(entry.target.isConnected)reserve(entry.target)}):null;
 async function go(step){if(busy||index+step<0||index+step>=view.chapters.length)return;busy=true;controls();pages.set(container,index+step);const old=current,incoming=page(index+step);viewport.append(incoming);reserve(incoming);observer?.observe(incoming);const canAnimate=!reduced()&&incoming.animate;
  if(canAnimate){const out=old.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${-step*10}px)`}],{duration:220,easing:'ease-in-out',fill:'forwards'}),enter=incoming.animate([{opacity:0,transform:`translateX(${step*14}px)`},{opacity:1,transform:'translateX(0)'}],{duration:420,delay:70,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});animations.push(out,enter);old.setAttribute('aria-hidden','true');await Promise.allSettled([out.finished,enter.finished]);if(disposed)return;out.cancel();enter.cancel()}
  observer?.unobserve(old);old.remove();current=incoming;observer?.observe(current);index+=step;busy=false;animations=[];controls();(step>0?next:prev).focus({preventScroll:true});
 }
 current=page(index);viewport.append(current);reserve(current);observer?.observe(current);controls();prev.onclick=()=>go(-1);next.onclick=()=>go(1);
 instances.set(container,{destroy(){disposed=true;observer?.disconnect();for(const a of animations)a.cancel();prev.onclick=null;next.onclick=null}});
}
