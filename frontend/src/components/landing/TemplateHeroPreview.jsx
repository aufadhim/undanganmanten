import {Component,lazy,Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {TEMPLATE_LOADERS} from '../../config/templateLoaders.generated.js';

class PreviewBoundary extends Component{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?null:this.props.children}}

/** Reuse the real invitation renderer, with a silent hero-only presentation. */
export default function TemplateHeroPreview({theme}){
 const root=useRef(null),[near,setNear]=useState(false),[visible,setVisible]=useState(false),[width,setWidth]=useState(300),[ready,setReady]=useState(false);
 const Template=useMemo(()=>lazy(TEMPLATE_LOADERS[theme.id]),[theme.id]);
 const invitation=useMemo(()=>({id:'landing-preview',themeId:theme.id,slug:'alina-raka',weddingDate:'2026-12-20',themeSettings:{characterSettings:{mode:'default'}},coupleProfile:{brideName:'Alina',groomName:'Raka'},invitationFeatures:{musicEnabled:false,igFilterEnabled:false},events:[],galleryMedia:[],wishes:[]}),[theme.id]);
 useEffect(()=>{
  const el=root.current;const load=new IntersectionObserver(([e])=>{if(e.isIntersecting)setNear(true)},{rootMargin:'180px'});load.observe(el);
  const view=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{threshold:.1});view.observe(el);
  const resize=new ResizeObserver(([e])=>setWidth(e.contentRect.width));resize.observe(el);
  return()=>{load.disconnect();view.disconnect();resize.disconnect()};
 },[]);
 useEffect(()=>{
  if(!near)return;let initialized=false;
  function initialize(){const frame=root.current?.querySelector('iframe'),win=frame?.contentWindow,doc=frame?.contentDocument;if(!win||!doc||!win.heroScene?.loaded||doc.body.dataset.cmsReady!=='true')return;
   if(doc.body.dataset.landingHero==='ready')initialized=true;
   if(!initialized){
    initialized=true;doc.body.dataset.landingHero='ready';const css=doc.createElement('style');css.textContent='html,body{overflow:hidden!important}#cover,#book-exterior,.bottom-ui,#music-toggle,#section-menu,header.topbar{display:none!important}#journey{display:block!important}#hero{height:100vh!important;min-height:100vh!important}.hero-heading{opacity:1!important;translate:0 0!important;transition:none!important;top:8%!important;left:6%!important;right:6%!important}.hero-heading h2{font-size:38px!important;margin:12px 0!important}.hero-heading .kicker,.hero-heading .cover-date{font-size:9px!important;letter-spacing:1px!important}';doc.head.append(css);
    const journey=doc.querySelector('#journey');if(journey){journey.hidden=false;journey.inert=false}
    doc.body.classList.remove('locked','book-outside','book-travelling');doc.querySelector('#hero')?.classList.add('hero-entered');
    win.dispatchEvent(new win.Event('invitation:prepare'));win.dispatchEvent(new win.Event('invitation:opened'));
    if(win.coverScene)win.coverScene.running=false;win.invitationNavigator?.stopAuto?.();
    doc.querySelectorAll('audio').forEach(a=>{a.pause();a.muted=true});
    win.scrollTo(0,0);setReady(true);
   }
   const active=visible&&!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
   win.heroScene.paused=!active;win.heroScene.running=active;
   doc.documentElement.style.setProperty('animation-play-state',active?'running':'paused');
   let pause=doc.querySelector('#landing-motion-state');if(!pause){pause=doc.createElement('style');pause.id='landing-motion-state';doc.head.append(pause)}pause.textContent=active?'':'*,*::before,*::after{animation-play-state:paused!important}';
   clearInterval(timer);
  }
  const timer=setInterval(initialize,250);initialize();document.addEventListener('visibilitychange',initialize);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',initialize)};
 },[near,visible]);
 const scale=width/390;
 return <div ref={root} className={`cl-live-hero ${ready?'is-ready':''}`}>
  <img src={theme.previewImg} alt={`Hero ${theme.name}`} loading="lazy" decoding="async"/>
  {near&&<div className="cl-live-viewport" aria-hidden="true" inert="" style={{width:390,height:487.5,transform:`scale(${scale})`}}><PreviewBoundary><Suspense fallback={null}><Template invitation={invitation} editorPreview/></Suspense></PreviewBoundary></div>}
 </div>;
}
