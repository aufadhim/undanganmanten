import {ACTIVE_THEME_IDS} from './templateRegistry.js';
import {TEMPLATE_SETTINGS} from './templateSettings.generated.js';
export const THEME_DEFAULT_SETTINGS=Object.fromEntries(ACTIVE_THEME_IDS.map(id=>[id,structuredClone(TEMPLATE_SETTINGS[id])]));
