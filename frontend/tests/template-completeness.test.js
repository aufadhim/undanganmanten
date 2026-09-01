import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { REQUIRED_TEMPLATE_FEATURES, TEMPLATE_MANIFEST } from '../src/components/templates/templateManifest.js';
import { resolveInvitationQuote } from '../src/config/quotePresets.js';
import { mergePreviewOverride } from '../src/utils/mergePreviewOverride.js';
import { galleryCountClasses } from '../src/components/templates/shared/galleryLayout.js';
import { DUMMY_TIMELINE_STORIES, resolvePreviewStory } from '../src/config/dummyStory.js';
import { ATELIER_BLUEPRINTS } from '../src/components/templates/atelier/atelierBlueprints.js';
import { resolveSandboxGallery } from '../src/utils/sandboxMigration.js';
import { normalizeActiveThemeId } from '../src/utils/activeTheme.js';
import {
  DUMMY_EVENTS,
  DUMMY_GIFT,
  DUMMY_RUNDOWNS,
  DUMMY_WISHES,
  previewFeatureEnabled,
  previewGift,
  previewList,
} from '../src/config/dummyPreviewData.js';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateRoot = path.join(frontendRoot, 'src/components/templates');

const featureSignals = {
  cover: /opened|opening|cover/i,
  quote: /quoteSettings|blockquote/i,
  profile: /brideName[\s\S]*groomName/i,
  events: /invitation\??\.events/,
  countdown: /useCountdown/,
  gallery: /galleryMedia/,
  video: /CenteredVideoPlayer|youtube\.com\/embed/,
  story: /timelineStories|mainStory/,
  dresscode: /dresscode/i,
  rundown: /rundowns/i,
  livestream: /livestream/i,
  rsvp: /formType=["']rsvp["']/,
  gift: /GiftSection/,
  wishes: /formType=["']wishes["']/,
  footer: /<footer/i,
  music: /FloatingMultimedia/,
};

test('ID, folder, root selector, dan templateStyle setiap template konsisten', async () => {
  assert.deepEqual(
    TEMPLATE_MANIFEST.map(({ id }) => id),
    ['eternal', 'seraya', 'nawasena', 'isvara', 'lanqing', 'celluloid', 'nocturne'],
    'Katalog publik hanya boleh berisi template yang sudah siap',
  );
  const celluloid = TEMPLATE_MANIFEST.find(({ id }) => id === 'celluloid');
  assert.equal(celluloid.component, 'celluloid/CelluloidTemplate.jsx');
  assert.equal(celluloid.stylesheet, 'celluloid/celluloid.css');
  assert.equal(celluloid.sharedEngine, undefined, 'Celluloid harus menjadi template mandiri');

  assert.equal(new Set(TEMPLATE_MANIFEST.map(({ id }) => id)).size, TEMPLATE_MANIFEST.length);

  for (const entry of TEMPLATE_MANIFEST) {
    const component = await readFile(path.join(templateRoot, entry.component), 'utf8');
    const stylesheet = await readFile(path.join(templateRoot, entry.stylesheet), 'utf8');

    assert.ok(entry.sharedEngine ? component.includes('atelier-${themeId}') : component.includes(entry.rootClass), `${entry.name}: root class belum sesuai manifest`);
    assert.match(stylesheet, new RegExp(`\\.${entry.rootClass}(?:\\s|\\{|,)`), `${entry.name}: CSS root belum terisolasi`);
    assert.match(component, entry.sharedEngine ? /templateStyle=\{themeId\}/ : new RegExp(`templateStyle=["']${entry.id}["']`), `${entry.name}: form publik memakai templateStyle yang salah`);
  }
});

test('seluruh template memenuhi fitur bisnis wajib tanpa menyeragamkan desain', async () => {
  for (const entry of TEMPLATE_MANIFEST) {
    assert.deepEqual(entry.features, REQUIRED_TEMPLATE_FEATURES, `${entry.name}: deklarasi fitur belum lengkap`);
    const source = await readFile(path.join(templateRoot, entry.component), 'utf8');

    for (const feature of REQUIRED_TEMPLATE_FEATURES) {
      assert.match(source, featureSignals[feature], `${entry.name}: implementasi ${feature} belum terdeteksi`);
    }
  }
});

test('semua template terhubung ke preview, katalog, Mode Coba, warna, dan preset backend', async () => {
  const files = await Promise.all([
    'src/components/PhonePreview.jsx',
    'src/components/TemaPanel.jsx',
    'src/components/SandboxTemaPanel.jsx',
    'src/components/WarnaPanel.jsx',
    'src/components/SandboxWarnaPanel.jsx',
    '../backend/src/utils/themePresets.js',
  ].map((relativePath) => readFile(path.resolve(frontendRoot, relativePath), 'utf8')));

  const atelierConfig = await readFile(path.join(templateRoot, 'atelier/atelierThemes.js'), 'utf8');
  for (const entry of TEMPLATE_MANIFEST) {
    files.forEach((source, index) => {
      assert.ok(source.includes(entry.id) || (entry.sharedEngine && source.includes('ATELIER_') && atelierConfig.includes(entry.id)), `${entry.name}: integrasi hilang pada berkas ke-${index + 1}`);
    });
  }
});

test('katalog dan preview tidak mengekspos template yang masih dikembangkan', async () => {
  const hiddenIds = ['daguerre', 'kodachrome', 'maison', 'gatsby', 'bauhaus', 'helvetica', 'monolith', 'vellum', 'hanami', 'hanji', 'zellige', 'mughal', 'safavid', 'songket', 'ulos', 'puspa-sunda', 'taksu', 'samudra', 'astralis', 'herbarium', 'storybook', 'cathedral', 'chrome'];
  const [themePanel, sandboxPanel, sandboxDashboard, dashboard, phonePreview] = await Promise.all([
    'src/components/TemaPanel.jsx',
    'src/components/SandboxTemaPanel.jsx',
    'src/pages/SandboxDashboard.jsx',
    'src/pages/Dashboard.jsx',
    'src/components/PhonePreview.jsx',
  ].map((relativePath) => readFile(path.resolve(frontendRoot, relativePath), 'utf8')));

  assert.doesNotMatch(themePanel, /ATELIER_CATALOG/);
  assert.doesNotMatch(sandboxPanel, /ATELIER_CATALOG/);
  assert.doesNotMatch(sandboxDashboard, /ATELIER_THEME_IDS/);
  assert.doesNotMatch(dashboard, /ATELIER_THEME_IDS/);
  assert.match(dashboard, /themeId: normalizeActiveThemeId\(rawInvitation\.themeId\)/);
  [sandboxDashboard, dashboard].forEach((source) => {
    TEMPLATE_MANIFEST.forEach(({ id }) => assert.ok(source.includes(`'${id}'`), `${id}: hilang dari allowlist runtime`));
    hiddenIds.forEach((id) => assert.ok(!source.includes(`'${id}'`), `${id}: masih diterima runtime`));
  });
  assert.match(phonePreview, /celluloid\/CelluloidTemplate\.jsx/);
  assert.doesNotMatch(phonePreview, /AtelierTemplate|ATELIER_THEME_IDS/);
  hiddenIds.forEach((id) => {
    assert.ok(!TEMPLATE_MANIFEST.some((entry) => entry.id === id), `${id}: masih tampil di manifest publik`);
  });
});

test('Celluloid tidak membawa implementasi atau selector template development', async () => {
  const [component, stylesheet] = await Promise.all([
    'src/components/templates/celluloid/CelluloidTemplate.jsx',
    'src/components/templates/celluloid/celluloid.css',
  ].map((relativePath) => readFile(path.resolve(frontendRoot, relativePath), 'utf8')));
  const hiddenIds = ['daguerre', 'kodachrome', 'maison', 'gatsby', 'bauhaus', 'helvetica', 'monolith', 'vellum', 'hanami', 'hanji', 'zellige', 'mughal', 'safavid', 'songket', 'ulos', 'puspa-sunda', 'taksu', 'samudra', 'astralis', 'herbarium', 'storybook', 'cathedral', 'chrome'];

  hiddenIds.forEach((id) => {
    assert.ok(!component.includes(id), `Celluloid masih membawa cabang ${id}`);
    assert.ok(!stylesheet.includes(`.atelier-${id}`), `Celluloid masih membawa selector ${id}`);
  });
});

test('migrasi sandbox hanya mengisi galeri yang benar-benar kosong', () => {
  const fallback = [{ id: 'dummy', type: 'photo', url: '/dummy.webp' }];
  const videoOnly = [{ id: 'video-user', type: 'video', url: '/user.mp4' }];
  const unsplashUser = [{ id: 'foto-user', type: 'photo', url: 'https://images.unsplash.com/photo-user' }];

  assert.deepEqual(resolveSandboxGallery([], fallback), fallback);
  assert.deepEqual(resolveSandboxGallery(videoOnly, fallback), videoOnly);
  assert.deepEqual(resolveSandboxGallery(unsplashUser, fallback), unsplashUser);
});

test('theme ID dari backend dinormalisasi ke template aktif', () => {
  assert.equal(normalizeActiveThemeId('celluloid'), 'celluloid');
  assert.equal(normalizeActiveThemeId('nocturne'), 'nocturne');
  assert.equal(normalizeActiveThemeId('daguerre'), 'eternal');
  assert.equal(normalizeActiveThemeId(undefined), 'eternal');
});

test('fallback kutipan selalu berasal dari katalog resmi', () => {
  assert.equal(resolveInvitationQuote({ religion: 'islam' }).source, 'QS. Ar-Rum: 21');
  assert.equal(resolveInvitationQuote({ religion: 'kristen' }).source, 'Kejadian 2:24');
  assert.equal(resolveInvitationQuote({ religion: 'katolik' }).source, 'Matius 19:6');
  assert.equal(resolveInvitationQuote({ religion: 'tidak-dikenal' }).source, 'QS. Ar-Rum: 21');
});

test('live preview menggabungkan nested settings tanpa menghilangkan data lain', () => {
  const invitation = { themeSettings: { background: { primary: '#fff' }, typography: { fontBody: 'Montserrat' } }, quoteSettings: { enabled: true, religion: 'islam' } };
  const preview = mergePreviewOverride(invitation, { quoteSettings: { religion: 'kristen', customText: 'Kutipan' } });
  assert.equal(preview.quoteSettings.enabled, true);
  assert.equal(preview.quoteSettings.religion, 'kristen');
  assert.equal(preview.themeSettings.typography.fontBody, 'Montserrat');
});

test('seluruh template menandai jumlah galeri dinamis dan variasi 1–20 foto stabil', async () => {
  for (const entry of TEMPLATE_MANIFEST) {
    const source = await readFile(path.join(templateRoot, entry.component), 'utf8');
    const stylesheet = await readFile(path.join(templateRoot, entry.stylesheet), 'utf8');
    assert.match(source, /galleryCountClasses\([^)]*\.length\)/, `${entry.name}: galeri belum memakai metadata jumlah foto`);
    assert.match(stylesheet, /gallery-count-odd/, `${entry.name}: penutup galeri ganjil belum diatur`);
    assert.match(stylesheet, /gallery-mod(?:6|7|8)-/, `${entry.name}: kelompok galeri parsial belum diatur`);
  }

  for (let count = 1; count <= 20; count += 1) {
    const classes = galleryCountClasses(count).split(' ');
    assert.ok(classes.includes(`gallery-count-${count}`), `kelas jumlah ${count} tidak tersedia`);
    assert.ok(classes.includes(count % 2 ? 'gallery-count-odd' : 'gallery-count-even'), `paritas ${count} salah`);
    for (const cycle of [3, 4, 6, 7, 8]) {
      assert.ok(classes.includes(`gallery-mod${cycle}-${count % cycle}`), `sisa siklus ${cycle} untuk ${count} salah`);
    }
  }
});

test('dummy Love Story hanya mengisi preview kosong dan tidak mencampuri cerita user', () => {
  const emptyPreview = resolvePreviewStory('', [], true);
  assert.ok(emptyPreview.mainStory);
  assert.equal(emptyPreview.timeline.length, DUMMY_TIMELINE_STORIES.length);

  const emptyPublic = resolvePreviewStory('', [], false);
  assert.equal(emptyPublic.mainStory, '');
  assert.deepEqual(emptyPublic.timeline, []);

  const savedTimeline = [{ id: 'saved', title: 'Cerita Asli' }];
  const saved = resolvePreviewStory('', savedTimeline, true);
  assert.equal(saved.mainStory, '');
  assert.deepEqual(saved.timeline, savedTimeline);
});

test('dummy section hanya mengisi editor kosong dan tidak menimpa data maupun toggle user', () => {
  assert.equal(previewFeatureEnabled(undefined, true), true);
  assert.equal(previewFeatureEnabled(false, true), false);
  assert.equal(previewFeatureEnabled(undefined, false), false);

  const savedEvents = [{ id: 'saved-event', type: 'Acara User' }];
  assert.deepEqual(previewList(savedEvents, DUMMY_EVENTS, true), savedEvents);
  assert.deepEqual(previewList([], DUMMY_EVENTS, true), DUMMY_EVENTS);
  assert.deepEqual(previewList([], DUMMY_EVENTS, false), []);

  const savedGift = { bankAccounts: [{ bankName: 'Bank User', accountNumber: '1' }] };
  assert.deepEqual(previewGift(savedGift, true), savedGift);
  assert.deepEqual(previewGift({}, true), DUMMY_GIFT);
  assert.deepEqual(previewGift({}, false), {});

  assert.ok(DUMMY_EVENTS.length >= 2);
  assert.ok(DUMMY_RUNDOWNS.length >= 3);
  assert.ok(DUMMY_WISHES.length >= 3);
  assert.ok(DUMMY_WISHES.every((wish) => wish.senderName && wish.message));
  assert.equal(DUMMY_GIFT.type, 'both');
});

test('seluruh template memakai resolver dummy preview bersama', async () => {
  for (const entry of TEMPLATE_MANIFEST) {
    const source = await readFile(path.join(templateRoot, entry.component), 'utf8');
    assert.match(source, /previewFeatureEnabled/, `${entry.name}: toggle preview kosong belum memiliki fallback`);
    assert.match(source, /previewGift/, `${entry.name}: informasi hadiah kosong belum memiliki fallback`);
  }

  const publicForms = await readFile(path.join(frontendRoot, 'src/components/PublicForms.jsx'), 'utf8');
  assert.match(publicForms, /DUMMY_WISHES/, 'Ucapan kosong belum memiliki fallback preview');

  const eternal = await readFile(path.join(templateRoot, 'eternal/EternalTemplate.jsx'), 'utf8');
  assert.match(eternal, /DEFAULT_LAYOUT\.filter/, 'Eternal belum menambahkan section baru ke layout undangan lama');
});

test('24 template rebuild memiliki blueprint dan anatomi section visual yang unik', async () => {
  const entries = Object.entries(ATELIER_BLUEPRINTS);
  assert.equal(entries.length, 25, 'Matriks Atelier harus mencakup seluruh koleksi termasuk Celluloid');

  const signatures = entries.map(([id, blueprint]) => {
    const required = ['cover', 'quote', 'couple', 'events', 'gallery', 'video', 'story', 'rundown', 'dresscode', 'forms', 'closing'];
    required.forEach((key) => assert.ok(blueprint[key], `${id}: blueprint ${key} belum ditetapkan`));
    return JSON.stringify(blueprint);
  });
  assert.equal(new Set(signatures).size, signatures.length, 'Tidak boleh ada dua template dengan blueprint section identik');

  const css = await readFile(path.join(templateRoot, 'atelier/atelier.css'), 'utf8');
  const rebuiltIds = entries.map(([id]) => id).filter((id) => id !== 'celluloid');
  const requiredSelectors = ['at-intro', 'at-couple', 'at-story-book', 'at-gallery', 'at-video', 'at-events', 'at-rundown', 'at-form', 'at-footer'];
  rebuiltIds.forEach((id) => requiredSelectors.forEach((section) => {
    assert.ok(css.includes(`.atelier-${id} .${section}`), `${id}: anatomi ${section} masih mewarisi layout generik`);
  }));
});
