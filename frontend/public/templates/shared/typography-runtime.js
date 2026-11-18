import {resolveTypographyMetrics} from './typography-settings.js';
/** Apply typography to text only, retaining each template's responsive type hierarchy. */
export function mountTypography(root,initial={}){
 const doc=root.ownerDocument||root,win=doc.defaultView;let options=initial,originals=new Map(),timer;
 const props=['font-family','font-size','line-height','letter-spacing','width','gap','margin-inline'];
 function restore(){for(const [el,styles]of originals)for(const [p,v,priority]of styles)v?el.style.setProperty(p,v,priority):el.style.removeProperty(p);originals.clear()}
 function apply(){restore();const heading=options.fontHeading,body=options.fontBody;
 const wideSinglePanel=doc.body?.classList?.contains('engine-landscape')&&win.matchMedia('(min-width: 680px) and (max-aspect-ratio: 4/3)').matches;
 const nodes=[...root.querySelectorAll('*')].filter(el=>!el.closest('svg,script,style,.music-control,.section-dots,#chapters,#chapter-backdrop,body>header,[data-typography-preserve]')&&(['INPUT','TEXTAREA','SELECT'].includes(el.tagName)||[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())));
 const measurements=nodes.map(el=>({el,heading:!!el.closest('h1,h2,h3,h4,h5,h6,.signature,[data-heading-family]'),size:parseFloat(win.getComputedStyle(el).fontSize)}));
 for(const item of measurements){const {el,heading:isHeading,size}=item;const container=el.closest('[data-typography-scope],.chapter,#cover,[data-section]');const aliases={janji:'quote',wanita:'bride',pria:'groom',akad:'events',cerita:'story',galeri:'gallery',filter:'igFilter',penutup:'footer'};const raw=container?.dataset.typographyScope||container?.dataset.section||container?.id;const scope=aliases[raw]||raw;const settings=resolveTypographyMetrics(options,scope);const metrics=settings.metricsMode!=='template';const family=isHeading?heading:body,scale=Number(settings[isHeading?'headingScale':'bodyScale'])||1,rawMetrics=options.sections?.[scope]||options,line=rawMetrics[isHeading?'headingLineHeight':'bodyLineHeight'],spacing=rawMetrics[isHeading?'headingLetterSpacing':'bodyLetterSpacing'];originals.set(el,props.map(p=>[p,el.style.getPropertyValue(p),el.style.getPropertyPriority(p)]));
 if((el.closest('[data-heading-family]')||!el.closest('h2,h3')?.closest?.('[data-section-heading-font="template"]'))&&family&&/^[\w\s'",.-]+$/.test(family))el.style.setProperty('font-family',family.includes(',')?family:`"${family}"`,'important');
 if(metrics){if(scale!==1&&Number.isFinite(size))el.style.setProperty('font-size',`${size*Math.max(.5,Math.min(1.5,scale))}px`,'important');if(Number.isFinite(line))el.style.setProperty('line-height',String(line),'important');if(Number.isFinite(spacing))el.style.setProperty('letter-spacing',`${spacing}em`,'important')}
 if(wideSinglePanel&&el!==container&&el.closest('#cover,#journey')){
  const minimum=isHeading?36:22;
  const currentSize=parseFloat(el.style.fontSize)||size;
  if(currentSize<minimum)el.style.setProperty('font-size',`${minimum}px`,'important');
 }
 }
 for(const form of root.querySelectorAll('form')){
  const container=form.closest('[data-typography-scope],.chapter,[data-section]');
  const scope=container?.dataset.typographyScope||container?.dataset.section||container?.id;
  if(scope!=='rsvp')continue;
  const settings=resolveTypographyMetrics(options,'rsvp');if(settings.metricsMode==='template')continue;
  if(!originals.has(form))originals.set(form,props.map(p=>[p,form.style.getPropertyValue(p),form.style.getPropertyPriority(p)]));
  form.style.setProperty('width',`${Math.max(.7,Math.min(1,Number(settings.formWidth)||1))*100}%`,'important');form.style.setProperty('margin-inline','auto','important');
  for(const el of [form,...form.querySelectorAll('fieldset')]){
   if(!originals.has(el))originals.set(el,props.map(p=>[p,el.style.getPropertyValue(p),el.style.getPropertyPriority(p)]));
   el.style.setProperty('gap',`${Math.max(8,Math.min(28,Number(settings.formGap)||14))}px`,'important');
  }
 }
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(apply,40)}
 const observer=new win.MutationObserver(schedule);observer.observe(root,{childList:true,characterData:true,subtree:true});win.addEventListener('resize',schedule);apply();
 return {update(next){options=next||{};apply()},destroy(){observer.disconnect();win.removeEventListener('resize',schedule);clearTimeout(timer);restore()}};
}
