import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCountdown } from '../../../hooks/useCountdown.js';
import { useCalendarUrl } from '../../../hooks/useCalendarUrl.js';
import { useTemplateReveal } from '../../../hooks/useTemplateReveal.js';
import { resolveImageUrl } from '../../../config/env.js';
import { resolveTemplateCovers } from '../../../config/templateCover.js';
import { DUMMY_BRIDE_PHOTO, DUMMY_GALLERY_PHOTOS, DUMMY_GALLERY_VIDEO, getGroomPhoto } from '../../../config/dummyAssets.js';
import { resolvePreviewStory } from '../../../config/dummyStory.js';
import { resolveInvitationQuote } from '../../../config/quotePresets.js';
import { DUMMY_EVENTS, DUMMY_LIVESTREAM, DUMMY_RUNDOWNS, previewFeatureEnabled, previewGift, previewList, sortWeddingEvents } from '../../../config/dummyPreviewData.js';
import { getDummyBrideBio, getDummyGroomBio } from '../../../config/dummyProfile.js';
import FloatingMultimedia from '../../FloatingMultimedia.jsx';
import PublicForms, { GiftSection } from '../../PublicForms.jsx';
import CenteredVideoPlayer from '../../CenteredVideoPlayer.jsx';
import Lightbox from '../shared/Lightbox.jsx';
import SaveTheDate from '../shared/SaveTheDate.jsx';
import LivestreamCard from '../shared/LivestreamCard.jsx';
import { galleryCountClasses } from '../shared/galleryLayout.js';
import './nocturne.css';

const A = '/assets/nocturne';
const DEFAULT_QUOTE = 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu agar kamu merasa tenteram kepadanya.';

