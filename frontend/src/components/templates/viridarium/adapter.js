// Compatibility export. Shared payload mapping belongs to the engine.
import defaults from './defaultConfig.json';
import {createGardenPayload as createPayload} from '../engines/shared/adapter.js';
export function createGardenPayload(invitation,guest,preview,scenePack=defaults){return createPayload(invitation,guest,preview,scenePack)}
