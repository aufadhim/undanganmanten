import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function HadiahPanel({ invitation, onUpdated, onLivePreview }) {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    type: 'bank_transfer',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    shippingAddress: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [giftEnabled, setGiftEnabled] = useState(invitation?.invitationFeatures?.giftEnabled || false);
  const { toast } = useUI();

  useEffect(() => {
    if (invitation?.giftSettings) {
      setFormData({
        type: invitation.giftSettings.type || 'bank_transfer',
        bankName: invitation.giftSettings.bankName || '',
        accountNumber: invitation.giftSettings.accountNumber || '',
        accountHolder: invitation.giftSettings.accountHolder || '',
        shippingAddress: invitation.giftSettings.shippingAddress || ''
      });
    }
  }, [invitation?.giftSettings]);

  useEffect(() => {
    setGiftEnabled(invitation?.invitationFeatures?.giftEnabled || false);
  }, [invitation?.invitationFeatures]);

  // Handle Toggle Gift On/Off
  async function handleToggleGift() {
      const checked = !giftEnabled;
      setGiftEnabled(checked);
      try {
          await api.patch('/invitations/me/features', { giftEnabled: checked });
          const updatedFeatures = { ...invitation.invitationFeatures, giftEnabled: checked };
          onUpdated({ ...invitation, invitationFeatures: updatedFeatures });
          if (onLivePreview) {
              onLivePreview({ invitationFeatures: updatedFeatures });
          }
      } catch (err) {
          console.error(err);
          setGiftEnabled(!checked); // revert
          toast.error(err.response?.data?.error || 'Gagal mengubah pengaturan fitur Hadiah.');
      }
  }

  function handleChange(field, value) {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (onLivePreview) {
        onLivePreview({ giftSettings: { ...invitation?.giftSettings, ...next } });
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      const res = await api.patch('/invitations/me/gift-settings', payload);
      toast.success(res.data.message || 'Pengaturan hadiah berhasil disimpan!');
      if (onUpdated && invitation) {
        onUpdated({ ...invitation, giftSettings: res.data.giftSettings });
      }
      if (onLivePreview) onLivePreview(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan pengaturan hadiah.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel-content">
      <h2 className="panel-header">Amplop Digital & Hadiah</h2>
      <p className="panel-sub">Pilih metode penerimaan kado/amplop digital. Jika opsi transfer dinonaktifkan, tamu hanya akan melihat opsi alamat fisik.</p>

      <form onSubmit={handleSubmit} className="stack">
        <div>
          <label className="field-label">Opsi Penerimaan Hadiah</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="radio" name="giftType" value="bank_transfer" checked={formData.type === 'bank_transfer'} onChange={() => handleChange('type', 'bank_transfer')} />
              Hanya Transfer Bank (Amplop Digital)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="radio" name="giftType" value="address" checked={formData.type === 'address'} onChange={() => handleChange('type', 'address')} />
              Hanya Kirim Bingkisan (Alamat Fisik)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="radio" name="giftType" value="both" checked={formData.type === 'both'} onChange={() => handleChange('type', 'both')} />
              Terima Keduanya
            </label>
          </div>
        </div>

        {(formData.type === 'bank_transfer' || formData.type === 'both') && (
          <div style={{ background: '#fdfdfd', border: '1px solid var(--line)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--ink)' }}>Detail Transfer Bank</h4>
            
            <div>
              <label className="field-label">Nama Bank / E-Wallet</label>
              <input
                type="text"
                className="text-input"
                placeholder="Misal: BCA, Mandiri, OVO, Dana"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
              />
            </div>
            
            <div>
              <label className="field-label">Nomor Rekening / No. HP</label>
              <input
                type="text"
                className="text-input"
                placeholder="Misal: 1234567890"
                value={formData.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
              />
            </div>
            
            <div>
              <label className="field-label">Atas Nama (Pemilik Rekening)</label>
              <input
                type="text"
                className="text-input"
                placeholder="Misal: Budi Santoso"
                value={formData.accountHolder}
                onChange={(e) => handleChange('accountHolder', e.target.value)}
              />
            </div>
          </div>
        )}

        {(formData.type === 'address' || formData.type === 'both') && (
          <div style={{ background: '#fdfdfd', border: '1px solid var(--line)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--ink)' }}>Alamat Pengiriman Hadiah Fisik</h4>
            
            <div>
              <label className="field-label">Alamat Lengkap (Beserta Kode Pos)</label>
              <textarea
                className="text-area"
                rows="4"
                placeholder="Misal: Jl. Mawar No. 12, RT 01/RW 02, Kelurahan Melati, Kecamatan Anggrek, Kota Bandung, 40111 (Patokan: Pagar Hitam)"
                value={formData.shippingAddress}
                onChange={(e) => handleChange('shippingAddress', e.target.value)}
              ></textarea>
            </div>
          </div>
        )}

        <Button type="submit" variant="primary" isLoading={loading} style={{ marginTop: '12px' }}>
          Simpan Pengaturan
        </Button>
      </form>
    </div>
  );
}
