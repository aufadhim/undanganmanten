import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PhonePreview from '../components/PhonePreview.jsx';
import DashboardSidebar from '../components/dashboard/DashboardSidebar.jsx';
import { useUI } from '../context/UIContext.jsx';

import SandboxTemaPanel, { SANDBOX_THEME_SETTINGS } from '../components/SandboxTemaPanel.jsx';
import SandboxProfilPanel from '../components/SandboxProfilPanel.jsx';
import SandboxWarnaPanel from '../components/SandboxWarnaPanel.jsx';
import SandboxFeaturePanel from '../components/SandboxFeaturePanel.jsx';
import { DUMMY_BRIDE_PHOTO, DUMMY_GALLERY_PHOTOS, DUMMY_GALLERY_VIDEO, DUMMY_GROOM_PHOTO } from '../config/dummyAssets.js';
import { resolveSandboxGallery } from '../utils/sandboxMigration.js';
const SUPPORTED_THEME_IDS = ['eternal', 'seraya', 'nawasena', 'isvara', 'lanqing', 'celluloid', 'nocturne'];

// Default dummy data for sandbox
const DEFAULT_SANDBOX_INVITATION = {
    id: 'sandbox',
    slug: 'sandbox-demo',
    status: 'draft',
    coupleProfile: {
        brideName: 'Arunika',
        brideFullName: 'Arunika Candramawarni',
        brideFather: 'Adikara Wicaksana',
        brideMother: 'Sekar Ayuningtyas',
        bridePhoto: DUMMY_BRIDE_PHOTO,
        groomName: 'Deva',
        groomFullName: 'Deva Nararya',
        groomFather: 'Bramantya Narendra',
        groomMother: 'Ratih Puspitasari',
        groomPhoto: DUMMY_GROOM_PHOTO,
    },
    themeSettings: {
        background: { enabled: false },
        bodyText: { enabled: false },
        button: { enabled: false },
        typography: {},
        musicUrl: '',
        animationType: '',
        loadingAnimation: 'breathe',
        mainStory: 'Kami bertemu pada sebuah sore yang sederhana, tanpa pernah menduga percakapan singkat itu akan menjadi awal perjalanan panjang. Waktu membawa kami melewati banyak cerita, tumbuh bersama, dan belajar bahwa rumah bukan hanya sebuah tempat, melainkan seseorang yang selalu ingin kita tuju. Kini kami memilih untuk melanjutkan kisah ini dalam satu janji, satu langkah, dan satu kehidupan bersama.'
    },
    themeId: 'eternal',
    invitationFeatures: { storyEnabled: true, timelineEnabled: true, galleryEnabled: true, dresscodeEnabled: true, rsvpEnabled: true, wishesEnabled: true, giftEnabled: true, livestreamEnabled: true, customLogoEnabled: true, musicEnabled: false, animationEnabled: false },
    events: [{ type: 'RECEPTION', date: '2026-12-20', startTime: '11:00', endTime: '14:00', venueName: 'The Langham Jakarta', address: 'District 8, SCBD Lot 28, Jakarta' }],
    galleryMedia: [
        ...DUMMY_GALLERY_PHOTOS.map((url, index) => ({ id: `sandbox-photo-${index}`, type: 'photo', url })),
        { id: 'sandbox-video', type: 'video', url: DUMMY_GALLERY_VIDEO },
    ],
    wishes: [
        {
            id: 'sandbox-wish-1',
            senderName: 'Nadira & Bagas',
            message: 'Selamat menempuh perjalanan baru, Deva dan Arunika. Semoga rumah kalian selalu dipenuhi tawa, ketenangan, dan kasih yang terus bertumbuh.',
            createdAt: '2026-08-23T10:00:00.000Z',
            isHidden: false,
            isPinned: true,
        },
        {
            id: 'sandbox-wish-2',
            senderName: 'Raka Pradipta',
            message: 'Turut berbahagia untuk kalian berdua. Semoga segala rencana menuju hari bahagia dilancarkan dan menjadi awal kisah yang indah.',
            createdAt: '2026-08-22T09:00:00.000Z',
            isHidden: false,
        },
        {
            id: 'sandbox-wish-3',
            senderName: 'Keluarga Narendra',
            message: 'Semoga senantiasa saling menjaga, menguatkan, dan menemukan rumah dalam satu sama lain. Doa terbaik menyertai kalian.',
            createdAt: '2026-08-21T08:00:00.000Z',
            isHidden: false,
        },
    ],
};
const SANDBOX_VERSION = '8';

