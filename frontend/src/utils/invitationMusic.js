export const DEFAULT_INVITATION_MUSIC = '/assets/music/demo.mp3';

export function verifyPlayableAudio(src) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const finish = (error) => {
      clearTimeout(timeout);
      audio.oncanplay = null;
      audio.onerror = null;
      audio.removeAttribute('src');
      audio.load();
      if (error) reject(error);
      else resolve();
    };
    const timeout = setTimeout(() => finish(new Error('Audio belum bisa dimuat. Coba lagi atau pilih file MP3 lain.')), 15000);
    audio.oncanplay = () => finish(Number.isFinite(audio.duration) && audio.duration > 0
      ? null : new Error('Durasi audio tidak terbaca. Pilih file MP3 lain.'));
    audio.onerror = () => finish(new Error('Audio tidak bisa diputar. Pilih file MP3 yang valid.'));
    audio.preload = 'auto';
    audio.src = src;
  });
}
