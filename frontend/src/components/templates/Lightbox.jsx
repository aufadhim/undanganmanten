import React, { useState, useEffect } from 'react';

// Fungsi utilitas untuk mendeteksi ID YouTube
function getYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function Lightbox({ mediaList, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  if (currentIndex === null || currentIndex < 0 || currentIndex >= mediaList.length) return null;

  const currentMedia = mediaList[currentIndex];
  const ytId = currentMedia.type === 'video' ? getYoutubeId(currentMedia.url) : null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0));
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px', right: '20px',
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '32px',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        &times;
      </button>

      {/* Main Content Area */}
      <div 
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
        onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam area ini menutup lightbox
      >
        
        {/* Prev Button */}
        {mediaList.length > 1 && (
          <button 
            onClick={handlePrev}
            style={{ position: 'absolute', left: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
        )}

        {/* Media Viewer */}
        <div style={{ maxWidth: '90%', maxHeight: '80%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {currentMedia.type === 'photo' ? (
            <img 
              src={currentMedia.url} 
              alt="Gallery Item" 
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }} 
            />
          ) : ytId ? (
            <iframe 
              width="100%" 
              height="100%" 
              style={{ minWidth: '300px', width: '80vw', maxWidth: '800px', aspectRatio: '16/9', borderRadius: '8px', border: 'none' }}
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} 
              title="YouTube video player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          ) : (
            <video 
              src={currentMedia.url} 
              controls 
              autoPlay
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }} 
            />
          )}
        </div>

        {/* Next Button */}
        {mediaList.length > 1 && (
          <button 
            onClick={handleNext}
            style={{ position: 'absolute', right: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        )}

      </div>

      {/* Pagination Indicator */}
      <div style={{ position: 'absolute', bottom: '30px', color: '#fff', fontSize: '14px', letterSpacing: '2px' }}>
        {currentIndex + 1} / {mediaList.length}
      </div>
    </div>
  );
}