export default function SandboxDashboard() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Check URL for theme
    const urlTheme = searchParams.get('theme');

    const [sandboxInvitation, setSandboxInvitation] = useState(() => {
        const saved = localStorage.getItem('sandbox_invitation');
        const savedVersion = localStorage.getItem('sandbox_version');
        if (saved && savedVersion === SANDBOX_VERSION) {
            const parsed = JSON.parse(saved);
            const savedGroomPhoto = parsed.coupleProfile?.groomPhoto || '';
            const groomPhoto = savedGroomPhoto.includes('photo-1506794778202-cad84cf45f1d')
                ? DUMMY_GROOM_PHOTO
                : (savedGroomPhoto || DUMMY_GROOM_PHOTO);
            const savedGallery = parsed.galleryMedia || [];
            const galleryMedia = resolveSandboxGallery(savedGallery, DEFAULT_SANDBOX_INVITATION.galleryMedia);
            return {
                ...DEFAULT_SANDBOX_INVITATION,
                ...parsed,
                coupleProfile: { ...DEFAULT_SANDBOX_INVITATION.coupleProfile, ...(parsed.coupleProfile || {}), groomPhoto },
                themeSettings: !SUPPORTED_THEME_IDS.includes(urlTheme || parsed.themeId)
                    ? { ...DEFAULT_SANDBOX_INVITATION.themeSettings, ...SANDBOX_THEME_SETTINGS.eternal }
                    : urlTheme && urlTheme !== parsed.themeId
                        ? { ...DEFAULT_SANDBOX_INVITATION.themeSettings, ...SANDBOX_THEME_SETTINGS[urlTheme] }
                    : { ...DEFAULT_SANDBOX_INVITATION.themeSettings, ...(parsed.themeSettings || {}) },
                invitationFeatures: { ...DEFAULT_SANDBOX_INVITATION.invitationFeatures, ...(parsed.invitationFeatures || {}) },
                galleryMedia,
                themeId: SUPPORTED_THEME_IDS.includes(urlTheme || parsed.themeId) ? (urlTheme || parsed.themeId) : 'eternal'
            };
        }
        return {
            ...DEFAULT_SANDBOX_INVITATION,
            themeId: SUPPORTED_THEME_IDS.includes(urlTheme) ? urlTheme : 'eternal',
            themeSettings: {
                ...DEFAULT_SANDBOX_INVITATION.themeSettings,
                ...SANDBOX_THEME_SETTINGS[SUPPORTED_THEME_IDS.includes(urlTheme) ? urlTheme : 'eternal'],
            },
        };
    });

    const [activeMacroTab, setActiveMacroTab] = useState('desain');
    const [activeTab, setActiveTab] = useState('tema');
    const [previewMode, setPreviewMode] = useState('mobile'); 
    const [previewOverride, setPreviewOverride] = useState(null);
    const [railOpen, setRailOpen] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const { toast } = useUI();

    useEffect(() => {
        setPreviewOverride(null);
    }, [activeTab]);

    useEffect(() => {
        // Save changes to localStorage so they persist across reloads
        localStorage.setItem('sandbox_invitation', JSON.stringify(sandboxInvitation));
        localStorage.setItem('sandbox_version', SANDBOX_VERSION);
    }, [sandboxInvitation]);

    const MACRO_TABS = [
        { key: 'desain', label: 'Desain', icon: 'fa-palette' },
        { key: 'konten', label: 'Konten', icon: 'fa-book-open' },
    ];

    const SUB_TABS = {
        desain: [
            { key: 'tema', label: 'Tema', icon: 'fa-palette' },
            { key: 'warna', label: 'Warna', icon: 'fa-fill-drip' },
            { key: 'visual', label: 'Musik & Visual', icon: 'fa-music' },
        ],
        konten: [
            { key: 'profil', label: 'Profil & Mempelai', icon: 'fa-user-group' },
            { key: 'acara', label: 'Informasi Acara & Save The Date', icon: 'fa-calendar-days' },
            { key: 'galeri', label: 'Galeri Foto & Video', icon: 'fa-images' },
        ]
    };

    const handleMacroTabChange = (macroKey) => {
        setActiveMacroTab(macroKey);
        const validSubTabs = SUB_TABS[macroKey] || [];
        const isCurrentSubTabValid = validSubTabs.some(t => t.key === activeTab);
        
        if (validSubTabs.length > 0 && !isCurrentSubTabValid) {
            setActiveTab(validSubTabs[0].key);
        }
    };

    const handleUpdateInvitation = (updatedInv) => {
        setSandboxInvitation(updatedInv);
        setPreviewOverride(null);
    };

    const handleSignup = () => {
        // Data is already in localStorage. We redirect to signup.
        navigate('/signup?from_sandbox=true');
    };

    return (
        <div className="dashboard">
            <DashboardSidebar 
                TABS={MACRO_TABS} 
                activeTab={activeMacroTab} 
                setActiveTab={handleMacroTabChange} 
                railOpen={railOpen}
                setRailOpen={setRailOpen}
            />

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

            <div className="panel mobile-content-wrapper">
                <div className="panel-inv-switcher" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Mode Coba</h2>
                        <p style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Coba ubah tampilan sebelum daftar.</p>
                    </div>
                    <button
                        className="btn btn-primary sandbox-signup-btn"
                        onClick={handleSignup}
                    >
                        Daftar & Simpan <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>

                {SUB_TABS[activeMacroTab]?.length > 0 && (
                    <div className="subnav-container">
                        <div className="subnav-scroll">
                            {SUB_TABS[activeMacroTab].map(tab => (
                                <button
                                    key={tab.key}
                                    className={`subnav-item ${activeTab === tab.key ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.icon && <i className={`fa-solid ${tab.icon}`}></i>}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'tema' && <SandboxTemaPanel invitation={sandboxInvitation} onUpdated={handleUpdateInvitation} />}
                {activeTab === 'warna' && <SandboxWarnaPanel invitation={sandboxInvitation} onUpdated={handleUpdateInvitation} onLivePreview={setPreviewOverride} />}
                {activeTab === 'profil' && <SandboxProfilPanel invitation={sandboxInvitation} onUpdated={handleUpdateInvitation} onLivePreview={setPreviewOverride} />}
                {!['tema', 'warna', 'profil'].includes(activeTab) && (
                    <SandboxFeaturePanel type={activeTab} invitation={sandboxInvitation} onUpdated={handleUpdateInvitation} onLivePreview={setPreviewOverride} />
                )}
            </div>

            <div className={`stage ${showMobilePreview ? 'is-mobile-preview-open' : ''}`}>
                <div className="stage-topbar">
                    <div className="stage-url">
                        undanganmanten.id/demo
                        <span className="stage-url-badge" style={{ background: '#ddd', color: '#555', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', fontSize: '11px' }}>Mode Coba</span>
                    </div>
                    <div className="stage-topbar-actions">
                        <button className="stage-close-btn" onClick={() => setShowMobilePreview(false)} style={{ display: showMobilePreview ? 'flex' : 'none' }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <div className="stage-topbar-device-switch">
                            <button className={`device-switch-btn ${previewMode === 'mobile' ? 'active' : ''}`} onClick={() => setPreviewMode('mobile')} title="Mobile">
                                <i className="fa-solid fa-mobile-screen"></i>
                            </button>
                            <button className={`device-switch-btn ${previewMode === 'tablet' ? 'active' : ''}`} onClick={() => setPreviewMode('tablet')} title="iPad">
                                <i className="fa-solid fa-tablet-screen-button"></i>
                            </button>
                            <button className={`device-switch-btn ${previewMode === 'tablet-pro' ? 'active' : ''}`} onClick={() => setPreviewMode('tablet-pro')} title="iPad Pro">
                                <i className="fa-solid fa-tablet"></i>
                            </button>
                            <button className={`device-switch-btn ${previewMode === 'desktop' ? 'active' : ''}`} onClick={() => setPreviewMode('desktop')} title="Desktop">
                                <i className="fa-solid fa-desktop"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="preview-wrapper">
                    <div className={`iphone-mockup-stage preview-mode-${previewMode}`}>
                        {previewMode === 'mobile' && <div className="dynamic-island"></div>}
                        <PhonePreview
                            invitation={previewOverride ? {
                                ...sandboxInvitation,
                                ...previewOverride,
                                coupleProfile: { ...sandboxInvitation.coupleProfile, ...(previewOverride.coupleProfile || {}) },
                                themeSettings: { ...sandboxInvitation.themeSettings, ...(previewOverride.themeSettings || {}) },
                                invitationFeatures: { ...sandboxInvitation.invitationFeatures, ...(previewOverride.invitationFeatures || {}) },
                            } : sandboxInvitation}
                            previewMode={previewMode}
                            previewGuest={null}
                            editorPreview
                        />
                    </div>
                </div>
            </div>
            
            {/* Mobile Rail Toggle */}
            <button className="mobile-rail-toggle" onClick={() => setRailOpen(true)}>
                <i className="fa-solid fa-bars"></i>
            </button>
            {railOpen && <div className="rail-overlay" onClick={() => setRailOpen(false)}></div>}

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
