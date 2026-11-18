window.InvitationMusicReady = (async () => {
    const { createMusicController, MUSIC_BUTTON_MARKUP } = await import('/templates/shared/music-controller.js?v=18');
    const audio = document.getElementById('wedding-music'), button = document.getElementById('music-toggle'), status = document.getElementById('music-status');
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = '/templates/shared/music-control.css'; document.head.append(link);
    button.className = 'floating-music-btn music-control'; button.innerHTML = MUSIC_BUTTON_MARKUP; button.style.setProperty('--music-color', window.InvitationConfig.style.accent); button.style.setProperty('--music-ink', '#fff9ee'); button.style.setProperty('--music-bottom', '15px');
    const music = createMusicController(audio, { pauseOnBlur: false, volume: window.InvitationConfig.style.musicVolume, onChange: s => { button.hidden = !s.visible; button.classList.toggle('is-playing', s.playing); button.setAttribute('aria-pressed', String(s.playing)); button.setAttribute('aria-label', s.playing ? 'Jeda musik latar' : 'Putar musik latar'); button.title = s.playing ? 'Jeda musik' : 'Putar musik'; status.textContent = s.error; status.hidden = !s.error; } });
    window.GardenMusic = music; document.getElementById('open').addEventListener('click', () => music.open(), { capture: true }); button.addEventListener('click', () => music.toggle()); addEventListener('invitation:closed', () => music.close());
})();
