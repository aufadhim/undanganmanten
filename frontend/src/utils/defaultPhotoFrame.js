import {ACTIVE_TEMPLATES,getTemplate} from '../config/templateRegistry.js';
export const DEFAULT_PHOTO_FRAMES=Object.fromEntries(ACTIVE_TEMPLATES.flatMap(t=>[[t.id,t.photoFrame],...(t.aliases||[]).map(a=>[a,t.photoFrame])]));
export function defaultPhotoFrame(themeId){const name=getTemplate(themeId)?.photoFrame;return name?`/assets/photo-frames/${name}.svg?v=relief-1`:''}
