/** Small watercolor sprite flights; independent of the camera and reading controls. */
export function mountWasesaBirds(){
 if(document.querySelector('.wasesa-birds'))return;
 const sky=document.createElement('div');sky.className='wasesa-birds';sky.setAttribute('aria-hidden','true');
 for(const [kind,size,top,duration,delay,reverse] of [['sunbird',43,21,24,-7,false],['dove',35,38,31,-20,true],['sunbird',27,12,29,-19,true],['dove',29,64,36,-11,false]]){
  const flight=document.createElement('div');flight.className='wasesa-bird-flight'+(reverse?' is-reversed':'');
  flight.style.cssText=`--bird-size:${size}px;--bird-top:${top}%;--bird-duration:${duration}s;--bird-delay:${delay}s`;
  const bird=document.createElement('div');bird.className='wasesa-bird '+kind;flight.append(bird);sky.append(flight);
 }
 document.body.append(sky);
 const visibility=()=>sky.classList.toggle('is-paused',document.hidden);document.addEventListener('visibilitychange',visibility);visibility();
}
