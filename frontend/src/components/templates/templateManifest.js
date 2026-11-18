import {ACTIVE_TEMPLATES} from '../../config/templateRegistry.js';
export const REQUIRED_TEMPLATE_FEATURES = [
  'cover',
  'quote',
  'profile',
  'events',
  'countdown',
  'gallery',
  'video',
  'story',
  'dresscode',
  'rundown',
  'livestream',
  'rsvp',
  'gift',
  'wishes',
  'footer',
  'music',
];

export const TEMPLATE_MANIFEST=ACTIVE_TEMPLATES.filter(t=>t.collection==='Signature').map(t=>({id:t.id,name:t.name,rootClass:t.rootClass,component:`${t.folder}/${t.component}`,stylesheet:t.engine?null:`${t.folder}/${t.id}.css`,features:[...REQUIRED_TEMPLATE_FEATURES],engine:t.engine}));
