import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import { useUI } from '../context/UIContext.jsx';

export default function VisualPanel({ invitation, onUpdated, onLivePreview }) {
  const { t } = useTranslation();

  const [features, setFeatures] = useState(invitation?.invitationFeatures || {});
  const [uploadingAsset, setUploadingAsset] = useState(false);
  
  const { toast } = useUI();

  // Reset isi form jika user berganti pilihan undangan dari dropdown
  useEffect(() => {
    if (invitation) {
      setFeatures(invitation.invitationFeatures || {});
    }
  }, [invitation?.id]);

  if (!invitation) return null;

  const coverType = invitation.themeSettings?.coverType || 'custom';
  const showOpeningUpload = coverType === 'custom' || coverType === 'custom-opening';
  const showMainUpload = coverType === 'custom' || coverType === 'custom-main';

  async function toggleFeature(key) {
    const newValue = !features[key];
    // Optimistic Update (Ubah UI dulu biar responsif)
    setFeatures((f) => ({ ...f, [key]: newValue }));
    onLivePreview?.({ invitationFeatures: { ...features, [key]: newValue } });

    try {
      const res = await api.patch('/invitations/me/features', {
        invitationId: invitation.id,
        [key]: newValue
      });
      onUpdated({ ...invitation, invitationFeatures: res.data.features || { ...features, [key]: newValue } });
    } catch (err) {
      // Revert UI ke semula jika gagal
      setFeatures((f) => ({ ...f, [key]: !newValue }));
      onLivePreview?.(null);
      toast.error(err.response?.data?.error || 'Gagal mengubah pengaturan fitur.');
    }
  }

  // Handler Multimedia & Asset
  async function handleUploadAsset(e, fieldKey) {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: Max 5MB for images, Max 15MB for audio
    const isAudio = file.type.startsWith('audio/');
    const maxSize = isAudio ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
    
    if (file.size > maxSize) {
      toast.error(`Ukuran file terlalu besar. Maksimal ${isAudio ? '15MB' : '5MB'}.`);
      return;
    }

    setUploadingAsset(true);
    try {
      const formData = new FormData();
      formData.append('invitationId', invitation.id);
      formData.append('file', file);

      const uploadRes = await api.post('/themes/upload-asset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = uploadRes.data.url;
      
      // Update theme settings with the new url
      await api.patch('/themes/me', {
        invitationId: invitation.id,
        [fieldKey]: url,
      });

      onUpdated({
        ...invitation,
        themeSettings: {
          ...(invitation.themeSettings || {}),
          [fieldKey]: url,
        },
      });

      toast.success('Berhasil mengunggah file!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengunggah file.');
    } finally {
      setUploadingAsset(false);
    }
  }

  async function handleSaveAnimation(e) {
    const animationType = e.target.value;
    try {
      await api.patch('/themes/me', {
        invitationId: invitation.id,
        animationType,
      });
      onUpdated({
        ...invitation,
        themeSettings: {
          ...(invitation.themeSettings || {}),
          animationType,
        },
      });
      toast.success('Animasi berhasil disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan animasi.');
    }
  }

  async function handleSaveOpeningAnimation(e) {
    const openingAnimation = e.target.value;
    onLivePreview?.({ themeSettings: { ...(invitation.themeSettings || {}), openingAnimation } });
    try {
      const res = await api.patch('/invitations/me/theme', {
        invitationId: invitation.id,
        openingAnimation,
      });
      onUpdated({
        ...invitation,
        themeSettings: res.data.themeSettings,
      });
      toast.success('Animasi pembuka berhasil disimpan!');
    } catch (err) {
      onLivePreview?.({ themeSettings: invitation.themeSettings || {} });
      toast.error(err.response?.data?.error || 'Gagal menyimpan animasi pembuka.');
    }
  }

  async function handleSaveCoverType(e) {
    const coverType = e.target.value;
    try {
      await api.patch('/themes/me', {
        invitationId: invitation.id,
        coverType,
      });
      onUpdated({
        ...invitation,
        themeSettings: {
          ...(invitation.themeSettings || {}),
          coverType,
        },
      });
      toast.success('Jenis Cover berhasil disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan jenis cover.');
    }
  }

  async function handleLoadingAnimation(type) {
    onLivePreview?.({ themeSettings: { ...(invitation.themeSettings || {}), loadingAnimation: type } });
    try {
      const res = await api.patch('/invitations/me/theme', { loadingAnimation: type });
      onUpdated({ ...invitation, themeSettings: res.data.themeSettings });
      toast.success('Animasi loading berhasil dipilih.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan animasi loading.');
    }
  }


  return (
    <>
      <h2 className="panel-header">Musik &amp; Visual Tambahan</h2>
      <p className="panel-sub">Atur musik latar, animasi, dan logo awal pada undangan Anda.</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0 18px', padding: '10px 12px', borderRadius: '10px', background: '#f2f7f3', color: '#496052', fontSize: '13px' }}>
        <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" />
        Setiap perubahan di panel ini tersimpan otomatis.
      </div>

      <div className="section-block">
        <div className="section-title">Tampilan Cover Awal &amp; Tirai</div>
        <div className="stack">
          <div>
            <label style={{ fontSize: '14px', color: '#333', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Jenis Cover
            </label>
            <select
              className="text-input"
              value={coverType}
              onChange={handleSaveCoverType}
            >
              <option value="default">Bawaan template untuk keduanya</option>
              <option value="custom-main">Kustom cover utama saja</option>
              <option value="custom-opening">Kustom cover sampul saja</option>
              <option value="custom">Kustom cover sampul &amp; utama</option>
            </select>
            <p style={{ fontSize: '14px', color: '#555', marginTop: '6px', lineHeight: '1.4' }}>
              Anda dapat mempertahankan ilustrasi bawaan template pada salah satu cover dan memakai foto hanya pada cover lainnya.
            </p>
          </div>

          <hr style={{ borderTop: '1px solid #eee', margin: '12px 0' }} />

          {showOpeningUpload && (
              <div>
                <label style={{ fontSize: '14px', color: '#333', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Gambar / Ilustrasi Tirai (Cover 1)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadAsset(e, 'coverImageUrl')}
                  disabled={uploadingAsset}
                  className="text-input"
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '8px', background: '#fafafa', cursor: 'pointer', fontFamily: 'inherit' }}
                />
                {invitation?.themeSettings?.coverImageUrl && (
                  <img src={invitation.themeSettings.coverImageUrl} alt="Cover Tirai" style={{ height: '100px', marginTop: '8px', objectFit: 'cover', borderRadius: '8px' }} />
                )}
                <p style={{ fontSize: '13px', color: '#555', marginTop: '6px', lineHeight: '1.4' }}>
                  Gambar yang akan muncul sebelum undangan dibuka (tirai awal).
                </p>
              </div>
          )}

          {showOpeningUpload && showMainUpload && (
              <hr style={{ borderTop: '1px solid #eee', margin: '12px 0' }} />
          )}

          {showMainUpload && (
              <div>
                <label style={{ fontSize: '14px', color: '#333', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Gambar / Ilustrasi Cover Utama (Cover 2)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadAsset(e, 'coverSecondImageUrl')}
                  disabled={uploadingAsset}
                  className="text-input"
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '8px', background: '#fafafa', cursor: 'pointer', fontFamily: 'inherit' }}
                />
                {invitation?.themeSettings?.coverSecondImageUrl && (
                  <img src={invitation.themeSettings.coverSecondImageUrl} alt="Cover Utama" style={{ height: '100px', marginTop: '8px', objectFit: 'cover', borderRadius: '8px' }} />
                )}
                <p style={{ fontSize: '13px', color: '#555', marginTop: '6px', lineHeight: '1.4' }}>
                  Gambar yang akan muncul setelah tamu mengklik tombol buka undangan.
                </p>
              </div>
          )}
        </div>
      </div>

      <div className="section-block">
        <div className="section-title">Multimedia &amp; Estetika</div>
        <div className="stack">
          
          <div>
            <label style={{ fontSize: '14px', color: '#333', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Animasi Pembuka Sampul
            </label>
            <select
              className="text-input"
              value={invitation?.themeSettings?.openingAnimation || ''}
              onChange={handleSaveOpeningAnimation}
            >
              <option value="">Slide Up (Bawaan - Terangkat ke Atas)</option>
              <option value="fade">Fade Out (Menghilang Halus)</option>
              <option value="zoom">Zoom Out (Membesar & Menghilang)</option>
              <option value="slide-down">Slide Down (Turun ke Bawah)</option>
            </select>
          </div>

          <hr style={{ borderTop: '1px solid #eee', margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '14px', color: '#333', fontWeight: 600 }}>Background Music (MP3/WAV)</label>
            <label className="switch">
              <input type="checkbox" checked={features.musicEnabled || false} onChange={() => toggleFeature('musicEnabled')} />
              <span className="slider round"></span>
            </label>
          </div>
          {features.musicEnabled && (
            <div>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => handleUploadAsset(e, 'musicUrl')}
              disabled={uploadingAsset}
              className="text-input"
              style={{
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '8px', 
                background: '#fafafa', 
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            />
            {invitation?.themeSettings?.musicUrl && (
              <audio controls src={invitation.themeSettings.musicUrl} style={{ width: '100%', height: '30px', marginTop: '8px' }} />
            )}
          </div>
          )}

          <hr style={{ borderTop: '1px solid #eee', margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '14px', color: '#333', fontWeight: 600 }}>Animasi Visual (Daun/Salju)</label>
            <label className="switch">
              <input type="checkbox" checked={features.animationEnabled || false} onChange={() => toggleFeature('animationEnabled')} />
              <span className="slider round"></span>
            </label>
          </div>
          {features.animationEnabled && (
            <div>
            <select
              className="text-input"
              value={invitation?.themeSettings?.animationType || ''}
              onChange={handleSaveAnimation}
            >
              <option value="">Tidak ada animasi</option>
              <option value="sakura">Kelopak Bunga Sakura</option>
              <option value="snow">Hujan Salju</option>
              <option value="leaves">Daun Berguguran</option>
            </select>
          </div>
          )}

          <hr style={{ borderTop: '1px solid #eee', margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '14px', color: '#333', fontWeight: 600 }}>Custom Loading Logo</label>
            <label className="switch">
              <input type="checkbox" checked={features.customLogoEnabled || false} onChange={() => toggleFeature('customLogoEnabled')} />
              <span className="slider round"></span>
            </label>
          </div>
          {features.customLogoEnabled && (
            <div>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Logo ini akan muncul saat tamu pertama kali membuka tautan (Maksimal 2MB, transparan disarankan).
              </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUploadAsset(e, 'customLogoUrl')}
              disabled={uploadingAsset}
              className="text-input"
              style={{
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '8px', 
                background: '#fafafa', 
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            />
            {invitation?.themeSettings?.customLogoUrl && (
              <img src={invitation.themeSettings.customLogoUrl} alt="Logo" style={{ height: '60px', marginTop: '8px', objectFit: 'contain' }} />
            )}
            <label className="field-label" style={{ marginTop: 16 }}>Gaya Animasi Loading</label>
            <div className="loading-animation-picker">
              {[
                ['breathe', 'Napas Halus'], ['reveal', 'Reveal Elegan'], ['shimmer', 'Kilau Cahaya'], ['spin', 'Putar Minimal']
              ].map(([id, label]) => <button type="button" key={id} className={`loading-animation-card ${invitation.themeSettings?.loadingAnimation === id ? 'active' : ''}`} onClick={() => handleLoadingAnimation(id)}>
                <span className={`loading-animation-demo demo-${id}`}><span>{invitation.themeId === 'eternal' ? '∞' : 'N'}</span></span>
                <strong>{label}</strong>
              </button>)}
            </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .loading-animation-picker{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}
        .loading-animation-card{border:1px solid var(--line,#ddd);background:#fff;border-radius:12px;padding:12px 8px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;color:var(--ink)}
        .loading-animation-card.active{border:2px solid var(--wine-deep);background:#fff9f5}
        .loading-animation-demo{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:var(--paper,#f7f2ea);font:600 22px Fraunces,serif;overflow:hidden}
        .demo-breathe span{animation:loadingBreathe 1.8s ease-in-out infinite}.demo-spin span{animation:loadingSpin 2s linear infinite}.demo-reveal span{animation:loadingReveal 2s ease-in-out infinite}.demo-shimmer{position:relative}.demo-shimmer:after{content:'';position:absolute;inset:-20%;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.9),transparent 70%);animation:loadingShimmer 1.8s linear infinite}
        @keyframes loadingBreathe{50%{transform:scale(1.18);opacity:.6}}@keyframes loadingSpin{to{transform:rotate(360deg)}}@keyframes loadingReveal{0%,100%{clip-path:inset(0 50%)}50%{clip-path:inset(0)}}@keyframes loadingShimmer{from{transform:translateX(-130%)}to{transform:translateX(130%)}}
      `}</style>
    </>
  );
}
