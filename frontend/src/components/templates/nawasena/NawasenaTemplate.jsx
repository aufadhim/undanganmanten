import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCountdown } from '../../../hooks/useCountdown.js';
import { useCalendarUrl } from '../../../hooks/useCalendarUrl.js';
import { resolveImageUrl } from '../../../config/env.js';
import { DUMMY_BRIDE_PHOTO, DUMMY_GALLERY_PHOTOS, DUMMY_GALLERY_VIDEO, getGroomPhoto } from '../../../config/dummyAssets.js';
import FloatingMultimedia from '../../FloatingMultimedia.jsx';
import PublicForms, { GiftSection } from '../../PublicForms.jsx';
import CenteredVideoPlayer from '../../CenteredVideoPlayer.jsx';
import Lightbox from '../shared/Lightbox.jsx';
import SaveTheDate from '../shared/SaveTheDate.jsx';
import LivestreamCard from '../shared/LivestreamCard.jsx';
import { galleryCountClasses } from '../shared/galleryLayout.js';
import { resolvePreviewStory } from '../../../config/dummyStory.js';
import { resolveInvitationQuote } from '../../../config/quotePresets.js';
import { resolveTemplateCovers } from '../../../config/templateCover.js';
import { DUMMY_EVENTS, DUMMY_LIVESTREAM, DUMMY_RUNDOWNS, previewFeatureEnabled, previewGift, previewList, sortWeddingEvents } from '../../../config/dummyPreviewData.js';
import { getDummyBrideBio, getDummyGroomBio } from '../../../config/dummyProfile.js';
import { useTemplateReveal } from '../../../hooks/useTemplateReveal.js';
import './nawasena.css';

const HERO = '/assets/nawasena/enchanted-joglo-hero.webp';
const ORNAMENTS = '/assets/nawasena/custom';
const DEFAULT_QUOTE = 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu agar kamu merasa tenteram kepadanya.';

