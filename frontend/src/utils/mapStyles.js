// Preset styling Google Maps disesuaikan sama vibe tiap tema.
// Format ini persis "styles" array yang dipake Google Maps JS API
// (bisa juga di-generate/edit visual di https://mapstyle.withgoogle.com)

export const MAP_STYLE_PRESETS = {
  'sage-garden': [
    { elementType: 'geometry', stylers: [{ color: '#f4f6f0' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#5c6b5c' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#d8e2d4' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ],
  'navy-blush': [
    { elementType: 'geometry', stylers: [{ color: '#eef0f4' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#1f3a5f' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d6e3' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ],
  'terracotta-earth': [
    { elementType: 'geometry', stylers: [{ color: '#fbf3ec' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#7a5c4a' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#ead9c9' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ],
  'minimal-mono': [
    { elementType: 'geometry', stylers: [{ saturation: -100 }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ],
};

export function getMapStyle(themeId) {
  return MAP_STYLE_PRESETS[themeId] || [];
}
