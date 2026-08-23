import React from 'react';

export default function SplitViewLayout({ invitation, children }) {
    const profile = invitation?.coupleProfile || {};
    const theme = invitation?.themeSettings || {};

    // Background based on theme primary/secondary or a default image
    const bgPrimary = theme?.background?.primary || '#2C3E50';
    const bgSecondary = theme?.background?.secondary || '#E4D5C0';
    const coverImage = profile.bridePhoto || profile.groomPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';

    return (
        <div className="split-view-container">
            <div className="split-view-inner">

                {/* Panel Kiri: Animasi & Cover */}
                <div className="split-view-left" style={{ background: bgPrimary }}>
                    {/* Background Image with Overlay */}
                    <div 
                        className="split-view-left-bg"
                        style={{ backgroundImage: `url(${coverImage})` }}
                    ></div>

                    {/* Content */}
                    <div className="split-view-left-content">
                        <div className="split-view-top-label">
                            The Wedding Of
                        </div>
                        <h1 
                            className="split-view-title"
                            style={{ fontFamily: theme?.typography?.fontHeading || "'Playfair Display', serif" }}
                        >
                            {profile.brideName || 'Bride'} &amp; {profile.groomName || 'Groom'}
                        </h1>
                        <p 
                            className="split-view-subtitle"
                            style={{ fontFamily: theme?.typography?.fontBody || "'Manrope', sans-serif" }}
                        >
                            A Journey of Love
                        </p>
                    </div>
                </div>

                {/* Panel Kanan: Template Asli (Bisa di-scroll) */}
                <div className="split-view-right">
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
