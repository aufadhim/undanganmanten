import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCountdown } from '../../../hooks/useCountdown.js';
import { useCalendarUrl } from '../../../hooks/useCalendarUrl.js';
import { resolveImageUrl } from '../../../config/env.js';
import { resolveTemplateCovers, uploadedProfilePhoto } from '../../../config/templateCover.js';
import { DUMMY_BRIDE_PHOTO, DUMMY_GALLERY_PHOTOS, DUMMY_GALLERY_VIDEO, getGroomPhoto } from '../../../config/dummyAssets.js';
import FloatingMultimedia from '../../FloatingMultimedia.jsx';
import PublicForms, { GiftSection } from '../../PublicForms.jsx';
import CenteredVideoPlayer from '../../CenteredVideoPlayer.jsx';
import Lightbox from '../shared/Lightbox.jsx';
import SaveTheDate from '../shared/SaveTheDate.jsx';
import LivestreamCard from '../shared/LivestreamCard.jsx';
import { galleryCountClasses } from '../shared/galleryLayout.js';
import { DUMMY_TIMELINE_STORIES, resolvePreviewStory } from '../../../config/dummyStory.js';
import { resolveInvitationQuote } from '../../../config/quotePresets.js';
import { DUMMY_EVENTS, DUMMY_LIVESTREAM, DUMMY_RUNDOWNS, previewFeatureEnabled, previewGift, previewList, sortWeddingEvents } from '../../../config/dummyPreviewData.js';
import { getDummyBrideBio, getDummyGroomBio } from '../../../config/dummyProfile.js';
import { useTemplateReveal } from '../../../hooks/useTemplateReveal.js';
import { motion, useReducedMotion } from 'framer-motion';
import './isvara.css';

const ASSETS = '/assets/isvara';
const BOTANICAL = `${ASSETS}/botanical`;
const DEFAULT_QUOTE = 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu agar kamu merasa tenteram kepadanya.';

