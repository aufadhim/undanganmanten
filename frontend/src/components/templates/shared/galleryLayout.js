export function galleryCountClasses(count) {
  const safeCount = Number.isFinite(Number(count)) ? Math.max(0, Math.floor(Number(count))) : 0;
  return [
    `gallery-count-${Math.min(safeCount, 20)}`,
    safeCount % 2 ? 'gallery-count-odd' : 'gallery-count-even',
    ...[3, 4, 6, 7, 8].map((cycle) => `gallery-mod${cycle}-${safeCount % cycle}`),
  ].join(' ');
}