export default function NawasenaTemplate({ invitation, previewGuest, editorPreview = false }) {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [gallerySlide, setGallerySlide] = useState(0);
  const [storyChapter, setStoryChapter] = useState(0);
  const storyTouchStart = useRef(null);
  const templateRef = useTemplateReveal('.nw-reveal');
  const [searchParams] = useSearchParams();
  const profile = invitation.coupleProfile || {};
  const theme = invitation.themeSettings || {};
  const features = invitation.invitationFeatures || {};
  const events = sortWeddingEvents(previewList(invitation.events, DUMMY_EVENTS, editorPreview));
  const mainEvent = events[0];
  const gallery = invitation.galleryMedia?.length ? invitation.galleryMedia : DUMMY_GALLERY_PHOTOS.map((url, index) => ({ id: `nw-dummy-${index}`, type: 'photo', url }));
  const photos = gallery.filter((item) => item.type !== 'video').map((item) => resolveImageUrl(item.url || item.path));
  const uploadedVideos = gallery.filter((item) => item.type === 'video');
  const videos = uploadedVideos.length || !editorPreview ? uploadedVideos : [{ id: 'nawasena-dummy-video', type: 'video', url: DUMMY_GALLERY_VIDEO }];
  const timeline = invitation.timelineStories || [];
  const previewStory = resolvePreviewStory(theme.mainStory, timeline, editorPreview);
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
  const resolvedCovers = resolveTemplateCovers(theme);
  const coverSource = resolvedCovers.main || resolvedCovers.opening || HERO;
  const coverPhoto = resolveImageUrl(String(coverSource).replace('enchanted-joglo-hero.png', 'enchanted-joglo-hero.webp'));
  const uploadedOpeningPhoto = resolvedCovers.opening ? resolveImageUrl(resolvedCovers.opening) : '';
  const uploadedHeroPhoto = resolvedCovers.main ? resolveImageUrl(resolvedCovers.main) : '';
  const countdown = useCountdown(mainEvent?.date || invitation.weddingDate, mainEvent?.startTime);
  const calendarUrl = useCalendarUrl(mainEvent?.date, mainEvent?.startTime, mainEvent?.endTime, mainEvent?.venueName, `Pernikahan ${brideName} & ${groomName}`, mainEvent?.address);
  const guestCode = searchParams.get('code');
  const matchedGuest = invitation.guests?.find((item) => item.code === guestCode || item.id === guestCode);
  const guest = previewGuest || matchedGuest;
  const guestName = guest?.name || 'Tamu Undangan';
  const dateLabel = useMemo(() => formatDate(mainEvent?.date || invitation.weddingDate), [mainEvent?.date, invitation.weddingDate]);
  const dressItems = theme.dresscodeDetails?.items || [{ title: 'Wanita', desc: 'Formal', colors: ['#7f1830', '#d5ccb0'] }, { title: 'Pria', desc: 'Formal', colors: ['#243322', '#8e773f'] }];
  const customLogo = features.customLogoEnabled !== false && theme.customLogoUrl;
  const activeStory = previewStory.timeline[storyChapter];

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), customLogo ? 1200 : 0);
    return () => window.clearTimeout(timer);
  }, [customLogo]);

  useEffect(() => {
    if (gallerySlide >= photos.length) setGallerySlide(0);
  }, [gallerySlide, photos.length]);

  useEffect(() => {
    if (theme.galleryLayout !== 'carousel' || photos.length < 2 || !opened) return undefined;
    const timer = window.setInterval(() => setGallerySlide((current) => (current + 1) % photos.length), 6500);
    return () => window.clearInterval(timer);
  }, [theme.galleryLayout, photos.length, opened]);

  useEffect(() => {
    if (storyChapter >= previewStory.timeline.length) setStoryChapter(0);
  }, [storyChapter, previewStory.timeline.length]);

  useEffect(() => {
    const root = templateRef.current;
    if (!root) return undefined;
    const syncViewport = () => root.style.setProperty('--nw-viewport-height', `${Math.max(480, root.clientHeight)}px`);
    syncViewport();
    const observer = new ResizeObserver(syncViewport);
    observer.observe(root);
    return () => observer.disconnect();
  }, [templateRef]);

  function changeStoryChapter(offset) {
    const count = previewStory.timeline.length;
    if (count < 2) return;
    setStoryChapter((current) => (current + offset + count) % count);
  }

  return <div ref={templateRef} className={`nawasena template-wrapper-dynamic ${opened ? 'nw-invitation-open' : 'nw-invitation-closed'}`} tabIndex={0} aria-label="Konten undangan Nawasena yang dapat digulir" style={{
    '--nw-paper': theme.background?.primary || '#f4eddf',
    '--nw-soft': theme.background?.secondary || '#d9c9ad',
    '--nw-wine': theme.bodyText?.primary || '#741d2b',
    '--nw-forest': theme.bodyText?.secondary || '#243322',
    '--nw-gold': theme.button?.primary || '#a4894e',
    '--nw-script': theme.typography?.fontHeading || '"Cormorant Garamond", serif',
    '--nw-body': theme.typography?.fontBody || 'Montserrat, sans-serif',
  }}>
    <FloatingMultimedia invitation={invitation} isOpen={opened} defaultColor="var(--nw-wine)" />

    {customLogo && loading && <div className="nw-loader"><img className={`loading-${theme.loadingAnimation || 'breathe'}`} src={resolveImageUrl(theme.customLogoUrl)} alt="Logo undangan" /></div>}

    <div className={`nw-opening ${uploadedOpeningPhoto ? 'has-photo' : 'no-photo'} ${opened ? `is-open opening-${theme.openingAnimation || 'fade'}` : ''}`}>
      <OpeningScene photo={uploadedOpeningPhoto} />
      <div className="nw-opening-copy">
        <div className="nw-opening-monogram"><span>{brideName[0]}{groomName[0]}</span></div>
        <small>Wedding Invitation</small>
        <h1>{brideName} <i>&amp;</i> {groomName}</h1>
        <p>Kepada Yth.</p>
        <strong>{guestName}</strong>
        <button onClick={() => setOpened(true)}>Buka Undangan</button>
      </div>
    </div>

    <main className="nw-flow">
      <section className="nw-hero" data-section="cover">
        <GardenScene image={HERO} photo={uploadedHeroPhoto} variant="hero" />
        <div className="nw-monogram nw-reveal"><span>{brideName[0]}{groomName[0]}</span></div>
        <div className="nw-hero-copy nw-reveal"><small>Wedding Invitation</small><h1>{brideName} <i>&amp;</i> {groomName}</h1><p>#{brideName}{groomName}InLove</p></div>
      </section>

      <section className="nw-section nw-intro" data-section="quote">
        <LayeredDecor variant="quote" />
        <div className="nw-reveal"><span className="nw-kicker">Two souls intertwined</span><h2>Cinta yang Menemukan Jalan Pulang</h2><blockquote>“{quote.text || DEFAULT_QUOTE}”</blockquote><p>{quote.source || 'Ar-Rum: 21'}</p></div>
      </section>

      <section className="nw-section nw-couple-section" data-section="profile">
        <LayeredDecor variant="couple" />
        <SectionTitle eyebrow="The Bride & Groom" title="Dua Jiwa, Satu Janji" />
        <div className="nw-couple">
          <PersonCard role="The Bride" image={bridePhoto} name={brideName} full={profile.brideFullName} parents={`Putri dari ${profile.brideFather || 'Adikara Wicaksana'} & ${profile.brideMother || 'Sekar Ayuningtyas'}`} bio={theme.brideBioEnabled !== false ? (profile.brideBio || (editorPreview ? getDummyBrideBio(brideName) : '')) : ''} ig={profile.brideInstagram || profile.brideIg} />
          <span className="nw-amp">&amp;</span>
          <PersonCard role="The Groom" image={groomPhoto} name={groomName} full={profile.groomFullName} parents={`Putra dari ${profile.groomFather || 'Bramantya Narendra'} & ${profile.groomMother || 'Ratih Puspitasari'}`} bio={theme.groomBioEnabled !== false ? (profile.groomBio || (editorPreview ? getDummyGroomBio(groomName) : '')) : ''} ig={profile.groomInstagram || profile.groomIg} />
        </div>
        <div className="nw-wayang-tableau nw-reveal">
          <div className="nw-wayang-pair" aria-hidden="true"><img src={`${ORNAMENTS}/ornamen-8.webp`} alt="" /><img src={`${ORNAMENTS}/ornamen-9.webp`} alt="" /></div>
          <div><span>A Timeless Dance</span><h3>Dua Perjalanan, Satu Irama</h3></div>
        </div>
      </section>

      {(previewStory.mainStory || previewStory.timeline.length) && <section className="nw-section nw-story" data-section="story">
        <LayeredDecor variant="story" />
        <SectionTitle eyebrow="Our Story" title="Kisah yang Ditulis Semesta" />
        {previewStory.mainStory && <p className="nw-story-lead nw-reveal">{previewStory.mainStory}</p>}
        {activeStory && <div className="nw-story-chapters nw-reveal">
          <div className="nw-story-tabs" aria-label="Bab perjalanan cinta">{previewStory.timeline.map((item, index) => <button type="button" className={index === storyChapter ? 'is-active' : ''} aria-current={index === storyChapter ? 'step' : undefined} onClick={() => setStoryChapter(index)} key={item.id || index}><span>{String(index + 1).padStart(2, '0')}</span>{formatStoryMonth(item.date) || `Bab ${index + 1}`}</button>)}</div>
          <article className="nw-story-chapter" onTouchStart={(event) => { storyTouchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientX; if (storyTouchStart.current == null || end == null) return; const distance = end - storyTouchStart.current; if (Math.abs(distance) > 45) changeStoryChapter(distance < 0 ? 1 : -1); storyTouchStart.current = null; }}>
            <div className="nw-story-photo">{photos.length > 0 && <img key={`${activeStory.id || storyChapter}-${photos[storyChapter % photos.length]}`} src={photos[storyChapter % photos.length]} alt={`Kenangan ${activeStory.title || `bab ${storyChapter + 1}`}`} />}</div>
            <div className="nw-story-copy"><span>{formatStoryMonth(activeStory.date) || `Bab ${storyChapter + 1}`}</span><h3>{activeStory.title}</h3><p>{activeStory.description}</p></div>
            {previewStory.timeline.length > 1 && <><button className="nw-story-arrow is-prev" type="button" onClick={() => changeStoryChapter(-1)} aria-label="Cerita sebelumnya"><i className="fa-solid fa-chevron-left" /></button><button className="nw-story-arrow is-next" type="button" onClick={() => changeStoryChapter(1)} aria-label="Cerita berikutnya"><i className="fa-solid fa-chevron-right" /></button></>}
          </article>
          <div className="nw-story-progress"><span>{String(storyChapter + 1).padStart(2, '0')}</span><i><b style={{ width: `${((storyChapter + 1) / previewStory.timeline.length) * 100}%` }} /></i>{String(previewStory.timeline.length).padStart(2, '0')}</div>
        </div>}
      </section>}

      {features.galleryEnabled !== false && <section className="nw-section nw-gallery-section" data-section="gallery">
        <LayeredDecor variant="gallery" />
        <SectionTitle eyebrow="Portraits of Us" title="Dalam Bingkai Cinta" />
        {theme.galleryLayout === 'carousel' ? (
          <div className={`nw-gallery nw-slideshow layout-carousel nw-reveal ${galleryCountClasses(photos.length)}`}>
            <div className="nw-slide-stage">
              <img className="nw-slide-floral floral-left" src={`${ORNAMENTS}/ornamen-13.webp`} alt="" aria-hidden="true" />
              <img className="nw-slide-floral floral-right" src={`${ORNAMENTS}/ornamen-16.webp`} alt="" aria-hidden="true" />
              <button className="nw-slide-main" type="button" onClick={() => setLightboxIndex(gallerySlide)} aria-label={`Buka foto galeri ${gallerySlide + 1}`}>
                {photos[gallerySlide] && <img key={photos[gallerySlide]} src={photos[gallerySlide]} alt={`Galeri utama ${gallerySlide + 1}`} />}
              </button>
              {photos.length > 1 && <>
                <button className="nw-slide-arrow is-prev" type="button" onClick={(event) => { event.stopPropagation(); setGallerySlide((current) => (current - 1 + photos.length) % photos.length); }} aria-label="Foto sebelumnya"><i className="fa-solid fa-chevron-left" /></button>
                <button className="nw-slide-arrow is-next" type="button" onClick={(event) => { event.stopPropagation(); setGallerySlide((current) => (current + 1) % photos.length); }} aria-label="Foto berikutnya"><i className="fa-solid fa-chevron-right" /></button>
              </>}
            </div>
            <div className="nw-slide-thumbs" aria-label="Pilihan foto galeri">
              {photos.map((url, index) => <button className={index === gallerySlide ? 'is-active' : ''} type="button" key={`${url}-${index}`} onClick={(event) => { event.stopPropagation(); setGallerySlide(index); }} aria-label={`Tampilkan foto ${index + 1}`} aria-current={index === gallerySlide ? 'true' : undefined}><img src={url} alt="" /></button>)}
            </div>
            <div className="nw-slide-counter"><span>{String(gallerySlide + 1).padStart(2, '0')}</span><i />{String(photos.length).padStart(2, '0')}</div>
          </div>
        ) : <div className={`nw-gallery layout-${theme.galleryLayout || 'collage'} ${galleryCountClasses(photos.length)}`}>{photos.map((url, index) => <button className="nw-reveal" key={url} onClick={() => setLightboxIndex(index)}><img src={url} alt={`Galeri ${index + 1}`} /></button>)}</div>}
        {videos.map((video) => <div className="nw-video nw-reveal" key={video.id || video.url}><Video url={video.url} /></div>)}
      </section>}

      <section className="nw-section nw-date" data-section="countdown">
        <LayeredDecor variant="date" />
        <SectionTitle eyebrow="Mark Your Calendar" title="Save the Date" />
        <SaveTheDate className="save-the-date-nawasena nw-reveal" date={mainEvent?.date || invitation.weddingDate} countdown={countdown} calendarUrl={calendarUrl} />
      </section>

      <section className="nw-section nw-events-section" data-section="events">
        <LayeredDecor variant="events" />
        <SectionTitle eyebrow="It's Wedding Day" title="Hari Bahagia Kami" />
        <div className="nw-events">{events.map((event, index) => <article className="nw-reveal" key={event.id || index}><FloralCorner /><span>{event.type || `Acara ${index + 1}`}</span><h3>{formatDate(event.date)}</h3><strong>{shortTime(event.startTime)} – {shortTime(event.endTime)} WIB</strong><h4>{event.venueName}</h4><p>{event.address || event.venueAddress}</p>{(event.googleMapsUrl || event.mapUrl) && <a href={event.googleMapsUrl || event.mapUrl} target="_blank" rel="noreferrer"><i className="fa-solid fa-location-dot" aria-hidden="true"></i> Lihat di Google Maps</a>}</article>)}</div>
      </section>

      {showDresscode && <section className="nw-section" data-section="dresscode"><SectionTitle eyebrow="What to Wear" title="Dresscode" /><div className="nw-dress">{dressItems.map((item, index) => <article className="nw-reveal" key={`${item.title}-${index}`}><h3>{item.title}</h3><p>{item.desc}</p><div>{(item.colors || []).map((color) => <i key={color} style={{ background: color }} />)}</div></article>)}</div></section>}

      {features.rundownEnabled !== false && <section className="nw-section" data-section="rundown"><SectionTitle eyebrow="Order of Celebration" title="Rundown" /><div className="nw-rundown">{rundowns.map((item, index) => <article className="nw-reveal" key={item.id || index}><time>{item.time}</time><div><h3>{item.activity || item.title}</h3>{item.description && <p>{item.description}</p>}</div></article>)}</div></section>}

      {showLivestream && <section className="nw-section" data-section="livestream"><SectionTitle eyebrow="Watch From Anywhere" title="Live Streaming" /><p className="nw-copy">Bagi keluarga dan sahabat yang belum dapat hadir secara langsung.</p><LivestreamCard className="livestream-card-nawasena" url={livestream.url} coverImage={resolveImageUrl(livestream.coverImageUrl || coverPhoto)} /></section>}

      {showIgFilter && <section className="nw-section nw-ig-filter" data-section="igFilter"><LayeredDecor variant="gallery" /><SectionTitle eyebrow="Share the Moment" title="Instagram Filter" /><div className="nw-ig-showcase"><img className="nw-ig-preview" src={resolveImageUrl(theme.igFilterImageUrl || coverPhoto)} alt="Pratinjau filter Instagram" /><img className="nw-ig-flower flower-left" src={`${ORNAMENTS}/ornamen-13.webp`} alt="" aria-hidden="true" /><img className="nw-ig-flower flower-right" src={`${ORNAMENTS}/ornamen-16.webp`} alt="" aria-hidden="true" /><OpeningBird direction="ltr" context="ig" /></div><p className="nw-copy">Gunakan filter khusus kami dan bagikan momen bahagia ini.</p><a className="nw-button" href={igFilterUrl || '#'} target={igFilterUrl && igFilterUrl !== '#' ? '_blank' : undefined} rel={igFilterUrl && igFilterUrl !== '#' ? 'noreferrer' : undefined} onClick={!igFilterUrl || igFilterUrl === '#' ? (event) => event.preventDefault() : undefined}>Coba Filter</a></section>}

      {features.rsvpEnabled !== false && <section className="nw-section nw-form" data-section="rsvp"><LayeredDecor variant="rsvp" /><SectionTitle eyebrow="Be Our Guest" title="RSVP" /><PublicForms invitation={invitation} previewGuest={guest} templateStyle="nawasena" previewMode={editorPreview} formType="rsvp" hideSectionTitle /></section>}

      {showGift && <section className="nw-section nw-form" data-section="gift"><LayeredDecor variant="gift" /><SectionTitle eyebrow="A Token of Love" title="Tanda Kasih" />{(gifts.shippingAddress || banks.length) ? <GiftSection gift={{ ...gifts, bankAccounts: banks }} accent={theme.bodyText?.primary || '#741d2b'} templateStyle="nawasena" hideTitle /> : <p className="nw-copy">Informasi rekening atau alamat hadiah akan tampil di sini.</p>}</section>}

      {features.wishesEnabled !== false && <section className="nw-section nw-form" data-section="wishes"><LayeredDecor variant="wishes" /><SectionTitle eyebrow="Wedding Wishes" title="Ucapan & Doa" /><PublicForms invitation={invitation} previewGuest={guest} templateStyle="nawasena" previewMode={editorPreview} formType="wishes" hideSectionTitle /></section>}

      <footer className="nw-footer" data-section="footer"><GardenScene image={coverPhoto} variant="footer" /><OpeningBird direction="ltr" context="closing" /><OpeningBird direction="rtl" context="closing" /><div className="nw-footer-copy"><span>Terima Kasih</span><h2>{brideName} <i>&amp;</i> {groomName}</h2><p>{theme.closingText || 'Merupakan kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.'}</p><strong>{dateLabel}</strong><small>UndanganManten</small></div></footer>
    </main>

    {lightboxIndex !== null && <Lightbox mediaList={[...photos.map((url) => ({ type: 'photo', url })), ...videos]} currentIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />}
  </div>;
}

