import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTemplateCovers } from '../src/config/templateCover.js';

test('cover bawaan selalu mengabaikan URL upload lama', () => {
  assert.deepEqual(
    resolveTemplateCovers(
      { coverType: 'default', coverImageUrl: '/uploads/old-opening.jpg', coverSecondImageUrl: '/uploads/old-main.jpg' },
      { opening: '/assets/default-opening.webp', main: '/assets/default-main.webp' },
    ),
    { opening: '', main: '', openingIsArtwork: true, mainIsArtwork: true },
  );
});

test('cover custom yang belum lengkap tetap mendapat fallback bawaan', () => {
  assert.deepEqual(
    resolveTemplateCovers(
      { coverType: 'custom', coverImageUrl: ' ', coverSecondImageUrl: 'undefined' },
      { opening: '/assets/default-opening.webp', main: '/assets/default-main.webp' },
    ),
    { opening: '/assets/default-opening.webp', main: '/assets/default-main.webp', openingIsArtwork: false, mainIsArtwork: false },
  );
});

test('cover utama mengikuti cover pertama bila user hanya mengunggah satu gambar', () => {
  assert.deepEqual(
    resolveTemplateCovers(
      { coverType: 'custom', coverImageUrl: '/uploads/custom.jpg' },
      { opening: '/assets/default-opening.webp', main: '/assets/default-main.webp' },
    ),
    { opening: '/uploads/custom.jpg', main: '/uploads/custom.jpg', openingIsArtwork: false, mainIsArtwork: false },
  );
});

test('tanpa upload dan tanpa foto profil menghasilkan artwork tanpa wajah', () => {
  assert.deepEqual(
    resolveTemplateCovers({ coverType: 'default' }),
    { opening: '', main: '', openingIsArtwork: true, mainIsArtwork: true },
  );
});

test('custom cover utama mempertahankan cover sampul bawaan template', () => {
  assert.deepEqual(
    resolveTemplateCovers(
      { coverType: 'custom-main', coverImageUrl: '/uploads/ignored-opening.jpg', coverSecondImageUrl: '/uploads/main.jpg' },
      { opening: '/assets/default-opening.webp', main: '/assets/default-main.webp' },
    ),
    { opening: '', main: '/uploads/main.jpg', openingIsArtwork: true, mainIsArtwork: false },
  );
});

test('custom cover sampul mempertahankan cover utama bawaan template', () => {
  assert.deepEqual(
    resolveTemplateCovers(
      { coverType: 'custom-opening', coverImageUrl: '/uploads/opening.jpg', coverSecondImageUrl: '/uploads/ignored-main.jpg' },
      { opening: '/assets/default-opening.webp', main: '/assets/default-main.webp' },
    ),
    { opening: '/uploads/opening.jpg', main: '', openingIsArtwork: false, mainIsArtwork: true },
  );
});

test('URL dummy lama tidak pernah dianggap sebagai cover custom', () => {
  assert.deepEqual(
    resolveTemplateCovers(
      { coverType: 'custom', coverImageUrl: '/assets/gallery/dummy-gallery-01.webp', coverSecondImageUrl: '/assets/isvara/thumb-md-old.jpg' },
    ),
    { opening: '', main: '', openingIsArtwork: true, mainIsArtwork: true },
  );
});
