import {calibrateTemplate} from './lib/calibrate-painted-scale.mjs';
const id=process.argv[2];if(!id)throw Error('Usage: node tools/calibrate-painted-scale.mjs <template-id>');
await calibrateTemplate(id);
