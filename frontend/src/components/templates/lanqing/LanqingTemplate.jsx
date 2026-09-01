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
import './lanqing.css';

const ASSETS = '/assets/lanqing';
const CINEMATIC = `${ASSETS}/cinematic`;
const RED_ASSETS = `${ASSETS}/red`;
const RED_BACKGROUNDS = `${RED_ASSETS}/background`;
const RED_TRANSPARENT = `${RED_ASSETS}/transparent`;
const DEFAULT_QUOTE = 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu agar kamu merasa tenteram kepadanya.';
const LEGACY_LANQING_COLORS = {
  '#f4f0e7': '#f6ebdd', '#dbe7eb': '#e9c9b6', '#173f5b': '#8d1b24',
  '#476878': '#341b18', '#2f6c88': '#a8232d', '#ffffff': '#fff8e8',
};
const lanqingColor = (value, fallback) => LEGACY_LANQING_COLORS[String(value || '').toLowerCase()] || value || fallback;

export default function LanqingTemplate({ invitation, previewGuest, editorPreview = false }) {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [gallerySlide, setGallerySlide] = useState(0);
  const [storyChapter, setStoryChapter] = useState(0);
  const [eventCardIndex, setEventCardIndex] = useState(0);
  const templateRef = useTemplateReveal('.lq-reveal');
  const [searchParams] = useSearchParams();
  const profile = invitation.coupleProfile || {};
  const theme = invitation.themeSettings || {};
  const features = invitation.invitationFeatures || {};
  const events = sortWeddingEvents(previewList(invitation.events, DUMMY_EVENTS, editorPreview));
  const mainEvent = events[0];
  const gallery = invitation.galleryMedia?.length ? invitation.galleryMedia : DUMMY_GALLERY_PHOTOS.map((url, index) => ({ id: `lq-dummy-${index}`, type: 'photo', url }));
  const photos = gallery.filter((item) => item.type !== 'video').map((item) => resolveImageUrl(item.url || item.path));
  const uploadedVideos = gallery.filter((item) => item.type === 'video');
  const videos = uploadedVideos.length || !editorPreview ? uploadedVideos : [{ id: 'lanqing-dummy-video', type: 'video', url: DUMMY_GALLERY_VIDEO }];
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

  const galleryThumbs = useMemo(() => {
    if (photos.length <= 8) return photos.map((url, index) => ({ url, index }));
    const start = Math.min(Math.max(gallerySlide - 3, 0), photos.length - 8);
    return photos.slice(start, start + 8).map((url, offset) => ({ url, index: start + offset }));
  }, [gallerySlide, photos]);

  useEffect(() => {
    if (theme.galleryLayout !== 'carousel' || photos.length < 2 || !opened) return undefined;
    const timer = window.setInterval(() => setGallerySlide((current) => (current + 1) % photos.length), 7000);
    return () => window.clearInterval(timer);
  }, [theme.galleryLayout, photos.length, opened]);

  useEffect(() => {
    if (storyChapter >= storyTimeline.length) setStoryChapter(0);
  }, [storyChapter, storyTimeline.length]);

  useEffect(() => {
    if (eventCardIndex >= events.length) setEventCardIndex(0);
  }, [eventCardIndex, events.length]);

  useEffect(() => {
    const root = templateRef.current;
    if (!root) return undefined;
    const syncViewport = () => root.style.setProperty('--lq-viewport-height', `${Math.max(480, root.clientHeight)}px`);
    syncViewport();
    const observer = new ResizeObserver(syncViewport);
    observer.observe(root);
    return () => observer.disconnect();
  }, [templateRef]);

  return <div ref={templateRef} className={`lanqing template-wrapper-dynamic ${opened ? 'lq-invitation-opened' : 'lq-invitation-closed'}`} tabIndex={0} aria-label="Konten undangan Lanqing yang dapat digulir" style={{
    '--lq-paper': lanqingColor(theme.background?.primary, '#f6ebdd'),
    '--lq-soft': lanqingColor(theme.background?.secondary, '#e9c9b6'),
    '--lq-wine': lanqingColor(theme.bodyText?.primary, '#8d1b24'),
    '--lq-forest': lanqingColor(theme.bodyText?.secondary, '#341b18'),
    '--lq-gold': lanqingColor(theme.button?.primary, '#a8232d'),
    '--lq-script': theme.typography?.fontHeading || '"Cormorant Garamond", serif',
    '--lq-body': theme.typography?.fontBody || 'Montserrat, sans-serif',
  }}>
    <FloatingMultimedia invitation={invitation} isOpen={opened} defaultColor="var(--lq-wine)" />

    {customLogo && loading && <div className="lq-loader"><img className={`loading-${theme.loadingAnimation || 'reveal'}`} src={resolveImageUrl(theme.customLogoUrl)} alt="Logo undangan" /></div>}

    <div className={`lq-opening ${opened ? `is-open opening-${theme.openingAnimation || 'fade'}` : ''}`}>
      <GardenScene image={openingCoverPhoto} variant="opening" active initials={`${brideName[0]}${groomName[0]}`} />
      <div className="lq-opening-copy">
        <span>囍 · The Wedding Invitation</span>
        <h1>{brideName} <i>&amp;</i> {groomName}</h1>
        <p>Kepada Yth.</p>
        <strong>{guestName}</strong>
        <button onClick={() => setOpened(true)}>Buka Undangan</button>
      </div>
    </div>

    <main className="lq-flow">
      <section className="lq-hero" data-section="cover">
        <GardenScene image={coverPhoto} variant="hero" active={opened} initials={`${brideName[0]}${groomName[0]}`} />
        <div className="lq-monogram lq-reveal"><span>囍</span><b>{brideName[0]} · {groomName[0]}</b></div>
        <div className="lq-hero-copy lq-reveal"><small>A Journey of Love</small><h1>{brideName} <i>&amp;</i> {groomName}</h1><p>#{brideName}{groomName}InLove</p></div>
      </section>

      <section className="lq-section lq-intro" data-section="quote">
        <LayeredDecor variant="quote" />
        <div className="lq-quote-frame lq-reveal"><span className="lq-kicker">Two souls intertwined</span><h2>Cinta yang Menemukan Jalan Pulang</h2><blockquote>“{quote.text || DEFAULT_QUOTE}”</blockquote><p>{quote.source || 'Ar-Rum: 21'}</p></div>
      </section>

      <section className="lq-section lq-couple-section" data-section="profile">
        <LayeredDecor variant="couple" />
        <SectionTitle eyebrow="良缘 · The Bride & Groom" title="Two Hearts in Harmony" />
        <div className="lq-couple">
          <PersonCard role="The Bride" image={bridePhoto} name={brideName} full={profile.brideFullName} parents={`Putri dari ${profile.brideFather || 'Adikara Wicaksana'} & ${profile.brideMother || 'Sekar Ayuningtyas'}`} bio={theme.brideBioEnabled !== false ? (profile.brideBio || (editorPreview ? getDummyBrideBio(brideName) : '')) : ''} ig={profile.brideInstagram || profile.brideIg} />
          <span className="lq-amp">&amp;</span>
          <PersonCard role="The Groom" image={groomPhoto} name={groomName} full={profile.groomFullName} parents={`Putra dari ${profile.groomFather || 'Bramantya Narendra'} & ${profile.groomMother || 'Ratih Puspitasari'}`} bio={theme.groomBioEnabled !== false ? (profile.groomBio || (editorPreview ? getDummyGroomBio(groomName) : '')) : ''} ig={profile.groomInstagram || profile.groomIg} />
        </div>
        <div className="lq-harmony-seal lq-reveal">
          <img className="lq-harmony-peony" src={`${RED_TRANSPARENT}/04-cabang-peony-vertikal.png`} alt="" />
          <img className="lq-harmony-phoenix" src={`${RED_TRANSPARENT}/15-sepasang-phoenix.png`} alt="" />
          <div><span>百年好合 · A Blessed Union</span><h3>Love, Harmony &amp; Prosperity</h3></div>
        </div>
      </section>

      {(previewStory.mainStory || storyTimeline.length) && <section className="lq-section lq-story" data-section="story">
        <LayeredDecor variant="story" />
        <SectionTitle eyebrow="Our Story" title="Kisah yang Ditulis Semesta" />
        {previewStory.mainStory && <p className="lq-story-lead lq-reveal">{previewStory.mainStory}</p>}
        {activeStory && <div className="lq-story-book lq-reveal"><nav aria-label="Bab perjalanan cinta">{storyTimeline.map((item, index) => <button type="button" className={index === storyChapter ? 'is-active' : ''} onClick={() => setStoryChapter(index)} key={item.id || index}><span>{String(index + 1).padStart(2, '0')}</span>{formatStoryMonth(item.date) || `Bab ${index + 1}`}</button>)}</nav><article><div className="lq-story-image">{photos.length > 0 && <img key={`${activeStory.id || storyChapter}-${photos[storyChapter % photos.length]}`} src={photos[storyChapter % photos.length]} alt={`Kenangan ${activeStory.title}`} />}</div><div><span>{formatStoryMonth(activeStory.date)}</span><h3>{activeStory.title}</h3><p>{activeStory.description}</p></div>{storyTimeline.length > 1 && <div className="lq-story-controls"><button type="button" onClick={() => setStoryChapter((storyChapter - 1 + storyTimeline.length) % storyTimeline.length)} aria-label="Cerita sebelumnya"><i className="fa-solid fa-arrow-left" /></button><b>{String(storyChapter + 1).padStart(2, '0')} / {String(storyTimeline.length).padStart(2, '0')}</b><button type="button" onClick={() => setStoryChapter((storyChapter + 1) % storyTimeline.length)} aria-label="Cerita berikutnya"><i className="fa-solid fa-arrow-right" /></button></div>}</article></div>}
      </section>}

      {features.galleryEnabled !== false && <section className="lq-section lq-gallery-section" data-section="gallery">
        <LayeredDecor variant="gallery" />
        <SectionTitle eyebrow="Portraits of Us" title="Dalam Bingkai Cinta" />
        {theme.galleryLayout === 'carousel' ? <div className={`lq-gallery lq-slideshow layout-carousel lq-reveal ${galleryCountClasses(photos.length)}`}><div className="lq-slide-stage"><img className="lq-slide-botanical left" src={`${ASSETS}/Orn-03.png`} alt="" /><img className="lq-slide-botanical right" src={`${ASSETS}/Orn-05.png`} alt="" /><button className="lq-slide-main" type="button" onClick={() => setLightboxIndex(gallerySlide)} aria-label={`Buka foto galeri ${gallerySlide + 1}`}>{photos[gallerySlide] && <img key={photos[gallerySlide]} src={photos[gallerySlide]} alt={`Galeri utama ${gallerySlide + 1}`} />}</button>{photos.length > 1 && <><button className="lq-slide-arrow prev" type="button" onClick={() => setGallerySlide((gallerySlide - 1 + photos.length) % photos.length)} aria-label="Foto sebelumnya"><i className="fa-solid fa-chevron-left" /></button><button className="lq-slide-arrow next" type="button" onClick={() => setGallerySlide((gallerySlide + 1) % photos.length)} aria-label="Foto berikutnya"><i className="fa-solid fa-chevron-right" /></button></>}</div><div className="lq-slide-thumbs">{galleryThumbs.map(({ url, index }) => <button type="button" className={index === gallerySlide ? 'is-active' : ''} onClick={() => setGallerySlide(index)} key={`${url}-${index}`} aria-label={`Tampilkan foto ${index + 1}`}><img src={url} alt="" /></button>)}</div><div className="lq-slide-count">{String(gallerySlide + 1).padStart(2, '0')}<i />{String(photos.length).padStart(2, '0')}</div></div> : <div className={`lq-gallery layout-${theme.galleryLayout || 'collage'} ${galleryCountClasses(photos.length)}`}>{photos.map((url, index) => <button className="lq-reveal" key={url} onClick={() => setLightboxIndex(index)}><img src={url} alt={`Galeri ${index + 1}`} /></button>)}</div>}
        {videos.map((video) => <div className="lq-video lq-reveal" key={video.id || video.url}><Video url={video.url} /></div>)}
      </section>}

      <section className="lq-section lq-date" data-section="countdown">
        <LayeredDecor variant="date" />
        <SectionTitle eyebrow="Mark Your Calendar" title="Save the Date" />
        <SaveTheDate className="save-the-date-lanqing lq-reveal" date={mainEvent?.date || invitation.weddingDate} countdown={countdown} calendarUrl={calendarUrl} />
      </section>

      <section className="lq-section lq-events-section" data-section="events">
        <LayeredDecor variant="events" />
        <SectionTitle eyebrow="It's Wedding Day" title="Hari Bahagia Kami" />
        <div className="lq-event-tabs" role="tablist" aria-label="Pilih rangkaian acara">{events.map((event, index) => <button type="button" role="tab" aria-selected={eventCardIndex === index} className={eventCardIndex === index ? 'is-active' : ''} onClick={() => setEventCardIndex(index)} key={`event-tab-${event.id || index}`}><small>{String(index + 1).padStart(2, '0')}</small>{event.type || `Acara ${index + 1}`}</button>)}</div>
        <div className="lq-events lq-event-deck">{events.map((event, index) => { const relativeIndex = (index - eventCardIndex + events.length) % events.length; const cardState = relativeIndex === 0 ? 'is-active' : relativeIndex === 1 ? 'is-next' : 'is-hidden'; return <article className={`lq-event-card ${cardState}`} aria-hidden={cardState !== 'is-active'} key={event.id || index}><FloralCorner /><span>{event.type || `Acara ${index + 1}`}</span><h3>{formatDate(event.date)}</h3><strong>{shortTime(event.startTime)} – {shortTime(event.endTime)} WIB</strong><h4>{event.venueName}</h4><p>{event.address || event.venueAddress}</p>{(event.googleMapsUrl || event.mapUrl) && <a href={event.googleMapsUrl || event.mapUrl} target="_blank" rel="noreferrer" tabIndex={cardState === 'is-active' ? 0 : -1}><i className="fa-solid fa-location-dot" aria-hidden="true"></i> Lihat di Google Maps</a>}</article>; })}</div>
        {events.length > 1 && <button type="button" className="lq-event-shuffle" onClick={() => setEventCardIndex((eventCardIndex + 1) % events.length)} aria-label="Tampilkan acara berikutnya"><i className="fa-solid fa-arrow-up" /><span>Kocok kartu acara</span><i className="fa-solid fa-arrow-down" /></button>}
      </section>

      {showDresscode && <section className="lq-section" data-section="dresscode"><SectionTitle eyebrow="What to Wear" title="Dresscode" /><div className="lq-dress">{dressItems.map((item, index) => <article className="lq-reveal" key={`${item.title}-${index}`}><h3>{item.title}</h3><p>{item.desc}</p><div>{(item.colors || []).map((color) => <i key={color} style={{ background: color }} />)}</div></article>)}</div></section>}

      {features.rundownEnabled !== false && <section className="lq-section" data-section="rundown"><SectionTitle eyebrow="Order of Celebration" title="Rundown" /><div className="lq-rundown">{rundowns.map((item, index) => <article className="lq-reveal" key={item.id || index}><time>{item.time}</time><div><h3>{item.activity || item.title}</h3>{item.description && <p>{item.description}</p>}</div></article>)}</div></section>}

      {showLivestream && <section className="lq-section" data-section="livestream"><SectionTitle eyebrow="Watch From Anywhere" title="Live Streaming" /><p className="lq-copy">Bagi keluarga dan sahabat yang belum dapat hadir secara langsung.</p><LivestreamCard className="livestream-card-lanqing" url={livestream.url} coverImage={resolveImageUrl(livestream.coverImageUrl || coverPhoto)} /></section>}

      {showIgFilter && <section className="lq-section lq-ig-filter" data-section="igFilter"><LayeredDecor variant="gallery" /><SectionTitle eyebrow="Share the Moment" title="Instagram Filter" /><div className="lq-ig-showcase"><img className="lq-ig-preview" src={resolveImageUrl(theme.igFilterImageUrl || coverPhoto)} alt="Pratinjau filter Instagram" /><img className="lq-ig-leaf left" src={`${ASSETS}/Orn-03.png`} alt="" /><img className="lq-ig-leaf right" src={`${ASSETS}/Orn-05.png`} alt="" /></div><p className="lq-copy">Gunakan filter khusus kami dan bagikan momen bahagia ini.</p><a className="lq-button" href={igFilterUrl || '#'} target={igFilterUrl && igFilterUrl !== '#' ? '_blank' : undefined} rel={igFilterUrl && igFilterUrl !== '#' ? 'noreferrer' : undefined} onClick={!igFilterUrl || igFilterUrl === '#' ? (event) => event.preventDefault() : undefined}>Coba Filter</a></section>}

      {features.rsvpEnabled !== false && <section className="lq-section lq-form" data-section="rsvp"><LayeredDecor variant="rsvp" /><SectionTitle eyebrow="Be Our Guest" title="RSVP" /><PublicForms invitation={invitation} previewGuest={guest} templateStyle="lanqing" previewMode={editorPreview} formType="rsvp" hideSectionTitle /></section>}

      {showGift && <section className="lq-section lq-form" data-section="gift"><LayeredDecor variant="gift" /><SectionTitle eyebrow="A Token of Love" title="Tanda Kasih" />{(gifts.shippingAddress || banks.length) ? <GiftSection gift={{ ...gifts, bankAccounts: banks }} accent={theme.bodyText?.primary || '#8d1b24'} templateStyle="lanqing" hideTitle /> : <p className="lq-copy">Informasi rekening atau alamat hadiah akan tampil di sini.</p>}</section>}

      {features.wishesEnabled !== false && <section className="lq-section lq-form" data-section="wishes"><LayeredDecor variant="wishes" /><SectionTitle eyebrow="Wedding Wishes" title="Ucapan & Doa" /><PublicForms invitation={invitation} previewGuest={guest} templateStyle="lanqing" previewMode={editorPreview} formType="wishes" hideSectionTitle /></section>}

      <footer className="lq-footer" data-section="footer"><GardenScene image={coverPhoto} variant="footer" initials={`${brideName[0]}${groomName[0]}`} /><div className="lq-footer-copy"><span>Terima Kasih</span><h2>{brideName} <i>&amp;</i> {groomName}</h2><p>{theme.closingText || 'Merupakan kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.'}</p><strong>{dateLabel}</strong></div><small className="lq-footer-watermark">UndanganManten</small></footer>
    </main>

    {lightboxIndex !== null && <Lightbox mediaList={[...photos.map((url) => ({ type: 'photo', url })), ...videos]} currentIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />}
  </div>;
}

