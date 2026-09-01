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
import { getAtelierTheme } from './atelierThemes.js';
import { getAtelierBlueprint } from './atelierBlueprints.js';
import './atelier.css';

const ASSETS = '/assets/isvara';
const CELLULOID = '/assets/celluloid/cinematic';
const DAGUERRE = '/assets/daguerre/cinematic';
const HERO = `${ASSETS}/thumb-md-717117-1400-1400-9632766178daf24c67babd5c-642061.jpg`;
const DEFAULT_QUOTE = 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu agar kamu merasa tenteram kepadanya.';

export default function AtelierTemplate({ invitation, previewGuest, editorPreview = false, themeId = invitation?.themeId || 'celluloid' }) {
  const design = getAtelierTheme(themeId);
  const blueprint = getAtelierBlueprint(themeId);
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [gallerySlide, setGallerySlide] = useState(0);
  const [storyChapter, setStoryChapter] = useState(0);
  const templateRef = useTemplateReveal('.at-reveal');
  const [searchParams] = useSearchParams();
  const profile = invitation.coupleProfile || {};
  const theme = invitation.themeSettings || {};
  const features = invitation.invitationFeatures || {};
  const events = sortWeddingEvents(previewList(invitation.events, DUMMY_EVENTS, editorPreview));
  const mainEvent = events[0];
  const gallery = invitation.galleryMedia?.length ? invitation.galleryMedia : DUMMY_GALLERY_PHOTOS.map((url, index) => ({ id: `at-dummy-${index}`, type: 'photo', url }));
  const photos = gallery.filter((item) => item.type !== 'video').map((item) => resolveImageUrl(item.url || item.path));
  const uploadedVideos = gallery.filter((item) => item.type === 'video');
  const videos = uploadedVideos.length || !editorPreview ? uploadedVideos : [{ id: 'atelier-dummy-video', type: 'video', url: DUMMY_GALLERY_VIDEO }];
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
  const atelierDefaultCovers = themeId === 'celluloid'
    ? { opening: uploadedProfilePhoto(profile.bridePhoto), main: uploadedProfilePhoto(profile.groomPhoto) || uploadedProfilePhoto(profile.bridePhoto) }
    : themeId === 'daguerre'
      ? { opening: uploadedProfilePhoto(profile.bridePhoto), main: uploadedProfilePhoto(profile.groomPhoto) || uploadedProfilePhoto(profile.bridePhoto) }
      : { opening: HERO, main: HERO };
  const templateCovers = resolveTemplateCovers(theme, atelierDefaultCovers);
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
    const syncViewport = () => root.style.setProperty('--at-viewport-height', `${Math.max(480, root.clientHeight)}px`);
    syncViewport();
    const observer = new ResizeObserver(syncViewport);
    observer.observe(root);
    return () => observer.disconnect();
  }, [templateRef]);

  return <div ref={templateRef} className={`atelier atelier-${themeId} atelier-family-${design.family} template-wrapper-dynamic ${editorPreview ? 'is-editor-preview' : ''}`} data-cover={blueprint.cover} data-quote={blueprint.quote} data-couple={blueprint.couple} data-events={blueprint.events} data-gallery={blueprint.gallery} data-story={blueprint.story} data-forms={blueprint.forms} tabIndex={0} aria-label={`Konten undangan ${design.name} yang dapat digulir`} style={{
    '--at-paper': theme.background?.primary || design.background,
    '--at-soft': theme.background?.secondary || design.background,
    '--at-wine': theme.bodyText?.primary || design.accent,
    '--at-forest': theme.bodyText?.secondary || design.foreground,
    '--at-gold': theme.button?.primary || design.gold,
    '--at-script': theme.typography?.fontHeading || '"Cormorant Garamond", serif',
    '--at-body': theme.typography?.fontBody || 'Montserrat, sans-serif',
  }}>
    <FloatingMultimedia invitation={invitation} isOpen={opened} defaultColor="var(--at-wine)" />

    {customLogo && loading && <div className="at-loader"><img className={`loading-${theme.loadingAnimation || 'reveal'}`} src={resolveImageUrl(theme.customLogoUrl)} alt="Logo undangan" /></div>}

    <div className={`at-opening ${opened ? `is-open opening-${theme.openingAnimation || 'fade'}` : ''}`}>
      <GardenScene image={openingCoverPhoto} variant="opening" celluloid={themeId === 'celluloid'} daguerre={themeId === 'daguerre'} active initials={`${brideName[0]}${groomName[0]}`} />
      <div className="at-opening-copy">
        <span>{themeId === 'daguerre' ? 'A Private Keepsake' : 'Wedding Invitation'}</span>
        <h1>{brideName} <i>&amp;</i> {groomName}</h1>
        <p>Kepada Yth.</p>
        <strong>{guestName}</strong>
        <button onClick={() => setOpened(true)}>{themeId === 'daguerre' ? 'Buka Kotak Kenangan' : 'Buka Undangan'}</button>
      </div>
    </div>

    <main className="at-flow">
      <section className="at-hero" data-section="cover">
        <GardenScene image={coverPhoto} variant="hero" celluloid={themeId === 'celluloid'} daguerre={themeId === 'daguerre'} active={opened} initials={`${brideName[0]}${groomName[0]}`} />
        <div className="at-monogram at-reveal"><span>{brideName[0]}{groomName[0]}</span></div>
        <div className="at-hero-copy at-reveal"><small>{themeId === 'daguerre' ? 'The Silver Portrait' : 'Wedding Invitation'}</small><h1>{brideName} <i>&amp;</i> {groomName}</h1><p>#{brideName}{groomName}InLove</p></div>
      </section>

      <section className="at-section at-intro" data-section="quote">
        <LayeredDecor variant="quote" />
        <div className="at-reveal"><span className="at-kicker">{themeId === 'daguerre' ? 'An Engraved Promise' : 'Two souls intertwined'}</span><h2>Cinta yang Menemukan Jalan Pulang</h2><blockquote>“{quote.text || DEFAULT_QUOTE}”</blockquote><p>{quote.source || 'Ar-Rum: 21'}</p></div>
      </section>

      <section className="at-section at-couple-section" data-section="profile">
        <LayeredDecor variant="couple" />
        <SectionTitle eyebrow={themeId === 'celluloid' ? 'Introducing the leading couple' : themeId === 'daguerre' ? 'Twin Portrait Cases' : 'The Bride & Groom'} title={themeId === 'celluloid' ? 'The Stars of Our Story' : themeId === 'daguerre' ? 'The Beloved Portraits' : 'Dua Jiwa, Satu Janji'} />
        <div className="at-couple">
          <PersonCard role="The Bride" image={bridePhoto} name={brideName} full={profile.brideFullName} parents={`Putri dari ${profile.brideFather || 'Adikara Wicaksana'} & ${profile.brideMother || 'Sekar Ayuningtyas'}`} bio={theme.brideBioEnabled !== false ? (profile.brideBio || (editorPreview ? getDummyBrideBio(brideName) : '')) : ''} ig={profile.brideInstagram || profile.brideIg} />
          <span className="at-amp">&amp;</span>
          <PersonCard role="The Groom" image={groomPhoto} name={groomName} full={profile.groomFullName} parents={`Putra dari ${profile.groomFather || 'Bramantya Narendra'} & ${profile.groomMother || 'Ratih Puspitasari'}`} bio={theme.groomBioEnabled !== false ? (profile.groomBio || (editorPreview ? getDummyGroomBio(groomName) : '')) : ''} ig={profile.groomInstagram || profile.groomIg} />
        </div>
        <div className="at-wayang-tableau at-reveal">
          <span className="at-tableau-mark" aria-hidden="true">{design.name.slice(0, 2).toUpperCase()}</span>
          <div><span>A Timeless Romance</span><h3>Dalam Satu Cerita</h3></div>
        </div>
      </section>

      {(previewStory.mainStory || storyTimeline.length) && <section className="at-section at-story" data-section="story">
        <LayeredDecor variant="story" />
        <SectionTitle eyebrow={themeId === 'celluloid' ? 'Story Reels' : themeId === 'daguerre' ? 'Keepsake Pages' : 'Our Story'} title={themeId === 'celluloid' ? 'Our Story' : themeId === 'daguerre' ? 'Our Story' : 'Kisah yang Ditulis Semesta'} />
        {previewStory.mainStory && <p className="at-story-lead at-reveal">{previewStory.mainStory}</p>}
        {activeStory && <div className="at-story-book at-reveal"><nav aria-label="Bab perjalanan cinta">{storyTimeline.map((item, index) => <button type="button" className={index === storyChapter ? 'is-active' : ''} onClick={() => setStoryChapter(index)} key={item.id || index}><span>{String(index + 1).padStart(2, '0')}</span>{formatStoryMonth(item.date) || `Bab ${index + 1}`}</button>)}</nav><article><div className="at-story-image">{photos.length > 0 && <img key={`${activeStory.id || storyChapter}-${photos[storyChapter % photos.length]}`} src={photos[storyChapter % photos.length]} alt={`Kenangan ${activeStory.title}`} />}</div><div><span>{formatStoryMonth(activeStory.date)}</span><h3>{activeStory.title}</h3><p>{activeStory.description}</p></div>{storyTimeline.length > 1 && <div className="at-story-controls"><button type="button" onClick={() => setStoryChapter((storyChapter - 1 + storyTimeline.length) % storyTimeline.length)} aria-label="Cerita sebelumnya"><i className="fa-solid fa-arrow-left" /></button><b>{String(storyChapter + 1).padStart(2, '0')} / {String(storyTimeline.length).padStart(2, '0')}</b><button type="button" onClick={() => setStoryChapter((storyChapter + 1) % storyTimeline.length)} aria-label="Cerita berikutnya"><i className="fa-solid fa-arrow-right" /></button></div>}</article></div>}
      </section>}

      {features.galleryEnabled !== false && <section className="at-section at-gallery-section" data-section="gallery">
        <LayeredDecor variant="gallery" />
        <SectionTitle eyebrow={themeId === 'daguerre' ? 'The Specimen Album' : 'Portraits of Us'} title="Dalam Bingkai Cinta" />
        {theme.galleryLayout === 'carousel' ? <div className={`at-gallery at-slideshow layout-carousel at-reveal ${galleryCountClasses(photos.length)}`}><div className="at-slide-stage"><img className="at-slide-botanical left" src={`${ASSETS}/Orn-03.webp`} alt="" /><img className="at-slide-botanical right" src={`${ASSETS}/Orn-05.webp`} alt="" /><button className="at-slide-main" type="button" onClick={() => setLightboxIndex(gallerySlide)} aria-label={`Buka foto galeri ${gallerySlide + 1}`}>{photos[gallerySlide] && <img key={photos[gallerySlide]} src={photos[gallerySlide]} alt={`Galeri utama ${gallerySlide + 1}`} />}</button>{photos.length > 1 && <><button className="at-slide-arrow prev" type="button" onClick={() => setGallerySlide((gallerySlide - 1 + photos.length) % photos.length)} aria-label="Foto sebelumnya"><i className="fa-solid fa-chevron-left" /></button><button className="at-slide-arrow next" type="button" onClick={() => setGallerySlide((gallerySlide + 1) % photos.length)} aria-label="Foto berikutnya"><i className="fa-solid fa-chevron-right" /></button></>}</div><div className="at-slide-thumbs">{photos.map((url, index) => <button type="button" className={index === gallerySlide ? 'is-active' : ''} onClick={() => setGallerySlide(index)} key={`${url}-${index}`} aria-label={`Tampilkan foto ${index + 1}`}><img src={url} alt="" /></button>)}</div><div className="at-slide-count">{String(gallerySlide + 1).padStart(2, '0')}<i />{String(photos.length).padStart(2, '0')}</div></div> : <div className={`at-gallery layout-${theme.galleryLayout || 'collage'} ${galleryCountClasses(photos.length)}`}>{photos.map((url, index) => <button className="at-reveal" key={url} onClick={() => setLightboxIndex(index)}><img src={url} alt={`Galeri ${index + 1}`} /></button>)}</div>}
        {videos.map((video) => <div className="at-video at-reveal" key={video.id || video.url}><Video url={video.url} /></div>)}
      </section>}

      <section className="at-section at-date" data-section="countdown">
        <LayeredDecor variant="date" />
        <SectionTitle eyebrow={themeId === 'celluloid' ? 'Countdown to Premiere' : themeId === 'daguerre' ? 'The Timekeeper' : 'Mark Your Calendar'} title="Save the Date" />
        <SaveTheDate className="save-the-date-isvara at-reveal" date={mainEvent?.date || invitation.weddingDate} countdown={countdown} calendarUrl={calendarUrl} buttonLabel={themeId === 'celluloid' ? 'Add Premiere to Calendar' : 'Tambahkan ke Kalender'} />
      </section>

      <section className="at-section at-events-section" data-section="events">
        <LayeredDecor variant="events" />
        <SectionTitle eyebrow={themeId === 'celluloid' ? "Today's screening" : themeId === 'daguerre' ? 'Cabinet Cards' : "It's Wedding Day"} title={themeId === 'celluloid' ? 'Wedding Program' : themeId === 'daguerre' ? 'The Wedding Record' : 'Hari Bahagia Kami'} />
        <div className="at-events">{events.map((event, index) => <article className="at-reveal" key={event.id || index}><FloralCorner /><span>{event.type || `Acara ${index + 1}`}</span><h3>{formatDate(event.date)}</h3><strong>{shortTime(event.startTime)} – {shortTime(event.endTime)} WIB</strong><h4>{event.venueName}</h4><p>{event.address || event.venueAddress}</p>{(event.googleMapsUrl || event.mapUrl) && <a href={event.googleMapsUrl || event.mapUrl} target="_blank" rel="noreferrer"><i className="fa-solid fa-location-dot" aria-hidden="true"></i> Lihat di Google Maps</a>}</article>)}</div>
      </section>

      {showDresscode && <section className="at-section" data-section="dresscode"><SectionTitle eyebrow={themeId === 'celluloid' ? 'Wardrobe Department' : themeId === 'daguerre' ? 'Etiquette Note' : 'What to Wear'} title={themeId === 'celluloid' ? 'What to Wear' : 'Dresscode'} /><div className="at-dress">{dressItems.map((item, index) => <article className="at-reveal" key={`${item.title}-${index}`}><h3>{item.title}</h3><p>{item.desc}</p><div>{(item.colors || []).map((color, colorIndex) => <i key={`${color}-${colorIndex}`} style={{ background: color }} />)}</div></article>)}</div></section>}

      {features.rundownEnabled !== false && <section className="at-section" data-section="rundown"><SectionTitle eyebrow={themeId === 'daguerre' ? "Registrar's Ledger" : 'Order of Celebration'} title="Rundown" /><div className="at-rundown">{rundowns.map((item, index) => <article className="at-reveal" key={item.id || index}><time>{item.time}</time><div><h3>{item.activity || item.title}</h3>{item.description && <p>{item.description}</p>}</div></article>)}</div></section>}

      {showLivestream && <section className="at-section" data-section="livestream"><SectionTitle eyebrow={themeId === 'celluloid' ? 'Remote Screening' : themeId === 'daguerre' ? 'Distant Viewing Parlour' : 'Watch From Anywhere'} title={themeId === 'celluloid' ? 'Live Broadcast' : 'Live Streaming'} /><p className="at-copy">Bagi keluarga dan sahabat yang belum dapat hadir secara langsung.</p><LivestreamCard className="livestream-card-atelier" title={themeId === 'celluloid' ? 'Wedding Live Broadcast' : themeId === 'daguerre' ? 'Distant Wedding Viewing' : 'Live Streaming'} url={livestream.url} coverImage={resolveImageUrl(livestream.coverImageUrl || coverPhoto)} /></section>}

      {showIgFilter && <section className="at-section at-ig-filter" data-section="igFilter"><LayeredDecor variant="gallery" /><SectionTitle eyebrow={themeId === 'celluloid' ? 'Premiere Photo Booth' : themeId === 'daguerre' ? 'Tintype Portrait Booth' : 'Share the Moment'} title={themeId === 'celluloid' ? 'Share the Moment' : 'Instagram Filter'} /><div className="at-ig-showcase"><img className="at-ig-preview" src={resolveImageUrl(theme.igFilterImageUrl || coverPhoto)} alt="Pratinjau filter Instagram" /><img className="at-ig-leaf left" src={`${ASSETS}/Orn-03.webp`} alt="" /><img className="at-ig-leaf right" src={`${ASSETS}/Orn-05.webp`} alt="" /></div><p className="at-copy">Gunakan filter khusus kami dan bagikan momen bahagia ini.</p><a className="at-button" href={igFilterUrl || '#'} target={igFilterUrl && igFilterUrl !== '#' ? '_blank' : undefined} rel={igFilterUrl && igFilterUrl !== '#' ? 'noreferrer' : undefined} onClick={!igFilterUrl || igFilterUrl === '#' ? (event) => event.preventDefault() : undefined}>{themeId === 'celluloid' ? 'Enter Photo Booth' : themeId === 'daguerre' ? 'Buka Portrait Booth' : 'Coba Filter'}</a></section>}

      {features.rsvpEnabled !== false && <section className="at-section at-form" data-section="rsvp"><LayeredDecor variant="rsvp" /><SectionTitle eyebrow={themeId === 'celluloid' ? 'Guest Admission' : themeId === 'daguerre' ? 'Calling Card' : 'Be Our Guest'} title={themeId === 'celluloid' ? 'Confirm Your Seat' : 'RSVP'} /><PublicForms invitation={invitation} previewGuest={guest} templateStyle={themeId} previewMode={editorPreview} formType="rsvp" hideSectionTitle /></section>}

      {showGift && <section className="at-section at-form" data-section="gift"><LayeredDecor variant="gift" /><SectionTitle eyebrow={themeId === 'celluloid' ? 'Premiere Gift Desk' : themeId === 'daguerre' ? 'The Keepsake Drawer' : 'A Token of Love'} title={themeId === 'celluloid' ? 'A Token of Love' : 'Tanda Kasih'} />{(gifts.shippingAddress || banks.length) ? <GiftSection gift={{ ...gifts, bankAccounts: banks }} accent={theme.bodyText?.primary || design.accent} templateStyle={themeId} hideTitle /> : <p className="at-copy">Informasi rekening atau alamat hadiah akan tampil di sini.</p>}</section>}

      {features.wishesEnabled !== false && <section className="at-section at-form" data-section="wishes"><LayeredDecor variant="wishes" /><SectionTitle eyebrow={themeId === 'celluloid' ? 'Audience Notes' : themeId === 'daguerre' ? 'The Guest Registry' : 'Wedding Wishes'} title="Ucapan & Doa" /><PublicForms invitation={invitation} previewGuest={guest} templateStyle={themeId} previewMode={editorPreview} formType="wishes" hideSectionTitle /></section>}

      <footer className="at-footer" data-section="footer"><GardenScene image={coverPhoto} variant="footer" celluloid={themeId === 'celluloid'} daguerre={themeId === 'daguerre'} active initials={`${brideName[0]}${groomName[0]}`} /><div className="at-footer-copy"><span>{themeId === 'celluloid' ? 'Thank You for Watching' : themeId === 'daguerre' ? 'The Case Closes' : 'Terima Kasih'}</span><h2>{brideName} <i>&amp;</i> {groomName}</h2><p>{theme.closingText || 'Merupakan kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.'}</p><strong>{dateLabel}</strong><small>{themeId === 'celluloid' ? 'UNDANGANMANTEN  •  THE END' : themeId === 'daguerre' ? 'UNDANGANMANTEN  •  PRESERVED IN MEMORY' : 'UndanganManten'}</small></div></footer>
    </main>

    {lightboxIndex !== null && <Lightbox mediaList={[...photos.map((url) => ({ type: 'photo', url })), ...videos]} currentIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />}
  </div>;
}

