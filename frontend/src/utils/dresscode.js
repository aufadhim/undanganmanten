export function normalizeDresscode(value, fallback = '') {
 if(typeof value==='string'){try{value=JSON.parse(value)}catch{value={}}}
 const raw=Array.isArray(value)?{items:[{title:'',desc:'',colors:value.map(x=>x.color),colorLabels:value.map(x=>x.label||'')}]}:(value||{});
 const items=(Array.isArray(raw.items)?raw.items:[]).filter(x=>x&&typeof x==='object').map(x=>({title:String(x.title||''),desc:String(x.desc||''),icon:'none',colors:(Array.isArray(x.colors)?x.colors:[]).filter(c=>/^#[a-f0-9]{6}$/i.test(c)).slice(0,6),colorLabels:(Array.isArray(x.colors)?x.colors:[]).map((c,i)=>({c,label:x.colorLabels?.[i]||''})).filter(v=>/^#[a-f0-9]{6}$/i.test(v.c)).slice(0,6).map(v=>v.label)}));
 return {title:String(raw.title??fallback),note:String(raw.note||''),mode:raw.mode||(items.length>1?'separate':'shared'),items:items.length?items:[{title:'Semua tamu',desc:'',icon:'none',colors:[],colorLabels:[]}]};
}
