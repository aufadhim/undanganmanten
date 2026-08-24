import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import { QRCodeSVG } from 'qrcode.react';
import { useUI } from '../context/UIContext.jsx';

export default function PublicForms({ invitation, previewGuest, templateStyle, formType = 'all', previewMode = false }) {
  if (!invitation) return null;

  const theme = invitation.themeSettings;
  const slug = invitation.slug;
  const guestId = previewGuest?.id;

  return (
    <div className="public-forms-root" style={{ padding: '0 20px', paddingBottom: '60px', width: '100%', boxSizing: 'border-box', zIndex: 10, position: 'relative' }}>
      
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

      {formType !== 'wishes' && invitation.invitationFeatures?.rsvpEnabled !== false && (
        <RsvpForm slug={slug} guest={previewGuest} theme={theme} previewMode={previewMode} />
      )}
      
      {formType === 'all' && invitation.invitationFeatures?.giftEnabled && invitation.giftSettings && templateStyle !== 'eternal' && (
        <GiftSection gift={invitation.giftSettings} accent={theme?.bodyText?.tertiary || '#000'} />
      )}
      
      {formType !== 'rsvp' && invitation.invitationFeatures?.wishesEnabled !== false && (
        <WishesSection slug={slug} initialWishes={invitation.wishes} theme={theme} guest={previewGuest} previewMode={previewMode} templateStyle={templateStyle} />
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
        .pf-subtitle {
          margin: -14px auto 22px;
          max-width: 520px;
          color: #666;
          font-size: 13px;
          line-height: 1.65;
          text-align: center;
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

function RsvpForm({ slug, guest, theme, previewMode }) {
  const { t } = useTranslation();
  const { toast } = useUI();
  const [form, setForm] = useState({ 
    name: guest?.name || '', 
    phone: guest?.phone || '', 
    attending: (guest?.rsvp?.attending ?? guest?.attending) !== false, // default true
    guestCount: guest?.rsvp?.guestCount || guest?.guestCount || 1,
    note: guest?.rsvp?.note || guest?.note || ''
  });
  
  useEffect(() => {
    if (guest) {
      setForm({
        name: guest.name || '',
        phone: guest.phone || '',
        attending: (guest.rsvp?.attending ?? guest.attending) !== false,
        guestCount: guest.rsvp?.guestCount || guest.guestCount || 1,
        note: guest.rsvp?.note || guest.note || ''
      });
    }
  }, [guest]);

  const [loading, setLoading] = useState(false);
  const paxLimit = guest?.paxLimit || 2;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const publicUrl = guest?.id ? `/invitations/public/${slug}/rsvp?g=${guest.id}` : `/invitations/public/${slug}/rsvp`;
      const ownerUrl = guest?.id ? `/invitations/me/preview-rsvp?g=${guest.id}` : '/invitations/me/preview-rsvp';
      const url = previewMode ? ownerUrl : publicUrl;
      await api.post(url, form);
      toast.success('Konfirmasi RSVP berhasil disimpan.');
      // Let TamuPanel know so dashboard updates realtime
      window.dispatchEvent(new Event('guest_updated'));
      window.dispatchEvent(new Event('refresh_dashboard'));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengirim RSVP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pf-glass">
      <h3 className="pf-title">RSVP</h3>
      <p className="pf-subtitle">{t('public.rsvp_subtitle')}</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <input className="pf-input" placeholder="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="pf-input" placeholder="Nomor WA (opsional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <select className="pf-input" value={form.attending} onChange={(e) => setForm({ ...form, attending: e.target.value === 'true' })}>
          <option value="true">Saya akan hadir</option>
          <option value="false">Maaf, tidak bisa hadir</option>
        </select>
        {form.attending && (
          <input className="pf-input" type="number" min="1" max={paxLimit} placeholder={`Jumlah tamu (maks. ${paxLimit} orang)`} aria-label={`Jumlah tamu (maksimal ${paxLimit} orang)`} value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: Math.min(paxLimit, Math.max(1, Number(e.target.value) || 1)) })} />
        )}
        <button type="submit" className="pf-btn" style={{ background: theme?.button?.primary || '#333' }} disabled={loading}>
          {loading ? 'Mengirim...' : (guest ? 'Update RSVP' : 'Kirim RSVP')}
        </button>
      </form>
    </div>
  );
}

export function GiftSection({ gift, accent }) {
  const [visible, setVisible] = useState(null);
  const accounts = gift.bankAccounts?.length ? gift.bankAccounts : [{ bankName: gift.bankName, accountNumber: gift.accountNumber, accountHolder: gift.accountHolder }];
  return (
    <div className="pf-glass" style={{ textAlign: 'center' }}>
      <h3 className="pf-title">Tanda Kasih</h3>
      <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 20, color: '#333' }}>Kehadiran dan doa Anda sudah lebih dari cukup. Informasi berikut tersedia hanya bila Anda berkenan.</p>
      {(gift.type === 'bank_transfer' || gift.type === 'both') && (
        <button className="pf-btn" type="button" onClick={() => setVisible('bank')} style={{ marginBottom: 10 }}>Lihat Informasi Rekening</button>
      )}
      {(gift.type === 'address' || gift.type === 'both') && (
        <button className="pf-btn" type="button" onClick={() => setVisible('address')}>Lihat Alamat Pengiriman</button>
      )}
      {visible && <div role="dialog" aria-modal="true" aria-label="Informasi hadiah" onClick={() => setVisible(null)} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.55)', display: 'grid', placeItems: 'center', padding: 20 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(440px,100%)', maxHeight: '80vh', overflow: 'auto', background: '#fff', color: '#222', borderRadius: 18, padding: 24, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><h3 style={{ marginTop: 0 }}>{visible === 'bank' ? 'Pilihan Rekening' : 'Alamat Pengiriman'}</h3><button type="button" onClick={() => setVisible(null)} aria-label="Tutup" style={{ border: 0, background: 'none', fontSize: 22 }}>×</button></div>
          {visible === 'bank' ? accounts.map((account, index) => <div key={index} style={{ padding: 14, border: '1px solid #ddd', borderRadius: 12, marginBottom: 10 }}><strong>{account.bankName}</strong><div style={{ fontFamily: 'monospace', fontSize: 18, margin: '8px 0' }}>{account.accountNumber}</div><div>a.n. {account.accountHolder}</div><button type="button" onClick={() => navigator.clipboard.writeText(account.accountNumber)} style={{ marginTop: 10 }}>Salin Nomor</button></div>) : <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{gift.shippingAddress}</p>}
        </div>
      </div>}
    </div>
  );
}

