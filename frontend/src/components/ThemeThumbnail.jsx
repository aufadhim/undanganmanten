import {useState} from 'react';
export default function ThemeThumbnail({theme}) {
 const [failed,setFailed]=useState(null);
 const primary=theme.previewImg?.startsWith('/assets/theme-thumbnails/heroes/')
  ? `${theme.previewImg}?v=hero-20261107`
  : theme.previewImg;
 const src=failed===primary?(theme.previewFallback||'/assets/landing-canvas/garden.webp'):primary;
 return <div className={`theme-poster theme-poster-clean poster-${theme.id}`}><img className="theme-poster-photo" loading="lazy" decoding="async" src={src} alt={`Hero template ${theme.name}`} onError={()=>setFailed(primary)}/></div>;
}
