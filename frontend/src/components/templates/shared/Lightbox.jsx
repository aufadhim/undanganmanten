import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { resolveImageUrl } from '../../../config/env.js';

function getYoutubeId(url = '') {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^#&?/]+)/);
  return match?.[1]?.length === 11 ? match[1] : null;
}

export default function Lightbox({ mediaList, images, initialIndex, currentIndex, onNavigate, onClose }) {
  const normalizedMedia = useMemo(() => {
    const source = mediaList || images || [];
    return source.map((item) => typeof item === 'string'
      ? { type: 'photo', url: item }
      : { type: item.type || 'photo', url: item.url || item.path, ...item });
  }, [mediaList, images]);
  const [activeIndex, setActiveIndex] = useState(initialIndex ?? currentIndex ?? 0);

  useEffect(() => setActiveIndex(initialIndex ?? currentIndex ?? 0), [initialIndex, currentIndex]);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  const move = (direction) => {
    const next = (activeIndex + direction + normalizedMedia.length) % normalizedMedia.length;
    setActiveIndex(next);
    onNavigate?.(next);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'ArrowLeft') move(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!normalizedMedia.length || activeIndex < 0 || activeIndex >= normalizedMedia.length) return null;
  const current = normalizedMedia[activeIndex];
  const youtubeId = current.type === 'video' ? getYoutubeId(current.url) : null;

  return createPortal(
    <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Pratinjau galeri" onClick={onClose}>
      <div className="gallery-lightbox-backdrop" />
      <div className="gallery-lightbox-shell" onClick={(event) => event.stopPropagation()}>
        <div className="gallery-lightbox-topbar">
          <span>{String(activeIndex + 1).padStart(2, '0')} / {String(normalizedMedia.length).padStart(2, '0')}</span>
          <button onClick={onClose} aria-label="Tutup lightbox"><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="gallery-lightbox-stage">
          {normalizedMedia.length > 1 && <button className="gallery-lightbox-nav previous" onClick={() => move(-1)} aria-label="Gambar sebelumnya"><i className="fa-solid fa-chevron-left" /></button>}
          <div className="gallery-lightbox-media">
            {current.type === 'photo' ? <img src={resolveImageUrl(current.url)} alt={current.alt || `Foto galeri ${activeIndex + 1}`} />
              : youtubeId ? <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} title="Wedding video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
              : <video src={resolveImageUrl(current.url)} controls autoPlay preload="metadata" />}
          </div>
          {normalizedMedia.length > 1 && <button className="gallery-lightbox-nav next" onClick={() => move(1)} aria-label="Gambar berikutnya"><i className="fa-solid fa-chevron-right" /></button>}
        </div>
        <div className="gallery-lightbox-caption">MOMENTS WE CHERISH</div>
      </div>
      <style>{`
        .gallery-lightbox{position:fixed;inset:0;width:100vw;height:100dvh;z-index:2147483000;display:grid;place-items:center;padding:12px;color:#fff;box-sizing:border-box;overflow:hidden;isolation:isolate}
        .gallery-lightbox-backdrop{position:absolute;inset:0;background:rgba(15,13,12,.9);backdrop-filter:blur(18px)}
        .gallery-lightbox-shell{position:relative;width:min(1120px,calc(100vw - 24px));height:calc(100dvh - 24px);max-height:860px;display:flex;flex-direction:column;min-height:0;overflow:hidden}
        .gallery-lightbox-topbar{display:flex;justify-content:space-between;align-items:center;padding:4px 2px 14px;font:600 12px/1 Manrope,sans-serif;letter-spacing:.16em}
        .gallery-lightbox-topbar button,.gallery-lightbox-nav{border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.1);color:#fff;cursor:pointer;backdrop-filter:blur(8px)}
        .gallery-lightbox-topbar button{width:40px;height:40px;border-radius:50%}
        .gallery-lightbox-stage{position:relative;flex:1 1 0;min-height:0;overflow:hidden;display:grid;place-items:center}
        .gallery-lightbox-media{width:100%;height:100%;min-height:0;overflow:hidden;display:grid;place-items:center}
        .gallery-lightbox-media img,.gallery-lightbox-media video{max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;box-shadow:0 30px 80px rgba(0,0,0,.45)}
        .gallery-lightbox-media iframe{width:min(100%,960px);aspect-ratio:16/9;border:0;border-radius:8px}
        .gallery-lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;z-index:2}
        .gallery-lightbox-nav.previous{left:12px}.gallery-lightbox-nav.next{right:12px}
        .gallery-lightbox-caption{text-align:center;padding-top:14px;font:500 10px/1 Manrope,sans-serif;letter-spacing:.3em;opacity:.6}
        @media(max-width:640px){.gallery-lightbox{padding:10px}.gallery-lightbox-nav{width:40px;height:40px}.gallery-lightbox-nav.previous{left:4px}.gallery-lightbox-nav.next{right:4px}}
      `}</style>
    </div>, document.body
  );
}
