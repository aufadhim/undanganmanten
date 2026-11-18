import {animateProgress} from '/templates/shared/transition-motion.js';
import {BookPortalRenderer} from './book-portal-renderer.js';
import {pageFit,portalTransform,cameraFrame,ease as smooth} from './portal-math.js';
/** Mental Canvas 2: an exterior book contains a live snapshot of the interior renderer. */
const config=window.InvitationConfig,scene=window.heroScene;
const outer=document.createElement('div');outer.id='book-exterior';outer.setAttribute('aria-hidden','true');
const backdrop=document.createElement('div');backdrop.className='book-outside-painting';backdrop.style.backgroundImage=`url("${config.assets.outer}")`;
const book=document.createElement('div');book.className='storybook';
const binding=new Image();binding.className='book-binding';binding.src=config.assets.book;binding.alt='';
const page=document.createElement('div');page.className='book-page';
const picture=new Image();picture.alt='';picture.src=config.assets.room1;page.append(picture);
const inscription=document.createElement('div');inscription.className='book-inscription';
const caption=document.createElement('small');caption.textContent='SEBUAH KISAH';const names=document.createElement('strong');names.textContent=config.identity.bride+' & '+config.identity.groom;
const note=document.createElement('em');note.textContent='Di antara waktu, kita bertemu.';inscription.append(caption,names,note);book.append(binding,page,inscription);outer.append(backdrop,book);document.body.prepend(outer);
const renderer=new BookPortalRenderer(outer);
let busy=false,outside=true,zoom=0,coverPicture=null,wasPaused=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

function geometry(){outer.style.transform='none';return pageFit(page.getBoundingClientRect(),innerWidth,innerHeight)}
function paint(p,g){outer.style.transformOrigin=`${g.x}px ${g.y}px`;outer.style.transform=portalTransform(p,g);const f=cameraFrame(p,g);picture.style.width=100/f.uvX+'%';picture.style.height=100/f.uvY+'%';picture.style.objectFit='fill';}
// The page is a snapshot of the exact live interior, including character size and pose.
// Never substitute cover framing here: restoring hero framing at the handoff causes a jump.
async function snapshot(){
 await scene.ready;scene.resize();
 if(scene.width<10||scene.height<10){picture.src=config.assets.room1;await picture.decode();return}
 try{
  scene.draw(scene.overridePose||scene.pose||scene.config.intro[0]);
  picture.src=scene.canvas.toDataURL('image/png');
 }catch{picture.src=config.assets.room1}
 await picture.decode();
}
async function animate(from,to,duration){
 const g=geometry();let gpu=false;
 try{gpu=await renderer.prepare({background:config.assets.outer,binding:config.assets.book,picture:picture.src,bookRect:binding.getBoundingClientRect(),pageRect:page.getBoundingClientRect(),inscription,width:innerWidth,height:innerHeight})}catch(error){console.warn('Portal menggunakan gerakan proporsional cadangan.',error)}
 outer.dataset.portalRenderer=gpu?'webgl-perspective':'proportional-fallback';
 await animateProgress(reduced?220:duration,p=>{zoom=from+(to-from)*p;if(gpu)renderer.draw(cameraFrame(zoom,g),zoom);else paint(zoom,g);outer.style.visibility='';if(from===1)document.body.classList.add('book-outside')});
 // Keep the final entry frame until the live scene has actually been revealed.
 if(to===0){renderer.hide();picture.style.width='';picture.style.height='';picture.style.objectFit='';outer.style.transform='none'}
}
async function enter(){if(busy)return;busy=true;wasPaused=scene.paused;scene.paused=true;await snapshot();if(document.body.classList.contains('locked'))coverPicture=picture.src;outer.hidden=false;outer.style.opacity='1';document.body.classList.add('book-travelling');await animate(0,1,4400);outside=false;document.body.classList.remove('book-outside','book-travelling');document.body.dataset.bookState='inside';}
async function completeEntry(){
 // Overlay the identical final snapshot while the live canvas becomes visible.
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 const fade=outer.animate([{opacity:1},{opacity:0}],{duration:reduced?100:650,easing:'ease-in-out',fill:'forwards'});
 await fade.finished;outer.hidden=true;fade.cancel();renderer.hide();outer.style.transform='none';picture.style.width='';picture.style.height='';picture.style.objectFit='';scene.paused=wasPaused;busy=false;
}
async function exit(){if(busy)return;busy=true;wasPaused=scene.paused;scene.paused=true;await snapshot();outer.hidden=false;outer.style.visibility='hidden';outer.style.opacity='1';document.body.classList.add('book-travelling');document.body.dataset.bookState='leaving';await animate(1,0,4600);outside=true;document.body.classList.remove('book-travelling');document.body.dataset.bookState='outside';scene.paused=wasPaused;busy=false;}
async function toCover(){if(!outside)await exit();document.body.classList.add('book-travelling');const g=geometry();await animateProgress(reduced?200:1800,p=>{const e=Math.sin(Math.PI*smooth(p));outer.style.transformOrigin=`${g.x}px ${g.y}px`;outer.style.transform=`translateY(${-22*e}px) scale(${1+.16*e}) rotate(${-1.4*e}deg)`});document.body.classList.remove('book-travelling');}
window.BookPortal={enter,completeEntry,exit,toCover,refresh(){if(outside&&!busy)snapshot()},get busy(){return busy},get outside(){return outside}};
document.body.classList.add('book-outside');document.body.dataset.engine='mental-canvas-2';document.body.dataset.bookState='outside';
await Promise.all([binding.decode(),snapshot(),new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=reject;i.src=config.assets.outer})]);
addEventListener('invitation:closed',()=>{outside=true;outer.hidden=false;outer.style.transform='none';if(coverPicture)picture.src=coverPicture;document.body.classList.add('book-outside');document.body.dataset.bookState='outside'});
addEventListener('resize',()=>{if(!busy&&outside)outer.style.transform='none'});

new ResizeObserver(()=>{if(!busy&&outside)snapshot()}).observe(scene.viewport);

new MutationObserver(()=>{const identity=window.InvitationConfig.identity;names.textContent=identity.bride+' & '+identity.groom}).observe(document.querySelector('.monogram'),{childList:true,subtree:true,characterData:true});