export default function NocturneTemplate({ invitation, previewGuest, editorPreview = false }) {
  const [opened, setOpened] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [gallerySlide, setGallerySlide] = useState(0);
  const templateRef = useTemplateReveal('.nt-reveal');
  const [searchParams] = useSearchParams();
  const profile = invitation.coupleProfile || {};
  const theme = invitation.themeSettings || {};
  const features = invitation.invitationFeatures || {};
  const events = sortWeddingEvents(previewList(invitation.events, DUMMY_EVENTS, editorPreview));
  const mainEvent = events[0];
  const gallery = invitation.galleryMedia?.length
    ? invitation.galleryMedia
    : DUMMY_GALLERY_PHOTOS.map((url, index) => ({ id: `nt-dummy-${index}`, type: 'photo', url }));
  const photos = gallery.filter((item) => item.type !== 'video').map((item) => resolveImageUrl(item.url || item.path));
  const savedVideos = gallery.filter((item) => item.type === 'video');
  const videos = savedVideos.length || !editorPreview ? savedVideos : [{ id: 'nt-dummy-video', type: 'video', url: DUMMY_GALLERY_VIDEO }];
  const previewStory = resolvePreviewStory(theme.mainStory, invitation.timelineStories || [], editorPreview);
  const storyTimeline = previewStory.timeline;
  const activeStory = storyTimeline[storyIndex];
  const rundowns = previewList(invitation.rundowns, DUMMY_RUNDOWNS, editorPreview);
  const gifts = previewGift(invitation.giftSettings || {}, editorPreview);
  const banks = gifts.bankAccounts?.length ? gifts.bankAccounts : gifts.accountNumber ? [{ bankName: gifts.bankName, accountNumber: gifts.accountNumber, accountHolder: gifts.accountHolder }] : [];
  const livestream = invitation.livestreamSettings?.url ? invitation.livestreamSettings : (editorPreview ? DUMMY_LIVESTREAM : (invitation.livestreamSettings || {}));
  const brideName = profile.brideName || 'Arunika';
  const groomName = profile.groomName || 'Deva';
  const bridePhoto = resolveImageUrl(profile.bridePhoto || DUMMY_BRIDE_PHOTO);
  const groomPhoto = resolveImageUrl(getGroomPhoto(profile.groomPhoto));
  const quote = resolveInvitationQuote(invitation.quoteSettings);
  const quoteText = quote.text || DEFAULT_QUOTE;
  const quoteLengthClass = quoteText.length > 220 ? 'is-long' : quoteText.length < 140 ? 'is-short' : 'is-medium';
  const covers = resolveTemplateCovers(theme);
  const openingPhoto = resolveImageUrl(covers.opening);
  const mainPhoto = resolveImageUrl(covers.main);
  const countdown = useCountdown(mainEvent?.date || invitation.weddingDate, mainEvent?.startTime);
  const calendarUrl = useCalendarUrl(mainEvent?.date, mainEvent?.startTime, mainEvent?.endTime, mainEvent?.venueName, `Pernikahan ${brideName} & ${groomName}`, mainEvent?.address);
  const guestCode = searchParams.get('code');
  const guest = previewGuest || invitation.guests?.find((item) => item.code === guestCode || item.id === guestCode);
  const guestName = guest?.name || 'Tamu Undangan';
  const dateLabel = useMemo(() => formatDate(mainEvent?.date || invitation.weddingDate), [mainEvent?.date, invitation.weddingDate]);
  const showDresscode = previewFeatureEnabled(features.dresscodeEnabled, editorPreview, false);
  const showLivestream = previewFeatureEnabled(features.livestreamEnabled, editorPreview, false);
  const showGift = previewFeatureEnabled(features.giftEnabled, editorPreview, false);
  const showIgFilter = previewFeatureEnabled(features.igFilterEnabled, editorPreview, false);
  const dressItems = theme.dresscodeDetails?.items || [{ title: 'Ladies', desc: 'Black tie · satin · evening wear', colors: ['#08090b', '#751c30', '#eee7dc'] }, { title: 'Gentlemen', desc: 'Formal black tie', colors: ['#08090b', '#1b1a1f', '#c5a46a'] }];

  useEffect(() => {
    if (storyIndex >= storyTimeline.length) setStoryIndex(0);
  }, [storyIndex, storyTimeline.length]);

  useEffect(() => {
    if (gallerySlide >= photos.length) setGallerySlide(0);
  }, [gallerySlide, photos.length]);

  useEffect(() => {
    const root = templateRef.current;
    const viewport = root?.parentElement;
    if (!root || !viewport) return undefined;
    const syncViewport = () => root.style.setProperty('--nt-viewport-height', `${Math.max(560, viewport.clientHeight)}px`);
    syncViewport();
    const observer = new ResizeObserver(syncViewport);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [templateRef]);

  return <div ref={templateRef} className={`nocturne template-wrapper-dynamic ${editorPreview ? 'is-editor-preview' : ''}`} style={{
    '--nt-black': theme.background?.primary || '#08090b',
    '--nt-surface': theme.background?.secondary || '#121014',
    '--nt-ivory': theme.bodyText?.secondary || '#eee7dc',
    '--nt-burgundy': theme.bodyText?.primary || '#751c30',
    '--nt-gold': theme.button?.primary || '#c5a46a',
    '--nt-heading': theme.typography?.fontHeading || '"Bodoni Moda", "Cormorant Garamond", serif',
    '--nt-body': theme.typography?.fontBody || 'Manrope, sans-serif',
  }}>
    <FloatingMultimedia invitation={invitation} isOpen={opened} defaultColor="var(--nt-gold)" />

    <div className={`nt-opening ${opened ? `is-open opening-${theme.openingAnimation || 'curtain'}` : ''}`}>
      <img className="nt-opening-bg" src={`${A}/backgrounds/opening-stage-background.webp`} alt="" />
      <img className="nt-opening-light" src={`${A}/lighting/opening-spotlight-beam.webp`} alt="" />
      <img className="nt-opening-fog" src={`${A}/lighting/opening-low-fog.webp`} alt="" />
      <img className="nt-opening-dust" src={`${A}/textures/nocturne-dust-overlay.webp`} alt="" />
      <img className="nt-opening-frame" src={`${A}/frames/opening-deco-frame.webp`} alt="" />
      <img className="nt-opening-drape" src={`${A}/curtains/opening-top-drape.webp`} alt="" />
      <img className="nt-opening-curtain left" src={`${A}/curtains/opening-curtain-left.webp`} alt="" />
      <img className="nt-opening-curtain right" src={`${A}/curtains/opening-curtain-right.webp`} alt="" />
      {openingPhoto && <img className="nt-opening-user-photo" src={openingPhoto} alt="" />}
      <div className="nt-opening-copy"><small>A PRIVATE EVENING</small><h1>{brideName}<i>&amp;</i>{groomName}</h1><p>Kepada Yth.</p><strong>{guestName}</strong><button type="button" onClick={() => setOpened(true)}>Enter the Evening</button></div>
    </div>

    <main className="nt-flow">
      <section className={`nt-cover ${opened ? 'is-entering' : ''}`} data-section="cover">
        <img className="nt-cover-bg" src={`${A}/backgrounds/cover-main-background.webp`} alt="" />
        <img className="nt-cover-light" src={`${A}/lighting/cover-spotlight-left.webp`} alt="" />
        <div className="nt-cover-portrait nt-reveal"><img className="nt-cover-frame" src={`${A}/frames/cover-main-photo-frame.webp`} alt="" />{mainPhoto ? <img className="nt-cover-photo" src={mainPhoto} alt={`${brideName} dan ${groomName}`} /> : <div className="nt-cover-monogram">{brideName[0]}{groomName[0]}</div>}</div>
        <img className="nt-cover-floral left" src={`${A}/florals/cover-floral-left.webp`} alt="" /><img className="nt-cover-floral right" src={`${A}/florals/cover-floral-right.webp`} alt="" />
        <div className="nt-cover-copy nt-reveal"><span>NOCTURNE · A PRIVATE CELEBRATION</span><h1>{brideName}<i>&amp;</i>{groomName}</h1><p>{dateLabel}</p></div>
      </section>

      <section className="nt-section nt-quote" data-section="quote"><SectionHeading index="01" eyebrow="Prologue" title="A Promise After Midnight" /><div className={`nt-paper ${quoteLengthClass} nt-reveal`}><img src={`${A}/sections/quote-paper.webp`} alt="" loading="lazy" /><blockquote>{quoteText}</blockquote><p>{quote.source || 'Ar-Rum: 21'}</p></div></section>

      <section className="nt-section nt-couple-section" data-section="profile"><img className="nt-couple-light" src={`${A}/lighting/couple-light-shadow.webp`} alt="" loading="lazy" /><SectionHeading index="02" eyebrow="The Leading Couple" title="Two Souls in the Spotlight" /><div className="nt-couple"><Person frame="01" frameLabel="Leading Lady" role="The Bride" name={brideName} full={profile.brideFullName} photo={bridePhoto} mask="left" parents={`Putri dari ${profile.brideFather || 'Adikara Wicaksana'} & ${profile.brideMother || 'Sekar Ayuningtyas'}`} bio={theme.brideBioEnabled !== false ? (profile.brideBio || (editorPreview ? getDummyBrideBio(brideName) : '')) : ''} ig={profile.brideInstagram || profile.brideIg} /><div className="nt-couple-bridge" aria-hidden="true"><img src={`${A}/frames/couple-stage-divider.webp`} alt="" /><span>&amp;</span></div><Person frame="02" frameLabel="Leading Man" role="The Groom" name={groomName} full={profile.groomFullName} photo={groomPhoto} mask="right" parents={`Putra dari ${profile.groomFather || 'Bramantya Narendra'} & ${profile.groomMother || 'Ratih Puspitasari'}`} bio={theme.groomBioEnabled !== false ? (profile.groomBio || (editorPreview ? getDummyGroomBio(groomName) : '')) : ''} ig={profile.groomInstagram || profile.groomIg} /></div><img className="nt-couple-floral" src={`${A}/florals/couple-floral-accent.webp`} alt="" loading="lazy" /></section>

      {(previewStory.mainStory || storyTimeline.length > 0) && <section className="nt-section nt-story" data-section="story"><SectionHeading index="03" eyebrow="Scene Chapters" title="Our Story" />{previewStory.mainStory && <p className="nt-story-lead nt-reveal">{previewStory.mainStory}</p>}{activeStory && <div className="nt-story-stage nt-reveal"><img className="nt-story-frame" src={`${A}/frames/story-film-frame.webp`} alt="" loading="lazy" />{photos.length > 0 && <img className="nt-story-photo" src={photos[storyIndex % photos.length]} alt={activeStory.title} loading="lazy" />}<article><small>SCENE {String(storyIndex + 1).padStart(2, '0')}</small><h3>{activeStory.title}</h3><p>{activeStory.description}</p><time>{formatMonth(activeStory.date)}</time></article></div>}<nav className="nt-story-nav">{storyTimeline.map((item, index) => <button type="button" className={index === storyIndex ? 'active' : ''} onClick={() => setStoryIndex(index)} key={item.id || index}>{String(index + 1).padStart(2, '0')}</button>)}</nav></section>}

      <section className="nt-section nt-events-section" data-section="events"><SectionHeading index="04" eyebrow="The Gala Program" title="The Wedding Day" /><div className="nt-event-program nt-reveal"><div className="nt-events">{events.map((event, index) => <article className={`nt-event ${index === 0 ? 'is-ceremony' : 'is-reception'}`} key={event.id || index}><img className="nt-event-light" src={`${A}/lighting/${index === 0 ? 'event-akad-light' : 'event-reception-spotlight'}.webp`} alt="" loading="lazy" /><div className="nt-event-copy"><div className="nt-event-act"><span>ACT {index === 0 ? 'I' : 'II'}</span><small>{index === 0 ? 'THE CEREMONY' : 'THE RECEPTION'}</small></div><h3>{event.type || `Acara ${index + 1}`}</h3><div className="nt-event-time"><time>{formatDate(event.date)}</time><strong>{shortTime(event.startTime)} — {shortTime(event.endTime)}</strong></div><div className="nt-event-place"><h4>{event.venueName}</h4><p>{event.address || event.venueAddress}</p>{(event.googleMapsUrl || event.mapUrl) && <a href={event.googleMapsUrl || event.mapUrl} target="_blank" rel="noreferrer">View Location</a>}</div></div></article>)}</div></div></section>

      <section className="nt-section nt-date" data-section="countdown"><SectionHeading index="05" eyebrow="Premiere Date" title="Save the Date" /><div className="nt-calendar-frame"><img className="nt-calendar-deco" src={`${A}/frames/calendar-deco-frame.webp`} alt="" loading="lazy" /><img className="nt-timecode-divider" src={`${A}/frames/timecode-divider.webp`} alt="" loading="lazy" /><SaveTheDate className="save-the-date-nocturne nt-reveal" date={mainEvent?.date || invitation.weddingDate} countdown={countdown} calendarUrl={calendarUrl} buttonLabel="Reserve the Date" showDateHero /></div></section>

      {features.galleryEnabled !== false && <section className="nt-section nt-gallery-section" data-section="gallery"><SectionHeading index="06" eyebrow="Darkroom Archive" title="Frames from Our Story" />{theme.galleryLayout === 'carousel' ? <div className={`nt-gallery-carousel ${galleryCountClasses(photos.length)}`}><button type="button" onClick={() => setLightboxIndex(gallerySlide)}>{photos[gallerySlide] && <img src={photos[gallerySlide]} alt={`Galeri ${gallerySlide + 1}`} loading="lazy" />}</button><nav>{photos.map((_, index) => <button type="button" className={index === gallerySlide ? 'active' : ''} onClick={() => setGallerySlide(index)} key={index}>{String(index + 1).padStart(2, '0')}</button>)}</nav></div> : <div className={`nt-gallery layout-${theme.galleryLayout || 'editorial'} ${galleryCountClasses(photos.length)}`}>{photos.map((url, index) => <button className="nt-reveal" type="button" onClick={() => setLightboxIndex(index)} key={`${url}-${index}`}><img src={url} alt={`Galeri ${index + 1}`} loading="lazy" /><span>FRAME {String(index + 1).padStart(2, '0')}</span></button>)}</div>}{videos.map((video) => <div className="nt-video nt-reveal" key={video.id || video.url}><img className="nt-video-frame" src={`${A}/frames/video-cinema-frame.webp`} alt="" loading="lazy" /><Video url={video.url} /></div>)}</section>}

      {features.rundownEnabled !== false && <section className="nt-section nt-rundown-section" data-section="rundown"><SectionHeading index="07" eyebrow="Running Order" title="The Evening Program" /><div className="nt-rundown"><img src={`${A}/frames/rundown-spine.webp`} alt="" loading="lazy" />{rundowns.map((item, index) => <article className="nt-reveal" key={item.id || index}><span>{String(index + 1).padStart(2, '0')}</span><time>{item.time}</time><h3>{item.activity || item.title}</h3>{item.description && <p>{item.description}</p>}</article>)}</div></section>}

      {showDresscode && <section className="nt-section nt-dresscode" data-section="dresscode"><SectionHeading index="08" eyebrow="Wardrobe Department" title="What to Wear" /><img className="nt-hanger" src={`${A}/frames/dresscode-hanger-line.webp`} alt="" loading="lazy" /><div className="nt-dress-items">{dressItems.map((item, index) => <article className="nt-reveal" key={`${item.title}-${index}`}><div className="nt-fabric" style={{ '--fabric-color': item.colors?.[0] || '#751c30' }}><img src={`${A}/masks/dresscode-fabric-mask.webp`} alt="" loading="lazy" /></div><h3>{item.title}</h3><p>{item.desc}</p><div>{(item.colors || []).map((color) => <i key={color} style={{ background: color }} />)}</div></article>)}</div></section>}

      {showLivestream && <section className="nt-section nt-livestream" data-section="livestream"><SectionHeading index="09" eyebrow="Remote Screening" title="Watch from Anywhere" /><div className="nt-live-frame"><img src={`${A}/frames/livestream-screen-frame.webp`} alt="" loading="lazy" /><LivestreamCard className="livestream-card-nocturne" title="Wedding Live Broadcast" url={livestream.url} coverImage={resolveImageUrl(livestream.coverImageUrl || mainPhoto || photos[0])} /></div></section>}

      {showIgFilter && <section className="nt-section nt-filter" data-section="igFilter"><SectionHeading index="10" eyebrow="After-Party Portrait" title="Share the Moment" /><div className="nt-filter-poster">{(theme.igFilterImageUrl || mainPhoto || photos[0]) && <img src={resolveImageUrl(theme.igFilterImageUrl || mainPhoto || photos[0])} alt="Pratinjau filter Instagram" loading="lazy" />}</div><p>Capture the evening through our private filter.</p><a className="nt-button" href={theme.igFilterUrl || '#'} target={theme.igFilterUrl ? '_blank' : undefined} rel="noreferrer" onClick={!theme.igFilterUrl ? (event) => event.preventDefault() : undefined}>Open Instagram Filter</a></section>}

      {features.rsvpEnabled !== false && <section className="nt-section nt-form nt-rsvp" data-section="rsvp"><SectionHeading index="11" eyebrow="Premiere Admission" title="Confirm Your Seat" /><div className="nt-ticket"><img src={`${A}/sections/rsvp-ticket-background.webp`} alt="" loading="lazy" /><PublicForms invitation={invitation} previewGuest={guest} templateStyle="nocturne" previewMode={editorPreview} formType="rsvp" hideSectionTitle /></div></section>}

      {showGift && <section className="nt-section nt-form nt-gift" data-section="gift"><SectionHeading index="12" eyebrow="Midnight Gift Desk" title="A Token of Love" /><div className="nt-envelope"><img src={`${A}/sections/gift-envelope-open.webp`} alt="" loading="lazy" /></div>{(gifts.shippingAddress || banks.length) ? <GiftSection gift={{ ...gifts, bankAccounts: banks }} accent={theme.button?.primary || '#c5a46a'} templateStyle="nocturne" hideTitle /> : <p>Informasi rekening atau alamat hadiah akan tampil di sini.</p>}</section>}

      {features.wishesEnabled !== false && <section className="nt-section nt-form nt-wishes" data-section="wishes"><SectionHeading index="13" eyebrow="Audience Notes" title="Wedding Wishes" /><div className="nt-note"><img src={`${A}/sections/wish-note-paper.webp`} alt="" loading="lazy" /><PublicForms invitation={invitation} previewGuest={guest} templateStyle="nocturne" previewMode={editorPreview} formType="wishes" hideSectionTitle /></div></section>}

      <footer className="nt-closing" data-section="footer"><img className="nt-closing-bg" src={`${A}/backgrounds/closing-stage-background.webp`} alt="" loading="lazy" /><img className="nt-closing-light" src={`${A}/lighting/closing-spotlight.webp`} alt="" loading="lazy" /><img className="nt-closing-curtain left" src={`${A}/curtains/closing-curtain-left.webp`} alt="" loading="lazy" /><img className="nt-closing-curtain right" src={`${A}/curtains/closing-curtain-right.webp`} alt="" loading="lazy" /><img className="nt-closing-floral" src={`${A}/florals/closing-floral-floor.webp`} alt="" loading="lazy" /><img className="nt-closing-vignette" src={`${A}/lighting/closing-final-vignette.webp`} alt="" loading="lazy" /><div className="nt-credits nt-reveal"><small>THE FINAL SCENE</small><h2>{brideName}<i>&amp;</i>{groomName}</h2><p>{theme.closingText || 'Merupakan kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.'}</p><strong>{dateLabel}</strong><span>UNDANGANMANTEN · NOCTURNE</span></div></footer>
    </main>

    {lightboxIndex !== null && <Lightbox mediaList={[...photos.map((url) => ({ type: 'photo', url })), ...videos]} currentIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />}
  </div>;
}

function SectionHeading({ index, eyebrow, title }) { return <header className="nt-heading nt-reveal"><span>{index}</span><div><small>{eyebrow}</small><h2>{title}</h2></div></header>; }
function Person({ frame, frameLabel, role, name, full, photo, mask, parents, bio, ig }) { const handle = ig ? String(ig).split('/').filter(Boolean).pop().replace('@', '') : ''; return <article className={`nt-person is-${mask} nt-reveal`}><div className="nt-portrait"><div className="nt-person-spotlight" /><img className="nt-person-photo" src={photo} alt={name} loading="lazy" /><img className="nt-person-mask" src={`${A}/frames/event-program-frame.webp`} alt="" loading="lazy" /><div className="nt-person-frame-meta"><span>{frameLabel}</span><b>Frame {frame}</b></div></div><div className="nt-person-credit"><small>{role}</small><h3>{name}</h3><strong>{full || name}</strong><p>{parents}</p>{bio && <p className="nt-bio">{bio}</p>}{ig && <a href={String(ig).startsWith('http') ? ig : `https://instagram.com/${String(ig).replace('@', '')}`} target="_blank" rel="noreferrer"><span>Instagram</span>@{handle}</a>}</div></article>; }
function Video({ url = '' }) { const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/); return match ? <iframe src={`https://www.youtube.com/embed/${match[1]}`} title="Video pernikahan" allowFullScreen /> : <CenteredVideoPlayer src={resolveImageUrl(url)} />; }
function shortTime(value) { return value ? String(value).slice(0, 5) : '--:--'; }
function formatDate(value) { if (!value) return 'Minggu, 20 Desember 2026'; return new Date(value).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
function formatMonth(value) { if (!value) return ''; return new Date(value).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }); }
