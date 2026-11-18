import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { resolveImageUrl } from '../../../config/env.js';

import {youtubeId as getYoutubeId} from '../../../utils/gallery.js';

export default function Lightbox({ mediaList, images, initialIndex, currentIndex, onNavigate, onClose, portalTarget }) {
  const normalizedMedia = useMemo(() => {
    const source = mediaList || images || [];
    return source.map((item) => typeof item === 'string'
      ? { type: 'photo', url: item }
      : { ...item, type: item.type || 'photo', url: item.url || item.path });
  }, [mediaList, images]);
  const [activeIndex, setActiveIndex] = useState(initialIndex ?? currentIndex ?? 0);

  useEffect(() => setActiveIndex(initialIndex ?? currentIndex ?? 0), [initialIndex, currentIndex]);
  const ownerDocument=portalTarget?.ownerDocument||document;
  useEffect(() => {
    const previousOverflow = ownerDocument.body.style.overflow;
    ownerDocument.body.style.overflow = 'hidden';
    const previousFocus=ownerDocument.activeElement;
    ownerDocument.querySelector('[aria-label="Tutup lightbox"]')?.focus();
    return () => { ownerDocument.body.style.overflow = previousOverflow;previousFocus?.focus?.(); };
  }, [ownerDocument]);

  const activeVideo=normalizedMedia[activeIndex]?.type==='video';
  useEffect(()=>{
    const target=ownerDocument.defaultView;
    target.dispatchEvent(new CustomEvent('invitation:media',{detail:{source:'gallery',active:activeVideo}}));
    return()=>target.dispatchEvent(new CustomEvent('invitation:media',{detail:{source:'gallery',active:false}}));
  },[ownerDocument,activeVideo]);

  const move = (direction) => {
    const next = (activeIndex + direction + normalizedMedia.length) % normalizedMedia.length;
    setActiveIndex(next);
    onNavigate?.(next);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if(event.key==='Tab'){
        const controls=[...ownerDocument.querySelectorAll('.gallery-lightbox button,.gallery-lightbox iframe,.gallery-lightbox video')];
        const first=controls[0],last=controls.at(-1);
        if(event.shiftKey&&ownerDocument.activeElement===first){event.preventDefault();last?.focus()}
        else if(!event.shiftKey&&ownerDocument.activeElement===last){event.preventDefault();first?.focus()}
      }
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'ArrowLeft') move(-1);
    };
    const target=ownerDocument.defaultView;
    target.addEventListener('keydown', handleKeyDown);
    return () => target.removeEventListener('keydown', handleKeyDown);
  });

  if (!normalizedMedia.length || activeIndex < 0 || activeIndex >= normalizedMedia.length) return null;
  const current = normalizedMedia[activeIndex];
  const youtubeId = current.type === 'video' ? getYoutubeId(current.url) : null;

  return createPortal(
    <div className={`gallery-lightbox ${portalTarget ? 'is-embedded' : ''}`} role="dialog" aria-modal="true" aria-label="Pratinjau galeri" onClick={onClose}>
      <div className="gallery-lightbox-backdrop" />
      <div className="gallery-lightbox-shell" onClick={(event) => event.stopPropagation()}>
        <div className="gallery-lightbox-topbar">
          <span>{String(activeIndex + 1).padStart(2, '0')} / {String(normalizedMedia.length).padStart(2, '0')}</span>
          <button onClick={onClose} aria-label="Tutup lightbox"><span aria-hidden="true">×</span></button>
        </div>
        <div className="gallery-lightbox-stage">
          {normalizedMedia.length > 1 && <button className="gallery-lightbox-nav previous" onClick={() => move(-1)} aria-label="Gambar sebelumnya"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button>}
          <div className="gallery-lightbox-media">
            {current.type === 'photo' ? <img src={resolveImageUrl(current.url)} alt={current.alt || `Foto galeri ${activeIndex + 1}`} />
              : youtubeId ? <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} title="Video pernikahan" referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
              : <video key={current.url} src={resolveImageUrl(current.url)} controls autoPlay playsInline preload="metadata" />}
          </div>
          {normalizedMedia.length > 1 && <button className="gallery-lightbox-nav next" onClick={() => move(1)} aria-label="Gambar berikutnya"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button>}
        </div>
        <div className="gallery-lightbox-caption">{youtubeId
          ? <a className="sam-action-link" href={`https://www.youtube.com/watch?v=${youtubeId}`} target="_blank" rel="noopener noreferrer" >Buka di YouTube</a>
          : 'MOMENTS WE CHERISH'}</div>
      </div>
      <style>{`
        .gallery-lightbox{position:fixed;inset:0;width:100%;height:100%;z-index:2147483000;display:grid;place-items:center;padding:12px;color:#fff;box-sizing:border-box;overflow:hidden;isolation:isolate}.gallery-lightbox.is-embedded{position:absolute}
        .gallery-lightbox-backdrop{position:absolute;inset:0;background:rgba(15,13,12,.9);backdrop-filter:blur(18px)}
        .gallery-lightbox-shell{position:relative;width:100%;height:100%;display:flex;flex-direction:column;min-height:0;overflow:hidden}
        .gallery-lightbox-topbar{display:flex;justify-content:space-between;align-items:center;padding:4px 2px 14px;font:600 12px/1 Manrope,sans-serif;letter-spacing:.16em}
        .gallery-lightbox-topbar button,.gallery-lightbox-nav{border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.1);color:#fff;cursor:pointer;backdrop-filter:blur(8px)}
        .gallery-lightbox-topbar button{width:40px;height:40px;border-radius:50%}
        .gallery-lightbox-stage{position:relative;flex:1 1 0;min-height:0;overflow:hidden;display:grid;place-items:center}
        .gallery-lightbox-media{width:100%;height:100%;min-height:0;overflow:hidden;display:grid;place-items:center}
        .gallery-lightbox-media img,.gallery-lightbox-media video{max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;box-shadow:0 30px 80px rgba(0,0,0,.45)}
        .gallery-lightbox-media iframe{width:min(100%,960px);aspect-ratio:16/9;border:0;border-radius:8px}
        .gallery-lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);display:grid;place-items:center;min-width:0;width:42px;height:42px;padding:0;border-radius:50%;z-index:2}
        .gallery-lightbox-nav.previous{left:12px}.gallery-lightbox-nav.next{right:12px}
        .gallery-lightbox-caption{text-align:center;padding-top:14px;font:500 10px/1 Manrope,sans-serif;letter-spacing:.3em;opacity:.6}
        @media(max-width:640px){.gallery-lightbox{padding:10px}.gallery-lightbox-nav{width:38px;height:38px}.gallery-lightbox-nav.previous{left:4px}.gallery-lightbox-nav.next{right:4px}}
      `}</style>
    </div>, portalTarget || document.body
  );
}
