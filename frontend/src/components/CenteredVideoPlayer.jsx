import { useEffect, useRef, useState } from 'react';
import '../styles/centered-video-player.css';

export default function CenteredVideoPlayer({ src, className = '', poster = '' }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const clearFadeTimer = () => {
    if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
  };

  const scheduleFade = (delay = 1400) => {
    clearFadeTimer();
    fadeTimerRef.current = window.setTimeout(() => setControlsVisible(false), delay);
  };

  useEffect(() => () => clearFadeTimer(), []);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play();
    else video.pause();
  };

  return (
    <div ref={playerRef}
      onPointerDown={() => { setControlsVisible(true); if (playing) scheduleFade(); }}
      onMouseEnter={() => { clearFadeTimer(); if (playing) setControlsVisible(true); }}
      onMouseLeave={() => { if (playing) scheduleFade(350); }}
      className={`centered-video-player ${playing ? 'is-playing' : ''} ${playing && !controlsVisible ? 'controls-hidden' : ''} ${className}`.trim()}>
      <video ref={videoRef} src={src} poster={poster || undefined} playsInline preload="metadata"
        onLoadedMetadata={(event) => { if (!poster && event.currentTarget.duration > 0.2) event.currentTarget.currentTime = 0.1; }}
        onPlay={() => { setPlaying(true); setControlsVisible(true); scheduleFade(); }}
        onPause={() => { clearFadeTimer(); setPlaying(false); setControlsVisible(true); }}
        onEnded={() => { clearFadeTimer(); setPlaying(false); setControlsVisible(true); }} />
      <button type="button" className="centered-video-toggle" onClick={togglePlayback}
        aria-label={playing ? 'Jeda video' : 'Putar video'}>
        <i className={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`} aria-hidden="true" />
      </button>
    </div>
  );
}
