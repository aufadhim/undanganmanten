import {createContext,useContext,useId,useLayoutEffect,useRef,useState,cloneElement} from 'react';
import {createPortal} from 'react-dom';
export const ContentSaveTarget=createContext(null);

/** Relocate the panel's save action below its typography controls, retaining native form validation. */
export default function ContentSaveAction({children}){
 const target=useContext(ContentSaveTarget),anchor=useRef(null),id=useId();
 const [formId,setFormId]=useState(undefined);
 useLayoutEffect(()=>{const form=anchor.current?.closest('form');if(form){if(!form.id)form.id=`content-form-${id.replaceAll(':','')}`;setFormId(form.id)}},[id,target]);
 if(!target)return <span ref={anchor} className="content-save-anchor">{children}</span>;
 return <><span ref={anchor} hidden/>{createPortal(<div className="content-save-footer">{cloneElement(children,{form:formId,className:`${children.props.className||''} content-save-button`,style:{...children.props.style,width:'100%',margin:0},children:children.props.isLoading?'Menyimpan…':'Simpan konten'})}</div>,target)}</>;
}
