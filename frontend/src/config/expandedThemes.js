import {ACTIVE_TEMPLATES} from './templateRegistry.js';
export const EXPANDED_THEMES=ACTIVE_TEMPLATES.filter(t=>t.expanded);
export const EXPANDED_THEME_IDS=EXPANDED_THEMES.map(t=>t.id);
