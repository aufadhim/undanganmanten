import React, { useState, useEffect } from "react";
import AnimatedSection from "../AnimatedSection";
import { useSearchParams } from "react-router-dom";
import { useCountdown } from "../../hooks/useCountdown.js";
import { useCalendarUrl } from "../../hooks/useCalendarUrl.js";
import FloatingMultimedia from "../FloatingMultimedia.jsx";
import PublicForms, { GiftSection } from "../PublicForms.jsx";
import Lightbox from "./Lightbox.jsx";
import "../../styles/eternal-template.css";
import { resolveImageUrl } from '../../config/env.js';
import { useTranslation } from 'react-i18next';

export default function EternalTemplate({ invitation, previewGuest, editorPreview = false }) {
  const { t } = useTranslation();
  if (!invitation) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [copyStatus, setCopyStatus] = useState('COPY');
  const [isLoading, setIsLoading] = useState(true);

  const features = invitation.invitationFeatures || {};
  const settings = invitation.themeSettings || {};
  const hasCustomLogo = features.customLogoEnabled && settings.customLogoUrl;

  useEffect(() => {
    // Artificial delay for splash screen if custom logo exists
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, hasCustomLogo ? 1500 : 0);
    return () => clearTimeout(timer);
  }, [hasCustomLogo]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const container = document.querySelector('.eternal-wrapper .gallery-container');
          if (container) {
            const rect = container.getBoundingClientRect();
            const winHeight = window.innerHeight;
            const containerCenterY = rect.top + rect.height / 2;
            const viewportCenterY = winHeight / 2;
            const distance = containerCenterY - viewportCenterY;
            
            // Subtle parallax effect, limited to prevent layout breakage
            let offset = distance * 0.08;
            if (offset > 60) offset = 60;
            if (offset < -60) offset = -60;

            const upCols = document.querySelectorAll('.eternal-wrapper .gallery-col-up');
            const downCols = document.querySelectorAll('.eternal-wrapper .gallery-col-down');
            upCols.forEach(col => { col.style.transform = `translateY(${offset}px)`; });
            downCols.forEach(col => { col.style.transform = `translateY(${-offset}px)`; });
            const storyLines = document.querySelectorAll('.eternal-wrapper .story-line');
            storyLines.forEach(line => {
              const lRect = line.getBoundingClientRect();
              if (lRect.top < winHeight * 0.9) {
                line.classList.add('visible');
              }
            });

          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const mainScroll = document.getElementById('mainScroll');
    if (mainScroll) {
      mainScroll.addEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (mainScroll) {
         mainScroll.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Safely extract deeply nested object properties
  
  const profile = invitation?.coupleProfile || {};
  const theme = invitation?.themeSettings || {};

  const events = invitation?.events || [];

  const mainEvent =
    events.find((e) => e.type === "RECEPTION") || events[0] || {};
    
  const countdownDate = mainEvent.date ? new Date(mainEvent.date).toISOString().slice(0, 10) : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const timeLeft = useCountdown(countdownDate, mainEvent.startTime || '08:00');

  const calendarUrl = useCalendarUrl(
    mainEvent.date,
    mainEvent.startTime,
    mainEvent.endTime,
    mainEvent.venueName,
    `Wedding of ${profile.brideName || 'Bride'} & ${profile.groomName || 'Groom'}`,
    "Please save the date for our wedding!"
  );
  let eventDateNum = "05";
  let eventMonth = "DECEMBER";
  let eventYear = "2026";
  let eventLocation = "Jakarta";

  if (mainEvent.date) {
    const d = new Date(mainEvent.date);
    eventDateNum = String(d.getDate()).padStart(2, "0");
    eventMonth = d.toLocaleString("en-US", { month: "long" }).toUpperCase();
    eventYear = String(d.getFullYear());
  }
  const addressParts = String(mainEvent.address || '').split(',').map((part) => part.trim()).filter(Boolean);
  if (addressParts.length) {
    eventLocation = addressParts.at(-1);
  } else if (mainEvent.city) {
    eventLocation = mainEvent.city;
  } else if (mainEvent.locationName) {
    eventLocation = mainEvent.locationName;
  }

  const timeline = invitation?.timelineStories || [];
  const galleries = invitation?.galleryMedia || [];
  const gifts = invitation?.giftSettings || {};

  // Default Images
  const useDefaultCover = theme?.coverType === 'default';

  const coverImage =
    (!useDefaultCover && theme?.coverImageUrl)
      ? theme.coverImageUrl
      : profile.bridePhoto || profile.groomPhoto || "/assets/eternal/images/hero/background.webp";

  const coverSecondImage =
    (!useDefaultCover && theme?.coverSecondImageUrl)
      ? theme.coverSecondImageUrl
      : profile.bridePhoto || profile.groomPhoto || "/assets/eternal/images/hero/background.webp";
  const groomImg =
    profile.groomPhoto || "/assets/eternal/images/couples/groom.webp";
  const brideImg =
    profile.bridePhoto || "/assets/eternal/images/couples/bride.webp";

  const DEFAULT_LAYOUT = [
    { id: "cover", enabled: true },
    { id: "quote", enabled: true },
    { id: "couple", enabled: true },
    { id: "events", enabled: true },
    { id: "countdown", enabled: true },
    { id: "gallery", enabled: true },
    { id: "rundown", enabled: true },
    { id: "story", enabled: true },
    { id: "dresscode", enabled: true },
    { id: "livestream", enabled: true },
    { id: "igFilter", enabled: true },
    { id: "rsvp", enabled: true },
    { id: "wishes", enabled: true },
    { id: "gift", enabled: true },
    { id: "footer", enabled: true },
  ];

  let layoutOrder = [];
  try {
    if (theme?.layoutOrder) {
      layoutOrder =
        typeof theme.layoutOrder === "string"
          ? JSON.parse(theme.layoutOrder)
          : theme.layoutOrder;
    } else {
      layoutOrder = DEFAULT_LAYOUT;
    }
  } catch (e) {
    layoutOrder = DEFAULT_LAYOUT;
  }

  // Use layoutOrder directly as saved by SusunanPanel.
  // The layoutOrder already contains the updated enabled states.
  layoutOrder = layoutOrder.map(item => ({ ...item }));

  // Helper functions to render sections

  const renderHero = () => (
    <section id="home" className="hero-section" key="cover">
      <div className="hero-bg">
        <img src={coverSecondImage} alt="Hero Background" className="hero-img" />
        <div className="hero-overlay"></div>
      </div>
      <div className="hero-noise"></div>
      <div className="hero-glow"></div>

      <div className="hero-content">
        <div className="hero-header">
          <p className="hero-subtitle">THE WEDDING OF</p>
        </div>

        <div className="hero-names">
          <h1 className="hero-name">{profile.brideName || "Arunika"}</h1>
          <div className="hero-divider">
            <span className="hero-ampersand">&</span>
          </div>
          <h1 className="hero-name">{profile.groomName || "Deva"}</h1>
        </div>

        <div className="hero-details">
          <div className="hero-date">
            <span className="hero-date-num">{eventDateNum}</span>
            <div className="hero-date-text">
              <span>{eventMonth}</span>
              <span>{eventYear}</span>
            </div>
          </div>
          <div className="hero-location">
            <p>{eventLocation}</p>
          </div>
        </div>

        <div className="hero-footer">
          <div className="hero-scroll">
            <span>SCROLL</span>
            <div className="scroll-line"></div>
          </div>
        </div>
      </div>
    </section>
  );


  const autoHighlight = (text) => {
    // If user already put html tags, leave it alone
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return <span dangerouslySetInnerHTML={{ __html: text }} />;
    }
    
    const keywords = [
      'love', 'forever', 'promise', 'proposal', 'akad', 'marriage', 'wedding', 'together', 
      'journey', 'beginning', 'always', 'destiny', 'soulmate', 'cinta', 'janji', 'lamaran', 
      'selamanya', 'bersama', 'pernikahan', 'jodoh', 'awal', 'akhir', 'bahagia', 'menikah',
      'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
      'januari', 'februari', 'maret', 'mei', 'juni', 'juli', 'agustus',
      'different dreams', 'rhythm changed', 'quiet hope', 'loud certainty', 'finally yielded to spring'
    ];
    
    let highlightedText = text;
    let found = false;
    
    // Check keywords (case-insensitive)
    for (const kw of keywords) {
      const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
      if (regex.test(highlightedText)) {
        highlightedText = highlightedText.replace(regex, '<strong>$1</strong>');
        found = true;
      }
    }
    
    // If no keywords found, highlight the last 2 words as a fallback aesthetic
    if (!found) {
      const words = text.trim().split(' ');
      if (words.length > 3) {
        const lastTwo = words.splice(-2).join(' ');
        highlightedText = words.join(' ') + ' <strong>' + lastTwo + '</strong>';
      } else if (words.length > 0) {
        highlightedText = '<strong>' + text + '</strong>';
      }
    }
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };
  const renderStory = () => {
    const displayTimeline = timeline;
    const displayMainStory = theme?.mainStory;
    
    // If no story content exists, don't render the section
    if (!displayMainStory && (!displayTimeline || displayTimeline.length === 0)) return null;

    return (
      <section id="story" className="story-section" key="story">
        <div className="story-marquee">
          <div className="marquee-text">
            {Array(4)
              .fill(
                `— Love — Eternal — ${profile.brideName || "Arunika"} — ${profile.groomName || "Deva"} — ${eventYear} `,
              )
              .join("")}
          </div>
        </div>

        <div className="container">
          <div className="story-header">
            <h2 className="section-title">Our Story</h2>
            <p className="section-subtitle">The Journey That Led Us Here</p>
          </div>

          {displayMainStory && (
            <div className="story-lines" style={{ marginBottom: displayTimeline && displayTimeline.length > 0 ? "4rem" : "0" }}>
              {(() => {
                // Split by any newline (\r, \n) or <br> or <p> tags
                let rawText = displayMainStory.replace(new RegExp('<br\\\\s*\\\\/?>', 'gi'), '\n').replace(new RegExp('<\\\\/?p>', 'gi'), '\n');
                let lines = rawText.split(/\n+/).filter(l => l.trim());
                
                // If it's still a single line but has multiple sentences, split by period
                if (lines.length === 1 && lines[0].includes('. ')) {
                  lines = lines[0].split('. ').map(l => l.trim() + '.').filter(l => l !== '.');
                }
                
                return lines.map((line, idx) => (
                  <div key={idx} className="story-line">
                    {autoHighlight(line)}
                  </div>
                ));
              })()}
            </div>
          )}

          {displayTimeline.length > 0 && (
            <div className="story-lines">
              {displayTimeline.map((story, i) => (
                <div key={story.id || i} className="story-line" data-story-line>
                  {story.date && <strong>{story.date}</strong>}
                  {story.date && story.title ? " — " : ""}
                  {story.title && <strong>{story.title}</strong>}
                  <br />
                  {story.description}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderCouple = () => (
    <section id="couple" className="couple-section" key="couple">
      <div className="couple-marquee">
        <div className="marquee-text">
          Love Eternal Love Eternal Love Eternal Love Eternal Love Eternal Love
        </div>
      </div>

      <div className="container">
        <div className="couple-grid">
          <div className="couple-item bride visible">
            <div className="couple-image-wrapper">
              <div className="couple-image">
                <img src={brideImg} alt={profile.brideName || "Bride"} />
              </div>
            </div>
            <div className="couple-info">
              <div className="couple-names">
                <h3 className="couple-name">{profile.brideName || "Arunika"}</h3>
                <p className="couple-fullname">
                  {profile.brideFullName || "Arunika Candramawarni"}
                </p>
              </div>
              <div className="couple-parents" style={{ fontStyle: 'italic' }}>
                <p className="parents-names">
                  "The dearest daughter of {profile.brideFather || "Adikara Wicaksana"} &amp; {profile.brideMother || "Sekar Ayuningtyas"}"
                </p>
              </div>
              {settings.brideBioEnabled !== false && profile.brideBio && (
              <div className="couple-bio">
                <p>{profile.brideBio}</p>
              </div>
            )}
            {profile.brideIg && (
              <a 
                href={profile.brideIg.startsWith('http') ? profile.brideIg : `https://instagram.com/${profile.brideIg.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="couple-ig"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--stone-600)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  marginTop: '1.5rem',
                  border: '1px solid var(--stone-200)',
                  padding: '8px 20px',
                  borderRadius: '30px',
                  transition: 'all 0.3s'
                }}
              >
                <i className="fa-brands fa-instagram"></i>
                {profile.brideIg.startsWith('http') ? 'Instagram' : (profile.brideIg.startsWith('@') ? profile.brideIg : `@${profile.brideIg}`)}
              </a>
            )}
            </div>
          </div>

          <div className="couple-divider">
            <span className="couple-ampersand">&</span>
            <div className="divider-line"></div>
          </div>

          <div className="couple-item groom visible">
            <div className="couple-info">
              <div className="couple-names">
                <h3 className="couple-name">{profile.groomName || "Deva"}</h3>
                <p className="couple-fullname">
                  {profile.groomFullName || "Agung Tri Prasetyo"}
                </p>
              </div>
              <div className="couple-parents" style={{ fontStyle: 'italic' }}>
                <p className="parents-names">
                  "The devoted son of {profile.groomFather || "Bramantya Narendra"} &amp; {profile.groomMother || "Ratih Puspitasari"}"
                </p>
              </div>
              {settings.groomBioEnabled !== false && profile.groomBio && (
              <div className="couple-bio">
                <p>{profile.groomBio}</p>
              </div>
            )}
            {profile.groomIg && (
              <a 
                href={profile.groomIg.startsWith('http') ? profile.groomIg : `https://instagram.com/${profile.groomIg.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="couple-ig"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--stone-600)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  marginTop: '1.5rem',
                  border: '1px solid var(--stone-200)',
                  padding: '8px 20px',
                  borderRadius: '30px',
                  transition: 'all 0.3s'
                }}
              >
                <i className="fa-brands fa-instagram"></i>
                {profile.groomIg.startsWith('http') ? 'Instagram' : (profile.groomIg.startsWith('@') ? profile.groomIg : `@${profile.groomIg}`)}
              </a>
            )}
            </div>
            <div className="couple-image-wrapper">
              <div className="couple-image">
                <img src={groomImg} alt={profile.groomName || "Groom"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );


  const renderCountdown = () => {
    return (
      <section id="countdown" className="countdown-section" key="countdown" style={{ padding: '5rem 0', textAlign: 'center', background: 'var(--stone-50)' }}>
        <div className="container">
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 className="section-title">{t('public.save_date')}</h2>
            <p className="section-subtitle">{t('public.toward_happy_day')}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.mins },
              { label: 'Seconds', value: timeLeft.secs }
            ].map((item, i) => (
              <div key={i} style={{ width: '80px' }}>
                <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', fontWeight: 300, color: 'var(--stone-900)' }}>
                  {String(item.value).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--stone-500)' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '3rem' }}>
            <a 
                href={calendarUrl} 
                target="_blank" 
                rel="noreferrer"
                className="eternal-btn"
            >
                Calendar
            </a>
          </div>
        </div>
      </section>
    );
  };

  const renderGallery = () => {
    const uploadedPhotos = galleries.filter((item) => item.type !== 'video');
    const uploadedVideos = galleries.filter((item) => item.type === 'video');
    const displayGalleries = uploadedPhotos.length > 0 ? uploadedPhotos : [
        {url: '/assets/eternal/images/galleries/1.webp'},
        {url: '/assets/eternal/images/galleries/2.webp'},
        {url: '/assets/eternal/images/galleries/3.webp'},
        {url: '/assets/eternal/images/galleries/4.webp'}
    ];
    const half = Math.ceil(displayGalleries.length / 2);
    const galleryLayout = theme.galleryLayout || 'editorial';
    const usesFlatLayout = ['collage', 'wall'].includes(galleryLayout);

    return (
      <section id="gallery" className="gallery-section" key="gallery" style={{ overflow: 'hidden' }}>
        <div className={`gallery-container gallery-layout-${galleryLayout}`}>
          <div className="gallery-header-col">
            <h2 className="section-title">{t('public.gallery')}</h2>
            <p className="section-subtitle">{t('public.gallery_subtitle')}</p>
            <div className="event-details">
              <p className="event-description">
                A glimpse into our beautiful journey together. Every picture tells a story of love, laughter, and a promise of forever.
              </p>
            </div>
          </div>
          {usesFlatLayout ? <div className="gallery-flat-layout">
            {displayGalleries.map((g, index) => <button className="gallery-item" key={g.id || index} onClick={() => setLightboxIndex(index)}>
              <img src={resolveImageUrl(g.url)} alt={`Gallery ${index + 1}`} />
            </button>)}
          </div> : <><div className="gallery-col gallery-col-up" style={{ transition: 'transform 0.2s ease-out', willChange: 'transform' }}>
            {displayGalleries.slice(0, half).map((g, i) => (
              <div className="gallery-item" key={i} onClick={() => setLightboxIndex(i)} style={{ cursor: 'pointer' }}>
                <img src={resolveImageUrl(g.url)} alt="Gallery" />
              </div>
            ))}
          </div>
          <div className="gallery-col gallery-col-down" style={{ transition: 'transform 0.2s ease-out', willChange: 'transform' }}>
            {displayGalleries.slice(half).map((g, i) => (
              <div className="gallery-item" key={half + i} onClick={() => setLightboxIndex(half + i)} style={{ cursor: 'pointer' }}>
                <img src={resolveImageUrl(g.url)} alt="Gallery" />
              </div>
            ))}
          </div></>}
        </div>

        {uploadedVideos.length > 0 && <div className="gallery-video-list">
          {uploadedVideos.map((video) => {
            const ytMatch = video.url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/);
            return <div className="gallery-video" key={video.id || video.url}>
              {ytMatch ? <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`} title="Wedding video" allowFullScreen /> : <video src={resolveImageUrl(video.url)} controls preload="metadata" />}
            </div>;
          })}
        </div>}

        {lightboxIndex !== null && (
          <Lightbox
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
            images={displayGalleries}
          />
        )}
      </section>
    );
  };

  const renderGift = () => {
    if (!gifts || !invitation?.invitationFeatures?.giftEnabled) return null;
    return (
      <section id="gift" className="gift-section" key="gift" style={{ padding: '60px 20px', background: 'var(--stone-50)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}><GiftSection gift={gifts} accent="var(--stone-800)" /></div>
      </section>
    );
  };
  const renderRsvp = () => (
    <section
      id="rsvp"
      className="rsvp-section"
      key="rsvp"
      style={{ padding: "80px 0", background: "var(--stone-50)" }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div
          className="rsvp-header"
          style={{ textAlign: "center", marginBottom: "40px", padding: "0 20px" }}
        >
          <h2
            className="section-title"
            style={{
              color: "var(--stone-900)",
              marginBottom: "10px",
            }}
          >
            {t('public.be_our_guest')}
          </h2>
          <p className="section-subtitle">
            {t('public.guest_subtitle')}
          </p>
        </div>
        <PublicForms
          invitation={invitation}
          previewGuest={previewGuest}
          templateStyle="eternal"
          previewMode={editorPreview}
          formType="rsvp"
        />
      </div>
    </section>
  );

  const renderWishes = () => (
    <section id="wishes" className="rsvp-section" key="wishes" style={{ padding: '80px 0', background: 'var(--stone-50)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}><PublicForms invitation={invitation} previewGuest={previewGuest} templateStyle="eternal" previewMode={editorPreview} formType="wishes" /></div>
    </section>
  );

  const renderFooter = () => (
    <footer
      className="footer-section"
      key="footer"
      style={{
        padding: "60px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="footer-glow"
        style={{
          position: "absolute",
          bottom: "-50%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      ></div>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="footer-content">
          <h2
            className="footer-title"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "32px",
              color: "#ffffff",
              marginBottom: "10px",
            }}
          >
            {profile.brideName || "Arunika"} &amp; {profile.groomName || "Deva"}
          </h2>
          <p
            className="footer-subtitle"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#aaaaaa",
              marginBottom: "30px",
            }}
          >
            {settings.closingText || t('public.closing_default')}
          </p>
          <div
            className="footer-info"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              fontSize: "13px",
              color: "#aaaaaa",
              marginBottom: "40px",
            }}
          >
            <span>
              {eventDateNum}.
              {new Date(mainEvent.date || Date.now()).getMonth() + 1}.
              {eventYear}
            </span>
            <span>•</span>
            <span>{eventLocation}</span>
          </div>
          <p
            className="footer-copyright"
            style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}
          >
            © 2026 {profile.brideName || "Arunika"} &amp;{" "}
            {profile.groomName || "Deva"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );

  const renderEvents = () => {
    const displayEvents = events.length > 0 ? events : [
        { type: 'AKAD', date: new Date(), startTime: '08:00', endTime: '10:00', venueName: 'Masjid Raya', address: 'Jl. Contoh No. 123' },
        { type: 'RECEPTION', date: new Date(), startTime: '11:00', endTime: '14:00', venueName: 'Gedung Pernikahan', address: 'Jl. Contoh No. 124' }
    ];

    return (
      <section id="events" className="events-section" key="events" style={{ background: 'var(--stone-50)', padding: '2rem 0' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="events-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">{t('public.events')}</h2>
            <p className="section-subtitle">{t('public.events_subtitle')}</p>
            <p style={{ 
              maxWidth: '600px', 
              margin: '1rem auto 0', 
              color: 'var(--stone-600)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              lineHeight: '1.6'
            }}>
              We are delighted to invite you to be part of our special day.
              Join us as we celebrate our love and commitment together.
            </p>
          </div>
          
          <div className="combined-events-wrapper" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {displayEvents.map((ev, idx) => {
                const dateStr = ev.date ? new Date(ev.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit' }) : 'Friday, December 05, 2026';
                const timeStr = `${ev.startTime || '14:00'} - ${ev.endTime || '21:00'} WIB`;
                return (
                  <div className="combined-event-card" key={idx}>
                      <div className="ce-row">
                          <div className="ce-icon"><i className="fa-regular fa-calendar"></i></div>
                          <div className="ce-content">
                              <div className="ce-label">DATE</div>
                              <div className="ce-value">{dateStr}</div>
                          </div>
                      </div>
                      <div className="ce-row">
                          <div className="ce-icon"><i className="fa-regular fa-clock"></i></div>
                          <div className="ce-content">
                              <div className="ce-label">TIME</div>
                              <div className="ce-value">{timeStr}</div>
                          </div>
                      </div>
                      <div className="ce-row">
                          <div className="ce-icon"><i className="fa-solid fa-location-dot"></i></div>
                          <div className="ce-content">
                              <div className="ce-label">LOCATION</div>
                              <div className="ce-value">
                                  {ev.venueName || 'The Bride\'s Home'}<br/>
                                  <span style={{fontWeight: 'normal', color: 'var(--stone-500)', fontSize: '0.9em'}}>{ev.address || 'Mojosari, Indonesia'}</span>
                              </div>
                          </div>
                      </div>
                      {ev.googleMapsUrl && (
                          <a href={ev.googleMapsUrl} target="_blank" rel="noreferrer" className="ce-map-btn">
                            View Maps
                          </a>
                      )}
                      {!ev.googleMapsUrl && idx === 0 && (
                          <a href="#" className="ce-map-btn">
                            View Maps
                          </a>
                      )}
                  </div>
                );
            })}
          </div>
        </div>
      </section>
    );
  };

  const renderQuote = () => {
    const defaultQuote = "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berfikir.";
    const defaultAuthor = "Ar-Rum: 21";

    const actualText = invitation?.quoteSettings?.customText || defaultQuote;
    const isLongText = actualText.length > 130;

    return (
      <section id="quote" className="quote-section" key="quote">
        <div className="container">
          <div className="quote-content">
            <div className="quote-icon">“</div>
            <p className="quote-text" style={{
              fontSize: isLongText ? '1.1rem' : '1.5rem',
              lineHeight: isLongText ? '1.6' : '1.8'
            }}>{actualText}</p>
            <p className="quote-author">— {invitation?.quoteSettings?.customSource || defaultAuthor} —</p>
          </div>
        </div>
      </section>
    );
  };

  const renderRundown = () => {
    const displayRundowns = invitation?.rundowns?.length > 0 ? invitation.rundowns : [
      { title: 'Persiapan Mempelai', time: '07:00 - 08:00 WIB', description: 'Persiapan sebelum prosesi akad dimulai.' },
      { title: 'Prosesi Akad Nikah', time: '08:00 - 10:00 WIB', description: 'Pengucapan ijab kabul.' },
      { title: 'Resepsi & Ramah Tamah', time: '11:00 - 14:00 WIB', description: 'Acara puncak resepsi pernikahan.' }
    ];

    return (
      <section id="rundown" className="rundown-section" key="rundown">
        <div className="container">
          <div className="rundown-header">
            <h2 className="section-title">{t('public.timeline')}</h2>
            <p className="section-subtitle">{t('public.rundown')}</p>
          </div>
          <div className="rundown-timeline">
            {displayRundowns.map((r, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-time">{r.time}</div>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h3 className="timeline-title">{r.activity || r.title}</h3>
                  {r.description && <p className="timeline-desc">{r.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderDresscode = () => {
    let parsedDresscode = null;
    if (theme?.dresscodeDetails) {
      if (typeof theme.dresscodeDetails === 'string') {
        try { parsedDresscode = JSON.parse(theme.dresscodeDetails); } catch (e) { }
      } else {
        parsedDresscode = theme.dresscodeDetails;
      }
    }

    const dresscodeText = parsedDresscode?.title || theme?.dresscodeText || "Kami mengharapkan para tamu undangan dapat hadir menggunakan pakaian dengan palet warna berikut:";

    let displayDresscode = [
      { color: '#ffffff', label: 'White' },
      { color: '#d6d3d1', label: 'Grey' },
      { color: '#1c1917', label: 'Black' }
    ];

    if (parsedDresscode) {
      if (Array.isArray(parsedDresscode) && parsedDresscode.length > 0) {
        displayDresscode = parsedDresscode; // Fallback for old simple array format
      } else if (parsedDresscode.items && Array.isArray(parsedDresscode.items)) {
        // Extract all colors from Men/Women categories and remove duplicates for a general list
        const uniqueColors = new Set();
        parsedDresscode.items.forEach(item => {
          if (Array.isArray(item.colors)) {
            item.colors.forEach(c => uniqueColors.add(c));
          }
        });
        if (uniqueColors.size > 0) {
          displayDresscode = Array.from(uniqueColors).map(hex => ({ color: hex, label: '' }));
        }
      }
    }

    return (
      <section id="dresscode" className="dresscode-section" key="dresscode">
        <div className="container">
          <div className="dresscode-content">
            <h2 className="section-title">Dresscode</h2>
            <p className="dresscode-text">{dresscodeText}</p>
            <div className="color-palette">
              {displayDresscode.map((d, i) => (
                <div className="color-item" key={i}>
                  <div className="color-circle" style={{ backgroundColor: d.color }}></div>
                  <span className="color-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderLivestream = () => {
    const liveLink = invitation?.livestreamSettings?.url || "https://youtube.com";
    return (
      <section id="livestream" className="livestream-section" key="livestream">
        <div className="container">
          <div className="livestream-content">
            <h2 className="section-title">Live Streaming</h2>
            <p className="section-subtitle">Bagi keluarga & sahabat yang tidak dapat hadir secara langsung</p>
            <div className="livestream-video-placeholder">
              <i className="fa-solid fa-play play-icon"></i>
            </div>
            <a href={liveLink} target="_blank" rel="noreferrer" className="eternal-btn">Tonton Live</a>
          </div>
        </div>
      </section>
    );
  };

  const renderIgFilter = () => {
    const filterLink = theme?.igFilterUrl || "https://instagram.com/ar/123456789";
    return (
      <section id="igFilter" className="igFilter-section" key="igFilter">
        <div className="container">
          <div className="igFilter-content">
            <h2 className="section-title">Instagram Filter</h2>
            <p className="section-subtitle">Gunakan filter spesial kami untuk mengabadikan momen</p>
            <div className="filter-preview">
              <i className="fa-brands fa-instagram ig-icon"></i>
            </div>
            <a href={filterLink} target="_blank" rel="noreferrer" className="eternal-btn">Coba Filter</a>
          </div>
        </div>
      </section>
    );
  };

  const renderFallback = (block) => {
    // Fallback for Rundown, Quote, Dresscode, Livestream, igFilter
    return (
      <section
        id={block.id}
        key={block.id}
        style={{
          padding: "60px 20px",
          background: "var(--stone-800)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "32px",
            fontFamily: "var(--font-display)",
            color: "#ffffff",
            marginBottom: "20px",
            textTransform: "capitalize",
          }}
        >
          {block.label || block.id}
        </h2>
        <p style={{ fontSize: "14px", color: "#aaaaaa" }}>
          Section content for {block.id} will be displayed here.
        </p>
      </section>
    );
  };

  const renderBlock = (block) => {
    if (!block.enabled) return null;
    switch (block.id) {
      case "cover":
        return renderHero();
      case "quote":
        return renderQuote();
      case "story":
        return renderStory();
      case "couple":
      case "profile":
        return renderCouple();
      case "events":
        return renderEvents();
      case "countdown":
        return renderCountdown();
      case "gallery":
        return renderGallery();
      case "rundown":
        return renderRundown();
      case "dresscode":
        return renderDresscode();
      case "livestream":
        return renderLivestream();
      case "igFilter":
        return renderIgFilter();
      case "gift":
        return renderGift();
      case "rsvp":
        return renderRsvp();
      case "wishes":
        return renderWishes();
      case "footer":
        return renderFooter();
      default:
        return renderFallback(block);
    }
  };

  const getImageUrl = (url) => url; // Handle if we need to format API urls later

  return (
    <div
      className="eternal-wrapper template-wrapper-dynamic"
      style={{
        "--font-display":
          theme?.typography?.fontHeading || '"Cormorant Garamond", serif',
        "--font-body":
          theme?.typography?.fontBody || '"Montserrat", sans-serif',
        "--stone-50": theme?.background?.primary || "#fafaf9",
        "--stone-100": theme?.background?.secondary || "#f5f5f4",
        "--stone-200": theme?.background?.secondary || "#e7e5e4",
        "--stone-800": theme?.bodyText?.primary || "#292524",
        "--stone-900": theme?.bodyText?.secondary || "#1c1917",
        "--btn-bg": theme?.button?.primary || "#292524",
        "--btn-text": theme?.button?.text || "#fafaf9",
      }}
    >
      {/* The Floating Multimedia component handles music/watermark */}
      <FloatingMultimedia
        invitation={invitation}
        isOpen={isOpen}
        defaultColor={theme?.button?.primary || "#1c1917"}
      />

      {/* Noise Texture Overlay */}
      <div className="bg-noise"></div>

      {/* Splash Screen */}
      {hasCustomLogo && isLoading && (
        <div 
          className="splash-screen"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: theme.background?.primary || '#1c1917',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 9999,
            transition: 'opacity 0.5s ease'
          }}
        >
          <div className={`theme-loading-logo loading-${settings.loadingAnimation || (invitation.themeId === 'nisera' ? 'shimmer' : invitation.themeId === 'samaya' ? 'reveal' : 'breathe')}`}><img
            src={settings.customLogoUrl}
            alt="Loading Logo"
            style={{ width: '120px', height: '120px', objectFit: 'contain' }}
          /></div>
        </div>
      )}

      {/* Cover / Opening */}
      <div
        id="coverOpening"
        className={`cover-opening cover-hero-bg ${(isOpen || isLoading) ? (settings.openingAnimation ? ("hide-" + settings.openingAnimation) : "hide") : ""}`}
        style={{ backgroundImage: `url('${coverImage}')` }}
      >
        <div className="cover-content">
          {hasCustomLogo && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <img 
                src={settings.customLogoUrl} 
                alt="Cover Logo" 
                style={{ width: '100px', height: '100px', objectFit: 'contain' }} 
              />
            </div>
          )}
          <div className="cover-subtitle">
            <p>{t('public.welcome_wedding')}</p>
          </div>
          <h1 className="cover-title">
            {profile.brideName || "Arunika"} &amp; {profile.groomName || "Deva"}
          </h1>
          <div
            id="coverGuest"
            className="cover-guest"
            style={{ marginTop: "2rem", marginBottom: "1rem" }}
          >
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", marginBottom: "0.5rem", fontStyle: "normal", letterSpacing: "1px", textTransform: "uppercase" }}>
              Dear,
            </p>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "400", color: "#ffffff", fontFamily: "var(--font-display)", fontStyle: "italic" }}>
              {previewGuest?.name || "Nama Tamu"}
            </h3>
          </div>
          <div className="cover-buttons">
            <button
              id="openWithMusic"
              className="btn-primary"
              onClick={() => setIsOpen(true)}
            >
              <span>{t('public.open_invitation')}</span>
            </button>
            {/* <button id="openWithoutMusic" className="btn-secondary">
            <span>Open Invitation (Music Off)</span>
          </button> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="mainContent" className="main-content">
        {/* Navigation */}
        <nav id="navigation" className="navigation">
          <div className="nav-inner">
            <a href="#home" className="nav-item active" data-section="home">
              HOME
            </a>
            <a href="#story" className="nav-item" data-section="story">
              STORY
            </a>
            <a href="#couple" className="nav-item" data-section="couple">
              COUPLE
            </a>
            <a href="#gallery" className="nav-item" data-section="gallery">
              GALLERY
            </a>
            <a href="#rsvp" className="nav-item" data-section="rsvp">
              RSVP
            </a>
          </div>
        </nav>

        {/* Music Player */}
        {/* Music toggle handled by FloatingMultimedia */}

        {/* Scrollable Main */}
        <main id="mainScroll" className="main-scroll">
          {layoutOrder.map((block) => renderBlock(block))}
        </main>
      </div>
    </div>
  );
}
