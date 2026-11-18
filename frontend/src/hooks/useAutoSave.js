import {useEffect,useRef,useState} from 'react';
/** Debounce edits and serialize requests so a slow response cannot overwrite a newer edit. */
export function useAutoSave(key,save,onSaved){
 const saveRef=useRef(save);saveRef.current=save;const commitRef=useRef(onSaved);commitRef.current=onSaved;const scope=useRef(null);const [status,setStatus]=useState('saved');
 useEffect(()=>{const state={timer:null,payload:null,revision:0,saved:0,running:false,active:true,save:saveRef.current};scope.current=state;setStatus('saved');const warn=event=>{if(state.revision>state.saved){event.preventDefault();event.returnValue=''}};window.addEventListener('beforeunload',warn);return()=>{window.removeEventListener('beforeunload',warn);state.active=false;clearTimeout(state.timer);if(state.revision>state.saved&&!state.running)run(state)}},[key]);
 async function run(state){if(state.running||state.saved===state.revision)return;state.running=true;const rev=state.revision,payload=state.payload;try{const result=await state.save(payload);state.saved=rev;if(!state.active)window.dispatchEvent(new Event('refresh_dashboard'));if(state.active&&state.revision===rev)commitRef.current?.(result,payload);if(state.active)setStatus(state.revision===rev?'saved':'saving')}catch{if(state.active)setStatus('error');state.running=false;return}state.running=false;if(state.revision>state.saved)run(state)}
 function schedule(payload){const state=scope.current;if(!state)return;state.payload=payload;state.revision++;setStatus('saving');clearTimeout(state.timer);state.timer=setTimeout(()=>run(state),650)}
 function retry(){const state=scope.current;if(state){setStatus('saving');run(state)}}
 return {schedule,status,retry};
}
