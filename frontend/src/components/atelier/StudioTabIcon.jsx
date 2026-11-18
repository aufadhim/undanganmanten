const studioIcons = {
    preview: 'studio-preview', account: 'dashboard-profile', cover: 'cover', wishes: 'studio-story', desain: 'hero', konten: 'cerita', tema: 'studio-palette', visual: 'studio-music',
    warna: 'studio-drop', typography: 'studio-type', susunan: 'studio-stack',
    kutipan: 'janji', profil: 'wanita', saveDate: 'countdown', acara: 'akad',
    galeri: 'galeri', rundown: 'rundown', cerita: 'studio-story', dresscode: 'dresscode',
    livestream: 'livestream', igfilter: 'filter', rsvp: 'rsvp', hadiah: 'gift', penutup: 'penutup',
};

export default function StudioTabIcon({ tab }) {
    return <svg className="studio-tab-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <use href={'/templates/shared/dock-watercolor.svg?v=studio-tabs-2#' + studioIcons[tab]} />
    </svg>;
}

