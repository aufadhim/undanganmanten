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

test('Seraya memiliki preset editorial lengkap', () => {
    const seraya = getPresetById('seraya');

    assert.ok(seraya);
    assert.equal(seraya.settings.background.primary, '#F4F1EA');
    assert.equal(seraya.settings.bodyText.primary, '#0A0A0A');
    assert.equal(seraya.settings.button.primary, '#111111');
    assert.equal(seraya.settings.typography.fontHeading, 'Abril Fatface');
});

test('Nawasena memiliki preset taman Jawa animatif', () => {
    const nawasena = getPresetById('nawasena');

    assert.ok(nawasena);
    assert.equal(nawasena.settings.background.primary, '#F4EDDF');
    assert.equal(nawasena.settings.bodyText.primary, '#741D2B');
    assert.equal(nawasena.settings.button.primary, '#A4894E');
    assert.equal(nawasena.settings.animationType, 'petals');
});




test('preset yang tidak dikenal tidak menghasilkan pengaturan tema', () => {
    assert.equal(getPresetById('tidak-ada'), null);
});

test('Garden Canvas terdaftar dengan kamera dan palet cat air', () => {
 const preset=getPresetById('garden-canvas');
 assert.ok(preset);
 assert.equal(preset.settings.openingAnimation,'camera-push');
 assert.equal(preset.settings.bodyText.primary,'#40553c');
});
