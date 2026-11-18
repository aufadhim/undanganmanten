import {isImmersiveTemplate} from './templateRegistry.js';
const regularCoverCapabilities = Object.freeze({
  mode: 'layer-exit',
  defaultPreset: 'slide-up',
  presets: ['slide-up', 'fade', 'zoom', 'slide-down'],
});

const PRESET_LABELS = {
  'slide-up': 'Terangkat ke Atas',
  fade: 'Menghilang Halus',
  zoom: 'Membesar & Menghilang',
  'slide-down': 'Turun ke Bawah',
  'camera-push': 'Kamera Mendekat',
  'moongate-push': 'Menembus Gerbang',
  'mist-opening': 'Kabut Membuka',
  'light-path': 'Cahaya Menuntun',
  'ornament-reveal': 'Ornamen Menyibak',
};

// Engine metadata comes from the registry; Signature keeps its regular layer transitions.
export function getTemplateEditorCapabilities(themeId) {
 return isImmersiveTemplate(themeId)?{cover:{mode:'cinematic-3d',defaultPreset:'camera-push',presets:['camera-push']}}:{cover:regularCoverCapabilities};
}

export function getCoverPresetOptions(capabilities) {
  return capabilities.cover.presets.map((value) => ({ value, label: PRESET_LABELS[value] || value }));
}
