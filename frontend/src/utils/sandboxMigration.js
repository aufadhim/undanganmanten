export function resolveSandboxGallery(savedGallery, fallbackGallery) {
  return Array.isArray(savedGallery) && savedGallery.length > 0
    ? savedGallery
    : fallbackGallery;
}
