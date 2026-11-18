import Hummingbird from './Hummingbird.jsx';
import FooterBrand from '../shared/FooterBrand.jsx';
import PhotoFrame from '../shared/PhotoFrame.jsx';
import DresscodeContent from '../shared/DresscodeContent.jsx';
import StandardGallery from '../shared/StandardGallery.jsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCountdown } from '../../../hooks/useCountdown.js';
import { useCalendarUrl } from '../../../hooks/useCalendarUrl.js';
import { resolveImageUrl } from '../../../config/env.js';
import { DUMMY_BRIDE_PHOTO, DUMMY_GALLERY_PHOTOS, DUMMY_GALLERY_VIDEO, getGroomPhoto } from '../../../config/dummyAssets.js';
import FloatingMultimedia from '../../FloatingMultimedia.jsx';
import PublicForms, { GiftSection } from '../../PublicForms.jsx';
import SaveTheDate from '../shared/SaveTheDate.jsx';
import LivestreamCard from '../shared/LivestreamCard.jsx';
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
  const [openingPresent, setOpeningPresent] = useState(true);
  const [loading, setLoading] = useState(true);
  const [coverReady, setCoverReady] = useState(false);
  
  
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
  const previewStory = resolvePreviewStory(theme.mainStory, timeline, editorPreview, invitation.invitationFeatures?.timelineEnabled);
  const rundowns = previewList(invitation.rundowns, DUMMY_RUNDOWNS, editorPreview);
  const gifts = previewGift(invitation.giftSettings || {}, editorPreview);
  const banks = gifts.bankAccounts?.length ? gifts.bankAccounts : gifts.accountNumber ? [{ bankName: gifts.bankName, accountNumber: gifts.accountNumber, accountHolder: gifts.accountHolder }] : [];
  const livestream = invitation.livestreamSettings?.url ? invitation.livestreamSettings : (editorPreview ? DUMMY_LIVESTREAM : (invitation.livestreamSettings || {}));
  const showDresscode = previewFeatureEnabled(features.dresscodeEnabled, editorPreview, false);
  const showLivestream = previewFeatureEnabled(features.livestreamEnabled, editorPreview, false);
  const showGift = previewFeatureEnabled(features.giftEnabled, editorPreview, false);
  const showIgFilter = previewFeatureEnabled(features.igFilterEnabled, editorPreview, false);
  const quote = resolveInvitationQuote(invitation.quoteSettings);
  const brideName = profile.brideName || 'Arunika';
  const groomName = profile.groomName || 'Deva';
  const bridePhoto = resolveImageUrl(profile.bridePhoto || DUMMY_BRIDE_PHOTO);
  const groomPhoto = resolveImageUrl(getGroomPhoto(profile.groomPhoto));
  const resolvedCovers = resolveTemplateCovers(theme);
  const uploadedOpeningPhoto = resolvedCovers.opening ? resolveImageUrl(resolvedCovers.opening) : '';
  const uploadedHeroPhoto = resolvedCovers.main ? resolveImageUrl(resolvedCovers.main) : '';
  const countdown = useCountdown(mainEvent?.date || invitation.weddingDate, mainEvent?.startTime);
  const calendarUrl = useCalendarUrl(mainEvent?.date, mainEvent?.startTime, mainEvent?.endTime, mainEvent?.venueName, `Pernikahan ${brideName} & ${groomName}`, mainEvent?.address);
  const guestCode = searchParams.get('code');
  const matchedGuest = invitation.guests?.find((item) => item.code === guestCode || item.id === guestCode);
  const guest = previewGuest || matchedGuest;
  const guestName = guest?.name || 'Tamu Undangan';
  const dateLabel = useMemo(() => formatDate(mainEvent?.date || invitation.weddingDate), [mainEvent?.date, invitation.weddingDate]);
  const customLogo = features.customLogoEnabled !== false && theme.customLogoUrl;
  const activeStory = previewStory.timeline[storyChapter];

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), customLogo ? 1200 : 0);
    return () => window.clearTimeout(timer);
  }, [customLogo]);

  

  

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

  // Start the entrance choreography after the cover's actual artwork is decoded.
  useEffect(() => {
    let cancelled = false;
    setCoverReady(false);
    const sources = [HERO, uploadedOpeningPhoto, ORNAMENTS + '/ornamen-13.webp', ORNAMENTS + '/ornamen-16.webp', ORNAMENTS + '/ornamen-11.webp'].filter(Boolean);
    Promise.all(sources.map(src => new Promise(resolve => {
      const image = new Image();
      image.onload = () => image.decode?.().catch(() => {}).then(resolve) || resolve();
      image.onerror = resolve;
      image.src = src;
    }))).then(() => { if (!cancelled) setCoverReady(true); });
    return () => { cancelled = true; };
  }, [uploadedOpeningPhoto]);

  // Stop hidden/offscreen ornament animation, including when the tab is backgrounded.
  useEffect(() => {
    const root = templateRef.current;
    if (!root) return;
    const sync = () => root.classList.toggle('nw-motion-paused', document.hidden);
    const observer = new IntersectionObserver(entries => entries.forEach(({target,isIntersecting}) => target.classList.toggle('nw-in-view', isIntersecting)), {root, rootMargin:'40px'});
    root.querySelectorAll('.nw-section,.nw-hero,.nw-footer').forEach(el => observer.observe(el));
    document.addEventListener('visibilitychange',sync);sync();
    return () => {observer.disconnect();document.removeEventListener('visibilitychange',sync)};
  }, [templateRef]);

  useEffect(() => {
    if (!opened) return;
    const timer = window.setTimeout(() => setOpeningPresent(false), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 180 : 800);
    return () => window.clearTimeout(timer);
  }, [opened]);

  function openInvitation() {
    const root = templateRef.current;
    root?.scrollTo({top:0,left:0,behavior:'instant'});
    root?.focus({preventScroll:true});
    setOpened(true);
    requestAnimationFrame(() => root?.scrollTo({top:0,left:0,behavior:'instant'}));
  }

  function changeStoryChapter(offset) {
    const count = previewStory.timeline.length;
    if (count < 2) return;
    setStoryChapter((current) => (current + offset + count) % count);
  }

  return <div ref={templateRef} className={`nawasena ${openingPresent ? 'nw-entrance-present' : ''} template-wrapper-dynamic ${opened ? 'nw-invitation-open' : 'nw-invitation-closed'}`} tabIndex={0} aria-label="Konten undangan Nawasena yang dapat digulir" style={{
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

    {openingPresent && (() => {
      const validNawasenaOpenings = ['fade', 'slide-up', 'slide-down', 'zoom'];
      const nawasenaOpening = validNawasenaOpenings.includes(theme.openingAnimation) ? theme.openingAnimation : 'fade';
      return (
        <div aria-hidden={opened} className={`nw-opening ${coverReady ? 'is-ready' : 'is-preparing'} ${uploadedOpeningPhoto ? 'has-photo' : 'no-photo'} ${opened ? `is-open opening-${nawasenaOpening}` : ''}`}>
          <OpeningScene />
          <div className={`nw-opening-layout ${uploadedOpeningPhoto ? 'with-portrait' : ''}`}>
            <header className="nw-opening-copy"><small>Wedding Invitation</small><h1>{brideName} <i>&amp;</i> {groomName}</h1><p>{dateLabel}</p></header>
            <PairPortrait source={uploadedOpeningPhoto} className="nw-opening-portrait" />
            <div className="nw-opening-greeting"><p>Kepada Yth. Bapak / Ibu / Saudara/i</p><strong>{guestName}</strong><button type="button" data-open-cover onClick={openInvitation}>Buka Undangan</button></div>
          </div>
        </div>
      );
    })()}

    <main className="nw-flow" inert={!opened ? '' : undefined} aria-hidden={!opened}>
      <section className="nw-hero" data-section="cover">
        <GardenScene />
        
        <div className={`nw-hero-layout ${uploadedHeroPhoto ? 'with-portrait' : ''}`}><header className="nw-hero-copy nw-reveal"><small>Wedding Invitation</small><h1>{brideName} <i>&amp;</i> {groomName}</h1><p>{dateLabel}</p></header><PairPortrait source={uploadedHeroPhoto} className="nw-hero-portrait" /></div>
      </section>

      <section className="nw-section nw-intro" data-section="quote">
        <LayeredDecor variant="quote" />
        <div className="nw-reveal"><span className="nw-kicker">Two souls intertwined</span><h2>Cinta yang Menemukan Jalan Pulang</h2><blockquote>“{quote.text || DEFAULT_QUOTE}”</blockquote><p>{quote.source || 'Ar-Rum: 21'}</p></div>
      </section>

      <section className="nw-section nw-couple-section" data-section="profile">
        <LayeredDecor variant="couple" />
        <SectionTitle eyebrow="The Bride & Groom" title="Dua Jiwa, Satu Janji" />
        <div className="nw-couple">
          <PersonCard role="The Bride" image={bridePhoto} name={brideName} full={profile.brideFullName} parents={`Putri dari ${profile.brideFather || 'Adikara Wicaksana'} & ${profile.brideMother || 'Sekar Ayuningtyas'}`} bio={theme.brideBioEnabled !== false ? (profile.brideBio || (editorPreview ? getDummyBrideBio(brideName) : '')) : ''} ig={theme.brideInstagramEnabled === false ? '' : (profile.brideInstagram || profile.brideIg)} />
          <span className="nw-amp">&amp;</span>
          <PersonCard role="The Groom" image={groomPhoto} name={groomName} full={profile.groomFullName} parents={`Putra dari ${profile.groomFather || 'Bramantya Narendra'} & ${profile.groomMother || 'Ratih Puspitasari'}`} bio={theme.groomBioEnabled !== false ? (profile.groomBio || (editorPreview ? getDummyGroomBio(groomName) : '')) : ''} ig={theme.groomInstagramEnabled === false ? '' : (profile.groomInstagram || profile.groomIg)} />
        </div>
        <figure className="nw-wayang-tableau nw-reveal">
          
          <figcaption><span>A Timeless Dance</span><h3>Dua Perjalanan, Satu Irama</h3></figcaption>
        </figure>
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
            {previewStory.timeline.length > 1 && <><button className="nw-story-arrow is-prev" type="button" onClick={() => changeStoryChapter(-1)} aria-label="Cerita sebelumnya"><span className="button-direction-label">Sebelumnya</span></button><button className="nw-story-arrow is-next" type="button" onClick={() => changeStoryChapter(1)} aria-label="Cerita berikutnya"><span className="button-direction-label">Berikutnya</span></button></>}
          </article>
          <div className="nw-story-progress"><span>{String(storyChapter + 1).padStart(2, '0')}</span><i><b style={{ width: `${((storyChapter + 1) / previewStory.timeline.length) * 100}%` }} /></i>{String(previewStory.timeline.length).padStart(2, '0')}</div>
        </div>}
      </section>}

      {features.galleryEnabled !== false && <section className="nw-section nw-gallery-section" data-section="gallery">
        <LayeredDecor variant="gallery" />
        <SectionTitle eyebrow="Portraits of Us" title="Dalam Bingkai Cinta" />
        <StandardGallery className={(uploadedVideos.length || (editorPreview && videos.length)) ? 'nw-gallery-media has-video' : 'nw-gallery-media'} mediaList={gallery.some(item=>item.type==='video')?gallery:[...gallery,...videos]} layout={theme.galleryLayout||'editorial'}/></section>}

      <section className="nw-section nw-date" data-section="countdown">
        <LayeredDecor variant="date" />
        <SectionTitle eyebrow="Mark Your Calendar" title="Save the Date" />
        <SaveTheDate className="save-the-date-nawasena nw-reveal" date={mainEvent?.date || invitation.weddingDate} countdown={countdown} calendarUrl={calendarUrl} />
      </section>

      <section className="nw-section nw-events-section" data-section="events">
        <LayeredDecor variant="events" />
        <SectionTitle eyebrow="It's Wedding Day" title="Hari Bahagia Kami" />
        <div className="nw-events">{events.map((event, index) => <article className="nw-reveal" key={event.id || index}><span>{event.type === 'ngunduh_mantu' ? 'Ngunduh Mantu' : event.type || `Acara ${index + 1}`}</span><h3>{formatDate(event.date)}</h3><strong>{shortTime(event.startTime)} – {shortTime(event.endTime)} WIB</strong><h4>{event.venueName}</h4><p>{event.address || event.venueAddress}</p>{(event.googleMapsUrl || event.mapUrl) && <a href={event.googleMapsUrl || event.mapUrl} target="_blank" rel="noreferrer">Lihat lokasi</a>}</article>)}</div>
      </section>

      {showDresscode && <section className="nw-section" data-section="dresscode"><LayeredDecor variant="dresscode" /><SectionTitle eyebrow="What to Wear" title="Dresscode" /><DresscodeContent theme={theme} /></section>}

      {features.rundownEnabled !== false && <section className="nw-section" data-section="rundown"><LayeredDecor variant="rundown" /><SectionTitle eyebrow="Order of Celebration" title="Rundown" /><div className="nw-rundown">{rundowns.map((item, index) => <article className="nw-reveal" key={item.id || index}><time>{item.time}</time><div><strong className="nw-rundown-title">{item.activity || item.title}</strong>{item.description && <p>{item.description}</p>}</div></article>)}</div></section>}

      {showLivestream && <section className="nw-section" data-section="livestream"><LayeredDecor variant="livestream" /><SectionTitle eyebrow="Watch From Anywhere" title="Live Streaming" /><p className="nw-copy">Bagi keluarga dan sahabat yang belum dapat hadir secara langsung.</p><LivestreamCard className="livestream-card-nawasena" url={livestream.url} coverImage={resolveImageUrl(livestream.coverImageUrl || HERO)} /></section>}

      {showIgFilter && <section className="nw-section photo-frame-section" data-section="igFilter"><SectionTitle eyebrow="Abadikan momen" title="Bingkai Foto" /><PhotoFrame invitation={invitation} themeId={invitation.themeId} frameUrl={theme.igFilterImageUrl} /></section>}

      {features.rsvpEnabled !== false && <section className="nw-section nw-form" data-section="rsvp"><LayeredDecor variant="rsvp" /><SectionTitle eyebrow="Be Our Guest" title="RSVP" /><PublicForms invitation={invitation} previewGuest={guest} templateStyle="nawasena" previewMode={editorPreview} formType="rsvp" hideSectionTitle /></section>}

      {showGift && <section className="nw-section nw-form" data-section="gift"><LayeredDecor variant="gift" /><SectionTitle eyebrow="A Token of Love" title="Tanda Kasih" />{(gifts.shippingAddress || banks.length) ? <GiftSection gift={{ ...gifts, bankAccounts: banks }} accent={theme.bodyText?.primary || '#741d2b'} templateStyle="nawasena" hideTitle /> : <p className="nw-copy">Informasi rekening atau alamat hadiah akan tampil di sini.</p>}</section>}

      {features.wishesEnabled !== false && features.rsvpEnabled === false && <section className="nw-section nw-form" data-section="wishes"><LayeredDecor variant="wishes" /><SectionTitle eyebrow="Wedding Wishes" title="Ucapan & Doa" /><PublicForms invitation={invitation} previewGuest={guest} templateStyle="nawasena" previewMode={editorPreview} formType="wishes" hideSectionTitle /></section>}

      <footer className="nw-footer" data-section="footer"><div className="nw-footer-garden" aria-hidden="true" /><img className="nw-closing-tree" src={`${ORNAMENTS}/ornamen-1.webp`} alt="" aria-hidden="true"/><div className="nw-footer-copy"><span>Terima kasih</span><h2>{brideName} <i>&amp;</i> {groomName}</h2><p>{theme.closingText || 'Merupakan kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.'}</p><strong>{dateLabel}</strong></div><PairPortrait source={uploadedHeroPhoto || uploadedOpeningPhoto} className="nw-footer-portrait" /><FooterBrand/></footer>
    </main>

    
  </div>;
}