function GardenScene({ image, photo = '', variant = 'hero' }) { return <div className={`nw-scene nw-scene-${variant} ${photo ? 'has-portrait' : 'no-portrait'}`} aria-hidden="true">
  <div className="nw-sky" style={{ backgroundImage: `url(${image})` }} />
  <img className="nw-scene-tree left" src={`${ORNAMENTS}/ornamen-20.webp`} alt="" /><img className="nw-scene-tree right" src={`${ORNAMENTS}/ornamen-21.webp`} alt="" />
  <img className="nw-scene-flower left" src={`${ORNAMENTS}/ornamen-13.webp`} alt="" /><img className="nw-scene-flower right" src={`${ORNAMENTS}/ornamen-16.webp`} alt="" />
  {variant === 'hero' ? <>
    {photo && <div className="nw-hero-portrait"><img src={photo} alt="" /></div>}
    {photo && <div className="nw-hero-frame-petals"><img src={`${ORNAMENTS}/ornamen-2.webp`} alt="" /><img src={`${ORNAMENTS}/ornamen-4.webp`} alt="" /><img src={`${ORNAMENTS}/ornamen-6.webp`} alt="" /><img src={`${ORNAMENTS}/ornamen-7.webp`} alt="" /></div>}
    <div className="nw-hero-foreground"><img src={`${ORNAMENTS}/ornamen-13.webp`} alt="" /><img src={`${ORNAMENTS}/ornamen-17.webp`} alt="" /><img src={`${ORNAMENTS}/ornamen-16.webp`} alt="" /></div>
    <HeroBird direction="ltr" /><HeroBird direction="rtl" />
  </> : <><img className="nw-scene-foliage left" src={`${ORNAMENTS}/ornamen-1.webp`} alt="" /><img className="nw-scene-foliage right" src={`${ORNAMENTS}/ornamen-19.webp`} alt="" /><img className="nw-ornate-bird" src={`${ORNAMENTS}/ornamen-12.webp`} alt="" /></>}
  <div className="nw-mist mist-one" /><div className="nw-mist mist-two" /><div className="nw-petals">{[2,3,4,5,6,7,2,4,6,3].map((number, index) => <img key={`${number}-${index}`} src={`${ORNAMENTS}/ornamen-${number}.webp`} alt="" />)}</div>
</div>; }
function HeroBird({ direction }) { return <div className={`nw-hero-bird bird-${direction}`}><img className="bird-body" src={`${ORNAMENTS}/ornamen-12.webp`} alt="" /><img className="bird-wing wing-top" src={`${ORNAMENTS}/ornamen-12.webp`} alt="" /><img className="bird-wing wing-bottom" src={`${ORNAMENTS}/ornamen-12.webp`} alt="" /></div>; }
function OpeningScene({ photo }) { return <div className="nw-opening-stage" aria-hidden="true">
  <div className="nw-opening-mountains" style={{ backgroundImage: `url(${HERO})` }} />
  <div className="nw-opening-sun" />
  <div className="nw-opening-joglo" style={{ backgroundImage: `url(${HERO})` }} />
  {photo && <div className="nw-opening-photo"><img src={photo} alt="" /><span /></div>}
  <div className="nw-opening-haze one" /><div className="nw-opening-haze two" />
  <img className="nw-opening-tree tree-left" src={`${ORNAMENTS}/ornamen-20.webp`} alt="" />
  <img className="nw-opening-tree tree-right" src={`${ORNAMENTS}/ornamen-21.webp`} alt="" />
  <img className="nw-opening-bloom bloom-left" src={`${ORNAMENTS}/ornamen-13.webp`} alt="" />
  <img className="nw-opening-bloom bloom-right" src={`${ORNAMENTS}/ornamen-16.webp`} alt="" />
  <img className="nw-opening-bloom bloom-center" src={`${ORNAMENTS}/ornamen-17.webp`} alt="" />
  <OpeningBird direction="ltr" /><OpeningBird direction="rtl" />
  <div className="nw-opening-petals">{[2,3,4,5,6,7,2,5].map((number, index) => <img key={`${number}-${index}`} src={`${ORNAMENTS}/ornamen-${number}.webp`} alt="" />)}</div>
</div>; }
function OpeningBird({ direction, context = 'opening' }) { return <div className={`nw-opening-bird bird-${direction} bird-context-${context}`} aria-hidden="true"><img className="bird-body" src={`${ORNAMENTS}/ornamen-12.webp`} alt="" /><img className="bird-wing wing-top" src={`${ORNAMENTS}/ornamen-12.webp`} alt="" /><img className="bird-wing wing-bottom" src={`${ORNAMENTS}/ornamen-12.webp`} alt="" /></div>; }
function LayeredDecor({ variant }) { const map = { quote: [11, 14, 15], couple: [24, 25], story: [20, 24, 25], gallery: [17, 22, 23], date: [13, 18, 15], events: [21, 14, 18], rsvp: [16, 22, 25], gift: [17, 23, 14], wishes: [13, 24, 18] }; return <div className={`nw-layered nw-layered-${variant}`} aria-hidden="true">{(map[variant] || [17, 18]).map((number, index) => <img key={`${variant}-${number}`} className={`nw-layer nw-layer-${index + 1}`} src={`${ORNAMENTS}/ornamen-${number}.webp`} alt="" />)}</div>; }
function FloralCorner() { return <img className="nw-floral" src={`${ORNAMENTS}/ornamen-17.webp`} alt="" aria-hidden="true" />; }
function SectionTitle({ eyebrow, title }) { return <header className="nw-heading nw-reveal"><span>{eyebrow}</span><h2>{title}</h2><i /></header>; }
function PersonCard({ role, image, name, full, parents, bio, ig }) { return <article className="nw-person nw-reveal"><div className="nw-portrait"><div className="nw-profile-photo-mask"><img src={image} alt={name} /></div><img className="nw-profile-frame" src={`${ORNAMENTS}/ornamen-11.webp`} alt="" aria-hidden="true" /><img className="nw-profile-tassel tassel-left" src={`${ORNAMENTS}/ornamen-10.webp`} alt="" aria-hidden="true" /><img className="nw-profile-tassel tassel-right" src={`${ORNAMENTS}/ornamen-10.webp`} alt="" aria-hidden="true" /><div className="nw-profile-florals" aria-hidden="true"><img src={`${ORNAMENTS}/ornamen-13.webp`} alt="" /><img src={`${ORNAMENTS}/ornamen-17.webp`} alt="" /><img src={`${ORNAMENTS}/ornamen-16.webp`} alt="" /></div></div><span>{role}</span><h3>{name}</h3><strong>{full || name}</strong><p>{parents}</p>{bio && <p className="nw-bio">{bio}</p>}{ig && <a href={String(ig).startsWith('http') ? ig : `https://instagram.com/${String(ig).replace('@', '')}`} target="_blank" rel="noreferrer"><i className="fa-brands fa-instagram" aria-hidden="true" />@{String(ig).split('/').filter(Boolean).pop().replace('@', '')}</a>}</article>; }
function Video({ url = '' }) { const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/); return match ? <iframe src={`https://www.youtube.com/embed/${match[1]}`} title="Video pernikahan" allowFullScreen /> : <CenteredVideoPlayer src={resolveImageUrl(url)} />; }
function shortTime(value) { return value ? String(value).slice(0, 5) : '--:--'; }
function formatDate(value) { if (!value) return 'Minggu, 20 Desember 2026'; return new Date(value).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
function formatStoryMonth(value) { if (!value) return ''; return new Date(value).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }); }
