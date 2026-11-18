import {grabScroll} from '../../public/templates/shared/grab-scroll.js';
import EnvelopeColorPanel from '../components/EnvelopeColorPanel.jsx';
import MobilePreviewFit from '../components/MobilePreviewFit.jsx';
import StudioTabIcon from '../components/atelier/StudioTabIcon.jsx';
import LoadingScreen from '../components/atelier/LoadingScreen.jsx';
import { DashboardThemeToggle } from '../components/atelier/CanvasRouteFrame.jsx';
import {invitationStatusLabel} from '../utils/invitationStatus.js';
import {ACTIVE_THEME_IDS} from '../config/templateRegistry.js';
import {ContentSaveTarget} from '../components/ui/ContentSaveAction.jsx';
import {isMentalCanvas} from '../components/MentalCanvasMediaPanel.jsx';
import { importSandboxOnce } from '../utils/sandboxImport.js';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, clearToken, setActiveInvitationId } from '../api/client.js';
import PhonePreview from '../components/PhonePreview.jsx';
import DashboardSidebar from '../components/dashboard/DashboardSidebar.jsx';
import LangSwitcher from '../components/LangSwitcher.jsx';
import { useUI } from '../context/UIContext.jsx';
import { mergePreviewOverride, composeInvitationPreview } from '../utils/mergePreviewOverride.js';
import { normalizeActiveThemeId } from '../utils/activeTheme.js';
const SUPPORTED_THEME_IDS = ACTIVE_THEME_IDS;

const TemaPanel = lazy(() => import('../components/TemaPanel.jsx'));
const KutipanPanel = lazy(() => import('../components/KutipanPanel.jsx'));
const WarnaPanel = lazy(() => import('../components/WarnaPanel.jsx'));
const ProfilPanel = lazy(() => import('../components/ProfilPanel.jsx'));
const SaveDatePanel = lazy(() => import('../components/SaveDatePanel.jsx'));
const AcaraPanel = lazy(() => import('../components/AcaraPanel.jsx'));
const RundownEditor = lazy(() => import('../components/RundownEditor.jsx'));
const CeritaPanel = lazy(() => import('../components/CeritaPanel.jsx'));
const GaleriPanel = lazy(() => import('../components/GaleriPanel.jsx'));
const LivestreamEditor = lazy(() => import('../components/LivestreamEditor.jsx'));
const IGFilterEditor = lazy(() => import('../components/IGFilterEditor.jsx'));
const HadiahPanel = lazy(() => import('../components/HadiahPanel.jsx'));
const VisualPanel = lazy(() => import('../components/VisualPanel.jsx'));
const TypographyPanel = lazy(() => import('../components/TypographyPanel.jsx'));
const SusunanPanel = lazy(() => import('../components/SusunanPanel.jsx'));
const DresscodeEditor = lazy(() => import('../components/DresscodeEditor.jsx'));
const PenutupPanel = lazy(() => import('../components/PenutupPanel.jsx'));
const CreateInvitationModal = lazy(() => import('../components/CreateInvitationModal.jsx'));
const WeddingWorkspace = lazy(() => import('../components/dashboard/WeddingWorkspace.jsx'));

// HadiahPanelPlaceholder removed

