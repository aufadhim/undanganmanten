import { useEffect, useRef, useState } from 'react';
import { getMapStyle } from '../utils/mapStyles.js';

let scriptLoadingPromise = null;

// Load Google Maps JS SDK sekali aja, dishare antar komponen (biar gak double-load kalau ada >1 map di halaman)
function loadGoogleMapsScript(apiKey) {
  if (window.google?.maps) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export default function MapEmbed({ lat, lng, venueName, themeId }) {
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn('VITE_GOOGLE_MAPS_API_KEY belum di-set di .env frontend.');
      return;
    }
    if (!lat || !lng) return;

    loadGoogleMapsScript(apiKey).then(() => setReady(true));
  }, [lat, lng]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const position = { lat, lng };
    const map = new window.google.maps.Map(mapRef.current, {
      center: position,
      zoom: 16,
      styles: getMapStyle(themeId),
      disableDefaultUI: true,
      zoomControl: true,
    });

    new window.google.maps.Marker({ position, map, title: venueName });
  }, [ready, lat, lng, themeId, venueName]);

  if (!lat || !lng) {
    return (
      <div style={{ fontSize: 12, opacity: 0.6, padding: 12 }}>
        Lokasi belum diatur. Isi latitude/longitude di dashboard.
      </div>
    );
  }

  // Fallback kalau API key belum ada: link "Buka di Google Maps" biasa, tanpa embed custom style
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <a
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noreferrer"
        style={{ fontSize: 13, color: 'inherit' }}
      >
        📍 Buka lokasi di Google Maps
      </a>
    );
  }

  return <div ref={mapRef} style={{ width: '100%', height: 180, borderRadius: 10, marginTop: 10 }} />;
}
