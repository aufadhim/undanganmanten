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

test('Isvara memiliki preset editorial sage', () => {
    const isvara = getPresetById('isvara');
    assert.ok(isvara);
    assert.equal(isvara.settings.background.primary, '#F3F0E8');
    assert.equal(isvara.settings.bodyText.primary, '#465440');
    assert.equal(isvara.settings.button.primary, '#78846C');
    assert.equal(isvara.settings.animationType, 'petals');
});

test('Lanqing memiliki preset Chinese lacquer merah', () => {
    const lanqing = getPresetById('lanqing');
    assert.ok(lanqing);
    assert.equal(lanqing.settings.background.primary, '#F6EBDD');
    assert.equal(lanqing.settings.bodyText.primary, '#8D1B24');
    assert.equal(lanqing.settings.button.primary, '#A8232D');
});

test('Nocturne memiliki preset black-tie cinematic mandiri', () => {
    const nocturne = getPresetById('nocturne');
    assert.ok(nocturne);
    assert.equal(nocturne.settings.background.primary, '#08090B');
    assert.equal(nocturne.settings.bodyText.primary, '#751C30');
    assert.equal(nocturne.settings.button.primary, '#C5A46A');
    assert.equal(nocturne.settings.typography.fontHeading, 'Bodoni Moda');
    assert.equal(nocturne.settings.animationType, 'cinematic');
});

test('preset yang tidak dikenal tidak menghasilkan pengaturan tema', () => {
    assert.equal(getPresetById('tidak-ada'), null);
});
