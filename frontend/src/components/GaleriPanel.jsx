import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';

export default function GaleriPanel({ invitation, onUpdated }) {
  const { t } = useTranslation();
  const [media, setMedia] = useState(invitation?.galleryMedia || []);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State for Add Link modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    if (invitation?.galleryMedia) {
      setMedia(invitation.galleryMedia);
    } else {
      api.get('/invitations/me/gallery').then((res) => setMedia(res.data.media));
    }
  }, [invitation?.id, invitation?.galleryMedia]);

  const currentPhotos = media.filter(m => m.type === 'photo').length;
  const currentVideos = media.filter(m => m.type === 'video').length;

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
          {uploading ? 'Mengunggah Foto-foto...' : 'Upload Foto/Video Singkat'}
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

      {/* TODO: implement drag-and-drop reorder pakai endpoint PATCH /me/gallery/reorder */}
      {/* TODO: pilihan layout (grid/masonry/carousel) - field layoutType sudah ada di data */}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {media.map((item) => {
          const ytId = item.type === 'video' && (item.url.includes('youtube.com') || item.url.includes('youtu.be')) ? getYoutubeId(item.url) : null;
          
          return (
          <div key={item.id} style={{ position: 'relative' }}>
            {item.type === 'photo' ? (
              <img src={item.url} style={{ width: '100%', borderRadius: 8, aspectRatio: '1', objectFit: 'cover' }} alt="" />
            ) : ytId ? (
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: '#000', position: 'relative' }}>
                <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} alt="Youtube Video" />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fontSize: '24px' }}>
                  <i className="fa-brands fa-youtube" style={{ color: '#ff0000' }}></i>
                </div>
              </div>
            ) : (
              <video src={item.url} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8 }} />
            )}
            <button
              onClick={() => handleDelete(item.id)}
              style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: 6, fontSize: 11, padding: '4px 8px', cursor: 'pointer' }}
            >
              Hapus
            </button>
          </div>
        )})}
      </div>
    </>
  );
}
