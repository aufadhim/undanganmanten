import test from 'node:test';
import assert from 'node:assert/strict';
import {updateThemeSettingsSchema} from '../src/utils/validators.js';
test('section typography survives validation without changing unrelated sections',()=>{
 const typography={sections:{quote:{bodyScale:.8,metricsMode:'custom'},bride:{headingScale:1.3,metricsMode:'custom'}}};
 assert.deepEqual(updateThemeSettingsSchema.parse({typography}).typography,typography);
 assert.equal(updateThemeSettingsSchema.safeParse({typography:{sections:{quote:{bodyScale:9}}}}).success,false);
 assert.equal(updateThemeSettingsSchema.safeParse({typography:{sections:{unknown:{bodyScale:1}}}}).success,false);
});
