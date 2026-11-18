function usableCover(value) {
  if (typeof value !== 'string') return '';
  const normalized = value.trim();
  if (!normalized || ['null', 'undefined', 'none'].includes(normalized.toLowerCase())) return '';
  if (normalized.includes('/assets/gallery/dummy-gallery-')) return '';
  if (normalized.includes('/assets/dummy-')) return '';
  // Abaikan placeholder lama yang mungkin masih tersimpan pada undangan.
  if (normalized.includes('/assets/isvara/thumb-md-')) return '';
  if (normalized.includes('photo-1492175742197-ed20dc5a6bed')) return '';
  return normalized;
}

/**
 * Resolve both invitation covers consistently.
 * `default` always ignores previously uploaded URLs, while an incomplete custom
 * cover falls back to the template artwork instead of rendering an empty image.
 */
export function resolveTemplateCovers(themeSettings = {}, defaults = {}) {
  const defaultOpening = usableCover(defaults.opening);
  const defaultMain = usableCover(defaults.main) || defaultOpening;
  const coverType = themeSettings.coverType || 'custom';
  if (coverType === 'default') {
    return { opening: '', main: '', openingIsArtwork: true, mainIsArtwork: true };
  }

  const useCustomOpening = coverType === 'custom' || coverType === 'custom-opening';
  const useCustomMain = coverType === 'custom' || coverType === 'custom-main';
  const uploadedOpening = useCustomOpening ? usableCover(themeSettings.coverImageUrl) : '';
  const uploadedMain = useCustomMain ? usableCover(themeSettings.coverSecondImageUrl) : '';
  const opening = useCustomOpening ? uploadedOpening || defaultOpening || defaultMain : '';
  const main = useCustomMain
    ? uploadedMain || (coverType === 'custom' ? uploadedOpening : '') || defaultMain || defaultOpening
    : '';

  return {
    opening,
    main,
    openingIsArtwork: !opening,
    mainIsArtwork: !main,
  };
}

export function uploadedProfilePhoto(value) {
  const image = usableCover(value);
  if (!image) return '';
  if (image.includes('photo-1492175742197-ed20dc5a6bed')) return '';
  if (image.includes('/assets/dummy-') || image.includes('/assets/gallery/dummy-gallery-')) return '';
  return image;
}