export default function Dashboard() {
    const { t } = useTranslation();
    const [viewParams,setViewParams]=useSearchParams();
    const editorMode=viewParams.has('invitation')&&!viewParams.has('section');
    useEffect(()=>{if(viewParams.get('invitation'))setSelectedId(viewParams.get('invitation'))},[viewParams]);
    function openEditor(inv,mode){setSelectedId(inv.id);setActiveInvitationId(inv.id);const destination={profile:['konten','profil'],events:['konten','acara'],gift:['konten','hadiah'],livestream:['konten','livestream'],package:['desain','tema'],expiry:['desain','tema']}[mode];if(destination){setActiveMacroTab(destination[0]);setActiveTab(destination[1])}setViewParams({invitation:inv.id,view:'studio'});setShowMobilePreview(mode==='preview')}
    async function openLibrary(){if(previewDirty&&!await confirm('Perubahan belum disimpan','Kembali ke dashboard dan batalkan perubahan pratinjau yang belum disimpan?'))return;setViewParams({section:'invitations'});setShowMobilePreview(false)}

    const [typographySection,setTypographySection]=useState('cover');
    useEffect(()=>{const aliases={janji:'quote',wanita:'bride',pria:'groom',akad:'events',cerita:'story',galeri:'gallery',filter:'igFilter',penutup:'footer'};const receive=e=>setTypographySection(aliases[e.detail]||e.detail);window.addEventListener('invitation:scene',receive);return()=>window.removeEventListener('invitation:scene',receive)},[]);
    const [invitations, setInvitations] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedThemeId, setSelectedThemeId] = useState('garden-canvas');
    const [contentSaveTarget,setContentSaveTarget]=useState(null);
    const [previewRevision,setPreviewRevision]=useState(0);
    const [previewMode, setPreviewMode] = useState('mobile'); // 'mobile', 'tablet', 'desktop'
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [activeMacroTab, setActiveMacroTab] = useState(() => localStorage.getItem('studioMacroTab') || 'desain');
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('studioActiveTab') || 'tema');
    useEffect(()=>{const inv=invitations.find(i=>i.id===viewParams.get('invitation'))||invitations[0];if(activeTab==='warna'&&isMentalCanvas(inv?.themeId)){setActiveTab('tema')}},[activeTab,invitations,viewParams]);
    const [returnTab, setReturnTab] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [previewGuest, setPreviewGuest] = useState(null);
    const [previewOverride, setPreviewOverride] = useState(null);
    const [typographyOverride,setTypographyOverride]=useState(null);
    useEffect(()=>setTypographyOverride(null),[selectedId]);
    const previewTypography=useCallback(patch=>setTypographyOverride(patch?.themeSettings?.typography||null),[]);
    const updateTypography=useCallback(updated=>setInvitations(items=>items.map(item=>item.id===updated.id?{...item,themeSettings:{...item.themeSettings,typography:updated.themeSettings.typography}}:item)),[]);
    const [previewDirty, setPreviewDirty] = useState(false);
    const previewInteractionRef = useRef(false);
    const [railOpen, setRailOpen] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const { toast, confirm } = useUI();
    useEffect(()=>{if(!['desain','konten'].includes(activeMacroTab)||['analitik','tamu','ucapan','pengaturan','paket'].includes(activeTab)){setActiveMacroTab('desain');setActiveTab('tema')}},[activeMacroTab,activeTab]);

    const handleLivePreview = useCallback((patch, forceDirty = false) => {
        if (patch == null) {
            setPreviewOverride(null);
            setPreviewDirty(false);
            return;
        }
        setPreviewOverride((current) => mergePreviewOverride(current || {}, patch));
        if (forceDirty || previewInteractionRef.current) setPreviewDirty(true);
    }, []);

    const handleAutoPreview=useCallback(patch=>{previewInteractionRef.current=false;handleLivePreview(patch)},[handleLivePreview]);

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
        setActiveInvitationId(viewParams.get('invitation')||null);
    }, [selectedId,editorMode,viewParams]);

    useEffect(() => {
        localStorage.setItem('studioActiveTab', activeTab);
        localStorage.setItem('studioMacroTab', activeMacroTab);
    }, [activeTab, activeMacroTab]);

    useEffect(() => {
        let cancelled = false;
        async function initDashboard() {
            // Show the dashboard immediately; draft import must not block first paint.
            fetchInvitations();
            try {
                const imported = await importSandboxOnce({storage:localStorage,api,supportedThemes:SUPPORTED_THEME_IDS});
                if (!cancelled && imported) { toast.success('Desain dari Mode Coba berhasil disimpan ke akun Anda!'); fetchInvitations(true); }
            } catch (error) {
                console.error('Failed to import sandbox data', error);
                if (!cancelled) toast.error('Data Mode Coba belum berhasil diimpor. Draf tetap tersimpan; buka Mode Coba untuk mencoba lagi.');
            }
            if (cancelled) return;

            // Handle QR Check-in parameter
            const searchParams = new URLSearchParams(window.location.search);
            const checkinGuestId = searchParams.get('checkin');
            if (checkinGuestId) {
                setViewParams({section:'guests',checkin:checkinGuestId,...(searchParams.get('invitation')?{invitation:searchParams.get('invitation')}:{})});
            }
        }
        
        initDashboard();
        return () => { cancelled = true; };
    }, []);

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
        window.addEventListener('guest_updated', handleRefresh);
        return () => {window.removeEventListener('refresh_dashboard', handleRefresh);window.removeEventListener('guest_updated', handleRefresh)};
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
        openEditor(newInv);
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

    function handleLogout() {
        clearToken();
        window.location.replace('/login');
    }

    const rawInvitation = invitations.find((inv) => inv.id === viewParams.get('invitation')) || invitations[0];
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


    const features = previewOverride?.invitationFeatures || selectedInvitation?.invitationFeatures || {};
    let layoutOrder = previewOverride?.themeSettings?.layoutOrder ?? selectedInvitation?.themeSettings?.layoutOrder;
    if (typeof layoutOrder === 'string') {
        try { layoutOrder = JSON.parse(layoutOrder); }
        catch { layoutOrder = null; }
    }
    const blockEnabled = (id, feature, defaultEnabled = true) => {
        const block = Array.isArray(layoutOrder) ? layoutOrder.find(item => item?.id === id) : undefined;
        return block?.enabled !== false && (feature ? (features[feature] ?? block?.enabled ?? defaultEnabled) : true);
    };
    // 1. MACRO TABS untuk Sidebar
    const MACRO_TABS = [
        { key: 'desain', label: t('dashboard.nav.design'), icon: 'fa-palette' },
        { key: 'konten', label: t('dashboard.nav.content'), icon: 'fa-book-open' },
    ];

    // 2. SUB TABS (Pills) untuk setiap Macro Tab
    const SUB_TABS = {
        desain: [
            { key: 'tema', label: t('dashboard.nav.theme'), icon: 'fa-palette' },
            { key: 'visual', label: (isMentalCanvas(selectedInvitation?.themeId) || selectedInvitation?.themeId === 'engine-4') ? 'Musik' : t('dashboard.nav.visual'), icon: 'fa-music' },
            ...(!isMentalCanvas(selectedInvitation?.themeId)?[{ key: 'warna', label: selectedInvitation?.themeId === 'engine-4' ? 'Amplop' : t('dashboard.nav.colors'), icon: 'fa-fill-drip' }]:[]),
            { key: 'typography', label: t('dashboard.nav.typography'), icon: 'fa-font' },
            { key: 'susunan', label: t('dashboard.nav.blocks'), icon: 'fa-layer-group' },
        ],
        konten: [
            blockEnabled('quote') && { key: 'kutipan', label: t('dashboard.nav.quote'), icon: 'fa-book-quran' },
            blockEnabled('profile') && { key: 'profil', label: t('dashboard.nav.profile'), icon: 'fa-user-group' },
            blockEnabled('countdown') && { key: 'saveDate', label: 'Simpan Tanggal', icon: 'fa-calendar-check' },
            blockEnabled('events') && { key: 'acara', label: 'Informasi Acara', icon: 'fa-calendar-days' },
            blockEnabled('gallery') && { key: 'galeri', label: t('dashboard.nav.gallery'), icon: 'fa-images' },
            blockEnabled('rundown', 'rundownEnabled') && { key: 'rundown', label: t('dashboard.nav.rundown'), icon: 'fa-clipboard-list' },
            blockEnabled('story', 'storyEnabled', false) && { key: 'cerita', label: t('dashboard.nav.story'), icon: 'fa-book-open' },
            blockEnabled('dresscode', 'dresscodeEnabled', false) && { key: 'dresscode', label: t('dashboard.nav.dresscode'), icon: 'fa-shirt' },
            blockEnabled('livestream', 'livestreamEnabled', false) && { key: 'livestream', label: t('dashboard.nav.livestream'), icon: 'fa-video' },
            blockEnabled('igFilter', 'igFilterEnabled', false) && { key: 'igfilter', label: 'Bingkai Foto', icon: 'fa-camera-retro' },
            (blockEnabled('rsvp', 'rsvpEnabled') || blockEnabled('wishes', 'wishesEnabled')) && { key: 'rsvp', label: 'RSVP & Ucapan', icon: 'fa-comment-dots' },
            blockEnabled('gift', 'giftEnabled') && { key: 'hadiah', label: t('dashboard.nav.gift'), icon: 'fa-gift' },
            blockEnabled('footer') && { key: 'penutup', label: t('dashboard.nav.closing'), icon: 'fa-heart' },
        ].filter(Boolean),
    };

    const firstContentTab = SUB_TABS.konten[0]?.key || 'konten';
    const contentTabIsVisible = SUB_TABS.konten.some(tab => tab.key === activeTab);
    useEffect(() => {
        if (editorMode && activeMacroTab === 'konten' && !contentTabIsVisible) {
            setActiveTab(firstContentTab);
        }
    }, [editorMode, activeMacroTab, contentTabIsVisible, firstContentTab]);

    const studioTabs = useRef(null);
    const studioTabScrollbar = useRef(null);
    useEffect(() => {
        const row = studioTabs.current;
        const track = studioTabScrollbar.current;
        if (!row || !track) return;
        let timer;
        const update = () => {
            const overflow = row.scrollWidth - row.clientWidth;
            const fraction = row.clientWidth / (row.scrollWidth || 1);
            track.hidden = overflow <= 1;
            track.style.setProperty('--thumb-width', `${fraction * 100}%`);
            track.style.setProperty('--thumb-left', `${row.scrollLeft / (row.scrollWidth || 1) * 100}%`);
        };
        const onScroll = () => {
            update();
            track.dataset.scrolling = 'true';
            clearTimeout(timer);
            timer = setTimeout(() => delete track.dataset.scrolling, 250);
        };
        const releaseRow = grabScroll(row);
        const releaseTrack = grabScroll(track, row);
        const observer = new ResizeObserver(update);
        observer.observe(row);
        for (const tab of row.children) observer.observe(tab);
        row.addEventListener('scroll', onScroll, { passive: true });
        update();
        return () => {
            releaseRow();
            releaseTrack();
            observer.disconnect();
            row.removeEventListener('scroll', onScroll);
            clearTimeout(timer);
            delete track.dataset.scrolling;
        };
    });
    useEffect(() => {
        const row = studioTabs.current;
        const active = row?.querySelector('[aria-pressed="true"]');
        if (active) row.scrollLeft += active.getBoundingClientRect().left - row.getBoundingClientRect().left - (row.clientWidth - active.offsetWidth) / 2;
    }, [activeMacroTab, activeTab, viewParams, loading]);
    if (loading) return <LoadingScreen label={t('dashboard.loading')} />;

    if (fetchError) {
        return (
            <div className="dashboard-fetch-error-container loading-screen">
                <p style={{ color: '#ff4d4f' }}>{fetchError}</p>
                <button className="btn-secondary" onClick={fetchInvitations}>Coba Lagi</button>
            </div>
        );
    }

    if (!editorMode || !invitations.some(inv=>inv.id===viewParams.get('invitation')&&!['archived','trashed'].includes(inv.status))) {
        return <WeddingWorkspace invitations={invitations} onEdit={openEditor} onUpdated={handleUpdateInvitation} onRefresh={()=>fetchInvitations(true)} onCreated={handleCreatedNew} onLogout={handleLogout} onDeleted={handleDeletedInvitation} onPreviewGuest={(inv,guest)=>{setPreviewGuest(guest);openEditor(inv,'preview')}}/>;
    }

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
        <div className={`dashboard ${showMobilePreview ? 'mobile-studio-preview' : ''}`}>
            <div className="mobile-studio-bar" role="group" aria-label="Tampilan studio">
                <div className="mobile-studio-header">
                    <button type="button" aria-label="Kembali ke Undangan" onClick={openLibrary}><i className="fa-solid fa-arrow-left" aria-hidden="true" /></button>
                    <select aria-label="Pilih undangan" value={selectedInvitation.id} onChange={async event => {
                        const invitation = invitations.find(item => item.id === event.target.value);
                        if (invitation && await confirmPreviewNavigation()) openEditor(invitation);
                    }}>
                        {invitations.filter(item => !['archived', 'trashed'].includes(item.status)).map(item => (
                            <option key={item.id} value={item.id}>{item.coupleProfile?.brideName || 'Mempelai wanita'} &amp; {item.coupleProfile?.groomName || 'Mempelai pria'}</option>
                        ))}
                    </select>
                    <DashboardThemeToggle />
                </div>
                {selectedInvitation.status === 'published' && new Date(selectedInvitation.expiresAt) > new Date()
                    ? <a href={`/${selectedInvitation.slug}`} target="_blank" rel="noreferrer">Lihat undangan <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></a>
                    : <button type="button" onClick={async () => {
                        if (await confirmPreviewNavigation()) setViewParams({ section: 'invitations', invitation: selectedInvitation.id, publish: selectedInvitation.id });
                    }}>Siapkan publikasi</button>}
            </div>
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
                studio
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
                        <StudioTabIcon tab={tab.key} />
                        <span className="nav-label">{tab.label}</span>
                    </button>
                ))}
            </nav>

            {/* Panel Editor Utama */}
            <div className={activeMacroTab === 'konten' ? 'panel mobile-content-wrapper studio-panel-shell studio-content-editor' : 'panel mobile-content-wrapper studio-panel-shell'}>
                <div className="studio-panel-scroll">
                <div className="studio-heading"><small>STUDIO UNDANGAN</small><h2>Desain & cerita kalian.</h2></div>
                <div className="studio-navigation"><button className="editor-library-back" onClick={openLibrary}>Kembali ke Undangan</button><button className="editor-library-back" onClick={()=>setViewParams({section:'invitations',invitation:selectedInvitation.id,publish:selectedInvitation.id})}>Siapkan publikasi</button></div>
                {/* Switcher Undangan Rapi di Atas Panel Editor */}
                <div className="panel-inv-switcher">
                    <div className="panel-inv-select-group">
                        <label htmlFor="active-invitation">Pilih Undangan</label>
                        <div className="select-wrapper">
                            <select
                                id="active-invitation"
                                value={selectedInvitation?.id || ''}
                                onChange={(e) => openEditor(invitations.find(inv=>inv.id===e.target.value))}
                            >
                                {invitations.filter(inv=>!['archived','trashed'].includes(inv.status)).map((inv) => {
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
                            {invitations.filter(inv=>!['archived','trashed'].includes(inv.status)).length} Undangan
                        </span>
                    </div>
                    <button
                        className="btn-create-inv"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <i className="fa-solid fa-plus"></i> Buat Undangan
                    </button>
                </div>

                {/* Sub Navigation (Pills) */}
                {SUB_TABS[activeMacroTab]?.length > 0 && (
                    <div className="subnav-container">
                        <div ref={studioTabs} className="subnav-scroll" role="group" aria-label="Pilihan tab Studio" tabIndex={0}>
                            {SUB_TABS[activeMacroTab].map(tab => (
                                <button
                                    key={tab.key}
                                    aria-pressed={activeTab === tab.key}
                                    className={`subnav-item ${activeTab === tab.key ? 'active' : ''}`}
                                    onClick={async () => {
                                        if (tab.key !== activeTab && !(await confirmPreviewNavigation())) return;
                                        setActiveTab(tab.key);
                                        setReturnTab(null);
                                    }}
                                >
                                    <StudioTabIcon tab={tab.key} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                        <div ref={studioTabScrollbar} className="studio-tab-scrollbar" aria-hidden="true" hidden />
                    </div>
                )}

                {previewDirty && (
                    <div className="unsaved-preview-notice" role="status">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>Perubahan sudah terlihat di preview, tetapi belum tersimpan. Gunakan tombol simpan atau terapkan pada pengaturan yang diubah sebelum berpindah tab.</span>
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
                             Kembali ke Susunan & Blok
                        </button>
                    </div>
                )}

                {/* Render Panel Berdasarkan Active Tab */}
                <div
                    onClickCapture={markPreviewInteraction}
                    onInputCapture={markPreviewInteraction}
                    onChangeCapture={markPreviewInteraction}
                >
                <ContentSaveTarget.Provider value={activeMacroTab==='konten'?contentSaveTarget:null}><Suspense fallback={<LoadingScreen label="Memuat editor…" />}>

                {activeTab === 'tema' && <TemaPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} />}
                {activeTab === 'visual' && <VisualPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'warna' && !isMentalCanvas(selectedInvitation?.themeId) && (selectedInvitation.themeId === 'engine-4'
                    ? <EnvelopeColorPanel key={selectedInvitation.id} invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />
                    : <WarnaPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />)}
                {activeTab === 'typography' && <TypographyPanel activeSection={typographySection} invitation={selectedInvitation} onUpdated={updateTypography} onLivePreview={previewTypography} />}
                {activeTab === 'susunan' && <SusunanPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleAutoPreview} onNavigateTab={(macro, sub) => { setReturnTab({ macro: 'desain', sub: 'susunan' }); setActiveMacroTab(macro); setActiveTab(sub); }} />}
                {activeTab === 'kutipan' && <KutipanPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'profil' && <ProfilPanel activeSection={typographySection} invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'saveDate' && <SaveDatePanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview}/>}
                {activeTab === 'acara' && <AcaraPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'rundown' && <RundownEditor invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'cerita' && (
                    <CeritaPanel
                        invitation={selectedInvitation}
                        onUpdated={handleUpdateInvitation}
                        onLivePreview={handleLivePreview}
                    />
                )}
                {activeTab === 'galeri' && <GaleriPanel key={selectedInvitation.id} invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'dresscode' && <DresscodeEditor invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'hadiah' && <HadiahPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'rsvp' && <div style={{paddingBottom:32}}><h2 className="panel-header">RSVP &amp; Ucapan</h2><p className="panel-sub">Atur ukuran dan jarak teks form melalui pengaturan di bawah. Nama, kehadiran, dan ucapan dikirim tamu dalam satu form.</p><p className="panel-sub">Kelola jawaban dan moderasi ucapan di ruang Tamu. Aktif/nonaktif tetap di Susunan &amp; Blok.</p></div>}
                {activeTab === 'penutup' && <PenutupPanel invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'livestream' && <LivestreamEditor invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeTab === 'igfilter' && <IGFilterEditor invitation={selectedInvitation} onUpdated={handleUpdateInvitation} onLivePreview={handleLivePreview} />}
                {activeMacroTab==='konten'&&contentTabIsVisible&&<TypographyPanel mode="metrics" activeSection={typographySection} scopeOptions={isMentalCanvas(selectedInvitation.themeId)?({kutipan:['quote'],profil:['cover','hero','bride','groom'],saveDate:['countdown'],acara:['events'],rundown:['rundown'],cerita:['story'],galeri:['gallery'],dresscode:['dresscode'],livestream:['livestream'],igfilter:['igFilter'],hadiah:['gift'],penutup:['footer']}[activeTab]||['rsvp','wishes','wishList']):({kutipan:['quote'],profil:['cover','profile'],saveDate:['countdown'],acara:['events'],rundown:['rundown'],cerita:['story'],galeri:['gallery'],dresscode:['dresscode'],livestream:['livestream'],igfilter:['igFilter'],hadiah:['gift'],penutup:['footer']}[activeTab]||['rsvp','wishes','wishList'])} invitation={selectedInvitation} onUpdated={updateTypography} onLivePreview={previewTypography}/>}
                </Suspense></ContentSaveTarget.Provider>
                </div>
                </div>
                <div ref={setContentSaveTarget} className="content-save-target"/>
            </div>

            {/* Stage Preview HP (iPhone 17 dengan Dynamic Island) */}
            <div className={`stage ${showMobilePreview ? 'is-mobile-preview-open' : ''}`}>
                <div className="stage-topbar">
                    <div className="stage-url">
                        <span className="stage-url-address">{window.location.host}/{selectedInvitation?.slug}</span>
                        <span className="badge-draft badge-draft-label">{invitationStatusLabel(selectedInvitation)}</span>
                        <span className="badge-draft badge-draft-label">{selectedInvitation?.packageType==='TRIAL'?'Trial':selectedInvitation?.packageType}</span>
                    </div>
                    <div className="stage-topbar-actions">
                        <button className="stage-close-btn" aria-label="Kembali ke editor" onClick={() => setShowMobilePreview(false)} style={{ display: showMobilePreview ? 'flex' : 'none' }}>

                            <span>Tutup Pratinjau</span>
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
                        <button type="button" className="preview-reload-btn" aria-label="Muat ulang pratinjau dari sampul" title="Muat ulang pratinjau dari sampul" onClick={()=>{setTypographySection('cover');setPreviewRevision(n=>n+1)}}><i className="preview-reload-icon fa-solid fa-rotate-right" aria-hidden="true" /><span className="preview-reload-label">Muat Ulang</span></button><LangSwitcher className="lang-switcher-dashboard" /><DashboardThemeToggle />
                        <button className="logout-btn" onClick={handleLogout}>
                            {t('dashboard.logout') || 'Keluar'}
                        </button>
                    </div>
                </div>
                {/* Wrapper Preview */}
                <div className="preview-wrapper"><span className="studio-preview-caption">Pratinjau undangan</span>
                    <MobilePreviewFit><div className={`iphone-mockup-stage preview-mode-${previewMode}`}>
                        {previewMode === 'mobile' && <div className="dynamic-island" aria-hidden="true"></div>}
                        <PhonePreview previewMode={previewMode} key={`${selectedInvitation.id}:${previewRevision}`} invitation={composeInvitationPreview(selectedInvitation, previewOverride, typographyOverride)} editorPreview previewGuest={previewGuest} />
                    </div></MobilePreviewFit>
                </div>
            </div>

            {/* Bottom Nav for Mobile */}
            <nav className="bottom-nav" aria-label="Navigasi studio">
                {MACRO_TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`bottom-nav-item ${!showMobilePreview && activeMacroTab === tab.key ? 'active' : ''}`}
                        aria-pressed={!showMobilePreview && activeMacroTab === tab.key}
                        onClick={() => {
                            if (activeMacroTab !== tab.key) handleMacroTabChange(tab.key);
                            setShowMobilePreview(false);
                        }}
                    >
                        <StudioTabIcon tab={tab.key} />
                        <span className="nav-label">{tab.label}</span>
                    </button>
                ))}
                <button type="button" className={showMobilePreview ? "bottom-nav-item active" : "bottom-nav-item"} aria-pressed={showMobilePreview} onClick={() => setShowMobilePreview(true)}>
                    <StudioTabIcon tab="preview" />
                    <span className="nav-label">Pratinjau</span>
                </button>
            </nav>
        </div>
    );
}
