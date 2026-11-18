export const DUMMY_MAIN_STORY = 'Kami bertemu pada sebuah sore yang sederhana, tanpa pernah menduga percakapan singkat itu akan menjadi awal perjalanan panjang. Waktu membawa kami tumbuh bersama, hingga akhirnya kami memilih melanjutkan kisah ini dalam satu janji dan satu kehidupan.';

export const DUMMY_TIMELINE_STORIES = [
  {
    id: 'dummy-story-first-meet',
    date: '2022-06-01',
    title: 'Pertemuan Pertama',
    description: 'Sebuah pertemuan sederhana membuka percakapan yang kemudian selalu ingin kami lanjutkan.',
  },
  {
    id: 'dummy-story-growing-together',
    date: '2024-02-01',
    title: 'Satu Langkah Lebih Dekat',
    description: 'Dari percakapan sederhana, kami mulai saling mengenal keluarga, impian, dan hal-hal kecil yang membuat kami merasa pulang.',
  },
  {
    id: 'dummy-story-proposal',
    date: '2025-09-14',
    title: 'Hari Kami Memilih',
    description: 'Di hadapan keluarga, kami mengikat niat dan memilih untuk menapaki masa depan dengan langkah yang sama.',
  },
  {
    id: 'dummy-story-forever',
    date: '2026-12-01',
    title: 'Menuju Selamanya',
    description: 'Kini kami memilih satu sama lain untuk melanjutkan perjalanan dalam cinta, doa, dan sebuah rumah yang sama.',
  },
];

export function resolvePreviewStory(mainStory, timeline, editorPreview, timelineEnabled) {
  const savedTimeline = Array.isArray(timeline) ? timeline : [];
  if (typeof timelineEnabled === 'boolean') return {mainStory: timelineEnabled ? '' : (mainStory || ''), timeline: timelineEnabled ? savedTimeline : []};
  const hasSavedStory = Boolean(mainStory || savedTimeline.length);

  return {
    mainStory: hasSavedStory ? (mainStory || '') : (editorPreview ? DUMMY_MAIN_STORY : ''),
    timeline: hasSavedStory ? savedTimeline : (editorPreview ? DUMMY_TIMELINE_STORIES : []),
  };
}
