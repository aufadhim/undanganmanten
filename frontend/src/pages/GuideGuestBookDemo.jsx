import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import GuestCheckIn from '../components/GuestCheckIn.jsx';

const sampleGuests = [
  { id: 'demo-nadira', name: 'Nadira & Bagas', paxLimit: 2 },
  { id: 'demo-raka', name: 'Raka Pradipta', paxLimit: 1 },
];

export default function GuideGuestBookDemo() {
  const [open, setOpen] = useState(false);
  const [guests, setGuests] = useState(sampleGuests);
  const update = (path, count) => {
    const id = path.split('/').at(-2);
    return { data: { guest: { ...guests.find(guest => guest.id === id), checkedIn: count > 0, checkInCount: count, checkedInAt: count ? new Date().toISOString() : null } } };
  };
  const client = {
    post: (path, { count }) => update(path, count),
    delete: path => update(path, 0),
  };
  return <div className="guest-hub-note">
    <h3>Coba Buku Tamu QR</h3>
    <p>Lihat QR dari sisi tamu, coba catat kehadiran sebagai petugas, dan unduh contoh rekap. Latihan gratis dengan data contoh.</p>
    <button type="button" className="lp-btn-seal" aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? 'Tutup demo' : 'Buka demo Buku Tamu QR'}</button>
    {open && <>
      <div className="guest-qr">
        <h4>QR pribadi tamu</h4>
        <QRCodeSVG size={144} value="Samavaya: QR contoh Nadira dan Bagas" title="QR contoh Nadira dan Bagas" />
        <p>Nadira &amp; Bagas</p>
      </div>
      <GuestCheckIn demo enabled invitation={{ id: 'demo', slug: 'contoh', coupleProfile: { brideName: 'Arunika', groomName: 'Deva' } }} guests={guests} staffClient={client}
        onUpdated={updated => setGuests(current => current.map(guest => guest.id === updated.id ? updated : guest))} />
    </>}
  </div>;
}
