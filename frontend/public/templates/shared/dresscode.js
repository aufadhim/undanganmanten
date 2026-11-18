export function renderDresscode(article,value={},fallback=''){
 if(!article)return;
 if(typeof value==='string'){try{value=JSON.parse(value)}catch{value={}}}
 if(Array.isArray(value))value={items:[{colors:value.map(x=>x.color),colorLabels:value.map(x=>x.label||'')}]};
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n};
 const guide=el('div','','dress-guide'),intro=value.title??fallback;
 if(intro)guide.append(el('p',intro,'dress-guide-intro'));
 const groups=el('div','','dress-guide-groups'),items=Array.isArray(value.items)?value.items:[];
 for(const x of items){const a=el('article');if(items.length>1&&x.title)a.append(el('h3',x.title));if(x.desc)a.append(el('p',x.desc));const colors=el('div','','dress-guide-colors');(x.colors||[]).forEach((c,j)=>{if(!/^#[a-f0-9]{6}$/i.test(c))return;const cell=el('div'),s=el('span');s.style.backgroundColor=c;cell.append(s);if(x.colorLabels?.[j])cell.append(el('small',x.colorLabels[j]));colors.append(cell)});a.append(colors);groups.append(a)}
 guide.append(groups);if(value.note)guide.append(el('p',value.note,'dress-guide-note'));
 article.querySelectorAll(':scope > p,:scope > .swatches,:scope > h3,:scope > .dress-guide').forEach(n=>n.remove());article.append(guide);
}
