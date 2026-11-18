import {useEffect,useRef} from 'react';
import {mountTypography} from '../../public/templates/shared/typography-runtime.js';
export default function TypographyRuntime({typography,children}){const root=useRef(null),runtime=useRef(null);useEffect(()=>{runtime.current=mountTypography(root.current,typography);return()=>runtime.current?.destroy()},[]);useEffect(()=>runtime.current?.update(typography),[typography]);return <div ref={root} style={{display:'contents'}}>{children}</div>}
