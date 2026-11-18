export function extractGuestIdFromQr(value,origin='http://localhost'){
 const text=String(value||'').trim();let id=text;try{if(text.includes('://'))id=new URL(text,origin).searchParams.get('checkin')||new URL(text,origin).searchParams.get('g')||''}catch{return ''}return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)?id:'';
}
