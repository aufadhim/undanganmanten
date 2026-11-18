import { DEFAULT_INVITATION_MUSIC } from '../../../utils/invitationMusic.js';
import { envelopeDesigns, resolveEnvelopeDesign } from '../../../config/envelopeDesigns.js';
import { eventTitle } from '../../../../public/templates/shared/event-layout.js';
import SaveTheDate from '../shared/SaveTheDate.jsx';
import DresscodeContent from '../shared/DresscodeContent.jsx';
import LivestreamCard from '../shared/LivestreamCard.jsx';
import PhotoFrame from '../shared/PhotoFrame.jsx';
import { useCountdown } from '../../../hooks/useCountdown.js';
import { useCalendarUrl } from '../../../hooks/useCalendarUrl.js';
import { resolvePreviewStory } from '../../../config/dummyStory.js';
import { resolveImageUrl } from '../../../config/env.js';
import { uploadedProfilePhoto } from '../../../config/templateCover.js';
import { Children, useEffect, useRef, useState } from 'react';
import FloatingMultimedia from '../../FloatingMultimedia.jsx';
import PublicForms, { GiftSection } from '../../PublicForms.jsx';
import StandardGallery from '../shared/StandardGallery.jsx';
import FooterBrand from '../shared/FooterBrand.jsx';
import { resolveInvitationQuote } from '../../../config/quotePresets.js';
import { DUMMY_EVENTS, DUMMY_RUNDOWNS, DUMMY_LIVESTREAM, previewGift, previewList, sortWeddingEvents } from '../../../config/dummyPreviewData.js';
import './engine-4.css';

const dateFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeZone: 'Asia/Jakarta' });
function formatDate(value) {
    return value && Number.isFinite(Date.parse(value)) ? dateFormat.format(new Date(value)) : '';
}

function OrderedSections({ layout, children }) {
    let order = layout;
    if (typeof order === 'string') {
        try { order = JSON.parse(order); } catch { order = []; }
    }
    const blocks = new Map((Array.isArray(order) ? order : []).filter(Boolean).map((block, index) => [block.id, { ...block, index }]));
    const rank = id => id === 'cover' ? -1 : id === 'footer' ? Infinity : blocks.get(id)?.index ?? blocks.size;
    return Children.toArray(children).filter(section => {
        const id = section.props['data-section'];
        return id === 'cover' || id === 'footer' || blocks.get(id)?.enabled !== false;
    }).sort((a, b) => rank(a.props['data-section']) - rank(b.props['data-section']));
}

