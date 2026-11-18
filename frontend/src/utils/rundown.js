export function parseRundownTime(value=''){
 const parts=String(value).match(/\b(?:[01]?\d|2[0-3])[:.][0-5]\d\b/g)||[];
 const normalize=v=>v?.replace('.',':').padStart(5,'0')||'';
 return {start:normalize(parts[0]),end:normalize(parts[1]),original:String(value)};
}
export function formatRundownTime(start,end=''){return [start,end].filter(Boolean).join(' – ')}
export function moveRundown(items,id,step){const index=items.findIndex(r=>r.id===id),to=index+step;if(index<0||to<0||to>=items.length)return items;const next=[...items];[next[index],next[to]]=[next[to],next[index]];return next.map((r,order)=>({...r,order}))}
