import React, { useState, useEffect } from 'react';
import AnimatedSection from '../AnimatedSection';
import { useSearchParams } from 'react-router-dom';
import { useCountdown } from '../../hooks/useCountdown.js';
import { useCalendarUrl } from '../../hooks/useCalendarUrl.js';
import FloatingMultimedia from '../FloatingMultimedia.jsx';
import PublicForms from '../PublicForms.jsx';
import Lightbox from './Lightbox';
import { resolveImageUrl } from '../../config/env.js';
import '../../styles/samaya-template.css';

export default function SamayaTemplate({ invitation, previewGuest }) {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [searchParams] = useSearchParams();

    if (!invitation) return null;

    // ========== TAMU LOGIC ==========
    const urlCode = searchParams.get('code');
    const matchedGuest = invitation.guests?.find((g) => g.code === urlCode || g.id === urlCode);

    let guestName = 'Tamu Undangan';
    if (urlCode) {
        guestName = matchedGuest ? matchedGuest.name : 'Tamu Undangan';
    } else if (previewGuest) {
        guestName = previewGuest.name;
    } else if (invitation.guests && invitation.guests.length > 0) {
        guestName = invitation.guests[0].name;
    }

    // ========== DATA ==========
    const theme = invitation.themeSettings || {};
    const profile = invitation.coupleProfile || {};
    const events = invitation.events || [];
    const gallery = invitation.galleryMedia || [];
    const gifts = invitation.giftSettings || {};
    const stories = invitation.timelineStories || [];
    const quote = invitation.quoteSettings || { enabled: false };

    const brideName = profile.brideName || 'Isabela';
    const groomName = profile.groomName || 'Ismaya';
    const brideFullName = profile.brideFullName || 'Isabela Putri Nandita';
    const groomFullName = profile.groomFullName || 'Muhammad Ismaya Putra';
    const brideParents = `Putri dari ${profile.brideFather || 'Bapak'} & ${profile.brideMother || 'Ibu'}`;
    const groomParents = `Putra dari ${profile.groomFather || 'Bapak'} & ${profile.groomMother || 'Ibu'}`;

    const akad = events.find((e) => e.type === 'akad') || events[0];
    const resepsi = events.find((e) => e.type === 'resepsi') || events[1];

    function getImageUrl(path) {
        return resolveImageUrl(path);
    }

    // Default images
    const defaultCoverImg = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800';
    const groomImg = profile.groomPhoto ? getImageUrl(profile.groomPhoto) : '/assets/samaya/groom.png';
    const brideImg = profile.bridePhoto ? getImageUrl(profile.bridePhoto) : '/assets/samaya/bride.png';
    const defaultGallery = [
        'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800',
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800',
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800',
        'https://images.unsplash.com/photo-1583939000140-547e1ee02ee8?q=80&w=800',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800',
    ];

    const galleryImages = gallery.length > 0
        ? gallery.map((g) => getImageUrl(g.url || g.path))
        : defaultGallery;

    // Countdown
    const targetDate = akad?.date || invitation.weddingDate;
    const timeLeft = useCountdown(targetDate, akad?.startTime);
    const calendarUrl = useCalendarUrl(
        targetDate,
        akad?.startTime,
        akad?.endTime,
        akad?.venueName,
        `The Wedding of ${groomName} & ${brideName}`,
        `You are invited to the wedding of ${groomName} & ${brideName}.`
    );

    function formatDate(dateStr) {
        if (!dateStr) return 'Sabtu, 28 Desember 2025';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }

    function formatTime(timeStr) {
        if (!timeStr) return '10:00';
        return timeStr.substring(0, 5);
    }

    function handleCopy(text, idx) {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    }

    function handleOpen() {
        setIsOpen(true);
    }

    // Bank accounts
    const bankAccounts = gifts.bankAccounts || [
        { bankName: 'Bank BCA', accountNumber: '1234567890', accountHolder: groomName }
    ];

    // Cover image
    const coverImg = invitation.themeSettings?.coverImageUrl
        ? getImageUrl(invitation.themeSettings.coverImageUrl)
        : (gallery.length > 0 ? getImageUrl(gallery[0].url || gallery[0].path) : defaultCoverImg);

    return (
        <div className="samaya-wrapper template-wrapper-dynamic" style={{ minHeight: '100vh' }}>
            <FloatingMultimedia invitation={invitation} isOpen={isOpen} />

            {/* ==================== COVER / TIRAI (ENVELOPE) ==================== */}
            <div data-section="cover">
                <div
                    className={`samaya-top-cover ${isOpen ? 'hide' : ''}`}
                    style={{ position: isOpen ? 'absolute' : 'fixed' }}
                >
                    <div className="tc-inner">
                        {/* Background image */}
                        <div className="tc-highlight">
                            <img src={coverImg} alt="Cover" />
                        </div>

                        {/* Head content */}
                        <div className="tc-head">
                            <p style={{ fontFamily: 'var(--heading-family)', textTransform: 'uppercase', fontWeight: 600, fontSize: 'calc(var(--body-text-size) + 2px)', color: 'var(--text-tertiary)' }}>
                                The Wedding Of
                            </p>
                            <h1>{groomName} & {brideName}</h1>
                        </div>

                        {/* Details + open button */}
                        <div className="tc-details">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                <p className="sapa-tamu" style={{ fontSize: 'var(--body-text-size)', color: 'var(--text-tertiary)' }}>
                                    Kepada Yth. Bapak/Ibu/Saudara/i
                                </p>
                                <p style={{ fontSize: 'calc(var(--body-text-size) + 4px)', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                                    {guestName}
                                </p>
                            </div>
                            <div className="link-wrap">
                                <button className="link-open" onClick={handleOpen}>
                                    Buka Undangan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== MAIN COVER SECTION ==================== */}
            <AnimatedSection animation="fadeUp" data-section="cover">
                <section className="samaya-cover">
                    <div className="cover-inner">
                        {/* Ornament frame image */}
                        

                        {/* Photo with mask */}
                        <div className="orn-cover-frame">
                            <div className="image-wrap">
                                <img src="/assets/samaya/frame-cover.png" alt="Frame" />
                            </div>
                        </div>
                        <div className="cover-body">
                            <div className="cover-frame" style={{ position: 'absolute', inset: '0 0 8% 0' }}>
                                <img src={coverImg} alt="Cover Photo" />
                            </div>
                        </div>

                        {/* Cover foot text */}
                        <div className="cover-foot">
                            <p className="top-text">The Wedding Of</p>
                            <h2 className="prime-title">{groomName} & {brideName}</h2>
                            <p className="bottom-text">{formatDate(targetDate)}</p>
                        </div>
                    </div>
                </section>
            </AnimatedSection>

            {/* ==================== QUOTE ==================== */}
            {(quote.enabled !== false) && (
                <AnimatedSection animation="fadeUp" data-section="quote">
                    <section className="samaya-quote">
                        <div className="quote-content">
                            <p className="quote-caption" style={{ fontStyle: 'italic', lineHeight: 1.8 }}>
                                {quote.text || '"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu mendapat ketenangan hati, dan dijadikan-Nya di antaramu rasa kasih dan sayang."'}
                            </p>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
                                {quote.source || '(QS. Ar-Rum: 21)'}
                            </p>
                        </div>
                    </section>
                </AnimatedSection>
            )}

            {/* ==================== COUPLE ==================== */}
            <AnimatedSection animation="fadeUp" data-section="profile">
                <section className="samaya-couple-wrap">
                    <div className="couple-section">
                        {/* Couple Head */}
                        <div className="couple-head">
                            <h2 className="couple-title">Bismillahirrahmanirrahim</h2>
                            <p className="couple-description">
                                Assalamualaikum Warahmatullahi Wabarakatuh. Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan acara pernikahan:
                            </p>
                        </div>

                        {/* Couple Body */}
                        <div className="couple-body">
                            {/* GROOM */}
                            <div className="couple-info groom">
                                <div className="couple-preview">
                                    <div className="img-wrap">
                                        <div className="couple-frame">
                                            <div className="couple-picture-wrap" style={{ width: '60%', marginLeft: 'auto' }}>
                                                <div className="couple-picture">
                                                    <img className="img" src={groomImg} alt={groomName} style={{ width: '82%', marginLeft: 'auto', transform: 'scaleX(-1)' }} />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Ornaments */}
                                        <div className="ornaments-wrapper">
                                            <div className="orn-cp-1-3 image-wrap"><img src="/assets/samaya/Orn-04.png" alt="" /></div>
                                            <div className="orn-cp-1-4 image-wrap"><img src="/assets/samaya/Orn-05.png" alt="" /></div>
                                            <div className="orn-cp-1-5 image-wrap"><img src="/assets/samaya/Orn-06.png" alt="" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="couple-details">
                                    <h3 className="couple-name-big">{groomName}</h3>
                                    <p className="couple-name">{groomFullName}</p>
                                    <p className="couple-parents">{groomParents}</p>
                                    {profile.groomInstagram && (
                                        <div className="couple-link-wrap">
                                            <a href={`https://instagram.com/${profile.groomInstagram}`} className="couple-link" target="_blank" rel="noreferrer">
                                                <i className="fa-brands fa-instagram"></i> @{profile.groomInstagram}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="separator-wrap">
                                <div className="separator">
                                    <h2 className="couple-separator">&</h2>
                                </div>
                            </div>

                            {/* BRIDE */}
                            <div className="couple-info bride">
                                <div className="couple-preview">
                                    <div className="img-wrap">
                                        <div className="couple-frame" style={{ transform: 'scaleX(1)' }}>
                                            <div className="couple-picture-wrap" style={{ width: '60%' }}>
                                                <div className="couple-picture">
                                                    <img className="img" src={brideImg} alt={brideName} style={{ width: '85.89%' }} />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Ornaments */}
                                        <div className="ornaments-wrapper">
                                            <div className="orn-cp-1-1 image-wrap"><img src="/assets/samaya/Orn-03.png" alt="" /></div>
                                            <div className="orn-cp-1-2 image-wrap"><img src="/assets/samaya/Orn-04.png" alt="" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="couple-details">
                                    <h3 className="couple-name-big">{brideName}</h3>
                                    <p className="couple-name">{brideFullName}</p>
                                    <p className="couple-parents">{brideParents}</p>
                                    {profile.brideInstagram && (
                                        <div className="couple-link-wrap">
                                            <a href={`https://instagram.com/${profile.brideInstagram}`} className="couple-link" target="_blank" rel="noreferrer">
                                                <i className="fa-brands fa-instagram"></i> @{profile.brideInstagram}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </AnimatedSection>

            {/* ==================== SAVE THE DATE ==================== */}
            <AnimatedSection animation="fadeUp" data-section="countdown">
                <section className="samaya-savedate">
                    <div className="save-date-body">
                        <div className="save-date-box">
                            {/* Ornament top */}
                            <div className="orn-sd-1">
                                <div className="image-wrap"><img src="/assets/samaya/Orn-sd.png" alt="" /></div>
                            </div>

                            <h2 className="save-date-title">Save The Date</h2>
                            <p className="save-date-description">{formatDate(targetDate)}</p>

                            <div className="divider"></div>

                            {/* Countdown */}
                            <div className="countdown">
                                <div className="count-item">
                                    <span className="count-num">{timeLeft.days}</span>
                                    <span className="count-text">Hari</span>
                                </div>
                                <div className="count-item">
                                    <span className="count-num">{timeLeft.hours}</span>
                                    <span className="count-text">Jam</span>
                                </div>
                                <div className="count-item">
                                    <span className="count-num">{timeLeft.minutes}</span>
                                    <span className="count-text">Menit</span>
                                </div>
                                <div className="count-item">
                                    <span className="count-num">{timeLeft.seconds}</span>
                                    <span className="count-text">Detik</span>
                                </div>
                            </div>

                            {/* Add to Calendar */}
                            <div className="add-to-calendar-wrap">
                                <a href={calendarUrl} target="_blank" rel="noreferrer" className="add-to-calendar">
                                    Ingatkan Saya
                                </a>
                            </div>
                        </div>

                        {/* Ornaments */}
                        <div className="ornaments-wrapper">
                            <div className="orn-sd-1-1 right image-wrap"><img src="/assets/samaya/Orn-08.png" alt="" /></div>
                            <div className="orn-sd-1-1 left image-wrap"><img src="/assets/samaya/Orn-08.png" alt="" /></div>
                        </div>
                    </div>
                </section>
            </AnimatedSection>

            {/* ==================== EVENTS / AGENDA ==================== */}
            <AnimatedSection animation="fadeUp" data-section="events">
                <section className="samaya-agenda">
                    <div className="agenda-inner">
                        <div className="agenda-head">
                            <h2 className="agenda-title">Acara</h2>
                            <p className="agenda-description">
                                Dengan hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami
                            </p>
                        </div>

                        <div className="agenda-body">
                            {/* Akad */}
                            {(akad || events.length === 0) && (
                                <div className="activity-item-wrapper">
                                    <div className="activity-item">
                                        <div className="activity-content">
                                            <div className="activity-head">
                                                <h3 className="activity-title">{akad?.title || 'Akad Nikah'}</h3>
                                                <p className="activity-time">
                                                    {formatTime(akad?.startTime)} - {formatTime(akad?.endTime || 'Selesai')}
                                                </p>
                                            </div>
                                            <div className="activity-details">
                                                <p className="activity-hall">{akad?.venueName || 'Gedung Serbaguna'}</p>
                                                <p className="activity-address">{akad?.venueAddress || 'Jl. Contoh No.1, Kota'}</p>
                                                {akad?.mapUrl && (
                                                    <div className="activity-link-wrap">
                                                        <a href={akad.mapUrl} className="activity-link" target="_blank" rel="noreferrer">
                                                            <img src="/assets/samaya/icon-map.png" className="icon-map" alt="map" />
                                                            Lihat Lokasi
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Ornaments */}
                                        <div className="ornaments-wrapper">
                                            <div className="orn-ev-1 image-wrap"><img src="/assets/samaya/Orn-07.png" alt="" /></div>
                                            <div className="orn-ev-1-2 image-wrap"><img src="/assets/samaya/Orn-05.png" alt="" /></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Resepsi */}
                            {(resepsi || events.length === 0) && (
                                <div className="activity-item-wrapper">
                                    <div className="activity-item">
                                        <div className="activity-content">
                                            <div className="activity-head">
                                                <h3 className="activity-title">{resepsi?.title || 'Resepsi'}</h3>
                                                <p className="activity-time">
                                                    {formatTime(resepsi?.startTime)} - {formatTime(resepsi?.endTime || 'Selesai')}
                                                </p>
                                            </div>
                                            <div className="activity-details">
                                                <p className="activity-hall">{resepsi?.venueName || 'Gedung Serbaguna'}</p>
                                                <p className="activity-address">{resepsi?.venueAddress || 'Jl. Contoh No.1, Kota'}</p>
                                                {resepsi?.mapUrl && (
                                                    <div className="activity-link-wrap">
                                                        <a href={resepsi.mapUrl} className="activity-link" target="_blank" rel="noreferrer">
                                                            <img src="/assets/samaya/icon-map.png" className="icon-map" alt="map" />
                                                            Lihat Lokasi
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Ornaments */}
                                        <div className="ornaments-wrapper">
                                            <div className="orn-ev-1 image-wrap"><img src="/assets/samaya/Orn-07.png" alt="" /></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Additional events */}
                            {events.slice(2).map((ev, idx) => (
                                <div className="activity-item-wrapper" key={idx}>
                                    <div className="activity-item">
                                        <div className="activity-content">
                                            <div className="activity-head">
                                                <h3 className="activity-title">{ev.title}</h3>
                                                <p className="activity-time">
                                                    {formatTime(ev.startTime)} - {formatTime(ev.endTime || 'Selesai')}
                                                </p>
                                            </div>
                                            <div className="activity-details">
                                                <p className="activity-hall">{ev.venueName}</p>
                                                <p className="activity-address">{ev.venueAddress}</p>
                                                {ev.mapUrl && (
                                                    <div className="activity-link-wrap">
                                                        <a href={ev.mapUrl} className="activity-link" target="_blank" rel="noreferrer">
                                                            <img src="/assets/samaya/icon-map.png" className="icon-map" alt="map" />
                                                            Lihat Lokasi
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </AnimatedSection>

            {/* ==================== LOVE STORY ==================== */}
            {stories.length > 0 && (
                <AnimatedSection animation="fadeUp" data-section="story">
                    <section className="samaya-story">
                        <div className="story-inner">
                            <div className="story-head">
                                <h2>Love Story</h2>
                                <p>Cerita perjalanan cinta kami</p>
                            </div>
                            <div className="story-body">
                                {stories.map((story, idx) => (
                                    <AnimatedSection key={idx} animation="fadeUp" delay={idx * 0.15}>
                                        <div className="story-content-wrapper">
                                            <div className="story-details">
                                                <h3 style={{ fontFamily: 'var(--heading-family)', fontSize: 'calc(var(--heading-size) - 8px)' }}>
                                                    {story.title}
                                                </h3>
                                                <p className="story-caption">{story.date}</p>
                                                <p className="story-caption">{story.description}</p>
                                            </div>
                                        </div>
                                    </AnimatedSection>
                                ))}
                            </div>
                        </div>
                    </section>
                </AnimatedSection>
            )}

            {/* ==================== DRESSCODE ==================== */}
            {invitation.invitationFeatures?.dresscodeEnabled && (
                <AnimatedSection animation="fadeUp" data-section="dresscode">
                    <section className="samaya-dresscode">
                        <div className="dress-inner">
                            <div className="dress-header">
                                <h2>Dresscode</h2>
                                <p style={{ marginTop: '8px', lineHeight: '150%' }}>
                                    Kami sangat mengharapkan kehadiran Bapak/Ibu dengan menggunakan dresscode berikut
                                </p>
                            </div>

                            <div className="dress-list" style={{ marginTop: '24px' }}>
                                {/* Men */}
                                <div className="dress-inwrap">
                                    <p className="dress-item-title">Pria</p>
                                    <div className="dress-color-list">
                                        <div className="dress-color-item" style={{ background: '#546447' }}></div>
                                        <div className="dress-color-item" style={{ background: '#827A4B' }}></div>
                                        <div className="dress-color-item" style={{ background: '#C8CBB8' }}></div>
                                    </div>
                                </div>
                                {/* Women */}
                                <div className="dress-inwrap">
                                    <p className="dress-item-title">Wanita</p>
                                    <div className="dress-color-list">
                                        <div className="dress-color-item" style={{ background: '#F3F2EE' }}></div>
                                        <div className="dress-color-item" style={{ background: '#C8CBB8' }}></div>
                                        <div className="dress-color-item" style={{ background: '#827A4B' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ornaments */}
                        <div className="ornaments-wrapper">
                            <div className="orn-dc-1 right image-wrap"><img src="/assets/samaya/Orn-07.png" alt="" /></div>
                            <div className="orn-dc-1 left image-wrap"><img src="/assets/samaya/Orn-07.png" alt="" /></div>
                        </div>
                    </section>
                </AnimatedSection>
            )}

            {/* ==================== RSVP ==================== */}
            <AnimatedSection animation="fadeUp" data-section="rsvp">
                <section className="samaya-rsvp">
                    <div className="rsvp-inner">
                        <div className="rsvp-head">
                            <div className="rsvp-info">
                                <h2 className="rsvp-title">RSVP</h2>
                                <div className="rsvp-desc-wrap">
                                    <p>Konfirmasi kehadiran Bapak/Ibu/Saudara/i di acara pernikahan kami</p>
                                </div>
                            </div>
                        </div>

                        <PublicForms
                            invitation={invitation}
                            previewGuest={previewGuest}
                            matchedGuest={matchedGuest}
                            urlCode={urlCode}
                            templateStyle="samaya"
                        />
                    </div>

                    {/* Ornaments */}
                    <div className="ornaments-wrapper">
                        <div className="orn-rsvp-1 right image-wrap"><img src="/assets/samaya/Orn-10.png" alt="" /></div>
                        <div className="orn-rsvp-1 left image-wrap"><img src="/assets/samaya/Orn-10.png" alt="" /></div>
                    </div>
                </section>
            </AnimatedSection>

            {/* ==================== PHOTO GALLERY ==================== */}
            <AnimatedSection animation="fadeUp" data-section="gallery">
                <section className="samaya-photo">
                    <div className="photo-inner">
                        <div className="photo-head">
                            <h2 className="photo-title">Our Gallery</h2>
                            <p>Momen kebersamaan kami</p>
                        </div>

                        <div className="photo-body">
                            <div className="photo-box">
                                {galleryImages.map((src, i) => (
                                    <div
                                        key={i}
                                        className="photo-item"
                                        onClick={() => setLightboxIndex(i)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img src={src} alt={`Gallery ${i + 1}`} loading="lazy" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Ornament */}
                    <div className="ornaments-wrapper" style={{ zIndex: 0 }}>
                        <div className="image-wrap" style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                            <img src="/assets/samaya/Orn-14.png" alt="" />
                        </div>
                    </div>
                </section>
            </AnimatedSection>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <Lightbox
                    images={galleryImages}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onNavigate={setLightboxIndex}
                />
            )}

            {/* ==================== WEDDING GIFT ==================== */}
            {gifts.enabled !== false && (
                <AnimatedSection animation="fadeUp" data-section="gift">
                    <section className="samaya-gift">
                        <div className="gift-inner">
                            <div className="gift-head">
                                <h2>Wedding Gift</h2>
                                <p className="gift-description" style={{ lineHeight: '150%' }}>
                                    Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun, jika Anda ingin memberikan tanda kasih, kami menyediakan informasi berikut.
                                </p>
                            </div>

                            <div className="gift-body-wrap">
                                {bankAccounts.map((bank, idx) => (
                                    <div key={idx} className="gift-details" style={{ marginBottom: '16px' }}>
                                        <div className="gift-select-header">
                                            <p>{bank.bankName}</p>
                                        </div>
                                        <div className="bank-item">
                                            <div className="bank-detail">
                                                <div className="bank-account-number-label">
                                                    <span>No. Rekening</span>
                                                </div>
                                                <p className="bank-account-number">{bank.accountNumber}</p>
                                                <div className="bank-account-number-label" style={{ marginTop: '8px' }}>
                                                    <span>Atas Nama</span>
                                                </div>
                                                <p className="bank-account-number">{bank.accountHolder || bank.accountName}</p>
                                            </div>
                                            <button
                                                className="bank-button-wrap"
                                                onClick={() => handleCopy(bank.accountNumber, idx)}
                                            >
                                                <span>{copiedIndex === idx ? '✓ Tersalin' : 'Salin No. Rekening'}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ornaments */}
                        <div className="ornaments-wrapper">
                            <div className="orn-kado-1 right image-wrap"><img src="/assets/samaya/Orn-11.png" alt="" /></div>
                            <div className="orn-kado-1 left image-wrap"><img src="/assets/samaya/Orn-11.png" alt="" /></div>
                        </div>
                    </section>
                </AnimatedSection>
            )}

            {/* ==================== WEDDING WISHES ==================== */}
            <AnimatedSection animation="fadeUp" data-section="wishes">
                <section className="samaya-wishes">
                    <div className="wishes-inner">
                        <div className="wishes-head">
                            <h2 className="wishes-title">Wedding Wishes</h2>
                            <p>Kirimkan doa dan ucapan untuk kedua mempelai</p>
                        </div>

                        <div className="wishes-body">
                            <PublicForms
                                invitation={invitation}
                                previewGuest={previewGuest}
                                matchedGuest={matchedGuest}
                                urlCode={urlCode}
                                formType="wishes"
                                templateStyle="samaya"
                            />
                        </div>
                    </div>

                    {/* Ornaments */}
                    <div className="ornaments-wrapper">
                        <div className="orn-rsvp-2 right image-wrap"><img src="/assets/samaya/Orn-12.png" alt="" /></div>
                        <div className="orn-rsvp-2 left image-wrap"><img src="/assets/samaya/Orn-12.png" alt="" /></div>
                    </div>
                </section>
            </AnimatedSection>

            {/* ==================== FOOTNOTE / THANK YOU ==================== */}
            <AnimatedSection animation="fadeUp" data-section="thankyou">
                <section className="samaya-footnote">
                    {/* Frame cover wrap */}
                    <div className="frame-cover-wrap">
                        <div className="image-wrap">
                            <img src="/assets/samaya/frame-ff.png" alt="Frame" style={{ visibility: 'hidden' }} />
                        </div>
                        <div className="cover-frame">
        <img src={coverImg} alt="Thank you" />
    </div>
                    </div>

                    {/* Footnote content */}
                    <div className="footnote-content">
                        <p className="top-text">Thank You</p>
                        <h2 className="footnote-title">{groomName} & {brideName}</h2>
                        <p className="bottom-text" style={{ fontSize: 'calc(var(--body-text-size))', color: 'var(--text-tertiary)', lineHeight: '150%' }}>
                            Merupakan suatu kebahagiaan dan kehormatan bagi kami, apabila Bapak/Ibu/Saudara/i berkenan hadir di acara pernikahan kami.
                        </p>
                    </div>
                </section>
            </AnimatedSection>

            {/* ==================== FOOTER ==================== */}
            <section className="samaya-footer">
                <div className="footer-inner">
                    <p>Designed with ❤️</p>
                </div>
            </section>
        </div>
    );
}
