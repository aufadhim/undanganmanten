export function guestAnalytics(guests=[]){
 const out={total:guests.length,attending:0,declined:0,pending:0,expectedPeople:0,opened:0,waPrepared:0,checkedIn:0,actualPeople:0,unrecordedCheckins:0,unopened:0,withoutPhone:0,groups:[],days:[]};const groups=new Map(),days=new Map();
 for(const g of guests){const group=g.groupName||'Umum';if(!groups.has(group))groups.set(group,{name:group,total:0,attending:0,declined:0,pending:0,people:0,checkins:0});const row=groups.get(group);row.total++;
 if(!g.rsvp){out.pending++;row.pending++}else if(g.rsvp.attending){out.attending++;row.attending++;const n=g.rsvp.guestCount||1;out.expectedPeople+=n;row.people+=n}else{out.declined++;row.declined++}
 if(g.openedAt||g.inviteStatus==='opened')out.opened++;else out.unopened++;
 if(g.sentAt||['sent','opened'].includes(g.inviteStatus))out.waPrepared++;
 if(!g.phone)out.withoutPhone++;
 if(g.checkedIn){out.checkedIn++;row.checkins++;if(Number.isInteger(g.checkInCount))out.actualPeople+=g.checkInCount;else out.unrecordedCheckins++;if(g.checkedInAt){const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(g.checkedInAt));days.set(day,(days.get(day)||0)+1)}}
 }
 out.responseRate=out.total?Math.round((out.attending+out.declined)/out.total*100):0;out.checkinRate=out.attending?Math.round(out.checkedIn/out.attending*100):0;out.groups=[...groups.values()].sort((a,b)=>b.total-a.total);out.days=[...days].sort(([a],[b])=>a.localeCompare(b)).slice(-7);return out;
}
