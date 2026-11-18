import '../../src/i18n.js';
import React, {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {TEMPLATE_LOADERS} from '../../src/config/templateLoaders.generated.js';
import {getTemplate} from '../../src/config/templateRegistry.js';
const id=new URLSearchParams(location.search).get('theme'),theme=getTemplate(id);
const invitation={id:'poster',themeId:id,slug:'alina-raka',status:'draft',packageType:'TRIAL',weddingDate:'2026-12-20',themeSettings:{characterSettings:{mode:'default'},...(theme.engine?{}:{coverType:'custom',coverImageUrl:'/assets/gallery/./dummy-gallery-01.webp',coverSecondImageUrl:'/assets/gallery/./dummy-gallery-01.webp'})},coupleProfile:{brideName:'Alina',groomName:'Raka',brideFullName:'Alina Putri',groomFullName:'Raka Pratama'},invitationFeatures:{musicEnabled:false,igFilterEnabled:false},events:[],galleryMedia:[],wishes:[]};
function App(){const[Template,setTemplate]=useState(null);useEffect(()=>{TEMPLATE_LOADERS[id]().then(m=>{setTemplate(()=>m.default);document.body.dataset.mounted='true'})},[]);return Template?<div id="poster" style={{position:'relative',width:'100%',height:'100%'}}><Template invitation={invitation} editorPreview/></div>:null}
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
