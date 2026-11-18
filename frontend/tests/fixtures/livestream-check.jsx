import {UIProvider} from '../../src/context/UIContext.jsx';import {api} from '../../src/api/client.js';import '../../src/styles/atelier.css';
api.patch=async(_,body)=>({data:{livestreamSettings:body}});
import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import LivestreamEditor from '../../src/components/LivestreamEditor.jsx';import LivestreamCard from '../../src/components/templates/shared/LivestreamCard.jsx';import '../../src/styles/index.css';
function Check(){const[inv,setInv]=useState({id:'qa-only',livestreamSettings:{url:'',coverImageUrl:''}});return <main style={{display:'grid',gridTemplateColumns:'minmax(300px,520px) 390px',gap:48,padding:32,background:'#faf8ee',color:'#526745'}}><LivestreamEditor invitation={inv} onUpdated={setInv} onLivePreview={patch=>setInv({...inv,...patch})}/><section><h2>Pratinjau siaran</h2><LivestreamCard {...{url:inv.livestreamSettings.url,coverImage:inv.livestreamSettings.coverImageUrl}}/></section></main>}
createRoot(document.getElementById('root')).render(<UIProvider><div className="atelier-app"><Check/></div></UIProvider>);