export default function Engine4Template({ invitation, previewGuest, editorPreview = false }) {
    const [opened, setOpened] = useState(false);
    const letter = useRef(null);
    const seal = useRef(null);
    const [closing, setClosing] = useState(false);
    useEffect(() => {
        if (!closing) return;
        const timer = window.setTimeout(() => {
            setClosing(false);
            requestAnimationFrame(() => seal.current?.focus({ preventScroll: true }));
        }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 4360);
        return () => window.clearTimeout(timer);
    }, [closing]);
    useEffect(() => {
        const scrollport = letter.current;
        if (!opened || !scrollport || !window.IntersectionObserver ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const sections = scrollport.querySelectorAll('.engine-four-pages > section, .engine-four-pages > section > article');
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add('engine-four-revealed');
                observer.unobserve(entry.target);
            }
        }, { root: scrollport, rootMargin: `0px 0px -${scrollport.clientHeight * .25}px 0px` });

        sections.forEach(section => observer.observe(section));
        return () => {
            observer.disconnect();
            sections.forEach(section => section.classList.remove('engine-four-revealed'));
        };
    }, [opened]);

    const profile = invitation.coupleProfile || {};
    const theme = invitation.themeSettings || {};
    const envelopeColor = theme.background?.envelopeColor;
    const customEnvelope = /^#[\da-f]{6}$/i.test(envelopeColor || '');
    const design = resolveEnvelopeDesign(theme.background?.envelopeDesign);
    const envelope = envelopeDesigns[design];
    const envelopeStyle = {
        ...(customEnvelope && getEnvelopeStyle(envelopeColor)),
        '--envelope-texture': `url("/assets/engine-4/${envelope.texture}")`,
        '--envelope-color': customEnvelope ? envelopeColor : envelope.color,
    };
    const features = invitation.invitationFeatures || {};
    const multimedia = {
        invitationFeatures: { musicEnabled: features.musicEnabled },
        themeSettings: { musicUrl: theme.musicUrl || (features.musicEnabled ? DEFAULT_INVITATION_MUSIC : '') },
    };
    const bride = profile.brideName || 'Mempelai wanita';
    const groom = profile.groomName || 'Mempelai pria';
    const events = sortWeddingEvents(previewList(invitation.events, DUMMY_EVENTS, editorPreview));
    const event = events[0];
    const date = formatDate(event?.date || invitation.weddingDate);
    const quote = resolveInvitationQuote(invitation.quoteSettings);
    const media = invitation.galleryMedia || [];
    const eventDate = event?.date || invitation.weddingDate;
    const countdown = useCountdown(eventDate, event?.startTime);
    const calendarUrl = useCalendarUrl(eventDate, event?.startTime, event?.endTime, event?.venueName, `Pernikahan ${bride} & ${groom}`, event?.address);
    const rundowns = previewList(invitation.rundowns, DUMMY_RUNDOWNS, editorPreview);
    const story = resolvePreviewStory(theme.mainStory, invitation.timelineStories || [], editorPreview, features.timelineEnabled);
    const livestream = invitation.livestreamSettings?.url ? invitation.livestreamSettings : editorPreview ? DUMMY_LIVESTREAM : null;
    const gift = previewGift(invitation.giftSettings || {}, editorPreview);

    function openInvitation() {
        if (letter.current) letter.current.scrollTop = 0;
        setOpened(true);
        letter.current?.focus({ preventScroll: true });
    }

    return (
        <div className="engine-four" data-envelope-design={design} data-envelope-panels={envelope.panels || 4} data-custom-envelope={customEnvelope || undefined} style={envelopeStyle}>
            <FloatingMultimedia invitation={multimedia} isOpen={opened} defaultColor="#56563e" />
            <div ref={letter} tabIndex={-1} aria-label="Surat undangan" className="engine-four-letter">
                <main className="template-wrapper-dynamic engine-four-pages" data-section-heading-font="template" inert={opened ? undefined : ''}>
                    <OrderedSections layout={theme.layoutOrder}>
                    <section className="engine-four-cover" data-section="cover">
                        <span className="engine-four-ornament" aria-hidden="true">&#10087;</span>
                        <p>Bersama keluarga, kami mengundang Anda</p>
                        <p><strong>{previewGuest?.name ? `Bpk/Ibu/Sdr/i ${previewGuest.name}` : 'Tamu tersayang'}</strong></p>
                        <p>untuk merayakan pernikahan kami.</p>
                        <h1>{bride} <em>&amp;</em> {groom}</h1>
                        <span className="engine-four-ornament" aria-hidden="true">&#10087;</span>
                        {date && <p>{date}</p>}
                    </section>
                    {quote.text && <section data-section="quote"><span className="engine-four-ornament" aria-hidden="true">&#10087;</span><blockquote>{quote.text}</blockquote><p>{quote.source}</p></section>}
                    <section data-section="profile">
                        <h2 data-typography-preserve>Mempelai</h2>
                        {['bride', 'groom'].map(side => {
                            const photo = uploadedProfilePhoto(profile[side + 'Photo']);
                            const father = profile[side + 'Father']?.trim();
                            const mother = profile[side + 'Mother']?.trim();
                            const bio = theme[side + 'BioEnabled'] !== false && profile[side + 'Bio']?.trim();
                            const ig = profile[side + 'Ig']?.trim();
                            const handle = ig?.match(/^(?:https?:\/\/(?:www\.)?instagram\.com\/|@)?([\w.]+)\/?$/i)?.[1];
                            return <article key={side}>
                                {photo && <figure className="engine-four-portrait">
                                    <div className="engine-four-photo-mount">
                                        <img className="engine-four-profile-photo" src={resolveImageUrl(photo)} alt={side === 'bride' ? bride : groom} loading="lazy" />
                                        <span className="engine-four-photo-corners" aria-hidden="true"><i /><i /><i /><i /></span>
                                    </div>
                                </figure>}
                                <h3 data-heading-family>{profile[side + 'FullName'] || (side === 'bride' ? bride : groom)}</h3>
                                {(father || mother) && <div className="engine-four-parents">
                                    <p>{side === 'bride' ? 'Putri dari' : 'Putra dari'}</p>
                                    {father && <p>{/^(bapak|pak|bpk\.?)\s/i.test(father) ? father : `Bapak ${father}`}</p>}
                                    {mother && <p>{/^(ibu|bu)\s/i.test(mother) ? mother : `Ibu ${mother}`}</p>}
                                </div>}
                                {bio && <p className="engine-four-bio">{bio}</p>}
                                {handle && theme[side + 'InstagramEnabled'] !== false && (
                                    <a className="engine-four-action" href={'https://www.instagram.com/' + handle + '/'} target="_blank" rel="noreferrer">
                                        <i className="fa-brands fa-instagram" aria-hidden="true" /> @{handle}
                                    </a>
                                )}
                            </article>;
                        })}
                    </section>
                    {date && <section data-section="countdown"><h2 data-typography-preserve>Simpan tanggal</h2><SaveTheDate date={eventDate} countdown={countdown} calendarUrl={calendarUrl} /></section>}
                    {events.length > 0 && <section data-section="events">
                        <h2 data-typography-preserve>Hari pernikahan</h2>
                        {events.map((item, index) => <article className="engine-four-event" key={item.id || index}>
                            <h3>{item.title || eventTitle(item.type)}</h3>
                            <div className="engine-four-event-time">
                                {formatDate(item.date) && <p>{formatDate(item.date)}</p>}
                                {item.startTime && <p>Pukul {String(item.startTime).slice(0, 5)}{item.endTime && `–${String(item.endTime).slice(0, 5)}`} WIB</p>}
                            </div>
                            {(item.venueName || item.address || item.venueAddress) && <div className="engine-four-event-venue">
                                {item.venueName && <strong>{item.venueName}</strong>}
                                {(item.address || item.venueAddress) && <p>{item.address || item.venueAddress}</p>}
                            </div>}
                            {(item.googleMapsUrl || item.mapUrl) && (
                                <a className="engine-four-action" href={item.googleMapsUrl || item.mapUrl} target="_blank" rel="noreferrer">
                                    <i className="fa-solid fa-location-dot" aria-hidden="true" /> Lihat lokasi
                                </a>
                            )}
                        </article>)}
                    </section>}
                    {features.rundownEnabled !== false && rundowns.length > 0 && <section data-section="rundown">
                        <h2 data-typography-preserve>Rangkaian acara</h2>
                        {rundowns.map((item, index) => <article key={item.id || index}>
                            <time>{item.time}</time><h3>{item.activity || item.title}</h3>
                            {item.description && <p>{item.description}</p>}
                        </article>)}
                    </section>}
                    {features.storyEnabled !== false && (story.mainStory || story.timeline.length > 0) && <section data-section="story">
                        <h2 data-typography-preserve>Kisah kami</h2>
                        {story.mainStory && <p className="engine-four-prose">{story.mainStory}</p>}
                        {story.timeline.map((item, index) => <article key={item.id || index}>
                            {item.date && <time>{formatDate(item.date) || item.date}</time>}
                            <h3>{item.title}</h3><p className="engine-four-prose">{item.description}</p>
                        </article>)}
                    </section>}
                    {features.dresscodeEnabled && <section data-section="dresscode"><h2 data-typography-preserve>Panduan busana</h2><DresscodeContent theme={theme} /></section>}
                    {features.livestreamEnabled && livestream?.url && <section data-section="livestream">
                        <h2 data-typography-preserve>Siaran langsung</h2><LivestreamCard url={livestream.url} coverImage={resolveImageUrl(livestream.coverImageUrl)} />
                    </section>}
                    {features.igFilterEnabled && <section className="photo-frame-section" data-section="igFilter"><h2 data-typography-preserve>Bingkai foto</h2><PhotoFrame invitation={invitation} themeId={invitation.themeId} frameUrl={theme.igFilterImageUrl} /></section>}
                    {features.galleryEnabled !== false && media.length > 0 && <section data-section="gallery"><h2 data-typography-preserve>Galeri</h2><StandardGallery className="engine-four-gallery" mediaList={media} layout={theme.galleryLayout || 'editorial'} /></section>}
                    {features.rsvpEnabled !== false && <section className="engine-four-reply" data-section="rsvp"><h2 data-typography-preserve>Konfirmasi kehadiran</h2><PublicForms replyCard hideSectionTitle invitation={invitation} previewGuest={previewGuest} previewMode={editorPreview} formType="rsvp" /></section>}
                    {features.rsvpEnabled === false && features.wishesEnabled !== false && <section className="engine-four-reply" data-section="wishes"><h2 data-typography-preserve>Ucapan &amp; doa</h2><PublicForms replyCard hideSectionTitle invitation={invitation} previewGuest={previewGuest} previewMode={editorPreview} formType="wishes" /></section>}
                    {features.giftEnabled && <section data-section="gift"><h2 data-typography-preserve>Tanda kasih</h2><GiftSection gift={gift} hideTitle /></section>}
                    <section data-section="footer"><h2 data-typography-preserve>Terima kasih</h2><p>{theme.closingText || 'Kami menantikan kehadiran dan doa restu Anda.'}</p><p className="engine-four-closing-names" data-heading-family>{bride} &amp; {groom}</p>
                        <button type="button" className="engine-four-action" onClick={() => {
                            setClosing(true);
                            setOpened(false);
                        }}>Tutup undangan</button>
                        <FooterBrand /></section>
                    </OrderedSections>
                </main>
            </div>
            <div className="engine-four-flaps" data-open={opened} data-closing={closing}>
                {(envelope.panels === 2 ? ['left', 'right'] : ['bottom', 'left', 'right', 'top']).map(side => (
                    <span className={'engine-four-flap ' + side} key={side} aria-hidden="true" />
                ))}
                <button type="button" className="engine-four-seal" data-open-cover onClick={openInvitation}
                    ref={seal} disabled={opened || closing} aria-label="Buka undangan">
                    <img src="/assets/engine-4/wax.webp" alt="" />
                </button>
            </div>
        </div>
    );
}

function getEnvelopeStyle(color) {
    const rgb = [1, 3, 5].map(offset => parseInt(color.slice(offset, offset + 2), 16) / 255);
    const brightness = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
    return {
        '--envelope-color': color,
        '--relief-shadow': .12 + brightness * .36,
        '--relief-highlight': .12 + (1 - brightness) * .48,
    };
}
