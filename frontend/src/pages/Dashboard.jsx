import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, clearToken, setActiveInvitationId } from '../api/client.js';
import PhonePreview from '../components/PhonePreview.jsx';
import DashboardSidebar from '../components/dashboard/DashboardSidebar.jsx';
import LangSwitcher from '../components/LangSwitcher.jsx';
import { useUI } from '../context/UIContext.jsx';
import { loadMidtransSnap } from '../utils/midtrans.js';
import { mergePreviewOverride } from '../utils/mergePreviewOverride.js';
import { normalizeActiveThemeId } from '../utils/activeTheme.js';
const SUPPORTED_THEME_IDS = ['eternal', 'seraya', 'nawasena', 'isvara', 'lanqing', 'celluloid', 'nocturne'];

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
const IGFilterEditor = lazy(() => import('../components/IGFilterEditor.jsx'));
const HadiahPanel = lazy(() => import('../components/HadiahPanel.jsx'));
const PengaturanPanel = lazy(() => import('../components/PengaturanPanel.jsx'));
const BillingPanel = lazy(() => import('../components/BillingPanel.jsx'));
const WishesPanel = lazy(() => import('../components/WishesPanel.jsx'));
const AnalitikPanel = lazy(() => import('../components/AnalitikPanel.jsx'));
const VisualPanel = lazy(() => import('../components/VisualPanel.jsx'));
const TypographyPanel = lazy(() => import('../components/TypographyPanel.jsx'));
const SusunanPanel = lazy(() => import('../components/SusunanPanel.jsx'));
const DresscodeEditor = lazy(() => import('../components/DresscodeEditor.jsx'));
const PenutupPanel = lazy(() => import('../components/PenutupPanel.jsx'));
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
    const [previewDirty, setPreviewDirty] = useState(false);
    const previewInteractionRef = useRef(false);
    const [railOpen, setRailOpen] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const { toast, confirm } = useUI();

    const handleLivePreview = useCallback((patch) => {
        if (patch == null) {
            setPreviewOverride(null);
            setPreviewDirty(false);
            return;
        }
        setPreviewOverride((current) => mergePreviewOverride(current || {}, patch));
        if (previewInteractionRef.current) setPreviewDirty(true);
    }, []);

    const markPreviewInteraction = useCallback(() => {
        previewInteractionRef.current = true;
        window.requestAnimationFrame(() => {
            previewInteractionRef.current = false;
        });
    }, []);

    // Clear preview override when switching tabs or invitations
    useEffect(() => {
        setPreviewOverride(null);
        setPreviewDirty(false);
        previewInteractionRef.current = false;
    }, [activeTab, selectedId]);

    useEffect(() => {
        const warnBeforeLeave = (event) => {
            if (!previewDirty) return;
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warnBeforeLeave);
        return () => window.removeEventListener('beforeunload', warnBeforeLeave);
    }, [previewDirty]);

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
                    const sandboxWeddingDate = sandboxData.events?.find((event) => event.date)?.date
                        || sandboxData.weddingDate
                        || new Date(Date.now() + (180 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
                    // Create basic invitation from sandbox data
                    const res = await api.post('/invitations', {
                        brideName: sandboxData.coupleProfile?.brideName || 'Wanita',
                        groomName: sandboxData.coupleProfile?.groomName || 'Pria',
                        themeId: SUPPORTED_THEME_IDS.includes(sandboxData.themeId) ? sandboxData.themeId : 'eternal',
                        weddingDate: sandboxWeddingDate
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
                    await api.patch(`/invitations/${newInvId}`, {
                        themeId: SUPPORTED_THEME_IDS.includes(sandboxData.themeId) ? sandboxData.themeId : 'eternal',
                        weddingDate: sandboxWeddingDate,
                    });
                    
                    toast.success('Desain dari Mode Coba berhasil disimpan ke akun Anda!');
                } catch (e) {
                    console.error('Failed to import sandbox data', e);
                    toast.error('Gagal mengimpor data dari Mode Coba.');
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
        setPreviewOverride(null);
        setPreviewDirty(false);
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

    async function handlePublish() {
        if (!selectedInvitation) return;
        setPayLoading(true);
        try {
            const res = await api.patch(`/invitations/${selectedInvitation.id}`, { status: 'published' });
            handleUpdateInvitation(res.data.invitation);
            toast.success('Undangan berhasil dipublikasikan.');
        } catch (err) { toast.error(err.response?.data?.error || 'Undangan belum siap dipublikasikan.'); }
        finally { setPayLoading(false); }
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
            themeId: normalizeActiveThemeId(rawInvitation.themeId),
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
    const publicationChecks = selectedInvitation ? [
        { label: 'Profil kedua mempelai', ok: !!(selectedInvitation.coupleProfile?.brideName && selectedInvitation.coupleProfile?.groomName) },
        { label: 'Detail acara (tanggal, jam, lokasi, alamat)', ok: !!selectedInvitation.events?.length && selectedInvitation.events.every((e) => e.date && e.startTime && e.venueName && e.address) },
        { label: 'Informasi hadiah atau blok dinonaktifkan', ok: !features.giftEnabled || !!(selectedInvitation.giftSettings && ((selectedInvitation.giftSettings.type === 'address' && selectedInvitation.giftSettings.shippingAddress) || (selectedInvitation.giftSettings.type === 'bank_transfer' && (selectedInvitation.giftSettings.bankAccounts?.length || selectedInvitation.giftSettings.accountNumber)) || (selectedInvitation.giftSettings.type === 'both' && selectedInvitation.giftSettings.shippingAddress && (selectedInvitation.giftSettings.bankAccounts?.length || selectedInvitation.giftSettings.accountNumber)))) },
        { label: 'Live streaming atau blok dinonaktifkan', ok: !features.livestreamEnabled || !!selectedInvitation.livestreamSettings?.url },
    ] : [];

    // 1. MACRO TABS untuk Sidebar
    const MACRO_TABS = [
        { key: 'analitik', label: t('dashboard.nav.analytics'), icon: 'fa-chart-pie' },
        { key: 'desain', label: t('dashboard.nav.design'), icon: 'fa-palette' },
        { key: 'konten', label: t('dashboard.nav.content'), icon: 'fa-book-open' },
        { key: 'tamu', label: t('dashboard.nav.guests'), icon: 'fa-users' },
        { key: 'sistem', label: t('dashboard.nav.system'), icon: 'fa-gear' },
    ];

    // 2. SUB TABS (Pills) untuk setiap Macro Tab
    const SUB_TABS = {
        analitik: [], // Analitik tidak punya sub-tab, langsung render panel
        desain: [
            { key: 'tema', label: t('dashboard.nav.theme'), icon: 'fa-palette' },
            { key: 'visual', label: t('dashboard.nav.visual'), icon: 'fa-music' },
            { key: 'warna', label: t('dashboard.nav.colors'), icon: 'fa-fill-drip' },
            { key: 'typography', label: t('dashboard.nav.typography'), icon: 'fa-font' },
            { key: 'susunan', label: t('dashboard.nav.blocks'), icon: 'fa-layer-group' },
        ],
        konten: [
            { key: 'kutipan', label: t('dashboard.nav.quote'), icon: 'fa-book-quran' },
            { key: 'profil', label: t('dashboard.nav.profile'), icon: 'fa-user-group' },
            { key: 'acara', label: t('dashboard.nav.event'), icon: 'fa-calendar-days' },
            { key: 'galeri', label: t('dashboard.nav.gallery'), icon: 'fa-images' },
            { key: 'rundown', label: t('dashboard.nav.rundown'), icon: 'fa-clipboard-list' },
            features.storyEnabled && { key: 'cerita', label: t('dashboard.nav.story'), icon: 'fa-book-open' },
            features.dresscodeEnabled && { key: 'dresscode', label: t('dashboard.nav.dresscode'), icon: 'fa-shirt' },
            features.livestreamEnabled && { key: 'livestream', label: t('dashboard.nav.livestream'), icon: 'fa-video' },
            features.igFilterEnabled && { key: 'igfilter', label: 'Filter Instagram', icon: 'fa-camera-retro' },
            { key: 'tamu', label: t('dashboard.nav.rsvp'), icon: 'fa-clipboard-check' },
            { key: 'hadiah', label: t('dashboard.nav.gift'), icon: 'fa-gift' },
            { key: 'ucapan', label: `${t('dashboard.nav.wishes')}${selectedInvitation?.wishes?.length ? ` (${selectedInvitation.wishes.length})` : ''}`, icon: 'fa-comment-dots' },
            { key: 'penutup', label: t('dashboard.nav.closing'), icon: 'fa-heart' },
        ].filter(Boolean),
        tamu: [
            { key: 'tamu', label: t('dashboard.tabs.tamu') || 'Tamu & RSVP', icon: 'fa-users' },
            { key: 'ucapan', label: `${t('dashboard.tabs.ucapan') || 'Ucapan'}${selectedInvitation?.wishes?.length ? ` (${selectedInvitation.wishes.length})` : ''}`, icon: 'fa-comment-dots' },
        ].filter(Boolean),
        sistem: [
            { key: 'pengaturan', label: t('dashboard.nav.url'), icon: 'fa-gear' },
            { key: 'paket', label: t('dashboard.nav.package'), icon: 'fa-crown' },
        ]
    };

    // Helper untuk mengubah Macro Tab dan otomatis memilih Sub Tab pertama (jika ada)
    const confirmPreviewNavigation = async () => {
        if (!previewDirty) return true;
        const proceed = await confirm('Perubahan belum disimpan', 'Preview sudah berubah, tetapi perubahan ini belum disimpan ke database. Tetap pindah tab dan batalkan perubahan?');
        if (proceed) {
            setPreviewOverride(null);
            setPreviewDirty(false);
        }
        return proceed;
    };

    const handleMacroTabChange = async (macroKey) => {
        if (macroKey !== activeMacroTab && !(await confirmPreviewNavigation())) return;
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
                    isFirstInvitation={invitations.length === 0}
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
                            <strong>{selectedInvitation?.packageType === 'TRIAL' ? 'Undangan Belum Diaktivasi' : 'Undangan Belum Dipublikasikan'}</strong>
                            <p>{selectedInvitation?.packageType === 'TRIAL' ? 'Aktivasi paket terlebih dahulu.' : 'Lengkapi checklist konten lalu publikasikan'} agar link <code>undanganmanten.id/{selectedInvitation?.slug}</code> bisa diakses publik.</p>
                            {selectedInvitation?.packageType !== 'TRIAL' && <div style={{ marginTop: 8 }}>{publicationChecks.map((check) => <div key={check.label} style={{ fontSize: 12, color: check.ok ? '#287a46' : '#9d3b32' }}>{check.ok ? '✓' : '○'} {check.label}</div>)}</div>}
                        </div>
                        <button
                            className="btn-save"
                            onClick={selectedInvitation?.packageType === 'TRIAL' ? handleCheckout : handlePublish}
                            disabled={payLoading}
                        >
                            {payLoading ? 'Memproses...' : selectedInvitation?.packageType === 'TRIAL' ? 'Aktivasi / Bayar Sekarang' : 'Publikasikan Undangan'}
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
                                    onClick={async () => {
                                        if (tab.key !== activeTab && !(await confirmPreviewNavigation())) return;
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

                {previewDirty && (
                    <div className="unsaved-preview-notice" role="status">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>Perubahan sudah terlihat di preview, tetapi belum tersimpan. Klik tombol Simpan pada panel ini sebelum berpindah tab.</span>
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
                <div
                    onClickCapture={markPreviewInteraction}
                    onInputCapture={markPreviewInteraction}
                    onChangeCapture={markPreviewInteraction}
                >
                <Suspense fallback={<div className="loading-screen">Memuat editor...</div>}>
                {activeTab === 'analitik' && <AnalitikPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} />}
                {activeTab === 'tema' && <TemaPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} />}
                {activeTab === 'visual' && <VisualPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'warna' && <WarnaPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'typography' && <TypographyPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'susunan' && <SusunanPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} onNavigateTab={(macro, sub) => { setReturnTab({ macro: 'desain', sub: 'susunan' }); setActiveMacroTab(macro); setActiveTab(sub); }} />}
                {activeTab === 'kutipan' && <KutipanPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'profil' && <ProfilPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'acara' && <AcaraPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'rundown' && <RundownEditor invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'cerita' && (
                    <CeritaPanel
                        invitation={selectedInvitation}
                        onUpdated={handleUpdateInvitation}
                        onLivePreview={handleLivePreview}
                    />
                )}
                {activeTab === 'galeri' && <GaleriPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'dresscode' && <DresscodeEditor invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'hadiah' && <HadiahPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'tamu' && <TamuPanel
                    invitation={selectedInvitation}
                    onUpdated={handleUpdateInvitation}
                    onSelectPreviewGuest={setPreviewGuest}
                />}
                {activeTab === 'ucapan' && <WishesPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} />}
                {activeTab === 'penutup' && <PenutupPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'livestream' && <LivestreamEditor invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'igfilter' && <IGFilterEditor invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'pengaturan' && (
                    <PengaturanPanel
                        invitation={selectedInvitation}
                        onUpdated={handleUpdateInvitation}
                        onDeleted={handleDeletedInvitation}
                        onLivePreview={handleLivePreview}
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
                        <PhonePreview invitation={previewOverride ? mergePreviewOverride(selectedInvitation, previewOverride) : selectedInvitation} editorPreview previewGuest={previewGuest} />
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