function GardenScene({ image, variant = 'hero', celluloid = false, daguerre = false, active = false, initials }) {
  if (celluloid) return <div className={`at-scene at-scene-${variant} at-celluloid-scene ${image ? '' : 'is-default-artwork'} ${active ? 'is-active' : 'is-paused'}`} aria-hidden="true"><img className="at-cell-bg" src={`${CELLULOID}/backgrounds/bg-${variant === 'footer' ? '05' : variant === 'opening' ? '02' : variant === 'hero' ? '03' : '01'}.webp`} alt="" /><div className="at-cell-screen" style={{ backgroundImage:image ? `url(${image})` : undefined }}>{!image && <span><small>THE WEDDING OF</small>{initials}</span>}</div><div className="at-cell-beam" />{variant === 'opening' ? <><img className="at-cell-curtain at-cell-curtain-left" src={`${CELLULOID}/props/prop-03.webp`} alt="" /><img className="at-cell-curtain at-cell-curtain-right" src={`${CELLULOID}/props/prop-03.webp`} alt="" /></> : <img className="at-cell-curtain" src={`${CELLULOID}/props/prop-03.webp`} alt="" />}<img className="at-cell-projector" src={`${CELLULOID}/props/prop-25.webp`} alt="" /><img className="at-cell-reel one" src={`${CELLULOID}/props/prop-30.webp`} alt="" /><img className="at-cell-reel two" src={`${CELLULOID}/props/prop-29.webp`} alt="" /><img className="at-cell-film" src={`${CELLULOID}/props/prop-28.webp`} alt="" /><img className="at-cell-rose" src={`${CELLULOID}/props/prop-02.webp`} alt="" />{(variant === 'opening' || variant === 'hero') && <img className="at-cell-botanical" src="/assets/celluloid/generated/victorian-botanical-corner-v1.png" alt="" />}<div className="at-cell-dust">{Array.from({length:18},(_,index)=><i key={index} />)}</div></div>;
  if (daguerre) return <div className={`at-scene at-scene-${variant} at-dag-scene ${image ? '' : 'is-default-artwork'} ${active ? 'is-active' : 'is-paused'}`} aria-hidden="true"><div className="at-dag-velvet" /><img className="at-dag-stage" src={`${DAGUERRE}/backgrounds/bg-${variant === 'footer' ? '05' : variant === 'opening' ? '03' : '04'}.webp`} alt="" /><div className="at-dag-plate"><div style={{ backgroundImage:image ? `url(${image})` : undefined }}>{!image && <span>{initials}</span>}</div></div><img className="at-dag-locket left" src={`${DAGUERRE}/props/prop-02.webp`} alt="" /><img className="at-dag-locket right" src={`${DAGUERRE}/props/prop-03.webp`} alt="" /><img className="at-dag-drape" src={`${DAGUERRE}/props/prop-08.webp`} alt="" /><img className="at-dag-flower" src={`${DAGUERRE}/props/prop-13.webp`} alt="" /><img className="at-dag-watch" src={`${DAGUERRE}/props/prop-15.webp`} alt="" /><div className="at-dag-glints">{Array.from({length:12},(_,index)=><i key={index} />)}</div></div>;
  return <div className={`at-scene at-scene-${variant}`} aria-hidden="true"><div className="at-sky" style={{ backgroundImage: `url(${image})` }} /><i className="at-scene-shape one" /><i className="at-scene-shape two" /><i className="at-scene-line one" /><i className="at-scene-line two" /><div className="at-mist mist-one" /><div className="at-mist mist-two" /><div className="at-petals">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div></div>;
}
function LayeredDecor({ variant }) { return <div className={`at-layered at-layered-${variant}`} aria-hidden="true"><i className="at-layer at-layer-1" /><i className="at-layer at-layer-2" /><i className="at-layer at-layer-3" /></div>; }
function Bird({ className }) { return <svg className={`at-bird ${className}`} viewBox="0 0 80 50"><path d="M4 30c18-4 26-17 36-27-1 12 4 19 12 22 8-2 16-7 24-15-5 15-15 26-29 28-16 2-30-1-43-8Z" fill="currentColor"/><path d="M47 27 69 35 48 34Z" fill="#8f2740"/></svg>; }
function FloralCorner() { return <span className="at-floral" aria-hidden="true" />; }
function SectionTitle({ eyebrow, title }) { return <header className="at-heading at-reveal"><span>{eyebrow}</span><h2>{title}</h2><i /></header>; }
function PersonCard({ role, image, name, full, parents, bio, ig }) { const bride = role.toLowerCase().includes('bride'); return <article className={`at-person ${bride ? 'is-bride' : 'is-groom'} at-reveal`}><div className="at-portrait"><img className="at-portrait-photo" src={image} alt={name} /><span className="at-portrait-index">{bride ? '01' : '02'}</span><span className="at-portrait-role">{role}</span><span className="at-portrait-lines" aria-hidden="true"><i /><i /></span><img className="at-portrait-botanical" src={`${ASSETS}/${bride ? 'Orn-03' : 'Orn-05'}.webp`} alt="" aria-hidden="true" /></div><span>{role}</span><h3>{name}</h3><strong>{full || name}</strong><p>{parents}</p>{bio && <p className="at-bio">{bio}</p>}{ig && <a href={String(ig).startsWith('http') ? ig : `https://instagram.com/${String(ig).replace('@', '')}`} target="_blank" rel="noreferrer">@{String(ig).split('/').filter(Boolean).pop().replace('@', '')}</a>}</article>; }
function Video({ url = '' }) { const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/); return match ? <iframe src={`https://www.youtube.com/embed/${match[1]}`} title="Video pernikahan" allowFullScreen /> : <CenteredVideoPlayer src={resolveImageUrl(url)} />; }
function shortTime(value) { return value ? String(value).slice(0, 5) : '--:--'; }
function formatDate(value) { if (!value) return 'Minggu, 20 Desember 2026'; return new Date(value).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
function formatStoryMonth(value) { if (!value) return ''; return new Date(value).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }); }
