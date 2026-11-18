/** Shared visible-time motion: hidden tabs never skip to the end of a journey. */
export const ease=p=>{p=Math.max(0,Math.min(1,p));return p*p*p*(p*(p*6-15)+10)};
export function panelEnvelope(progress,duration,revealAt=.65){
 const fadeIn=Math.min(duration*.55,Math.max(1000,duration*(1-revealAt)));
 const fadeOut=Math.min(650,duration*.28);
 return {out:1-ease(progress*duration/fadeOut),in:ease((progress*duration-(duration-fadeIn))/fadeIn)};
}
export function createVisibleClock(){
 let elapsed=0,last=null;
 return {step(stamp,hidden=false){if(hidden){last=null;return elapsed}if(last!==null)elapsed+=Math.max(0,Math.min(80,stamp-last));last=stamp;return elapsed},get elapsed(){return elapsed}};
}
export function animateProgress(duration,paint){
 const clock=createVisibleClock();
 return new Promise(resolve=>{function frame(stamp){const elapsed=clock.step(stamp,document.hidden),p=Math.min(1,elapsed/Math.max(1,duration));if(!document.hidden)paint(p);if(p<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)});
}
