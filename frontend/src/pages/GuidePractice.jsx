import { useMemo, useState } from 'react';
import AcaraPanel from '../components/AcaraPanel.jsx';
import BillingPanel from '../components/BillingPanel.jsx';
import TemaPanel from '../components/TemaPanel.jsx';
import ThemeThumbnail from '../components/ThemeThumbnail.jsx';
import { THEME_CATALOG } from '../config/themeCatalog.js';

const themes = THEME_CATALOG.slice(0, 6);
const sample = {
  id: 'guide-practice',
  slug: 'contoh-latihan',
  status: 'draft',
  packageType: 'TRIAL',
  themeId: themes[0].id,
  coupleProfile: { brideName: 'Lita', groomName: 'Dzul' },
  events: [{ type: 'ngunduh_mantu', date: '2027-12-27', startTime: '15:00', endTime: '20:00', venueName: 'Pendopo Melati', address: 'Jl. Melati 10, Yogyakarta' }],
};

function practiceClient() {
  let orders = [];
  const reply = data => Promise.resolve({ data });
  return {
    get(url) {
      switch (url) {
        case '/themes/presets': return reply({ themes });
        case '/payments/availability': return reply({ enabled: true, sandbox: true, methods: ['QRIS2'] });
        case '/payments/orders': return reply({ orders });
        case '/invitations/me/guests': return reply({ entitlements: {} });
        default: return Promise.reject(new Error('Tindakan ini belum tersedia di latihan.'));
      }
    },
    post(url, input) {
      if (url === '/themes/apply-preset') return reply({ invitation: { themeId: input.presetId } });
      if (url === '/payments/checkout') {
        const id = 'LATIHAN-' + (orders.length + 1);
        const amount = (input.packageType === 'PREMIUM' ? 129000 : 99000) + (input.selectedAddons.includes('QR_GUESTBOOK') ? 20000 : 0);
        const tripay = { mode: 'sandbox', method: 'QRIS2', reference: id, qrString: 'Samavaya latihan. Kode ini tidak dapat dibayar.', fee: 0, checkoutUrl: '#' };
        orders = [{ id, midtransOrderId: id, amount, packageType: input.packageType, addons: input.selectedAddons, tripay, createdAt: new Date().toISOString(), status: 'PENDING' }, ...orders];
        return reply({ payment: tripay, amount });
      }
      if (url.startsWith('/payments/orders/') && url.endsWith('/refresh')) {
        const id = url.split('/')[3];
        orders = orders.map(order => order.id === id ? { ...order, status: 'SUCCESS', paidAt: new Date().toISOString() } : order);
        return reply({ status: 'PAID' });
      }
      return Promise.reject(new Error('Tindakan ini belum tersedia di latihan.'));
    },
    put(url, input) {
      if (url === '/invitations/me/events') return reply({ events: input.events, weddingDate: input.events[0].date });
      return Promise.reject(new Error('Tindakan ini belum tersedia di latihan.'));
    },
  };
}

function Practice({ topic }) {
  const client = useMemo(practiceClient, []);
  const [invitation, setInvitation] = useState(sample);
  const [preview, setPreview] = useState(null);
  if (topic === 'pembayaran') return <BillingPanel invitation={invitation} client={client} onUpdated={setInvitation}/>;
  if (topic === 'tombol-studio') {
    const theme = themes.find(item => item.id === invitation.themeId) || themes[0];
    return <><div className="guide-theme-preview"><ThemeThumbnail theme={theme}/><p>Pratinjau sampul · {theme.name}</p></div><TemaPanel invitation={invitation} client={client} onUpdated={setInvitation}/></>;
  }
  const events = preview?.events || invitation.events;
  return <><AcaraPanel invitation={invitation} client={client} onUpdated={setInvitation} onLivePreview={setPreview}/><p role="status">Pratinjau acara · {events.map(event => ({ ngunduh_mantu: 'Ngunduh Mantu', akad: 'Akad', resepsi: 'Resepsi' })[event.type] + (event.date ? ' · ' + event.date : '')).join(' / ')}</p></>;
}

export default function GuidePractice({ topic }) {
  const [active, setActive] = useState(false);
  const [revision, setRevision] = useState(0);
  return <section className="guide-practice" aria-label="Latihan interaktif">
    <h3>Coba langsung</h3>
    <p>Latihan ini memakai data contoh. Perubahan berlaku selama latihan terbuka.</p>
    <button type="button" className="sam-action-link" onClick={() => setActive(value => !value)}>{active ? 'Tutup latihan' : 'Mulai latihan'}</button>
    {active && <><button type="button" className="sam-action-link" onClick={() => setRevision(value => value + 1)}>Ulangi latihan</button>
      {topic === 'pembayaran' && <p>Pilih paket, buka tagihan uji, lalu tekan Periksa status untuk menyimulasikan pembayaran berhasil.</p>}
      <div className="guide-practice-body"><Practice key={revision} topic={topic}/></div>
    </>}
  </section>;
}
