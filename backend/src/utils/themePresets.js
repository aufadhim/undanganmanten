import {ACTIVE_TEMPLATES} from '../config/templateRegistry.generated.js';
import {TEMPLATE_SETTINGS} from '../config/templateSettings.generated.js';
export const THEME_PRESETS=ACTIVE_TEMPLATES.map(t=>({id:t.id,name:t.name,category:t.category,engine:t.engine,previewImg:t.previewImg,previewColor:TEMPLATE_SETTINGS[t.id].button.primary,settings:structuredClone(TEMPLATE_SETTINGS[t.id])}));
const byId=new Map(THEME_PRESETS.map(t=>[t.id,t]));
export function getPresetById(id){return byId.get(id)||null}
