export const ACTIVE_THEME_IDS = ['eternal', 'seraya', 'nawasena', 'isvara', 'lanqing', 'celluloid', 'nocturne'];

export function normalizeActiveThemeId(themeId) {
  return ACTIVE_THEME_IDS.includes(themeId) ? themeId : 'eternal';
}
