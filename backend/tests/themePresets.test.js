import test from 'node:test';
import assert from 'node:assert/strict';
import { getPresetById } from '../src/utils/themePresets.js';

test('Eternal memakai palet clean terang sebagai desain awal', () => {
    const eternal = getPresetById('eternal');

    assert.ok(eternal);
    assert.equal(eternal.settings.background.primary, '#fafaf9');
    assert.equal(eternal.settings.bodyText.primary, '#292524');
    assert.equal(eternal.settings.button.text, '#fafaf9');
});

test('preset yang tidak dikenal tidak menghasilkan pengaturan tema', () => {
    assert.equal(getPresetById('tidak-ada'), null);
});
