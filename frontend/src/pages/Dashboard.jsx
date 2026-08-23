import { lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, clearToken, setActiveInvitationId } from '../api/client.js';
import PhonePreview from '../components/PhonePreview.jsx';
import DashboardSidebar from '../components/dashboard/DashboardSidebar.jsx';
import LangSwitcher from '../components/LangSwitcher.jsx';
import { useUI } from '../context/UIContext.jsx';
import { loadMidtransSnap } from '../utils/midtrans.js';

const TemaPanel = lazy(() => import('../components/TemaPanel.jsx'));
const KutipanPanel = lazy(() => import('../components/KutipanPanel.jsx'));
const WarnaPanel = lazy(() => import('../components/WarnaPanel.jsx'));
const ProfilPanel = lazy(() => import('../components/ProfilPanel.jsx'));
const AcaraPanel = lazy(() => import('../components/AcaraPanel.jsx'));
const RundownEditor = lazy(() => import('../components/RundownEditor.jsx'));
const CeritaPanel = lazy(() => import('../components/CeritaPanel.jsx'));
const GaleriPanel = lazy(() => import('../components/GaleriPanel.jsx'));
const TamuPanel = lazy(() => import('../components/TamuPanel.jsx'));
const LivestreamEditor = lazy(() => import('../components/LivestreamEditor.jsx'));
const HadiahPanel = lazy(() => import('../components/HadiahPanel.jsx'));
const PengaturanPanel = lazy(() => import('../components/PengaturanPanel.jsx'));
const BillingPanel = lazy(() => import('../components/BillingPanel.jsx'));
const WishesPanel = lazy(() => import('../components/WishesPanel.jsx'));
const AnalitikPanel = lazy(() => import('../components/AnalitikPanel.jsx'));
const VisualPanel = lazy(() => import('../components/VisualPanel.jsx'));
const TypographyPanel = lazy(() => import('../components/TypographyPanel.jsx'));
const SusunanPanel = lazy(() => import('../components/SusunanPanel.jsx'));
const DresscodeEditor = lazy(() => import('../components/DresscodeEditor.jsx'));
const CreateInvitationModal = lazy(() => import('../components/CreateInvitationModal.jsx'));
const DashboardOnboarding = lazy(() => import('../components/dashboard/DashboardOnboarding.jsx'));

// HadiahPanelPlaceholder removed