function PairPortrait({source,className}) { return source ? <figure className={`nw-pair-portrait nw-photo-frame ${className}`}><img className="nw-framed-photo" src={source} alt="Foto pasangan"/><img className="nw-frame-art" src={`${ORNAMENTS}/ornamen-11.webp`} alt="" aria-hidden="true"/></figure> : <div className={`nw-pair-portrait ${className} is-empty`} aria-hidden="true" />; }

function GardenScene() { return <div className="nw-scene" aria-hidden="true"><div className="nw-sky" style={{backgroundImage:`url(${HERO})`}}/><Hummingbird context="hero"/><Hummingbird direction="rtl" context="hero"/><div className="nw-scene-flowers"><img src={`${ORNAMENTS}/ornamen-13.webp`} alt=""/><img src={`${ORNAMENTS}/ornamen-16.webp`} alt=""/></div></div>; }
function LayeredDecor({variant}) { const sides={quote:[14,25],couple:[20,21],story:[12,18],gallery:[23,22],date:[15,24],events:[14,25],rsvp:[22,25],gift:[17,18],wishes:[16,24],dresscode:[15,23],rundown:[24,14],livestream:[18,22]};return <div className={`nw-layered nw-layered-${variant}`} aria-hidden="true">{(sides[variant]||[24,25]).map((number,index)=><img key={index} className={`nw-layer nw-layer-${index+1}`} src={`${ORNAMENTS}/ornamen-${number}.webp`} alt=""/>)}</div>; }
function SectionTitle({ eyebrow, title }) { return <header className="nw-heading nw-reveal"><span>{eyebrow}</span><h2>{title}</h2><i /></header>; }
function ProfileCorner({corner}) {return <svg className={`nw-profile-carving ${corner}`} viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M4 43V15Q4 4 15 4H43M9 35V17Q9 9 17 9H35M9 28C19 29 28 21 24 15C20 9 12 17 18 20C23 23 30 15 35 9" stroke="currentColor" strokeWidth="1.4"/><path d="M11 32C17 32 23 28 22 24C17 23 13 26 11 32ZM25 17C25 11 31 7 35 9C34 14 29 14 25 17Z" fill="currentColor" opacity=".7"/></svg>;}
function PersonCard({role,image,name,full,parents,bio,ig}) {const bride=role==='The Bride';return <article className={`nw-person nw-reveal ${bride?'is-bride':'is-groom'}`}><figure className="nw-portrait"><div className="nw-profile-mat"><img className="nw-profile-photo" src={image} alt={name}/></div>{['tl','tr','bl','br'].map(corner=><ProfileCorner key={corner} corner={corner}/>)}<img className="nw-profile-wayang" src={`${ORNAMENTS}/ornamen-${bride?8:9}.webp`} alt="" aria-hidden="true"/></figure><span>{role}</span><h3>{full || name}</h3><p>{parents}</p>{bio&&<p className="nw-bio">{bio}</p>}{ig&&<a href={String(ig).startsWith('http')?ig:`https://instagram.com/${String(ig).replace('@','')}`} target="_blank" rel="noreferrer">Instagram</a>}</article>; }

function shortTime(value) { return value ? String(value).slice(0, 5) : '--:--'; }
function formatDate(value) { if (!value) return 'Minggu, 20 Desember 2026'; return new Date(value).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
function formatStoryMonth(value) { if (!value) return ''; return new Date(value).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }); }

function OpeningScene() { return <div className="nw-opening-stage" aria-hidden="true"><div className="nw-opening-mountains" style={{backgroundImage:`url(${HERO})`}}/><img className="nw-opening-bloom bloom-left" src={`${ORNAMENTS}/ornamen-13.webp`} alt=""/><img className="nw-opening-bloom bloom-right" src={`${ORNAMENTS}/ornamen-16.webp`} alt=""/><Hummingbird/><Hummingbird direction="rtl"/><div className="nw-opening-petals">{[2,3,4,5,6,7].map((number,index)=><img key={index} src={`${ORNAMENTS}/ornamen-${number}.webp`} alt=""/>)}</div></div>; }
