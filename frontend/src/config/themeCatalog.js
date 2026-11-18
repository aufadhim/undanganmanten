import {ACTIVE_TEMPLATES,THEME_CATEGORIES} from './templateRegistry.js';
import {TEMPLATE_SETTINGS} from './templateSettings.generated.js';
export const THEME_CATALOG=ACTIVE_TEMPLATES;
export {THEME_CATEGORIES};
// Compatibility names for existing callers; palette definitions live in the registry.
export const GARDEN_DEFAULT_SETTINGS=TEMPLATE_SETTINGS['garden-canvas'];
export const SEKAR_DEFAULT_SETTINGS=TEMPLATE_SETTINGS['sekar-jawa'];
export const PRAMAYA_DEFAULT_SETTINGS=TEMPLATE_SETTINGS.pramaya;
export const RIVIERA_DEFAULT_SETTINGS=TEMPLATE_SETTINGS.riviera;
export const WASESA_DEFAULT_SETTINGS=TEMPLATE_SETTINGS.wasesa;
export const LUDORA_DEFAULT_SETTINGS=TEMPLATE_SETTINGS.ludora;
