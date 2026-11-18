// Shared notification lifecycle for API requests, autosave, and upload batches.
let sequence=0,toasts=[],lastFinished=null;
const listeners=new Set(),timers=new Map();
const emit=()=>listeners.forEach(listener=>listener());
export function dismissNotification(id){clearTimeout(timers.get(id));timers.delete(id);toasts=toasts.filter(t=>t.id!==id);emit()}
export function notify(message,type='success',options={}){
 let id=options.id;
 if(!id&&type!=='loading'&&lastFinished?.type===type&&Date.now()-lastFinished.time<400&&toasts.some(t=>t.id===lastFinished.id)){id=lastFinished.id;lastFinished=null}
 id??=++sequence;clearTimeout(timers.get(id));
 const next={id,message,type,action:options.action,progress:options.progress};
 toasts=toasts.some(t=>t.id===id)?toasts.map(t=>t.id===id?next:t):[...toasts,next];
 if(type!=='loading')timers.set(id,setTimeout(()=>dismissNotification(id),options.duration??(type==='error'?8000:3500)));
 emit();return id;
}
export function finishNotification(id,message,type='success',options={}){notify(message,type,{...options,id});lastFinished={id,type,time:Date.now()}}
export const notificationStore={subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener)},getSnapshot:()=>toasts};
export const toastApi={success:(message,options)=>notify(message,'success',options),error:(message,options)=>notify(message,'error',options),info:(message,options)=>notify(message,'info',options),loading:(message,options)=>notify(message,'loading',options),update:(id,message,type='loading',options={})=>notify(message,type,{...options,id}),dismiss:dismissNotification};
