import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import { QRCodeSVG } from 'qrcode.react';

export default function PublicForms({ invitation, previewGuest, templateStyle }) {
  if (!invitation) return null;

  const theme = invitation.themeSettings;
  const slug = invitation.slug;
  const guestId = previewGuest?.id;

  return (
    <div style={{ padding: '0 20px', paddingBottom: '60px', width: '100%', boxSizing: 'border-box', zIndex: 10, position: 'relative' }}>
      
      {/* QR CODE ACCESS PASS */}
      {previewGuest && (
        <div className="pf-glass" style={{ textAlign: 'center' }}>
          <h3 className="pf-title">Access Pass</h3>
          <p style={{ fontSize: 13, color: '#333', marginBottom: 16 }}>Tunjukkan QR Code ini kepada penerima tamu di lokasi acara untuk check-in.</p>
          <div style={{ background: '#fff', padding: '16px', borderRadius: 12, display: 'inline-block', maxWidth: '100%', boxSizing: 'border-box' }}>
            <QRCodeSVG
              value={`${window.location.origin}/dashboard?checkin=${guestId}`}
              size={150}
              level="M"
              title={`QR check-in ${previewGuest.name}`}
            />
          </div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 12 }}>{previewGuest.name}</div>
        </div>
      )}

      {invitation.invitationFeatures?.rsvpEnabled !== false && (
        <RsvpForm slug={slug} guest={previewGuest} theme={theme} />
      )}
      
      {invitation.invitationFeatures?.giftEnabled && invitation.giftSettings && templateStyle !== 'eternal' && (
        <GiftSection gift={invitation.giftSettings} accent={theme?.bodyText?.tertiary || '#000'} />
      )}
      
      {invitation.invitationFeatures?.wishesEnabled !== false && (
        <WishesSection slug={slug} initialWishes={invitation.wishes} theme={theme} guest={previewGuest} />
      )}

      <style>{`
        .pf-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
          text-align: left;
          width: 100%;
          box-sizing: border-box;
        }
        .pf-title {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--pf-accent, #333);
          margin-bottom: 24px;
          text-align: center;
          font-family: var(--pf-font-body, inherit);
        }
        .pf-input {
          width: 100%;
          padding: 14px;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 8px;
          background: rgba(255,255,255,0.9);
          font-family: inherit;
          font-size: 14px;
          box-sizing: border-box;
          margin-bottom: 12px;
          color: #333;
        }
        .pf-input:focus {
          outline: none;
          border-color: var(--pf-accent, #000);
        }
        .pf-btn {
          width: 100%;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          background: #333;
          color: #fff;
        }
        .wishes-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .wishes-scroll-container::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 8px;
        }
        .wishes-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
        }
        .wishes-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}

function RsvpForm({ slug, guest, theme }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ 
    name: guest?.name || '', 
    phone: guest?.phone || '', 
    attending: guest?.attending !== false, // default true
    guestCount: guest?.guestCount || 1, 
    note: guest?.note || '' 
  });
  
  useEffect(() => {
    if (guest) {
      setForm({
        name: guest.name || '',
        phone: guest.phone || '',
        attending: guest.attending !== false,
        guestCount: guest.guestCount || 1,
        note: guest.note || ''
      });
    }
  }, [guest]);

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSent(false);
    try {
      const url = guest?.id ? `/invitations/public/${slug}/rsvp?g=${guest.id}` : `/invitations/public/${slug}/rsvp`;
      await api.post(url, form);
      setSent(true);
      // Let TamuPanel know so dashboard updates realtime
      window.dispatchEvent(new Event('guest_updated'));
      setTimeout(() => setSent(false), 5000); // Hide banner after 5 seconds
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengirim RSVP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pf-glass">
      <h3 className="pf-title">RSVP</h3>
      {sent && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center', border: '1px solid #c3e6cb' }}>
          Berhasil menyimpan konfirmasi RSVP Anda!
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <input className="pf-input" placeholder="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="pf-input" placeholder="Nomor WA (opsional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <select className="pf-input" value={form.attending} onChange={(e) => setForm({ ...form, attending: e.target.value === 'true' })}>
          <option value="true">Saya akan hadir</option>
          <option value="false">Maaf, tidak bisa hadir</option>
        </select>
        {form.attending && (
          <input className="pf-input" type="number" min="1" max="5" placeholder="Jumlah tamu" value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: e.target.value })} />
        )}
        {error && <div style={{ color: 'red', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>{error}</div>}
        <button type="submit" className="pf-btn" style={{ background: theme?.button?.primary || '#333' }} disabled={loading}>
          {loading ? 'Mengirim...' : (guest ? 'Update RSVP' : 'Kirim RSVP')}
        </button>
      </form>
    </div>
  );
}

function GiftSection({ gift, accent }) {
  return (
    <div className="pf-glass" style={{ textAlign: 'center' }}>
      <h3 className="pf-title">Kirim Hadiah</h3>
      <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 20, color: '#333' }}>Bagi yang ingin mengirimkan hadiah, silakan melalui:</p>
      
      {(gift.type === 'bank_transfer' || gift.type === 'both') && (
        <div style={{ background: 'rgba(255,255,255,0.8)', padding: 16, borderRadius: 12, marginBottom: 16, color: '#333' }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{gift.bankName}</div>
          <div style={{ fontSize: 18, letterSpacing: '0.1em', fontFamily: 'monospace', margin: '8px 0' }}>{gift.accountNumber}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>a.n. {gift.accountHolder}</div>
        </div>
      )}
      
      {(gift.type === 'address' || gift.type === 'both') && (
        <div style={{ background: 'rgba(255,255,255,0.8)', padding: 16, borderRadius: 12, color: '#333' }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Alamat Pengiriman</div>
          <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>{gift.shippingAddress}</div>
        </div>
      )}
    </div>
  );
}

function WishesSection({ slug, initialWishes, theme, guest }) {
  const [wishes, setWishes] = useState(initialWishes || []);
  
  const guestWish = initialWishes?.find(w => w.guestId === guest?.id);
  
  const [form, setForm] = useState({ 
    senderName: guestWish?.senderName || guest?.name || '', 
    message: guestWish?.message || '' 
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (initialWishes) {
      setWishes(initialWishes);
    }
  }, [initialWishes]);

  useEffect(() => {
    const gw = wishes.find(w => w.guestId === guest?.id);
    if (gw) {
      setForm(prev => {
        const newName = gw.senderName || guest?.name || '';
        const newMsg = gw.message || '';
        if (prev.senderName === newName && prev.message === newMsg) return prev;
        return { ...prev, senderName: newName, message: newMsg };
      });
    } else if (guest?.name) {
      setForm(prev => {
        if (prev.senderName === guest.name) return prev;
        return { ...prev, senderName: guest.name };
      });
    }
  }, [guest, wishes]);

  const visibleWishes = wishes.filter(w => !w.isHidden);
  const sortedWishes = [...visibleWishes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSent(false);
    try {
      const url = guest?.id ? `/invitations/public/${slug}/wishes?g=${guest.id}` : `/invitations/public/${slug}/wishes`;
      const res = await api.post(url, form);
      
      // Update local wishes state (replace if exists, otherwise prepend)
      setWishes(prev => {
        const existingIdx = prev.findIndex(w => w.id === res.data.wish.id);
        if (existingIdx >= 0) {
          const newWishes = [...prev];
          newWishes[existingIdx] = res.data.wish;
          return newWishes;
        }
        return [res.data.wish, ...prev];
      });
      
      setSent(true);
      setTimeout(() => setSent(false), 5000);
      
      // Notify parent to refresh the wishes panel
      window.dispatchEvent(new Event('wish_added'));
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengirim ucapan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="pf-glass">
        <h3 className="pf-title">Ucapan & Doa</h3>
        {sent && (
          <div style={{ background: '#d4edda', color: '#155724', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center', border: '1px solid #c3e6cb' }}>
            Berhasil menyimpan ucapan Anda!
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <input className="pf-input" placeholder="Nama Anda" value={form.senderName} onChange={(e) => setForm({ ...form, senderName: e.target.value })} required />
          <textarea className="pf-input" placeholder="Tulis ucapan dan doa..." rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          {error && <div style={{ color: 'red', fontSize: 13, marginBottom: 10 }}>{error}</div>}
          <button type="submit" className="pf-btn" style={{ background: theme?.button?.primary || '#333' }} disabled={loading}>
            {loading ? 'Mengirim...' : (wishes.find(w => w.guestId === guest?.id) ? 'Update Ucapan' : 'Kirim Ucapan')}
          </button>
        </form>
      </div>

      <div className="wishes-scroll-container" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '450px', overflowY: 'auto', paddingRight: '8px', paddingBottom: '20px' }}>
        {sortedWishes.map((w) => {
          const isMine = guest && w.guestId === guest.id;
          return (
            <div key={w.id} style={{ 
              background: isMine ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.5)', 
              padding: '16px', 
              borderRadius: '12px', 
              border: isMine ? '1px solid #1890ff' : '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: isMine ? '0 4px 12px rgba(24, 144, 255, 0.15)' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#111', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {w.senderName}
                  {isMine && <span style={{ fontSize: '10px', background: '#e6f7ff', color: '#1890ff', padding: '2px 6px', borderRadius: '4px' }}>Ucapan Anda</span>}
                  {w.isPinned && <span style={{ fontSize: 10, background: '#fffbe6', color: '#d48806', padding: '2px 6px', borderRadius: 10, border: '1px solid #ffe58f' }}>📌 Pinned</span>}
                </div>
              </div>
              <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>{w.message}</div>
              
              {w.reply && (
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '8px', marginTop: '12px', fontSize: '13px', borderLeft: '3px solid #666' }}>
                  <div style={{ fontWeight: 'bold', color: '#555', marginBottom: '4px' }}>Balasan:</div>
                  <div style={{ color: '#333' }}>{w.reply}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