export default function Dashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [invitations, setInvitations] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedThemeId, setSelectedThemeId] = useState('exclusive-olan');
    const [previewMode, setPreviewMode] = useState('mobile'); // 'mobile', 'tablet', 'desktop'
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [activeMacroTab, setActiveMacroTab] = useState(() => localStorage.getItem('dashboardMacroTab') || 'desain');
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('dashboardActiveTab') || 'tema');
    const [returnTab, setReturnTab] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [payLoading, setPayLoading] = useState(false);
    const [previewGuest, setPreviewGuest] = useState(null);
    const [previewOverride, setPreviewOverride] = useState(null);
    const [railOpen, setRailOpen] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const { toast, confirm } = useUI();

    // Clear preview override when switching tabs or invitations
    useEffect(() => {
        setPreviewOverride(null);
    }, [activeTab, selectedId]);

    // Susunan Tab Lengkap (Dipindahkan ke bawah setelah selectedInvitation diinisialisasi)

    useEffect(() => {
        if (selectedId) {
            setActiveInvitationId(selectedId);
        }
    }, [selectedId]);

    useEffect(() => {
        localStorage.setItem('dashboardActiveTab', activeTab);
        localStorage.setItem('dashboardMacroTab', activeMacroTab);
    }, [activeTab, activeMacroTab]);

    useEffect(() => {
        async function initDashboard() {
            const savedSandbox = localStorage.getItem('sandbox_invitation');
            if (savedSandbox) {
                try {
                    setLoading(true);
                    const sandboxData = JSON.parse(savedSandbox);
                    // Create basic invitation from sandbox data
                    const res = await api.post('/invitations', {
                        brideName: sandboxData.coupleProfile?.brideName || 'Wanita',
                        groomName: sandboxData.coupleProfile?.groomName || 'Pria',
                        themeId: sandboxData.themeId || 'nisera',
                        weddingDate: '' // Or some default
                    });
                    const newInvId = res.data.invitation.id;
                    
                    // Patch profile if exists
                    if (sandboxData.coupleProfile) {
                        await api.patch('/invitations/me/couple-profile', sandboxData.coupleProfile, { headers: { 'x-invitation-id': newInvId }});
                    }
                    // Patch theme colors if exists
                    if (sandboxData.themeSettings) {
                        await api.patch('/invitations/me/theme', sandboxData.themeSettings, { headers: { 'x-invitation-id': newInvId }});
                    }
                    
                    toast.success('Desain dari Sandbox berhasil disimpan ke akun Anda!');
                } catch (e) {
                    console.error('Failed to import sandbox data', e);
                    toast.error('Gagal mengimpor data sandbox.');
                } finally {
                    localStorage.removeItem('sandbox_invitation');
                    fetchInvitations();
                }
            } else {
                fetchInvitations();
            }
            
            // Handle QR Check-in parameter
            const searchParams = new URLSearchParams(window.location.search);
            const checkinGuestId = searchParams.get('checkin');
            if (checkinGuestId) {
                handleCheckinGuest(checkinGuestId);
            }
        }
        
        initDashboard();
    }, []);

    async function handleCheckinGuest(guestId) {
        try {
            const res = await api.post(`/invitations/me/guests/${guestId}/checkin`);
            toast.success(res.data?.message || 'Check-in berhasil!');
            // Remove checkin from URL without refreshing
            window.history.replaceState({}, document.title, window.location.pathname);
            // Switch to tamu tab automatically
            setActiveTab('tamu');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Gagal check-in tamu.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    function fetchInvitations(silent = false) {
        if (!silent) setLoading(true);
        setFetchError(null);
        api
            .get('/invitations')
            .then((res) => {
                const list = res.data?.invitations || [];
                setInvitations(list);
                if (list.length > 0 && !selectedId) {
                    setSelectedId(list[0].id);
                    setActiveInvitationId(list[0].id);
                }
            })
            .catch((err) => {
                console.error('Gagal mengambil daftar undangan:', err);
                setFetchError(err.response?.data?.error || 'Gagal terhubung ke server.');
            })
            .finally(() => {
                if (!silent) setLoading(false);
            });
    }

    useEffect(() => {
        const handleRefresh = () => {
            fetchInvitations(true); // Silent refresh
        };
        window.addEventListener('refresh_dashboard', handleRefresh);
        return () => window.removeEventListener('refresh_dashboard', handleRefresh);
    }, []);

    function handleSelectTheme(themeId) {
        setSelectedThemeId(themeId);
        setShowCreateModal(true);
    }

    function handleUpdateInvitation(updatedData) {
        if (!updatedData?.id) return;
        setInvitations((prev) =>
            prev.map((inv) => (inv.id === updatedData.id ? { ...inv, ...updatedData } : inv))
        );
    }

    function handleCreatedNew(newInv) {
        if (!newInv) return;
        setInvitations((prev) => [newInv, ...prev]);
        setSelectedId(newInv.id);
        setShowCreateModal(false);
    }

    function handleDeletedInvitation(deletedId) {
        setInvitations((prev) => {
            const nextList = prev.filter((inv) => inv.id !== deletedId);
            if (nextList.length > 0) {
                setSelectedId(nextList[0].id);
            } else {
                setSelectedId(null);
            }
            return nextList;
        });
    }

    async function handleCheckout() {
        if (!selectedInvitation) return;
        setPayLoading(true);
        try {
            const res = await api.post(`/invitations/${selectedInvitation.id}/checkout`);
            const { snapToken } = res.data;

            const snap = await loadMidtransSnap();
            snap.pay(snapToken, {
                    onSuccess: () => fetchInvitations(),
                    onPending: () => fetchInvitations(),
                    onError: (err) => toast.error('Pembayaran gagal: ' + err.message)
                });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Gagal memproses pembayaran');
        } finally {
            setPayLoading(false);
        }
    }

    function handleLogout() {
        clearToken();
        navigate('/login');
    }

    if (loading) return <div className="loading-screen">{t('dashboard.loading') || 'Memuat...'}</div>;

    if (fetchError) {
        return (
            <div className="dashboard-fetch-error-container loading-screen">
                <p style={{ color: '#ff4d4f' }}>{fetchError}</p>
                <button className="btn-secondary" onClick={fetchInvitations}>Coba Lagi</button>
            </div>
        );
    }

    if (!invitations || invitations.length === 0) {
        return (
            <DashboardOnboarding
                showCreateModal={showCreateModal}
                setShowCreateModal={setShowCreateModal}
                selectedThemeId={selectedThemeId}
                handleSelectTheme={handleSelectTheme}
                handleCreatedNew={handleCreatedNew}
            />
        );
    }

    const rawInvitation = invitations.find((inv) => inv.id === selectedId) || invitations[0];
    const selectedInvitation = rawInvitation
        ? {
            ...rawInvitation,
            coupleProfile: rawInvitation.coupleProfile || {},
            themeSettings: rawInvitation.themeSettings || {},
            invitationFeatures: rawInvitation.invitationFeatures || {},
            events: rawInvitation.events || [],
            galleryMedia: rawInvitation.galleryMedia || [],
            timelineStories: rawInvitation.timelineStories || [],
            wishes: rawInvitation.wishes || [],
            guests: rawInvitation.guests || [],
            giftSettings: rawInvitation.giftSettings || {},
        }
        : null;

    const isDraft = selectedInvitation?.status === 'draft' || selectedInvitation?.packageType === 'TRIAL';

    const features = selectedInvitation?.invitationFeatures || {};

    // 1. MACRO TABS untuk Sidebar
    const MACRO_TABS = [
        { key: 'analitik', label: 'Analitik', icon: 'fa-chart-pie' },
        { key: 'desain', label: 'Desain', icon: 'fa-palette' },
        { key: 'konten', label: 'Konten', icon: 'fa-book-open' },
        { key: 'tamu', label: 'Tamu', icon: 'fa-users' },
        { key: 'sistem', label: 'Sistem', icon: 'fa-gear' },
    ];

    // 2. SUB TABS (Pills) untuk setiap Macro Tab
    const SUB_TABS = {
        analitik: [], // Analitik tidak punya sub-tab, langsung render panel
        desain: [
            { key: 'tema', label: 'Tema', icon: 'fa-palette' },
            { key: 'visual', label: 'Musik & Visual', icon: 'fa-music' },
            { key: 'warna', label: t('dashboard.tabs.warna') || 'Warna', icon: 'fa-fill-drip' },
            { key: 'typography', label: 'Typography', icon: 'fa-font' },
            { key: 'susunan', label: 'Susunan & Blok', icon: 'fa-layer-group' },
        ],
        konten: [
            { key: 'profil', label: t('dashboard.tabs.profil') || 'Profil', icon: 'fa-user-group' },
            { key: 'acara', label: t('dashboard.tabs.acara') || 'Acara', icon: 'fa-calendar-days' },
            { key: 'rundown', label: 'Rundown', icon: 'fa-clipboard-list' },
            features.storyEnabled && { key: 'cerita', label: 'Cerita', icon: 'fa-book-open' },
            features.dresscodeEnabled && { key: 'dresscode', label: 'Dresscode', icon: 'fa-shirt' },
            { key: 'galeri', label: t('dashboard.tabs.galeri') || 'Galeri', icon: 'fa-images' },
            features.livestreamEnabled && { key: 'livestream', label: 'Live Streaming', icon: 'fa-video' },
            { key: 'kutipan', label: 'Kutipan & Doa', icon: 'fa-book-quran' },
        ].filter(Boolean),
        tamu: [
            features.giftEnabled && { key: 'hadiah', label: 'Hadiah', icon: 'fa-gift' },
            { key: 'tamu', label: t('dashboard.tabs.tamu') || 'Tamu & RSVP', icon: 'fa-users' },
            { key: 'ucapan', label: t('dashboard.tabs.ucapan') || 'Ucapan', icon: 'fa-comment-dots' },
        ].filter(Boolean),
        sistem: [
            { key: 'pengaturan', label: 'Sistem URL', icon: 'fa-gear' },
            { key: 'paket', label: t('dashboard.tabs.paket') || 'Paket', icon: 'fa-crown' },
        ]
    };

    // Helper untuk mengubah Macro Tab dan otomatis memilih Sub Tab pertama (jika ada)
    const handleMacroTabChange = (macroKey) => {
        setActiveMacroTab(macroKey);
        setReturnTab(null);
        
        // Cek jika sub-tab saat ini tidak valid untuk macro tab baru
        const validSubTabs = SUB_TABS[macroKey] || [];
        const isCurrentSubTabValid = validSubTabs.some(t => t.key === activeTab);
        
        if (validSubTabs.length > 0 && !isCurrentSubTabValid) {
            setActiveTab(validSubTabs[0].key);
        } else if (validSubTabs.length === 0) {
            setActiveTab(macroKey); // fallback untuk analitik
        }
    };
    return (
        <div className="dashboard">
            {showCreateModal && (
                <CreateInvitationModal
                    selectedThemeId={selectedThemeId}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleCreatedNew}
                />
            )}

            {/* Sidebar Rail Bersih (Khusus Navigasi) */}
            <DashboardSidebar 
                TABS={MACRO_TABS} 
                activeTab={activeMacroTab} 
                setActiveTab={handleMacroTabChange} 
            />

            {/* Bottom Navbar untuk Mobile (ergonomis, di bawah layar) */}
            <nav className="bottom-nav" style={{ display: 'none' }}>
                {MACRO_TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`bottom-nav-item ${activeMacroTab === tab.key ? 'active' : ''}`}
                        onClick={() => handleMacroTabChange(tab.key)}
                        title={tab.label}
                    >
                        <i className={`fa-solid ${tab.icon}`}></i>
                        <span className="nav-label">{tab.label}</span>
                    </button>
                ))}
            </nav>

            {/* Panel Editor Utama */}
            <div className="panel mobile-content-wrapper">
                {/* Switcher Undangan Rapi di Atas Panel Editor */}
                <div className="panel-inv-switcher">
                    <div className="panel-inv-select-group">
                        <label>Pilih Undangan</label>
                        <div className="select-wrapper">
                            <select
                                value={selectedInvitation?.id || ''}
                                onChange={(e) => setSelectedId(e.target.value)}
                            >
                                {invitations.map((inv) => {
                                    const bride = inv.coupleProfile?.brideName || 'Wanita';
                                    const groom = inv.coupleProfile?.groomName || 'Pria';
                                    const labelStatus = inv.status === 'published' ? 'Aktif' : 'Draft';
                                    return (
                                        <option key={inv.id} value={inv.id}>
                                            {bride} &amp; {groom} ({labelStatus})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <span className="inv-count-badge">
                            {invitations.length}/3 Undangan
                        </span>
                    </div>
                    <button
                        className="btn-create-inv"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <i className="fa-solid fa-plus"></i> Buat Undangan
                    </button>
                </div>

                {/* Banner Warning Draft */}
                {isDraft && (
                    <div className="payment-warning-banner">
                        <div className="payment-warning-banner-text">
                            <strong>Undangan Masih Status Draft</strong>
                            <p>Aktivasi sekarang agar link <code>undanganmanten.id/{selectedInvitation?.slug}</code> bisa diakses publik.</p>
                        </div>
                        <button
                            className="btn-save"
                            onClick={handleCheckout}
                            disabled={payLoading}
                        >
                            {payLoading ? 'Memproses...' : 'Aktivasi / Bayar Sekarang'}
                        </button>
                    </div>
                )}



                {/* Sub Navigation (Pills) */}
                {SUB_TABS[activeMacroTab]?.length > 0 && (
                    <div className="subnav-container">
                        <div className="subnav-scroll">
                            {SUB_TABS[activeMacroTab].map(tab => (
                                <button
                                    key={tab.key}
                                    className={`subnav-item ${activeTab === tab.key ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab(tab.key);
                                        setReturnTab(null);
                                    }}
                                >
                                    {tab.icon && <i className={`fa-solid ${tab.icon}`}></i>}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {returnTab && (
                    <div style={{ marginBottom: '15px' }}>
                        <button 
                            onClick={() => {
                                setActiveMacroTab(returnTab.macro);
                                setActiveTab(returnTab.sub);
                                setReturnTab(null);
                            }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(128, 0, 32, 0.08)',
                                color: 'var(--wine-deep)',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '13px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <i className="fa-solid fa-arrow-left"></i> Kembali ke Susunan & Blok
                        </button>
                    </div>
                )}

                {/* Render Panel Berdasarkan Active Tab */}
                <Suspense fallback={<div className="loading-screen">Memuat editor...</div>}>
                {activeTab === 'analitik' && <AnalitikPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} />}
                {activeTab === 'tema' && <TemaPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} />}
                {activeTab === 'visual' && <VisualPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={setPreviewOverride} />}
                {activeTab === 'warna' && <WarnaPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={setPreviewOverride} />}
                {activeTab === 'typography' && <TypographyPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={setPreviewOverride} />}
                {activeTab === 'susunan' && <SusunanPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={setPreviewOverride} onNavigateTab={(macro, sub) => { setReturnTab({ macro: 'desain', sub: 'susunan' }); setActiveMacroTab(macro); setActiveTab(sub); }} />}
                {activeTab === 'kutipan' && <KutipanPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={setPreviewOverride} />}
                {activeTab === 'profil' && <ProfilPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={setPreviewOverride} />}
                {activeTab === 'acara' && <AcaraPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={setPreviewOverride} />}
                {activeTab === 'rundown' && <RundownEditor invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={setPreviewOverride} />}
                {activeTab === 'cerita' && (
                    <CeritaPanel
                        invitation={selectedInvitation}
                        onUpdated={handleUpdateInvitation}
                        onLivePreview={setPreviewOverride}
                    />
                )}
                {activeTab === 'galeri' && <GaleriPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={setPreviewOverride} />}
                {activeTab === 'dresscode' && <DresscodeEditor invitation={selectedInvitation} onUpdated={handleUpdateInvitation} />}
                {activeTab === 'hadiah' && <HadiahPanel invitation={selectedInvitation} onUpdated={(inv) => { setInvitations(invs => invs.map(i => i.id === inv.id ? inv : i)); setSelectedId(inv.id); }} />}
                {activeTab === 'tamu' && <TamuPanel
                    invitation={selectedInvitation}
                    onUpdated={handleUpdateInvitation}
                    onSelectPreviewGuest={setPreviewGuest}
                />}
                {activeTab === 'ucapan' && <WishesPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} />}
                {activeTab === 'livestream' && <LivestreamEditor invitation={selectedInvitation} onUpdated={handleUpdateInvitation} />}
                {activeTab === 'pengaturan' && (
                    <PengaturanPanel
                        invitation={selectedInvitation}
                        onUpdated={handleUpdateInvitation}
                        onDeleted={handleDeletedInvitation}
                        onLivePreview={setPreviewOverride}
                    />
                )}
                {activeTab === 'paket' && (
                    <BillingPanel
                        invitation={selectedInvitation}
                        onUpdated={handleUpdateInvitation}
                        onCheckout={handleCheckout}
                    />
                )}
                </Suspense>
            </div>

            {/* Stage Preview HP (iPhone 17 dengan Dynamic Island) */}
            <div className={`stage ${showMobilePreview ? 'is-mobile-preview-open' : ''}`}>
                <div className="stage-topbar">
                    <div className="stage-url">
                        undanganmanten.id/{selectedInvitation?.slug}
                        {isDraft && (
                            <span className="badge-draft badge-draft-label">
                                Draft
                            </span>
                        )}
                    </div>
                    <div className="stage-topbar-actions">
                        <button className="stage-close-btn" onClick={() => setShowMobilePreview(false)} style={{ display: showMobilePreview ? 'flex' : 'none' }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <div className="stage-topbar-device-switch">
                            <button onClick={() => setPreviewMode('mobile')} title="Mobile" className={`device-switch-btn ${previewMode === 'mobile' ? 'active' : ''}`}>
                                <i className="fa-solid fa-mobile-screen"></i>
                            </button>
                            <button onClick={() => setPreviewMode('tablet')} title="iPad" className={`device-switch-btn ${previewMode === 'tablet' ? 'active' : ''}`}>
                                <i className="fa-solid fa-tablet-screen-button"></i>
                            </button>
                            <button onClick={() => setPreviewMode('tablet-pro')} title="iPad Pro" className={`device-switch-btn ${previewMode === 'tablet-pro' ? 'active' : ''}`}>
                                <i className="fa-solid fa-tablet"></i>
                            </button>
                            <button onClick={() => setPreviewMode('desktop')} title="Desktop" className={`device-switch-btn ${previewMode === 'desktop' ? 'active' : ''}`}>
                                <i className="fa-solid fa-desktop"></i>
                            </button>
                        </div>
                        <LangSwitcher className="lang-switcher-dashboard" />
                        <button className="logout-btn" onClick={handleLogout}>
                            {t('dashboard.logout') || 'Keluar'}
                        </button>
                    </div>
                </div>
                {/* Wrapper Preview */}
                <div className="preview-wrapper">
                    <div className={`iphone-mockup-stage preview-mode-${previewMode}`}>
                        {previewMode === 'mobile' && <div className="dynamic-island"></div>}
                        <PhonePreview invitation={previewOverride ? { ...selectedInvitation, ...previewOverride } : selectedInvitation} isDraft={isDraft} previewGuest={previewGuest} />
                    </div>
                </div>
            </div>

            {/* FAB untuk Lihat Preview di Mobile */}
            <button className="mobile-preview-fab" onClick={() => setShowMobilePreview(true)}>
                <i className="fa-solid fa-mobile-screen"></i> Lihat Undangan
            </button>

            {/* Bottom Nav for Mobile */}
            <div className="bottom-nav">
                {MACRO_TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`bottom-nav-item ${activeMacroTab === tab.key ? 'active' : ''}`}
                        onClick={() => handleMacroTabChange(tab.key)}
                    >
                        <i className={`fa-solid ${tab.icon}`}></i>
                        <span className="nav-label">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
