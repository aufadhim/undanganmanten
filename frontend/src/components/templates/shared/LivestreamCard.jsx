import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './livestream-card.css';

function youtubeEmbed(url = '') {
  const match = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|live\/))([^?&/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : '';
}

export default function LivestreamCard({ className = '', url, coverImage, title = 'Live Streaming' }) {
  const [open, setOpen] = useState(false);
  const hostRef = useRef(null);
  const embedUrl = youtubeEmbed(url);
  const directVideo = !embedUrl && /\.(?:mp4|webm|ogg)(?:[?#].*)?$/i.test(String(url || '')) ? url : '';
  const playable = Boolean(embedUrl || directVideo);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', close);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', close); document.body.style.overflow = ''; };
  }, [open]);

  const lightbox = open && <div className="livestream-lightbox" role="dialog" aria-modal="true" aria-label={title} onClick={() => setOpen(false)}>
    <button type="button" className="livestream-lightbox-close" onClick={() => setOpen(false)} aria-label="Tutup pemutar">×</button>
    <div className="livestream-lightbox-player" onClick={(event) => event.stopPropagation()}>{embedUrl ? <iframe src={embedUrl} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <video src={directVideo} controls autoPlay playsInline />}</div>
  </div>;
  const previewViewport = hostRef.current?.closest('.phone-preview-wrapper');
  return <div ref={hostRef} className="livestream-card-root">
    <button type="button" className={`livestream-poster ${className}`} onClick={() => playable && setOpen(true)} aria-label={`Tonton ${title}`} disabled={!playable}>
      {coverImage ? <img src={coverImage} alt={`Sampul ${title}`} /> : <div className="livestream-poster-placeholder"><i className="fa-regular fa-image" /></div>}
      <span className="livestream-poster-shade" />
      <span className="livestream-play"><i className="fa-solid fa-play" /></span>
      <span className="livestream-poster-label">WATCH LIVE</span>
    </button>
    {lightbox && (previewViewport ? createPortal(lightbox, previewViewport) : lightbox)}
  </div>;
}
