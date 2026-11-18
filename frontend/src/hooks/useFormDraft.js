import {useState,useEffect} from 'react';

export function readFormDraft(storage,key,initialData){
    try{
        const saved=storage.getItem(key);
        if(saved){
            const parsed=JSON.parse(saved);
            if(initialData&&typeof initialData==='object'&&!Array.isArray(initialData)){
                return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?{...initialData,...parsed}:initialData;
            }
            return parsed??initialData;
        }
    }catch{}
    return initialData;
}
export function writeFormDraft(storage,key,form,baseline){
    if(JSON.stringify(form)===baseline)storage.removeItem(key);
    else storage.setItem(key,JSON.stringify(form));
}

// Keep only unsaved edits. A completed save must not recreate its own stale draft.
export function useFormDraft(key,initialData,persist=true){
    const initial=JSON.stringify(initialData);
    const fresh=()=>({key,form:persist?readFormDraft(localStorage,key,initialData):initialData,baseline:initial,server:initial});
    const [state,setState]=useState(fresh);
    if(state.key!==key)setState(fresh());
    else if(state.server!==initial){
        const pristine=JSON.stringify(state.form)===state.baseline;
        setState({...state,server:initial,...(pristine?{form:initialData,baseline:initial}:{})});
    }
    useEffect(()=>{
        if(!persist||state.key!==key)return;
        try{writeFormDraft(localStorage,key,state.form,state.baseline)}catch{}
    },[key,state,persist]);
    const setForm=value=>setState(current=>({...current,form:typeof value==='function'?value(current.form):value}));
    const clearDraft=()=>{
        try{if(persist)localStorage.removeItem(key)}catch{}
        setState(current=>({...current,baseline:JSON.stringify(current.form)}));
    };
    return [state.form,setForm,clearDraft];
}
