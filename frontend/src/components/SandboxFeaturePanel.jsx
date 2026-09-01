import GalleryLayoutPicker from './GalleryLayoutPicker.jsx';
import { DUMMY_GALLERY_PHOTOS, DUMMY_GALLERY_VIDEO } from '../config/dummyAssets.js';

const BLOCKS = [
  ['storyEnabled', 'Cerita Cinta'], ['timelineEnabled', 'Timeline'], ['dresscodeEnabled', 'Dresscode'],
  ['livestreamEnabled', 'Live Streaming'], ['rsvpEnabled', 'RSVP'], ['giftEnabled', 'Informasi Hadiah'],
  ['wishesEnabled', 'Ucapan & Doa'], ['animationEnabled', 'Animasi Visual'],
];

export default function SandboxFeaturePanel({ type, invitation, onUpdated, onLivePreview }) {
  const update = (patch) => {
    const next = {
      ...invitation,
      ...patch,
      themeSettings: { ...invitation.themeSettings, ...(patch.themeSettings || {}) },
      invitationFeatures: { ...invitation.invitationFeatures, ...(patch.invitationFeatures || {}) },
    };
    onUpdated(next);
    onLivePreview?.(null);
  };
  const theme = invitation.themeSettings || {};
  const event = invitation.events?.[0] || {};

  if (type === 'typography') return <Panel title="Typography" subtitle="Coba kombinasi font dan lihat hasilnya langsung.">
    <Field label="Font Judul"><select value={theme.typography?.fontHeading || 'Cormorant Garamond'} onChange={(e) => update({ themeSettings: { typography: { ...theme.typography, fontHeading: e.target.value } } })}><option>Cormorant Garamond</option><option>Playfair Display</option><option>Bodoni Moda</option><option>DM Serif Display</option></select></Field>
    <Field label="Font Isi"><select value={theme.typography?.fontBody || 'Montserrat'} onChange={(e) => update({ themeSettings: { typography: { ...theme.typography, fontBody: e.target.value } } })}><option>Montserrat</option><option>Manrope</option><option>Inter</option><option>Lora</option></select></Field>
  </Panel>;

  if (type === 'visual') return <Panel title="Musik & Visual" subtitle="Coba musik latar, animasi jatuh, dan gaya loading langsung di preview.">
    <Toggle label="Aktifkan Musik Latar" checked={Boolean(invitation.invitationFeatures?.musicEnabled)} onChange={(checked) => update({ invitationFeatures: { musicEnabled: checked } })} />
    {invitation.invitationFeatures?.musicEnabled && <Field label="Tautan Musik (MP3/WAV)"><input type="url" value={theme.musicUrl || ''} placeholder="https://contoh.com/lagu-instrumental.mp3" onChange={(e) => update({ themeSettings: { musicUrl: e.target.value } })} /></Field>}
    <Toggle label="Aktifkan Animasi Visual" checked={Boolean(invitation.invitationFeatures?.animationEnabled)} onChange={(checked) => update({ invitationFeatures: { animationEnabled: checked } })} />
    {invitation.invitationFeatures?.animationEnabled && <Field label="Animasi Jatuh"><select value={theme.animationType || ''} onChange={(e) => update({ themeSettings: { animationType: e.target.value } })}><option value="">Tidak ada</option><option value="snow">Salju</option><option value="leaves">Daun</option><option value="sakura">Sakura</option></select></Field>}
    <Field label="Animasi Loading"><select value={theme.loadingAnimation || 'breathe'} onChange={(e) => update({ themeSettings: { loadingAnimation: e.target.value } })}><option value="breathe">Napas Halus</option><option value="reveal">Reveal Elegan</option><option value="shimmer">Kilau Cahaya</option><option value="spin">Putar Minimal</option></select></Field>
    <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 12, lineHeight: 1.6 }}>Musik baru diputar setelah tombol “Buka Undangan” ditekan karena aturan autoplay browser.</p>
  </Panel>;

  if (type === 'kutipan') return <Panel title="Quote / Doa" subtitle="Teks contoh dapat diganti bebas.">
    <Field label="Teks Quote"><textarea rows="5" value={invitation.quoteSettings?.text || ''} placeholder="Dan di antara tanda-tanda kebesaran-Nya..." onChange={(e) => update({ quoteSettings: { ...(invitation.quoteSettings || {}), enabled: true, text: e.target.value } })} /></Field>
  </Panel>;

  if (type === 'acara') return <Panel title="Informasi Acara & Save The Date" subtitle="Kota pada cover diambil dari bagian terakhir alamat.">
    <Field label="Nama Lokasi"><input value={event.venueName || ''} onChange={(e) => update({ events: [{ ...event, venueName: e.target.value }] })} /></Field>
    <Field label="Alamat Lengkap"><textarea rows="3" value={event.address || ''} onChange={(e) => update({ events: [{ ...event, address: e.target.value }] })} /></Field>
    <Field label="Tanggal"><input type="date" value={String(event.date || '').slice(0,10)} onChange={(e) => update({ events: [{ ...event, date: e.target.value }] })} /></Field>
  </Panel>;

  if (type === 'galeri') return <Panel title="Galeri Foto & Video" subtitle="Pilih layout berdasarkan mini-preview, lalu lihat hasil penuhnya di kanan.">
    <GalleryLayoutPicker value={theme.galleryLayout || 'editorial'} onChange={(galleryLayout) => update({ themeSettings: { galleryLayout }, galleryMedia: [...DUMMY_GALLERY_PHOTOS.map((url, index) => ({ id: `sandbox-photo-${index}`, type: 'photo', url })), { id: 'sandbox-video', type: 'video', url: DUMMY_GALLERY_VIDEO }] })} />
  </Panel>;

  if (type === 'cerita') return <Panel title="Cerita Cinta" subtitle="Coba teks utama dan timeline singkat.">
    <Field label="Our Story"><textarea rows="6" value={theme.mainStory || ''} placeholder="Kami bertemu tanpa rencana..." onChange={(e) => update({ themeSettings: { mainStory: e.target.value } })} /></Field>
  </Panel>;

  if (type === 'rundown') return <Panel title="Rundown" subtitle="Atur gambaran urutan acara yang akan dilihat tamu.">
    <Field label="Agenda Utama"><input value={invitation.rundowns?.[0]?.title || ''} placeholder="Akad Nikah" onChange={(e) => update({ rundowns: [{ ...(invitation.rundowns?.[0] || {}), title: e.target.value, time: invitation.rundowns?.[0]?.time || '08:00' }] })} /></Field>
    <Field label="Waktu"><input type="time" value={invitation.rundowns?.[0]?.time || '08:00'} onChange={(e) => update({ rundowns: [{ ...(invitation.rundowns?.[0] || {}), title: invitation.rundowns?.[0]?.title || 'Akad Nikah', time: e.target.value }] })} /></Field>
  </Panel>;

  if (type === 'dresscode') return <Panel title="Dresscode" subtitle="Coba arahan pakaian dan warna pilihan.">
    <Field label="Arahan Dresscode"><textarea rows="4" value={theme.dresscodeText || ''} placeholder="Earth tone — formal dan nyaman" onChange={(e) => update({ themeSettings: { dresscodeText: e.target.value } })} /></Field>
  </Panel>;

  if (type === 'livestream') return <Panel title="Live Streaming" subtitle="Masukkan link YouTube atau platform streaming.">
    <Field label="URL Streaming"><input type="url" value={invitation.livestreamSettings?.url || ''} placeholder="https://youtube.com/live/..." onChange={(e) => update({ livestreamSettings: { ...(invitation.livestreamSettings || {}), url: e.target.value } })} /></Field>
  </Panel>;

  if (type === 'rsvp') return <Panel title="RSVP" subtitle="Form RSVP pada preview hanya simulasi dan tidak menyimpan data.">
    <Field label="Batas Waktu RSVP"><input type="datetime-local" value={invitation.rsvpDeadline || ''} onChange={(e) => update({ rsvpDeadline: e.target.value, rsvpOpenToPublic: false })} /></Field>
  </Panel>;

  if (type === 'hadiah') return <Panel title="Informasi Hadiah" subtitle="Detail tetap tersembunyi sampai tamu memilih untuk melihatnya.">
    <Field label="Nama Bank"><input value={invitation.giftSettings?.bankName || ''} placeholder="BCA" onChange={(e) => update({ giftSettings: { ...(invitation.giftSettings || {}), type: 'both', bankName: e.target.value } })} /></Field>
    <Field label="Nomor Rekening"><input value={invitation.giftSettings?.accountNumber || ''} placeholder="1234567890" onChange={(e) => update({ giftSettings: { ...(invitation.giftSettings || {}), type: 'both', accountNumber: e.target.value } })} /></Field>
    <Field label="Alamat Bingkisan"><textarea rows="3" value={invitation.giftSettings?.shippingAddress || ''} onChange={(e) => update({ giftSettings: { ...(invitation.giftSettings || {}), type: 'both', shippingAddress: e.target.value } })} /></Field>
  </Panel>;

  if (type === 'susunan') return <Panel title="Susunan & Blok" subtitle="Aktifkan atau sembunyikan bagian undangan. Urutannya mengikuti alur Konten.">
    <div style={{ display: 'grid', gap: 10 }}>{BLOCKS.map(([key, label]) => <label key={key} className="sandbox-block-toggle"><span>{label}</span><span className="switch"><input type="checkbox" checked={invitation.invitationFeatures?.[key] ?? true} onChange={(e) => update({ invitationFeatures: { [key]: e.target.checked } })} /><span className="slider round" /></span></label>)}</div>
  </Panel>;

  if (type === 'penutup') return <Panel title="Penutup" subtitle="Kalimat terakhir yang tampil sebelum informasi tanggal dan lokasi.">
    <Field label="Teks Penutup"><textarea rows="4" value={theme.closingText || ''} placeholder="Awal dari kisah selamanya" onChange={(e) => update({ themeSettings: { closingText: e.target.value } })} /></Field>
  </Panel>;

  return <Panel title="Ucapan & Doa" subtitle="Form pada preview dapat dicoba tanpa menyimpan ucapan ke server."><p style={{ fontSize: 13 }}>Ucapan tidak pantas akan otomatis ditolak pada undangan aktif.</p></Panel>;
}

function Panel({ title, subtitle, children }) {
  return <div className="panel-content"><h2 className="panel-header">{title}</h2><p className="panel-sub">{subtitle}</p><div className="section-block stack">{children}</div><style>{`
    .sandbox-block-toggle{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line,#eee);font-size:13px;font-weight:600}
  `}</style></div>;
}
function Field({ label, children }) {
  return <label style={{ display: 'grid', gap: 7 }}><span className="field-label">{label}</span>{children}</label>;
}

function Toggle({ label, checked, onChange }) {
  return <label className="sandbox-block-toggle"><span>{label}</span><span className="switch"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="slider round" /></span></label>;
}
