import {getTemplate,isImmersiveTemplate} from '../config/templateRegistry.js';

export default function SplitViewLayout({ invitation, children }) {
    const profile = invitation?.coupleProfile || {};
    const theme = invitation?.themeSettings || {};

    // Background based on theme primary/secondary or a default image
    const bgPrimary = theme?.background?.primary || '#2C3E50';
    const bgSecondary = theme?.background?.secondary || '#E4D5C0';
    const eventDate = new Date(invitation?.weddingDate || invitation?.events?.[0]?.date || '');
    const dateLabel = Number.isNaN(eventDate.getTime()) ? '' : new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long', timeZone: 'Asia/Jakarta',
    }).format(eventDate);
    const template = getTemplate(invitation?.themeId);
    const immersive = isImmersiveTemplate(invitation?.themeId);
    const templateBackground = invitation?.themeId === 'nawasena'
        ? '/assets/nawasena/enchanted-joglo-hero.webp'
        : template?.previewFallback || template?.previewImg;
    const coverImage = (immersive ? templateBackground : theme.coverImageUrl || templateBackground)
        || '/assets/landing-canvas/garden.webp';

    return (
        <div className={`split-view-container split-view-theme-${invitation?.themeId || 'default'} ${immersive?'split-view-immersia':''}`}>
            <div className="split-view-inner">

                {/* Panel Kiri: Animasi & Cover */}
                <div className="split-view-left" style={{ background: bgPrimary }}>
                    {/* Background Image with Overlay */}
                    <div 
                        className="split-view-left-bg"
                        style={{ backgroundImage: `url(${coverImage})` }}
                    ></div>

                    <div className="split-view-bubbles" aria-hidden="true">
                        {Array.from({ length: 14 }, (_, i) => (
                            <span key={i} className="split-view-bubble" style={{
                                left: ((i * 37 + 8) % 100) + '%',
                                '--bubble-rest': (18 + (i * 29) % 72) + '%',
                                '--bubble-size': (14 + (i * 11) % 34) + 'px',
                                '--bubble-duration': (15 + (i * 7) % 16) + 's',
                                '--bubble-delay': (-i * 2.3) + 's',
                                '--bubble-drift': i % 2 ? 1 : -1,
                            }} />
                        ))}
                    </div>
                    <div className="split-view-left-content split-couple-caption">
                        <h1 className="split-view-title">{profile.brideName || 'Mempelai wanita'} &amp; {profile.groomName || 'Mempelai pria'}</h1>
                        {dateLabel && <p className="split-view-subtitle">{dateLabel}</p>}
                    </div>
                </div>
                {/* Panel Kanan: Template Asli (Bisa di-scroll) */}
                <div className="split-view-right" tabIndex={0} aria-label="Undangan dalam tampilan mobile">
                    {/* Wrapper for background to prevent scale(1.1) from causing overflow */}
                    <div className="split-view-blur-wrapper">
                        {/* Background Blur for iPad void */}
                        <div 
                            className="split-view-blur-bg"
                            style={{ backgroundImage: `url(${coverImage})` }}
                        ></div>

                        {/* Overlay to make it distinct but not black */}
                        <div className="split-view-blur-overlay"></div>
                    </div>

                    {/* Kontainer template standar */}
                    <div 
                        className="split-view-template-wrapper" 
                        style={{ background: bgSecondary }}
                    >
                        {children}
                    </div>
                </div>
            </div>

        </div>
    );
}
