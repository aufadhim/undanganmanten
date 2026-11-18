/** Shared guest intent and visibility lifecycle for React and iframe invitations. */
export const MUSIC_BUTTON_MARKUP='<span class="music-control-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span><svg class="music-control-play" aria-hidden="true" viewBox="0 0 20 20"><path d="M7 4.5 15 10l-8 5.5Z" fill="currentColor"/></svg>';
export function createMusicController(audio,{onChange=()=>{},enabled=true,pauseOnBlur=true,volume=.45,documentTarget=globalThis.document,windowTarget=globalThis.window}={}){
 let wanted=false,opened=false,background=Boolean(documentTarget?.hidden),ticket=0,disposed=false,error='';const media=new Set();
 audio.volume=Math.max(0,Math.min(1,volume));audio.loop=true;
 const emit=()=>{if(!disposed)onChange({playing:!audio.paused&&!audio.ended,visible:opened&&enabled,wanted,error})};
 async function play(){const request=++ticket;if(!enabled||!wanted||!opened||background||media.size||disposed)return;try{await audio.play();if(disposed||!wanted||background||media.size||!opened||!enabled)audio.pause();error=''}catch{if(request===ticket)error='Musik belum dapat diputar. Ketuk tombol musik untuk mencoba lagi.'}emit()}
 function suspend(){background=true;ticket++;audio.pause();emit()}
 function resume(){background=Boolean(documentTarget?.hidden);if(!background&&wanted&&opened&&enabled)play()}
 function open(){opened=true;wanted=true;background=Boolean(documentTarget?.hidden);play();emit()}
 function close(){opened=false;wanted=false;ticket++;audio.pause();error='';emit()}
 function toggle(){if(wanted&&!audio.paused){wanted=false;ticket++;audio.pause();error='';emit()}else{wanted=true;opened=true;background=Boolean(documentTarget?.hidden);play()}}
 function setEnabled(value){enabled=Boolean(value);if(!enabled){ticket++;audio.pause()}else if(wanted&&opened&&!background)play();emit()}
 const changeMedia=event=>{const key=event.detail?.source||'media';if(event.detail?.active){media.add(key);ticket++;audio.pause();emit()}else{media.delete(key);if(!background)play();emit()}};
 const visibility=()=>documentTarget.hidden?suspend():resume();
 for(const event of ['play','pause','playing','ended'])audio.addEventListener(event,emit);
 documentTarget?.addEventListener('visibilitychange',visibility);if(pauseOnBlur)windowTarget?.addEventListener('blur',suspend);windowTarget?.addEventListener('focus',resume);windowTarget?.addEventListener('invitation:media',changeMedia);windowTarget?.addEventListener('pagehide',suspend);windowTarget?.addEventListener('pageshow',resume);emit();
 return {open,close,toggle,setEnabled,suspend,resume,destroy(){disposed=true;ticket++;audio.pause();for(const e of ['play','pause','playing','ended'])audio.removeEventListener(e,emit);documentTarget?.removeEventListener('visibilitychange',visibility);if(pauseOnBlur)windowTarget?.removeEventListener('blur',suspend);windowTarget?.removeEventListener('focus',resume);windowTarget?.removeEventListener('invitation:media',changeMedia);windowTarget?.removeEventListener('pagehide',suspend);windowTarget?.removeEventListener('pageshow',resume)}};
}