export default function IsvaraTemplate({ invitation, previewGuest, editorPreview = false }) {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [gallerySlide, setGallerySlide] = useState(0);
  const [storyChapter, setStoryChapter] = useState(0);
  const templateRef = useTemplateReveal('.iv-reveal');
  const [searchParams] = useSearchParams();
  const profile = invitation.coupleProfile || {};
  const theme = invitation.themeSettings || {};
  const features = invitation.invitationFeatures || {};
  const events = sortWeddingEvents(previewList(invitation.events, DUMMY_EVENTS, editorPreview));
  const mainEvent = events[0];
  const gallery = invitation.galleryMedia?.length ? invitation.galleryMedia : DUMMY_GALLERY_PHOTOS.map((url, index) => ({ id: `iv-dummy-${index}`, type: 'photo', url }));
  const photos = gallery.filter((item) => item.type !== 'video').map((item) => resolveImageUrl(item.url || item.path));
  const uploadedVideos = gallery.filter((item) => item.type === 'video');
  const videos = uploadedVideos.length || !editorPreview ? uploadedVideos : [{ id: 'isvara-dummy-video', type: 'video', url: DUMMY_GALLERY_VIDEO }];
  const timeline = invitation.timelineStories || [];
  const previewStory = resolvePreviewStory(theme.mainStory, timeline, editorPreview);
  const storyTimeline = previewStory.timeline.length ? previewStory.timeline : (editorPreview ? DUMMY_TIMELINE_STORIES : []);
  const rundowns = previewList(invitation.rundowns, DUMMY_RUNDOWNS, editorPreview);
  const gifts = previewGift(invitation.giftSettings || {}, editorPreview);
  const banks = gifts.bankAccounts?.length ? gifts.bankAccounts : gifts.accountNumber ? [{ bankName: gifts.bankName, accountNumber: gifts.accountNumber, accountHolder: gifts.accountHolder }] : [];
  const livestream = invitation.livestreamSettings?.url ? invitation.livestreamSettings : (editorPreview ? DUMMY_LIVESTREAM : (invitation.livestreamSettings || {}));
  const showDresscode = previewFeatureEnabled(features.dresscodeEnabled, editorPreview, false);
  const showLivestream = previewFeatureEnabled(features.livestreamEnabled, editorPreview, false);
  const showGift = previewFeatureEnabled(features.giftEnabled, editorPreview, false);
  const showIgFilter = previewFeatureEnabled(features.igFilterEnabled, editorPreview, false);
  const igFilterUrl = theme.igFilterUrl || (editorPreview ? '#' : '');
  const quote = resolveInvitationQuote(invitation.quoteSettings);
  const brideName = profile.brideName || 'Arunika';
  const groomName = profile.groomName || 'Deva';
  const bridePhoto = resolveImageUrl(profile.bridePhoto || DUMMY_BRIDE_PHOTO);
  const groomPhoto = resolveImageUrl(getGroomPhoto(profile.groomPhoto));
  const templateCovers = resolveTemplateCovers(theme, {
    opening: uploadedProfilePhoto(profile.bridePhoto),
    main: uploadedProfilePhoto(profile.groomPhoto) || uploadedProfilePhoto(profile.bridePhoto),
  });
  const openingCoverPhoto = resolveImageUrl(templateCovers.opening);
  const coverPhoto = resolveImageUrl(templateCovers.main);
  const countdown = useCountdown(mainEvent?.date || invitation.weddingDate, mainEvent?.startTime);
  const calendarUrl = useCalendarUrl(mainEvent?.date, mainEvent?.startTime, mainEvent?.endTime, mainEvent?.venueName, `Pernikahan ${brideName} & ${groomName}`, mainEvent?.address);
  const guestCode = searchParams.get('code');
  const matchedGuest = invitation.guests?.find((item) => item.code === guestCode || item.id === guestCode);
  const guest = previewGuest || matchedGuest;
  const guestName = guest?.name || 'Tamu Undangan';
  const dateLabel = useMemo(() => formatDate(mainEvent?.date || invitation.weddingDate), [mainEvent?.date, invitation.weddingDate]);
  const dressItems = theme.dresscodeDetails?.items || [{ title: 'Wanita', desc: 'Formal', colors: ['#7f1830', '#d5ccb0'] }, { title: 'Pria', desc: 'Formal', colors: ['#243322', '#8e773f'] }];
  const customLogo = features.customLogoEnabled !== false && theme.customLogoUrl;
  const activeStory = storyTimeline[storyChapter];

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), customLogo ? 1200 : 0);
    return () => window.clearTimeout(timer);
  }, [customLogo]);

  useEffect(() => {
    if (gallerySlide >= photos.length) setGallerySlide(0);
  }, [gallerySlide, photos.length]);

  useEffect(() => {
    if (theme.galleryLayout !== 'carousel' || photos.length < 2 || !opened) return undefined;
    const timer = window.setInterval(() => setGallerySlide((current) => (current + 1) % photos.length), 7000);
    return () => window.clearInterval(timer);
  }, [theme.galleryLayout, photos.length, opened]);

  useEffect(() => {
    if (storyChapter >= storyTimeline.length) setStoryChapter(0);
  }, [storyChapter, storyTimeline.length]);

  useEffect(() => {
    const root = templateRef.current;
    if (!root) return undefined;
    const syncViewport = () => root.style.setProperty('--iv-viewport-height', `${Math.max(480, root.clientHeight)}px`);
    syncViewport();
    const observer = new ResizeObserver(syncViewport);
    observer.observe(root);
    return () => observer.disconnect();
  }, [templateRef]);

  return <div ref={templateRef} className={`isvara template-wrapper-dynamic ${opened ? 'is-opened' : 'is-closed'}`} tabIndex={0} aria-label="Konten undangan Isvara yang dapat digulir" style={{
    '--iv-paper': theme.background?.primary || '#f3f0e8',
    '--iv-soft': theme.background?.secondary || '#dfe3d5',
    '--iv-wine': theme.bodyText?.primary || '#465440',
    '--iv-forest': theme.bodyText?.secondary || '#30372f',
    '--iv-gold': theme.button?.primary || '#78846c',
    '--iv-script': theme.typography?.fontHeading || '"Cormorant Garamond", serif',
    '--iv-body': theme.typography?.fontBody || 'Montserrat, sans-serif',
  }}>
    <FloatingMultimedia invitation={invitation} isOpen={opened} defaultColor="var(--iv-wine)" />

    {customLogo && loading && <div className="iv-loader"><img className={`loading-${theme.loadingAnimation || 'reveal'}`} src={resolveImageUrl(theme.customLogoUrl)} alt="Logo undangan" /></div>}

    <div className={`iv-opening ${templateCovers.openingIsArtwork ? 'is-default-artwork' : ''} ${opened ? `is-open opening-${theme.openingAnimation || 'fade'}` : ''}`}>
      <IsvaraCinematicScene image={openingCoverPhoto} variant="opening" initials={`${brideName[0]}${groomName[0]}`} />
      <div className="iv-opening-copy">
        <span>Wedding Invitation</span>
        <h1>{brideName} <i>&amp;</i> {groomName}</h1>
        <p>Kepada Yth.</p>
        <strong>{guestName}</strong>
        <button onClick={() => setOpened(true)}>Buka Undangan</button>
      </div>
    </div>

    <main className="iv-flow">
      <section className={`iv-hero ${templateCovers.mainIsArtwork ? 'is-default-artwork' : ''}`} data-section="cover">
        {opened && <IsvaraCinematicScene image={coverPhoto} variant="hero" initials={`${brideName[0]}${groomName[0]}`} />}
        <div className="iv-monogram iv-reveal"><span>{brideName[0]}{groomName[0]}</span></div>
        <div className="iv-hero-copy iv-reveal"><small>Wedding Invitation</small><h1>{brideName} <i>&amp;</i> {groomName}</h1><p>#{brideName}{groomName}InLove</p></div>
      </section>

      <section className="iv-section iv-intro" data-section="quote">
        <LayeredDecor variant="quote" />
        <div className="iv-reveal"><span className="iv-kicker">Two souls intertwined</span><h2>Cinta yang Menemukan Jalan Pulang</h2><blockquote>“{quote.text || DEFAULT_QUOTE}”</blockquote><p>{quote.source || 'Ar-Rum: 21'}</p></div>
      </section>

      <section className="iv-section iv-couple-section" data-section="profile">
        <LayeredDecor variant="couple" />
        <SectionTitle eyebrow="The Bride & Groom" title="Dua Jiwa, Satu Janji" />
        <div className="iv-couple">
          <PersonCard role="The Bride" image={bridePhoto} name={brideName} full={profile.brideFullName} parents={`Putri dari ${profile.brideFather || 'Adikara Wicaksana'} & ${profile.brideMother || 'Sekar Ayuningtyas'}`} bio={theme.brideBioEnabled !== false ? (profile.brideBio || (editorPreview ? getDummyBrideBio(brideName) : '')) : ''} ig={profile.brideInstagram || profile.brideIg} />
          <span className="iv-amp">&amp;</span>
          <PersonCard role="The Groom" image={groomPhoto} name={groomName} full={profile.groomFullName} parents={`Putra dari ${profile.groomFather || 'Bramantya Narendra'} & ${profile.groomMother || 'Ratih Puspitasari'}`} bio={theme.groomBioEnabled !== false ? (profile.groomBio || (editorPreview ? getDummyGroomBio(groomName) : '')) : ''} ig={profile.groomInstagram || profile.groomIg} />
        </div>
        <div className="iv-wayang-tableau iv-reveal">
          <img src={`${BOTANICAL}/flowering-shrub.webp`} alt="Semak berbunga putih bernuansa hijau sage" />
          <div><span>A Timeless Romance</span><h3>Dalam Satu Cerita</h3></div>
        </div>
      </section>

      {(previewStory.mainStory || storyTimeline.length) && <section className="iv-section iv-story" data-section="story">
        <LayeredDecor variant="story" />
        <SectionTitle eyebrow="Our Story" title="Kisah yang Ditulis Semesta" />
        {previewStory.mainStory && <p className="iv-story-lead iv-reveal">{previewStory.mainStory}</p>}
        {activeStory && <div className="iv-story-book iv-reveal"><nav aria-label="Bab perjalanan cinta">{storyTimeline.map((item, index) => <button type="button" className={index === storyChapter ? 'is-active' : ''} onClick={() => setStoryChapter(index)} key={item.id || index}><span>{String(index + 1).padStart(2, '0')}</span>{formatStoryMonth(item.date) || `Bab ${index + 1}`}</button>)}</nav><article><div className="iv-story-image">{photos.length > 0 && <img key={`${activeStory.id || storyChapter}-${photos[storyChapter % photos.length]}`} src={photos[storyChapter % photos.length]} alt={`Kenangan ${activeStory.title}`} />}</div><div><span>{formatStoryMonth(activeStory.date)}</span><h3>{activeStory.title}</h3><p>{activeStory.description}</p></div>{storyTimeline.length > 1 && <div className="iv-story-controls"><button type="button" onClick={() => setStoryChapter((storyChapter - 1 + storyTimeline.length) % storyTimeline.length)} aria-label="Cerita sebelumnya"><i className="fa-solid fa-arrow-left" /></button><b>{String(storyChapter + 1).padStart(2, '0')} / {String(storyTimeline.length).padStart(2, '0')}</b><button type="button" onClick={() => setStoryChapter((storyChapter + 1) % storyTimeline.length)} aria-label="Cerita berikutnya"><i className="fa-solid fa-arrow-right" /></button></div>}</article></div>}
      </section>}

      {features.galleryEnabled !== false && <section className="iv-section iv-gallery-section" data-section="gallery">
        <LayeredDecor variant="gallery" />
        <SectionTitle eyebrow="Portraits of Us" title="Dalam Bingkai Cinta" />
        {theme.galleryLayout === 'carousel' ? <div className={`iv-gallery iv-slideshow layout-carousel iv-reveal ${galleryCountClasses(photos.length)}`}><div className="iv-slide-stage"><button className="iv-slide-main" type="button" onClick={() => setLightboxIndex(gallerySlide)} aria-label={`Buka foto galeri ${gallerySlide + 1}`}>{photos[gallerySlide] && <img key={photos[gallerySlide]} src={photos[gallerySlide]} alt={`Galeri utama ${gallerySlide + 1}`} />}</button>{photos.length > 1 && <><button className="iv-slide-arrow prev" type="button" onClick={() => setGallerySlide((gallerySlide - 1 + photos.length) % photos.length)} aria-label="Foto sebelumnya"><i className="fa-solid fa-chevron-left" /></button><button className="iv-slide-arrow next" type="button" onClick={() => setGallerySlide((gallerySlide + 1) % photos.length)} aria-label="Foto berikutnya"><i className="fa-solid fa-chevron-right" /></button></>}</div><div className="iv-slide-thumbs">{photos.map((url, index) => <button type="button" className={index === gallerySlide ? 'is-active' : ''} onClick={() => setGallerySlide(index)} key={`${url}-${index}`} aria-label={`Tampilkan foto ${index + 1}`}><img src={url} alt="" /></button>)}</div><div className="iv-slide-count">{String(gallerySlide + 1).padStart(2, '0')}<i />{String(photos.length).padStart(2, '0')}</div></div> : <div className={`iv-gallery layout-${theme.galleryLayout || 'collage'} ${galleryCountClasses(photos.length)}`}>{photos.map((url, index) => <button className="iv-reveal" key={url} onClick={() => setLightboxIndex(index)}><img src={url} alt={`Galeri ${index + 1}`} /></button>)}</div>}
        {videos.map((video) => <div className="iv-video iv-reveal" key={video.id || video.url}><Video url={video.url} /></div>)}
      </section>}

      <section className="iv-section iv-date" data-section="countdown">
        <LayeredDecor variant="date" />
        <SectionTitle eyebrow="Mark Your Calendar" title="Save the Date" />
        <SaveTheDate className="save-the-date-isvara iv-reveal" date={mainEvent?.date || invitation.weddingDate} countdown={countdown} calendarUrl={calendarUrl} />
      </section>

      <section className="iv-section iv-events-section" data-section="events">
        <LayeredDecor variant="events" />
        <SectionTitle eyebrow="It's Wedding Day" title="Hari Bahagia Kami" />
        <div className="iv-events">{events.map((event, index) => <article className="iv-reveal" key={event.id || index}><FloralCorner /><span>{event.type || `Acara ${index + 1}`}</span><h3>{formatDate(event.date)}</h3><strong>{shortTime(event.startTime)} – {shortTime(event.endTime)} WIB</strong><h4>{event.venueName}</h4><p>{event.address || event.venueAddress}</p>{(event.googleMapsUrl || event.mapUrl) && <a href={event.googleMapsUrl || event.mapUrl} target="_blank" rel="noreferrer"><i className="fa-solid fa-location-dot" aria-hidden="true"></i> Lihat di Google Maps</a>}</article>)}</div>
      </section>

      {showDresscode && <section className="iv-section" data-section="dresscode"><LayeredDecor variant="dresscode" /><SectionTitle eyebrow="What to Wear" title="Dresscode" /><div className="iv-dress">{dressItems.map((item, index) => <article className="iv-reveal" key={`${item.title}-${index}`}><h3>{item.title}</h3><p>{item.desc}</p><div>{(item.colors || []).map((color) => <i key={color} style={{ background: color }} />)}</div></article>)}</div></section>}

      {features.rundownEnabled !== false && <section className="iv-section" data-section="rundown"><LayeredDecor variant="rundown" /><SectionTitle eyebrow="Order of Celebration" title="Rundown" /><div className="iv-rundown">{rundowns.map((item, index) => <article className="iv-reveal" key={item.id || index}><time>{item.time}</time><div><h3>{item.activity || item.title}</h3>{item.description && <p>{item.description}</p>}</div></article>)}</div></section>}

      {showLivestream && <section className="iv-section" data-section="livestream"><LayeredDecor variant="livestream" /><SectionTitle eyebrow="Watch From Anywhere" title="Live Streaming" /><p className="iv-copy">Bagi keluarga dan sahabat yang belum dapat hadir secara langsung.</p><LivestreamCard className="livestream-card-isvara" url={livestream.url} coverImage={resolveImageUrl(livestream.coverImageUrl || coverPhoto)} /></section>}

      {showIgFilter && <section className="iv-section iv-ig-filter" data-section="igFilter"><LayeredDecor variant="gallery" /><SectionTitle eyebrow="Share the Moment" title="Instagram Filter" /><div className="iv-ig-showcase"><img className="iv-ig-preview" src={resolveImageUrl(theme.igFilterImageUrl || coverPhoto)} alt="Pratinjau filter Instagram" /><img className="iv-ig-leaf left" src={`${BOTANICAL}/hydrangea-cutout-v2.webp`} alt="" /><img className="iv-ig-leaf right" src={`${BOTANICAL}/cosmos-cutout-v2.webp`} alt="" /></div><p className="iv-copy">Gunakan filter khusus kami dan bagikan momen bahagia ini.</p><a className="iv-button" href={igFilterUrl || '#'} target={igFilterUrl && igFilterUrl !== '#' ? '_blank' : undefined} rel={igFilterUrl && igFilterUrl !== '#' ? 'noreferrer' : undefined} onClick={!igFilterUrl || igFilterUrl === '#' ? (event) => event.preventDefault() : undefined}>Coba Filter</a></section>}

      {features.rsvpEnabled !== false && <section className="iv-section iv-form" data-section="rsvp"><LayeredDecor variant="rsvp" /><SectionTitle eyebrow="Be Our Guest" title="RSVP" /><PublicForms invitation={invitation} previewGuest={guest} templateStyle="isvara" previewMode={editorPreview} formType="rsvp" hideSectionTitle /></section>}

      {showGift && <section className="iv-section iv-form" data-section="gift"><LayeredDecor variant="gift" /><SectionTitle eyebrow="A Token of Love" title="Tanda Kasih" />{(gifts.shippingAddress || banks.length) ? <GiftSection gift={{ ...gifts, bankAccounts: banks }} accent={theme.bodyText?.primary || '#465440'} templateStyle="isvara" hideTitle /> : <p className="iv-copy">Informasi rekening atau alamat hadiah akan tampil di sini.</p>}</section>}

      {features.wishesEnabled !== false && <section className="iv-section iv-form" data-section="wishes"><LayeredDecor variant="wishes" /><SectionTitle eyebrow="Wedding Wishes" title="Ucapan & Doa" /><PublicForms invitation={invitation} previewGuest={guest} templateStyle="isvara" previewMode={editorPreview} formType="wishes" hideSectionTitle /></section>}

      <footer className="iv-footer" data-section="footer"><img className="iv-footer-landscape" src={`${BOTANICAL}/fern-valley.webp`} alt="" /><img className="iv-footer-garland" src={`${BOTANICAL}/trailing-garland.webp`} alt="" /><div className="iv-footer-copy"><span>Terima Kasih</span><h2>{brideName} <i>&amp;</i> {groomName}</h2><p>{theme.closingText || 'Merupakan kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.'}</p><strong>{dateLabel}</strong><small>UndanganManten</small></div></footer>
    </main>

    {lightboxIndex !== null && <Lightbox mediaList={[...photos.map((url) => ({ type: 'photo', url })), ...videos]} currentIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />}
  </div>;
}

