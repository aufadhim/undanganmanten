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
import { resolveSandboxGallery } from '../src/utils/sandboxMigration.js';
import {THEME_CATALOG} from '../src/config/themeCatalog.js';
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

async function readTemplateImplementation(entry) {
  const paths = [entry.component, ...(entry.implementationSources || [])];
  return (await Promise.all(paths.map((source) => readFile(path.join(templateRoot, source), 'utf8')))).join('\n');
}

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
    ['eternal', 'seraya', 'nawasena'],
    'Katalog publik hanya boleh berisi template yang sudah siap',
  );
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
    const source = await readTemplateImplementation(entry);

    for (const feature of REQUIRED_TEMPLATE_FEATURES) {
      assert.match(source, featureSignals[feature], `${entry.name}: implementasi ${feature} belum terdeteksi`);
    }
  }
});

test('template lama tetap dapat dirender, katalog baru terhubung ke panel dan preset', async () => {
  const files = await Promise.all([
    'src/components/PhonePreview.jsx',
    'src/components/TemaPanel.jsx',
    'src/components/SandboxTemaPanel.jsx',
    'src/components/WarnaPanel.jsx',
    'src/components/SandboxWarnaPanel.jsx',
    '../backend/src/utils/themePresets.js',
  ].map((relativePath) => readFile(path.resolve(frontendRoot, relativePath), 'utf8')));

  for(const theme of THEME_CATALOG){assert.ok(files[0].includes(theme.id));assert.ok(files[5].includes(theme.id));}
  for (const entry of TEMPLATE_MANIFEST) {
    files.forEach((source, index) => {
      if(index===1||index===2){assert.match(source,/THEME_CATALOG/);return;}
      assert.ok(source.includes(entry.id), `${entry.name}: integrasi hilang pada berkas ke-${index + 1}`);
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
  assert.doesNotMatch(phonePreview, /AtelierTemplate|ATELIER_THEME_IDS/);
  hiddenIds.forEach((id) => {
    assert.ok(!TEMPLATE_MANIFEST.some((entry) => entry.id === id), `${id}: masih tampil di manifest publik`);
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
  assert.equal(normalizeActiveThemeId('celluloid'), 'eternal');
  assert.equal(normalizeActiveThemeId('nocturne'), 'eternal');
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

test('seluruh template memakai galeri standar dan metadata jumlah legacy tetap stabil', async () => {
  for (const entry of TEMPLATE_MANIFEST) {
    const source = await readTemplateImplementation(entry);
    assert.match(source, /<StandardGallery/, `${entry.name}: galeri belum memakai komponen standar`);
    assert.match(source, /layout=\{theme.galleryLayout/, `${entry.name}: pilihan layout belum tersambung`);
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
    const source = await readTemplateImplementation(entry);
    assert.match(source, /previewFeatureEnabled/, `${entry.name}: toggle preview kosong belum memiliki fallback`);
    assert.match(source, /previewGift/, `${entry.name}: informasi hadiah kosong belum memiliki fallback`);
  }

  const publicForms = await readFile(path.join(frontendRoot, 'src/components/PublicForms.jsx'), 'utf8');
  assert.match(publicForms, /DUMMY_WISHES/, 'Ucapan kosong belum memiliki fallback preview');

  const eternal = await readFile(path.join(templateRoot, 'eternal/EternalTemplate.jsx'), 'utf8');
  assert.match(eternal, /DEFAULT_LAYOUT\.filter/, 'Eternal belum menambahkan section baru ke layout undangan lama');
});






test('kutipan kosong dari database tidak menjatuhkan template', () => {
  const fallback=resolveInvitationQuote();
  for(const value of [null,undefined,false,'',[],{customText:{invalid:true}},{customSource:{invalid:true}}]){
    assert.deepEqual(resolveInvitationQuote(value),fallback);
  }
  assert.deepEqual(resolveInvitationQuote({customText:'Janji kami',customSource:'Keluarga'}),{text:'Janji kami',source:'Keluarga'});
});
