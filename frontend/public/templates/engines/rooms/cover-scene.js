import {syncContactShadow} from '/templates/shared/character-grounding.js';
import {SceneEngine} from '/templates/shared/runtime/scene-engine.js?v=16';
import {coverConfig as config} from './garden-theme.js?v=16';
const scene=window.InvitationStage?window.InvitationStage.createCoverScene(document.querySelector('#cover-stage')):new SceneEngine(document.querySelector('#cover-stage'),config);window.coverScene=scene;
const cover=document.getElementById('cover'),pause=document.getElementById('pause-cover');
cover.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||event.target.closest('button'))return;scene.pointer={x:event.clientX/innerWidth-.5,y:event.clientY/innerHeight-.5}});cover.addEventListener('pointerleave',()=>scene.pointer={x:0,y:0});
document.getElementById('replay-cover').onclick=()=>{scene.paused=false;if(window.InvitationStage)window.InvitationStage.replay();else scene.reset();pause.textContent='Ⅱ';pause.setAttribute('aria-label','Jeda animasi')};
pause.onclick=()=>{scene.paused=!scene.paused;pause.textContent=scene.paused?'▷':'Ⅱ';pause.setAttribute('aria-label',scene.paused?'Lanjutkan animasi':'Jeda animasi')};
scene.ready.then(()=>cover.classList.add('scene-ready')).catch(()=>{cover.classList.add('scene-ready');document.querySelector('.cover-note').textContent='Taman belum termuat. Muat ulang untuk mencoba kembali.'});

// Resolve the actual decoded cutout aspect instead of assuming all couples are 2:3.
if(!window.InvitationStage){scene.onBeforeRender=()=>syncContactShadow(scene.nodes.find(n=>n.layer.id==='couple'),scene.nodes.find(n=>n.layer.id==='contact-shadow'));}