function GardenScene({ image, variant = 'hero' }) { return <div className={`iv-scene iv-scene-${variant}`} aria-hidden="true"><div className="iv-sky" style={{ backgroundImage: `url(${image})` }} /><img className="iv-scene-tree left" src={`${ASSETS}/env-back.webp`} alt="" /><img className="iv-scene-tree right" src={`${ASSETS}/env-front.webp`} alt="" /><img className="iv-scene-flower left" src={`${ASSETS}/Orn-03.webp`} alt="" /><img className="iv-scene-flower right" src={`${ASSETS}/Orn-05.webp`} alt="" /><img className="iv-scene-cloud one" src={`${ASSETS}/Orn-01.webp`} alt="" /><img className="iv-scene-cloud two" src={`${ASSETS}/Orn-02.webp`} alt="" /><div className="iv-mist mist-one" /><div className="iv-mist mist-two" /><div className="iv-petals">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div></div>; }
const CINEMATIC = '/assets/isvara/cinematic';
function IsvaraCinematicScene({ image, variant, initials }) {
  const reduceMotion = useReducedMotion();
  const drift = reduceMotion ? {} : { y: [0, -8, 0], rotate: [-.6, .7, -.6] };
  return <div className={`iv-cinema iv-cinema-${variant}`} aria-hidden="true">
    <motion.div className="iv-cinema-landscape" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }} />
    <motion.div className="iv-cinema-depthscape" initial={{ opacity: 0, scale: 1.12 }} animate={reduceMotion ? { opacity: .12, scale: 1.04 } : { opacity: [0, .22, .08], scale: [1.12, 1.05, 1.09] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} />
    <div className="iv-cinema-light" />
    <motion.div className={`iv-cinema-photo ${image ? '' : 'is-default-artwork'}`} initial={{ opacity: 0, scale: 1.09, y: 28 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 2.4, delay: .35, ease: [0.16, 1, 0.3, 1] }}>{image ? <img src={image} alt="" /> : <span>{initials}</span>}</motion.div>
    <motion.img className="iv-cinema-tree left" src={`${CINEMATIC}/flowering-tree.webp`} initial={{ opacity: 0, x: -70 }} animate={{ opacity: 1, x: 0, ...drift }} transition={{ opacity:{duration:2.2,delay:.4},x:{duration:2.4,delay:.4,ease:[.16,1,.3,1]},y:{duration:10,repeat:Infinity,ease:'easeInOut'},rotate:{duration:12,repeat:Infinity,ease:'easeInOut'} }} />
    <motion.img className="iv-cinema-tree right" src={`${CINEMATIC}/flowering-tree.webp`} initial={{ opacity: 0, x: 70 }} animate={{ opacity: 1, x: 0, ...drift }} transition={{ opacity:{duration:2.2,delay:.55},x:{duration:2.4,delay:.55,ease:[.16,1,.3,1]},y:{duration:12,repeat:Infinity,ease:'easeInOut'},rotate:{duration:14,repeat:Infinity,ease:'easeInOut'} }} />
    <motion.img className="iv-cinema-canopy" src={`${CINEMATIC}/leaf-canopy.webp`} initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: reduceMotion ? 0 : [0, 7, 0] }} transition={{ opacity:{duration:2.4,delay:.2},y:{duration:11,repeat:Infinity,ease:'easeInOut'} }} />
    <motion.img className="iv-cinema-ivy" src={`${CINEMATIC}/cascading-ivy.webp`} animate={reduceMotion ? {} : { y:[-3,8,-3],rotate:[-.5,.5,-.5] }} transition={{ duration:9,repeat:Infinity,ease:'easeInOut' }} />
    <motion.img className="iv-cinema-fern" src={`${CINEMATIC}/fern-fan.webp`} initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration:2.1,delay:.8,ease:[.16,1,.3,1] }} />
    <motion.img className="iv-cinema-peony" src={`${CINEMATIC}/peony-corner.webp`} initial={{ opacity: 0, y: 70 }} animate={{ opacity: 1, y: 0 }} transition={{ duration:2.1,delay:1,ease:[.16,1,.3,1] }} />
    <motion.img className="iv-cinema-hydrangea" src={`${BOTANICAL}/hydrangeas.webp`} initial={{ opacity: 0, x: -55, y: 30 }} animate={reduceMotion ? { opacity: .7, x: 0, y: 0 } : { opacity: .7, x: [0, 5, 0], y: [0, -7, 0], rotate: [-.8, .6, -.8] }} transition={{ opacity:{duration:2.2,delay:.8},x:{duration:13,repeat:Infinity,ease:'easeInOut'},y:{duration:11,repeat:Infinity,ease:'easeInOut'},rotate:{duration:15,repeat:Infinity,ease:'easeInOut'} }} />
    <motion.img className="iv-cinema-magnolia" src={`${BOTANICAL}/magnolia.webp`} initial={{ opacity: 0, x: 55 }} animate={reduceMotion ? { opacity: .58, x: 0 } : { opacity: .58, x: [0, -6, 0], rotate: [.5, -1, .5] }} transition={{ opacity:{duration:2.3,delay:1},x:{duration:14,repeat:Infinity,ease:'easeInOut'},rotate:{duration:12,repeat:Infinity,ease:'easeInOut'} }} />
    <motion.img className="iv-cinema-moss" src={`${BOTANICAL}/moss-island.webp`} initial={{ opacity: 0, y: 45 }} animate={reduceMotion ? { opacity: .5, y: 0 } : { opacity: .5, y: [0, -4, 0], scale: [1, 1.025, 1] }} transition={{ opacity:{duration:2.4,delay:1.15},y:{duration:16,repeat:Infinity,ease:'easeInOut'},scale:{duration:18,repeat:Infinity,ease:'easeInOut'} }} />
    <motion.img className="iv-cinema-petal-sheet" src={`${CINEMATIC}/floating-petals.webp`} animate={reduceMotion ? {} : { x:[-14,18,-14],y:[-20,30,-20],rotate:[-2,3,-2] }} transition={{ duration:17,repeat:Infinity,ease:'easeInOut' }} />
    <div className="iv-cinema-dust">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
    <div className="iv-cinema-mist one" /><div className="iv-cinema-mist two" />
  </div>;
}
function LayeredDecor({ variant }) { const map = { quote: ['botanical-wreath', 'cosmos-cutout-v2'], couple: ['flowering-tree', 'hydrangea-valley'], story: ['small-tree', 'trailing-garland'], gallery: ['trailing-garland', 'hydrangea-cutout-v2'], date: ['shaded-grove', 'fern-mound'], events: ['botanical-wreath', 'hydrangea-cutout-v2'], dresscode: ['cosmos-cutout-v2', 'magnolia'], rundown: ['flowering-shrub', 'cosmos-cutout-v2'], livestream: ['fern-valley', 'trailing-garland'], rsvp: ['botanical-wreath', 'eucalyptus'], gift: ['moss-island', 'hydrangea-cutout-v2'], wishes: ['botanical-wreath', 'trailing-garland'] }; return <div className={`iv-layered iv-layered-${variant}`} aria-hidden="true">{(map[variant] || ['cosmos-cutout-v2', 'hydrangea-cutout-v2']).map((name, index) => <img key={name} className={`iv-layer iv-layer-${index + 1}`} src={`${BOTANICAL}/${name}.webp`} alt="" />)}</div>; }
function Bird({ className }) { return <svg className={`iv-bird ${className}`} viewBox="0 0 80 50"><path d="M4 30c18-4 26-17 36-27-1 12 4 19 12 22 8-2 16-7 24-15-5 15-15 26-29 28-16 2-30-1-43-8Z" fill="currentColor"/><path d="M47 27 69 35 48 34Z" fill="#8f2740"/></svg>; }
function FloralCorner() { return <img className="iv-floral" src={`${BOTANICAL}/hydrangea-cutout-v2.webp`} alt="" aria-hidden="true" />; }
function SectionTitle({ eyebrow, title }) { return <header className="iv-heading iv-reveal"><span>{eyebrow}</span><h2>{title}</h2><i /></header>; }
function PersonCard({ role, image, name, full, parents, bio, ig }) { const bride = role.toLowerCase().includes('bride'); return <article className={`iv-person ${bride ? 'is-bride' : 'is-groom'} iv-reveal`}><div className="iv-portrait"><img className="iv-portrait-photo" src={image} alt={name} /><span className="iv-portrait-index">{bride ? '01' : '02'}</span><span className="iv-portrait-role">{role}</span><span className="iv-portrait-lines" aria-hidden="true"><i /><i /></span><img className="iv-portrait-botanical" src={`${BOTANICAL}/${bride ? 'hydrangea-cutout-v2' : 'cosmos-cutout-v2'}.webp`} alt="" aria-hidden="true" /></div><span>{role}</span><h3>{name}</h3><strong>{full || name}</strong><p>{parents}</p>{bio && <p className="iv-bio">{bio}</p>}{ig && <a href={String(ig).startsWith('http') ? ig : `https://instagram.com/${String(ig).replace('@', '')}`} target="_blank" rel="noreferrer">@{String(ig).split('/').filter(Boolean).pop().replace('@', '')}</a>}</article>; }
function Video({ url = '' }) { const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/); return match ? <iframe src={`https://www.youtube.com/embed/${match[1]}`} title="Video pernikahan" allowFullScreen /> : <CenteredVideoPlayer src={resolveImageUrl(url)} />; }
function shortTime(value) { return value ? String(value).slice(0, 5) : '--:--'; }
function formatDate(value) { if (!value) return 'Minggu, 20 Desember 2026'; return new Date(value).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
function formatStoryMonth(value) { if (!value) return ''; return new Date(value).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }); }
