import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import html2canvas from 'html2canvas';
import { useUI } from '../context/UIContext.jsx';

export default function WishesPanel({ invitation, onUpdated }) {
  const { t } = useTranslation();
  const [loadingId, setLoadingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  
  // States for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'pinned', 'hidden'
  const [currentPage, setCurrentPage] = useState(1);
  const [wishSettings, setWishSettings] = useState({ enabled: invitation?.invitationFeatures?.wishesEnabled ?? true, moderation: invitation?.invitationFeatures?.wishesModerationEnabled ?? false });
  const itemsPerPage = 10;
  
  const { toast, confirm } = useUI();
  
  // Hidden ref for html2canvas
  const exportRef = useRef(null);
  const [exportData, setExportData] = useState(null); // The wish currently being exported

  const wishes = invitation.wishes || [];
  const groom = invitation.coupleProfile?.groomName || 'Groom';
  const bride = invitation.coupleProfile?.brideName || 'Bride';
  const couplePhoto = invitation.coupleProfile?.groomPhoto || invitation.coupleProfile?.bridePhoto;

  // Sorting: Pinned first, then by createdAt desc
  const sortedWishes = [...wishes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filteredWishes = sortedWishes.filter(w => {
    if (filterType === 'pinned' && !w.isPinned) return false;
    if (filterType === 'hidden' && !w.isHidden) return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const sender = w.senderName?.toLowerCase() || '';
      const msg = w.message?.toLowerCase() || '';
      if (!sender.includes(term) && !msg.includes(term)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredWishes.length / itemsPerPage));
  const paginatedWishes = filteredWishes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Listen for real-time updates from PublicForms
  useEffect(() => {
    const handleWishAdded = () => {
      // Trigger a refresh of the dashboard
      window.dispatchEvent(new Event('refresh_dashboard'));
    };
    window.addEventListener('wish_added', handleWishAdded);
    return () => window.removeEventListener('wish_added', handleWishAdded);
  }, []);

  async function handleDelete(wishId) {
    const isConfirmed = await confirm('Hapus Ucapan', 'Yakin ingin menghapus ucapan ini?');
    if (!isConfirmed) return;
    try {
      await api.delete(`/invitations/me/wishes/${wishId}`);
      window.dispatchEvent(new Event('refresh_dashboard'));
      toast.success('Ucapan berhasil dihapus');
    } catch (err) {
      toast.error('Gagal menghapus ucapan');
    }
  }

  async function saveWishSettings(next) {
    setWishSettings(next);
    try {
      const res = await api.patch('/invitations/me/features', { wishesEnabled: next.enabled, wishesModerationEnabled: next.moderation });
      onUpdated?.({ ...invitation, invitationFeatures: res.data.features });
      toast.success('Pengaturan ucapan disimpan.');
    } catch (err) { setWishSettings(wishSettings); toast.error(err.response?.data?.error || 'Gagal menyimpan pengaturan ucapan.'); }
  }

  async function handleTogglePin(wish) {
    setLoadingId(`pin-${wish.id}`);
    try {
      await api.patch(`/invitations/me/wishes/${wish.id}`, { isPinned: !wish.isPinned });
      window.dispatchEvent(new Event('refresh_dashboard'));
    } catch (err) {
      toast.error('Gagal menyematkan ucapan');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleToggleHide(wish) {
    setLoadingId(`hide-${wish.id}`);
    try {
      await api.patch(`/invitations/me/wishes/${wish.id}`, { isHidden: !wish.isHidden });
      window.dispatchEvent(new Event('refresh_dashboard'));
    } catch (err) {
      toast.error('Gagal menyembunyikan ucapan');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleShare(wish) {
    setExportingId(wish.id);
    setExportData(wish);
    
    // Allow React to render the hidden component first before capturing
    setTimeout(async () => {
      if (exportRef.current) {
        try {
          const canvas = await html2canvas(exportRef.current, {
            scale: 2, // High resolution
            useCORS: true, // For external images
            backgroundColor: null
          });
          
          const dataUrl = canvas.toDataURL("image/png");
          const filename = `Ucapan-${wish.senderName}.png`;
          
          // Attempt native share if supported (mobile devices)
          let sharedNative = false;
          if (navigator.share) {
            try {
              const blob = await (await fetch(dataUrl)).blob();
              const file = new File([blob], filename, { type: 'image/png' });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: 'Wedding Wish',
                  files: [file]
                });
                sharedNative = true;
              }
            } catch (shareErr) {
              console.log('Share canceled or failed', shareErr);
              // Fallthrough to download if user didn't explicitly cancel but it failed
              if (shareErr.name !== 'AbortError') {
                 sharedNative = false;
              } else {
                 sharedNative = true; // User aborted native share, don't auto download
              }
            }
          }
          
          // Fallback to auto-download if not natively shared
          if (!sharedNative) {
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = filename;
              link.click();
          }
        } catch (error) {
          console.error("Error generating IG story:", error);
          toast.error('Gagal membuat gambar, silakan coba lagi.');
        } finally {
          setExportingId(null);
          setExportData(null);
        }
      }
    }, 500);
  }

  return (
    <>
      <h2 className="panel-header">{t('panels.ucapan_title') || 'Ucapan & Doa'}</h2>
      <p className="panel-sub">Sematkan doa terbaik, atau jadikan gambar untuk dipamerkan di IG Story-mu!</p>
      <div className="section-block" style={{ marginBottom: 18, fontSize: 12, color: 'var(--ink-soft)' }}>
        Form ucapan diaktifkan melalui tab Susunan &amp; Blok. Ucapan tidak pantas otomatis ditolak sebelum tersimpan.
      </div>

      {wishes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Cari nama atau ucapan..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'pinned', 'hidden'].map(f => (
              <button 
                key={f}
                onClick={() => setFilterType(f)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: filterType === f ? 'var(--accent)' : 'var(--line)',
                  background: filterType === f ? 'var(--accent)' : 'transparent',
                  color: filterType === f ? '#fff' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {f === 'all' ? 'Semua' : f === 'pinned' ? 'Disematkan' : 'Sembunyi'}
              </button>
            ))}
          </div>
        </div>
      )}

      {paginatedWishes.length === 0 ? (
        <div style={{ textAlign: 'center', opacity: 0.5, padding: 40 }}>
          {wishes.length === 0 ? 'Belum ada ucapan.' : 'Ucapan tidak ditemukan.'}
        </div>
      ) : (
        <div className="wishes-list" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {paginatedWishes.map((wish) => (
            <div key={wish.id} className={`wish-card ${wish.isHidden ? 'wish-hidden' : ''} ${wish.isPinned ? 'wish-pinned' : ''}`}>
              <div className="wish-card-header">
                <div>
                  <strong>{wish.senderName}</strong>
                  {wish.isPinned && <span className="badge badge-pin">📌 Disematkan</span>}
                  {wish.isHidden && <span className="badge badge-hide">👁️ Disembunyikan</span>}
                </div>
                <div className="wish-card-actions">
                  <Button 
                    variant="ghost" size="sm" 
                    onClick={() => handleShare(wish)}
                    isLoading={exportingId === wish.id}
                    icon={<i className="fa-brands fa-instagram"></i>}
                  >
                    IG Story
                  </Button>
                  <Button 
                    variant="ghost" size="sm"
                    onClick={() => handleTogglePin(wish)}
                    isLoading={loadingId === `pin-${wish.id}`}
                    icon={<i className="fa-solid fa-thumbtack"></i>}
                  >
                    {wish.isPinned ? 'Lepas' : 'Sematkan'}
                  </Button>
                  <Button 
                    variant="ghost" size="sm"
                    onClick={() => handleToggleHide(wish)}
                    isLoading={loadingId === `hide-${wish.id}`}
                    icon={<i className={wish.isHidden ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"}></i>}
                  >
                    {wish.isHidden ? 'Tampilkan' : 'Sembunyikan'}
                  </Button>
                  <Button 
                    variant="ghost" size="sm" style={{ color: 'red' }}
                    onClick={() => handleDelete(wish.id)}
                    icon={<i className="fa-solid fa-trash"></i>}
                  />
                </div>
              </div>
              <p className="wish-message">{wish.message}</p>
              <div className="wish-date">{new Date(wish.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <Button 
            variant="ghost" size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Halaman {currentPage} dari {totalPages}
          </span>
          <Button 
            variant="ghost" size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* HIDDEN EXPORT TEMPLATE FOR IG STORY */}
      {exportData && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={exportRef} className="ig-story-export-container">
            {/* Background Pattern / Image */}
            {couplePhoto && <img src={couplePhoto} alt="Couple" className="ig-story-bg" crossOrigin="anonymous" />}
            <div className="ig-story-overlay"></div>
            
            {/* Content */}
            <div className="ig-story-content">
              <div className="ig-story-couple">
                <h1>{groom} & {bride}</h1>
                <p>Wedding Wishes</p>
              </div>
              
              <div className="ig-story-card">
                <div className="quote-icon">"</div>
                <p className="ig-story-message">{exportData.message}</p>
                <div className="ig-story-sender">— {exportData.senderName}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