function WishesSection({ slug, initialWishes, theme, guest, previewMode, templateStyle }) {
  const { t } = useTranslation();
  const { toast } = useUI();
  const [wishes, setWishes] = useState(initialWishes || []);
  
  const guestWish = initialWishes?.find(w => w.guestId === guest?.id);
  
  const [form, setForm] = useState({ 
    senderName: guestWish?.senderName || guest?.name || '', 
    message: guestWish?.message || '' 
  });
  
  const [loading, setLoading] = useState(false);

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
    try {
      const publicUrl = guest?.id ? `/invitations/public/${slug}/wishes?g=${guest.id}` : `/invitations/public/${slug}/wishes`;
      const ownerUrl = guest?.id ? `/invitations/me/preview-wishes?g=${guest.id}` : '/invitations/me/preview-wishes';
      const url = previewMode ? ownerUrl : publicUrl;
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
      
      toast.success('Ucapan dan doa berhasil disimpan.');
      
      // Notify parent to refresh the wishes panel
      window.dispatchEvent(new Event('wish_added'));
      window.dispatchEvent(new Event('refresh_dashboard'));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengirim ucapan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="pf-glass">
        <h3 className="pf-title">Ucapan & Doa</h3>
        <p className="pf-subtitle">{t('public.wishes_subtitle')}</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <input className="pf-input" placeholder="Nama Anda" value={form.senderName} onChange={(e) => setForm({ ...form, senderName: e.target.value })} required />
          <textarea className="pf-input" placeholder="Tulis ucapan dan doa..." rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <button type="submit" className="pf-btn" style={{ background: theme?.button?.primary || '#333' }} disabled={loading}>
            {loading ? 'Mengirim...' : (wishes.find(w => w.guestId === guest?.id) ? 'Update Ucapan' : 'Kirim Ucapan')}
          </button>
        </form>
      </div>

      <div className={`wishes-scroll-container ${templateStyle === 'eternal' ? 'eternal-wishes-list' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '450px', overflowY: 'auto', paddingRight: '8px', paddingBottom: '20px' }}>
        {sortedWishes.map((w) => {
          const isMine = guest && w.guestId === guest.id;
          return (
            <div key={w.id} className={templateStyle === 'eternal' ? 'eternal-wish-card' : ''} style={{
              background: isMine ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.5)', 
              padding: '16px', 
              borderRadius: '12px', 
              border: isMine ? '1px solid #1890ff' : '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: isMine ? '0 4px 12px rgba(24, 144, 255, 0.15)' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div className={templateStyle === 'eternal' ? 'eternal-wish-name' : ''} style={{ fontWeight: 'bold', fontSize: '14px', color: '#111', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {w.senderName}
                  {isMine && <span style={{ fontSize: '10px', background: '#e6f7ff', color: '#1890ff', padding: '2px 6px', borderRadius: '4px' }}>Ucapan Anda</span>}
                  {w.isPinned && <span style={{ fontSize: 10, background: '#fffbe6', color: '#d48806', padding: '2px 6px', borderRadius: 10, border: '1px solid #ffe58f' }}>📌 Pinned</span>}
                </div>
              </div>
              <div className={templateStyle === 'eternal' ? 'eternal-wish-message' : ''} style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>{w.message}</div>
              
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
