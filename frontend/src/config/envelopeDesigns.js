export const envelopeDesigns = {
    classic: { name: 'Emboss Klasik', color: '#421b21', texture: 'burgundy.webp', thumbnail: 'segelara-thumbnail.webp' },
    botanical: { name: 'Botanikal Ivory', color: '#e8e2d2', texture: 'botanical.webp', thumbnail: 'botanical-preview.webp' },
    calla: { name: 'Calla Relief', color: '#dfd6c5', texture: 'calla.webp', thumbnail: 'calla-preview.webp', panels: 2 },
    orchid: { name: 'Anggrek Porselen', color: '#f1eadf', texture: 'orchid.webp', thumbnail: 'orchid-preview.webp', panels: 2 },
    navy: { name: 'Navy Foil', color: '#172739', texture: 'navy.webp', thumbnail: 'navy-preview.webp' },
};

export function resolveEnvelopeDesign(value) {
    return Object.hasOwn(envelopeDesigns, value) ? value : 'classic';
}
