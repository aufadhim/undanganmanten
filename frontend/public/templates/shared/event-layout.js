import {fitEventPanel} from './event-panel-fit.js';
const text=v=>String(v||'').trim().replace(/\s+/g,' ');
export const eventTitle=type=>({akad:'Akad',ceremony:'Akad',resepsi:'Resepsi',ngunduh_mantu:'Ngunduh Mantu',reception:'Resepsi'}[text(type).toLowerCase()]||'Acara');
export function sameEventLocation(events){if(events.length<2)return false;const key=e=>[text(e.venueName).toLowerCase(),text(e.address).toLowerCase(),text(e.googleMapsUrl||e.mapUrl||e.mapsUrl).replace(/\/$/,'')];const first=key(events[0]);return Boolean(first[0]||first[1])&&events.every(e=>key(e).every((v,i)=>v===first[i]))}
export function renderEventDetails(container,events=[]){
 if(!container)return;
 fitEventPanel(container);
 const doc=container.ownerDocument,node=(tag,value,className)=>{const el=doc.createElement(tag);if(value)el.textContent=value;if(className)el.className=className;return el};
 const shared=sameEventLocation(events),dates=new Set(events.map(e=>String(e.date||'').slice(0,10)));
 container.classList.add('event-details');container.classList.toggle('same-location',shared);container.replaceChildren();
 const grid=node('div',null,'event-schedules');
 function location(e){const el=node('div',null,'event-location');if(e.venueName)el.append(node('strong',e.venueName,'event-venue'));if(e.address)el.append(node('p',e.address));const url=text(e.googleMapsUrl||e.mapUrl||e.mapsUrl);if(/^https?:\/\//i.test(url)){const link=node('a','Lihat lokasi','event-map-button');link.href=url;link.target='_blank';link.rel='noopener noreferrer';el.append(link)}return el}
 for(const e of events){const card=node('section',null,'event-schedule');card.append(node('h3',eventTitle(e.type),'event-subtitle'));if(dates.size>1&&e.date){const d=new Date(String(e.date).slice(0,10)+'T12:00:00');if(Number.isFinite(d.getTime()))card.append(node('p',d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}),'event-date'))}const start=text(e.startTime).slice(0,5),end=text(e.endTime).slice(0,5);card.append(node('p',[start,end].filter(Boolean).join(' – ')+(start?' WIB':''),'event-time'));if(!shared)card.append(location(e));grid.append(card)}container.append(grid);if(shared)container.append(location(events[0]));
}
