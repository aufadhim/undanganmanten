import test from 'node:test';
import assert from 'node:assert/strict';
import {createMusicController} from '../public/templates/shared/music-controller.js';
class Audio extends EventTarget {paused=true;ended=false;reject=false;play(){if(this.reject)return Promise.reject(Error('blocked'));this.paused=false;this.dispatchEvent(new Event('play'));return Promise.resolve()}pause(){this.paused=true;this.dispatchEvent(new Event('pause'))}}
function fixture(){const audio=new Audio(),doc=new EventTarget(),win=new EventTarget();doc.hidden=false;let state;const control=createMusicController(audio,{documentTarget:doc,windowTarget:win,onChange:s=>state=s});return {audio,doc,win,control,get state(){return state}}}
const settle=()=>new Promise(resolve=>queueMicrotask(resolve));
test('background pauses and returning resumes unless guest paused manually',async()=>{const f=fixture();f.control.open();await settle();assert.equal(f.audio.paused,false);f.win.dispatchEvent(new Event('blur'));assert.equal(f.audio.paused,true);f.win.dispatchEvent(new Event('focus'));await settle();assert.equal(f.audio.paused,false);f.control.toggle();f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));f.doc.hidden=false;f.doc.dispatchEvent(new Event('visibilitychange'));await settle();assert.equal(f.audio.paused,true);assert.equal(f.state.wanted,false);f.control.destroy()});
test('disabled and closed invitations cannot continue playback',async()=>{const f=fixture();f.control.open();f.control.setEnabled(false);await settle();assert.equal(f.audio.paused,true);assert.equal(f.state.visible,false);f.control.setEnabled(true);await settle();assert.equal(f.audio.paused,false);f.control.close();f.win.dispatchEvent(new Event('focus'));await settle();assert.equal(f.audio.paused,true);assert.equal(f.state.visible,false);f.control.destroy()});
test('play rejection offers retry without claiming music is playing',async()=>{const f=fixture();f.audio.reject=true;f.control.open();await settle();assert.equal(f.state.playing,false);assert.match(f.state.error,/Ketuk/);f.audio.reject=false;f.control.toggle();await settle();assert.equal(f.state.playing,true);assert.equal(f.state.error,'');f.control.destroy();f.win.dispatchEvent(new Event('focus'));assert.equal(f.audio.paused,true)});
test('video playback suppresses background music across focus changes without losing guest intent',async()=>{
 const f=fixture(),media=active=>{const e=new Event('invitation:media');e.detail={source:'gallery',active};f.win.dispatchEvent(e)};
 f.control.open();await settle();media(true);assert.equal(f.audio.paused,true);
 f.win.dispatchEvent(new Event('focus'));await settle();assert.equal(f.audio.paused,true);
 media(false);await settle();assert.equal(f.audio.paused,false);
 f.control.toggle();media(true);media(false);await settle();assert.equal(f.audio.paused,true);f.control.destroy();
});
