/** Viridarium's foreground canopy: independent of camera navigation and other themes. */
const cover=document.querySelector('#cover');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const curtain=document.createElement('div');curtain.className='foliage-curtain';curtain.setAttribute('aria-hidden','true');
for(const side of ['left','right']){const branch=document.createElement('div');branch.className=`foliage-bough ${side}`;curtain.append(branch)}
cover.append(curtain);
const butterflies=document.createElement('div');butterflies.className='cover-butterflies';butterflies.setAttribute('aria-hidden','true');
for(let i=0;i<2;i++){const butterfly=document.createElement('span');butterfly.className=`garden-butterfly butterfly-${i+1}`;butterfly.innerHTML='<img src="/templates/shared/assets/cover-butterfly.webp" alt="" draggable="false">';butterflies.append(butterfly)}
cover.append(butterflies);
const reveal=()=>{cover.classList.remove('foliage-reveal');requestAnimationFrame(()=>requestAnimationFrame(()=>cover.classList.add('foliage-reveal')))};
const image=new Image();image.src='/templates/viridarium/assets/foliage-curtain.webp';
image.decode().then(()=>window.coverScene.ready).then(reveal).catch(()=>{curtain.remove();cover.classList.add('foliage-reveal')});
addEventListener('invitation:closed',reveal);
if(reduced)cover.classList.add('foliage-reveal');