function GardenScene({ image, variant = 'hero', active = false }) {
  const opening = variant === 'opening';
  const hero = variant === 'hero';
  const footer = variant === 'footer';
  const background = opening
    ? `${RED_BACKGROUNDS}/01-cover-sampul-gerbang-merah.png`
    : footer
      ? `${RED_BACKGROUNDS}/03-latar-penutup-landscape.png`
      : `${RED_BACKGROUNDS}/02-cover-utama-taman-istana.png`;
  return <div className={`lq-scene lq-scene-${variant} ${image ? '' : 'is-default-artwork'} ${active ? 'is-active' : 'is-paused'}`} aria-hidden="true">
    <div className="lq-sky" style={{ backgroundImage: `url(${background})` }} />
    {image && !footer && <><div className="lq-custom-cover" style={{ backgroundImage: `url(${image})` }} /><div className="lq-custom-photo-halo" /></>}
    <div className="lq-scene-wash" />
    {opening && <><img className="lq-red-cine lq-red-roof lq-red-roof-left" src={`${RED_TRANSPARENT}/13-atap-sudut-kiri-atas.png`} alt="" /><img className="lq-red-cine lq-red-roof lq-red-roof-right" src={`${RED_TRANSPARENT}/12-atap-sudut-kanan-atas.png`} alt="" /><img className="lq-red-cine lq-red-lantern lq-red-lantern-left" src={`${RED_TRANSPARENT}/05-lentera-kiri.png`} alt="" /><img className="lq-red-cine lq-red-lantern lq-red-lantern-right" src={`${RED_TRANSPARENT}/06-lentera-kanan.png`} alt="" /><img className="lq-red-cine lq-red-lanterns" src={`${RED_TRANSPARENT}/07-rangkaian-lentera-jauh.png`} alt="" /></>}
    {hero && <>
      <img className="lq-red-cine lq-red-hero-lantern lq-red-hero-lantern-left" src={`${RED_TRANSPARENT}/05-lentera-kiri.png`} alt="" />
      <img className="lq-red-cine lq-red-hero-lantern lq-red-hero-lantern-right" src={`${RED_TRANSPARENT}/06-lentera-kanan.png`} alt="" />
      <img className="lq-red-cine lq-red-hero-peony lq-red-hero-peony-main" src={`${RED_TRANSPARENT}/04-cabang-peony-vertikal.png`} alt="" />
      <img className="lq-red-cine lq-red-hero-peony lq-red-hero-peony-secondary" src={`${RED_TRANSPARENT}/04-cabang-peony-vertikal.png`} alt="" />
      <img className="lq-red-cine lq-red-hero-knot" src={`${RED_TRANSPARENT}/20-simpul-keberuntungan.png`} alt="" />
      <img className="lq-red-cine lq-red-hero-petals" src={`${RED_TRANSPARENT}/18-kelopak-bergerak.png`} alt="" />
      <img className="lq-red-cine lq-red-hero-bottom-floral lq-red-hero-bottom-floral-left" src={`${RED_TRANSPARENT}/02-peony-sudut-kiri-bawah.png`} alt="" />
      <img className="lq-red-cine lq-red-hero-bottom-floral lq-red-hero-bottom-floral-right" src={`${RED_TRANSPARENT}/03-peony-sudut-kanan-bawah.png`} alt="" />
      <i className="lq-red-cine lq-red-hero-waterlight" />
      <i className="lq-red-cine lq-red-hero-fireflies lq-red-hero-fireflies-a" />
      <i className="lq-red-cine lq-red-hero-fireflies lq-red-hero-fireflies-b" />
      <i className="lq-red-cine lq-red-hero-lightbeam" />
    </>}
    {opening && <img className="lq-red-cine lq-red-petals" src={`${RED_TRANSPARENT}/18-kelopak-bergerak.png`} alt="" />}
    {footer && <><img className="lq-red-cine lq-footer-peony lq-footer-peony-left" src={`${RED_TRANSPARENT}/02-peony-sudut-kiri-bawah.png`} alt="" /><img className="lq-red-cine lq-footer-peony lq-footer-peony-right" src={`${RED_TRANSPARENT}/03-peony-sudut-kanan-bawah.png`} alt="" /><i className="lq-red-cine lq-footer-waterlight" /><i className="lq-red-cine lq-footer-fireflies" /></>}
  </div>;
}
function LayeredDecor({ variant }) { const map = { quote: ['15-sepasang-phoenix','16-awan-keberuntungan'], couple: ['04-cabang-peony-vertikal','20-simpul-keberuntungan'], story: ['19-kipas-dekoratif','16-awan-keberuntungan'], gallery: ['02-peony-sudut-kiri-bawah','03-peony-sudut-kanan-bawah'], date: ['07-rangkaian-lentera-jauh','16-awan-keberuntungan'], events: ['12-atap-sudut-kanan-atas','13-atap-sudut-kiri-atas'], dresscode: ['19-kipas-dekoratif','04-cabang-peony-vertikal'], rundown: ['11-paviliun-depan','16-awan-keberuntungan'], livestream: ['08-gerbang-bulan','07-rangkaian-lentera-jauh'], rsvp: ['02-peony-sudut-kiri-bawah','16-awan-keberuntungan'], gift: ['20-simpul-keberuntungan','03-peony-sudut-kanan-bawah'], wishes: ['14-phoenix-terbang','16-awan-keberuntungan'] }; return <div className={`lq-layered lq-layered-${variant}`} aria-hidden="true">{(map[variant] || ['16-awan-keberuntungan']).map((name, index) => <img key={name} className={`lq-layer lq-layer-${index + 1}`} src={`${RED_TRANSPARENT}/${name}.png`} alt="" />)}</div>; }
function Bird({ className }) { return <svg className={`lq-bird ${className}`} viewBox="0 0 80 50"><path d="M4 30c18-4 26-17 36-27-1 12 4 19 12 22 8-2 16-7 24-15-5 15-15 26-29 28-16 2-30-1-43-8Z" fill="currentColor"/><path d="M47 27 69 35 48 34Z" fill="#8f2740"/></svg>; }
function FloralCorner() { return <img className="lq-floral" src={`${RED_TRANSPARENT}/03-peony-sudut-kanan-bawah.png`} alt="" aria-hidden="true" />; }
function SectionTitle({ eyebrow, title }) { return <header className="lq-heading lq-reveal"><span>{eyebrow}</span><div><i /><b>囍</b><i /></div><h2>{title}</h2></header>; }
function PersonCard({ role, image, name, full, parents, bio, ig }) { const bride = role.toLowerCase().includes('bride'); return <article className="lq-person lq-reveal"><div className="lq-portrait"><img src={image} alt={name} /><img className="lq-portrait-frame" src={`${RED_TRANSPARENT}/09-bingkai-foto-mempelai.png`} alt="" aria-hidden="true" /><img className={`lq-portrait-charm ${bride ? 'is-bride' : 'is-groom'}`} src={`${RED_TRANSPARENT}/${bride ? '02-peony-sudut-kiri-bawah' : '03-peony-sudut-kanan-bawah'}.png`} alt="" aria-hidden="true" /></div><span>{role}</span><h3>{name}</h3><strong>{full || name}</strong><p>{parents}</p>{bio && <p className="lq-bio">{bio}</p>}{ig && <a href={String(ig).startsWith('http') ? ig : `https://instagram.com/${String(ig).replace('@', '')}`} target="_blank" rel="noreferrer"><i className="fa-brands fa-instagram" /> @{String(ig).split('/').filter(Boolean).pop().replace('@', '')}</a>}</article>; }
function Video({ url = '' }) { const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/); return match ? <iframe src={`https://www.youtube.com/embed/${match[1]}`} title="Video pernikahan" allowFullScreen /> : <CenteredVideoPlayer src={resolveImageUrl(url)} />; }
function shortTime(value) { return value ? String(value).slice(0, 5) : '--:--'; }
function formatDate(value) { if (!value) return 'Minggu, 20 Desember 2026'; return new Date(value).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
function formatStoryMonth(value) { if (!value) return ''; return new Date(value).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }); }
