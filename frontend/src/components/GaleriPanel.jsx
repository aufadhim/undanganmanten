import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { resolveImageUrl } from '../config/env.js';

export default function GaleriPanel({ invitation, onUpdated, onLivePreview }) {
  const { t } = useTranslation();
  const [media, setMedia] = useState(invitation?.galleryMedia || []);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State for Add Link modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [layout, setLayout] = useState(invitation?.themeSettings?.galleryLayout || 'editorial');

  useEffect(() => {
    if (invitation?.galleryMedia) {
      setMedia(invitation.galleryMedia);
    } else {
      api.get('/invitations/me/gallery').then((res) => setMedia(res.data.media));
    }
  }, [invitation?.id, invitation?.galleryMedia]);

  const currentPhotos = media.filter(m => m.type === 'photo').length;
  const currentVideos = media.filter(m => m.type === 'video').length;
  const photos = media.filter(m => m.type === 'photo');
  const videos = media.filter(m => m.type === 'video');

  async function handleLayoutChange(nextLayout) {
    setLayout(nextLayout);
    const nextTheme = { ...(invitation.themeSettings || {}), galleryLayout: nextLayout };
    onLivePreview?.({ themeSettings: nextTheme });
    try {
      const res = await api.patch('/invitations/me/theme', { galleryLayout: nextLayout });
      onUpdated?.({ ...invitation, themeSettings: res.data.themeSettings });
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Gagal menyimpan layout galeri.');
    }
  }

  async function handleBatchUpload(fileList) {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg('');

    const files = Array.from(fileList);
    setUploading(true);

    let currentMedia = [...media];

    const validFiles = [];
    const sizeErrors = [];
    const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 MB
    const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30 MB

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        if (file.size > MAX_PHOTO_SIZE) {
          sizeErrors.push(`${file.name} (> 10MB)`);
        } else {
          validFiles.push(file);
        }
      } else if (file.type.startsWith('video/')) {
        if (file.size > MAX_VIDEO_SIZE) {
          sizeErrors.push(`${file.name} (> 30MB)`);
        } else {
          validFiles.push(file);
        }
      }
    }

    if (validFiles.length === 0) {
        if (sizeErrors.length > 0) {
           setErrorMsg(`Gagal upload: ${sizeErrors.join(', ')}`);
        } else {
           setErrorMsg(`Batas maksimum foto/video tercapai.`);
        }
        setUploading(false);
        return;
    }

    if (sizeErrors.length > 0) {
      setErrorMsg(`Beberapa file ditolak: ${sizeErrors.join(', ')}`);
    }

    // Upload concurrently hanya untuk file yang valid ukurannya
    const uploadPromises = validFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/invitations/me/gallery', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.media;
      } catch (err) {
        console.error('Gagal upload file:', file.name, err);
        throw new Error(err.response?.data?.error || `Gagal mengunggah ${file.name}.`);
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      
      const successfulUploads = [];
      const failedUploads = [];

      results.forEach((res) => {
        if (res.status === 'fulfilled') {
          successfulUploads.push(res.value);
        } else {
          failedUploads.push(res.reason.message);
        }
      });

      currentMedia = [...currentMedia, ...successfulUploads];

      if (failedUploads.length > 0) {
        // Show the first error, or combine them
        setErrorMsg(failedUploads[0] + (failedUploads.length > 1 ? ` (dan ${failedUploads.length - 1} lainnya gagal)` : ''));
      }
    } catch (err) {
      setErrorMsg('Gagal mengunggah beberapa file.');
    }

    setMedia(currentMedia);
    if (onUpdated && invitation) {
      onUpdated({ ...invitation, galleryMedia: currentMedia });
    }
    setUploading(false);
  }

  async function handleDelete(id) {
    setErrorMsg('');
    await api.delete(`/invitations/me/gallery/${id}`);
    const filtered = media.filter((item) => item.id !== id);
    setMedia(filtered);
    if (onUpdated && invitation) {
      onUpdated({ ...invitation, galleryMedia: filtered });
    }
  }

  async function handleAddLink(e) {
    e.preventDefault();
    if (!linkUrl) return;
    setLinkLoading(true);
    setErrorMsg('');
    
    try {
      const res = await api.post('/invitations/me/gallery/link', { url: linkUrl });
      const newMedia = [...media, res.data.media];
      setMedia(newMedia);
      if (onUpdated && invitation) {
        onUpdated({ ...invitation, galleryMedia: newMedia });
      }
      setShowLinkModal(false);
      setLinkUrl('');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Gagal menambahkan link video.');
    } finally {
      setLinkLoading(false);
    }
  }

  // Fungsi utilitas untuk mendeteksi ID YouTube agar bisa menampilkan thumbnail/iframe
  function getYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  return (
    <>
      <h2 className="panel-header">{t('panels.galeri_title')}</h2>
      <p className="panel-sub">{t('panels.galeri_sub')} Pastikan ukuran Foto Maksimal 10MB dan Video Maksimal 30MB.</p>

      <div style={{ fontSize: '12px', color: '#5c655d', marginBottom: '12px' }}>
        Galeri saat ini: <strong>{currentPhotos} foto</strong> dan <strong>{currentVideos} video</strong>. Kuota paket diperiksa otomatis saat menyimpan.
      </div>

      {errorMsg && (
        <div className="form-error" style={{ marginBottom: '14px', background: '#fff2f0', border: '1px solid #ffccc7', color: '#ff4d4f', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        <Button 
          as="label"
          variant="secondary" 
          isLoading={uploading}
          icon={<i className="fa-solid fa-cloud-arrow-up"></i>}
          style={{ margin: 0 }}
        >
          {uploading ? 'Mengunggah Media...' : 'Upload Foto atau Video Singkat'}
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            disabled={uploading}
            style={{ display: 'none' }}
            onChange={(e) => handleBatchUpload(e.target.files)}
          />
        </Button>
        <Button 
          variant="secondary"
          onClick={() => setShowLinkModal(true)}
          icon={<i className="fa-brands fa-youtube" style={{ color: '#ff0000', fontSize: '16px' }}></i>}
          style={{ margin: 0, background: '#f0f0f0' }}
        >
          Tambah Video via Link (YouTube)
        </Button>
      </div>

      {showLinkModal && (
        <form onSubmit={handleAddLink} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Masukkan Link Video (YouTube)</h4>
          <input 
            type="url" 
            required 
            placeholder="https://www.youtube.com/watch?v=..."
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            className="text-input"
            style={{ marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
            <Button variant="ghost" type="button" onClick={() => setShowLinkModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" isLoading={linkLoading}>
              Simpan Link
            </Button>
          </div>
        </form>
      )}

      <div className="section-block" style={{ marginBottom: 18 }}>
        <label className="field-label">Layout Galeri Foto</label>
        <select className="text-input" value={layout} onChange={(e) => handleLayoutChange(e.target.value)}>
          <option value="editorial">Editorial Eternal — dua kolom berbeda</option>
          <option value="grid">Grid Rapi — ukuran seragam</option>
          <option value="masonry">Masonry — susunan natural</option>
          <option value="carousel">Slideshow — geser horizontal</option>
          <option value="collage">Collage — potongan dinamis</option>
          <option value="wall">Wall Board — foto tempel dinding</option>
        </select>
        <small style={{ color: '#777' }}>Perubahan layout langsung terlihat pada preview.</small>
      </div>

      <h3 style={{ fontSize: 14, margin: '0 0 10px' }}>Foto ({photos.length})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {photos.map((item) => (
          <div key={item.id} style={{ position: 'relative' }}>
            <img src={resolveImageUrl(item.url)} style={{ width: '100%', borderRadius: 8, aspectRatio: '1', objectFit: 'cover' }} alt="Foto galeri" />
            <button
              onClick={() => handleDelete(item.id)}
              style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: 6, fontSize: 11, padding: '4px 8px', cursor: 'pointer' }}
            >
              Hapus
            </button>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 14, margin: '22px 0 10px' }}>Video ({videos.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {videos.map((item) => {
          const ytId = getYoutubeId(item.url);
          return <div key={item.id} style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 10, overflow: 'hidden', background: '#111' }}>
            {ytId ? <iframe src={`https://www.youtube.com/embed/${ytId}`} title="Video YouTube" style={{ width: '100%', height: '100%', border: 0 }} allowFullScreen /> : <video src={resolveImageUrl(item.url)} controls preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            <button onClick={() => handleDelete(item.id)} style={{ position: 'absolute', top: 6, right: 6, zIndex: 2, background: 'rgba(0,0,0,.7)', color: '#fff', border: 0, borderRadius: 6, padding: '5px 9px' }}>Hapus</button>
          </div>;
        })}
      </div>
    </>
  );
}
