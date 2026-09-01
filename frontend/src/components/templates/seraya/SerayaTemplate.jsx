import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCountdown } from '../../../hooks/useCountdown.js';
import { useCalendarUrl } from '../../../hooks/useCalendarUrl.js';
import { resolveImageUrl } from '../../../config/env.js';
import { resolveTemplateCovers, uploadedProfilePhoto } from '../../../config/templateCover.js';
import { DUMMY_BRIDE_PHOTO, DUMMY_GALLERY_PHOTOS, DUMMY_GALLERY_VIDEO, getGroomPhoto } from '../../../config/dummyAssets.js';
import { resolveInvitationQuote } from '../../../config/quotePresets.js';
import { resolvePreviewStory } from '../../../config/dummyStory.js';
import { DUMMY_EVENTS, DUMMY_LIVESTREAM, DUMMY_RUNDOWNS, previewFeatureEnabled, previewGift, previewList, sortWeddingEvents } from '../../../config/dummyPreviewData.js';
import { getDummyBrideBio, getDummyGroomBio } from '../../../config/dummyProfile.js';
import FloatingMultimedia from '../../FloatingMultimedia.jsx';
import PublicForms, { GiftSection } from '../../PublicForms.jsx';
import CenteredVideoPlayer from '../../CenteredVideoPlayer.jsx';
import Lightbox from '../shared/Lightbox.jsx';
import SaveTheDate from '../shared/SaveTheDate.jsx';
import LivestreamCard from '../shared/LivestreamCard.jsx';
import { galleryCountClasses } from '../shared/galleryLayout.js';
import './seraya.css';

export default function SerayaTemplate({ invitation, previewGuest, editorPreview = false }) {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [searchParams] = useSearchParams();
  const profile = invitation.coupleProfile || {};
  const theme = invitation.themeSettings || {};
  const features = invitation.invitationFeatures || {};
  const events = sortWeddingEvents(previewList(invitation.events, DUMMY_EVENTS, editorPreview));
  const gallery = invitation.galleryMedia?.length ? invitation.galleryMedia : DUMMY_GALLERY_PHOTOS.map((url, index) => ({ id: `dummy-${index}`, type: 'photo', url }));
  const photos = gallery.filter((item) => item.type !== 'video').map((item) => resolveImageUrl(item.url || item.path));
  const uploadedVideos = gallery.filter((item) => item.type === 'video');
  const videos = uploadedVideos.length || !editorPreview
    ? uploadedVideos
    : [{ id: 'seraya-dummy-video', type: 'video', url: DUMMY_GALLERY_VIDEO }];
  const timeline = invitation.timelineStories || [];
  const rundowns = previewList(invitation.rundowns, DUMMY_RUNDOWNS, editorPreview);
  const gifts = previewGift(invitation.giftSettings || {}, editorPreview);
  const banks = gifts.bankAccounts?.length ? gifts.bankAccounts : gifts.accountNumber ? [{ bankName: gifts.bankName, accountNumber: gifts.accountNumber, accountHolder: gifts.accountHolder }] : [];
  const giftReady = Boolean(gifts.shippingAddress || banks.length);
  const livestream = invitation.livestreamSettings?.url ? invitation.livestreamSettings : (editorPreview ? DUMMY_LIVESTREAM : (invitation.livestreamSettings || {}));
  const showDresscode = previewFeatureEnabled(features.dresscodeEnabled, editorPreview, false);
  const showLivestream = previewFeatureEnabled(features.livestreamEnabled, editorPreview, false);
  const showGift = previewFeatureEnabled(features.giftEnabled, editorPreview, false);
  const showIgFilter = previewFeatureEnabled(features.igFilterEnabled, editorPreview, false);
  const igFilterUrl = theme.igFilterUrl || (editorPreview ? '#' : '');
  const brideName = profile.brideName || 'Arunika';
  const groomName = profile.groomName || 'Deva';
  const bridePhoto = resolveImageUrl(profile.bridePhoto || DUMMY_BRIDE_PHOTO);
  const groomPhoto = resolveImageUrl(getGroomPhoto(profile.groomPhoto));
  const templateCovers = resolveTemplateCovers(theme, {
    opening: uploadedProfilePhoto(profile.bridePhoto),
    main: uploadedProfilePhoto(profile.groomPhoto) || uploadedProfilePhoto(profile.bridePhoto),
  });
  const coverPhoto = resolveImageUrl(templateCovers.opening);
  const mainCoverPhoto = resolveImageUrl(templateCovers.main);
  const mainEvent = events[0];
  const countdown = useCountdown(mainEvent?.date || invitation.weddingDate, mainEvent?.startTime);
  const calendarUrl = useCalendarUrl(mainEvent?.date, mainEvent?.startTime, mainEvent?.endTime, mainEvent?.venueName, `Pernikahan ${brideName} & ${groomName}`, mainEvent?.address);
  const customLogo = features.customLogoEnabled !== false && theme.customLogoUrl;
  const guestCode = searchParams.get('code');
  const matchedGuest = invitation.guests?.find((item) => item.code === guestCode || item.id === guestCode);
  const guest = previewGuest || matchedGuest;
  const guestName = guest?.name || 'Tamu Undangan';
  const quote = resolveInvitationQuote(invitation.quoteSettings);
  const previewStory = resolvePreviewStory(theme.mainStory, timeline, editorPreview);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), customLogo ? 1200 : 0);
    return () => clearTimeout(timer);
  }, [customLogo]);

  const dateLabel = useMemo(() => formatDate(mainEvent?.date || invitation.weddingDate), [mainEvent?.date, invitation.weddingDate]);
  const dressItems = theme.dresscodeDetails?.items || [{ title: 'Wanita', desc: 'Formal', colors: ['#e9e2d5', '#b8aa96'] }, { title: 'Pria', desc: 'Formal', colors: ['#262626', '#7e766c'] }];

  return <div className="seraya template-wrapper-dynamic" tabIndex={0} aria-label="Konten undangan Seraya yang dapat digulir" style={{ '--sy-paper': theme.background?.primary || '#f4f1ea', '--sy-soft': theme.background?.secondary || '#dedbd2', '--sy-ink': theme.bodyText?.primary || '#0a0a0a', '--sy-muted': theme.bodyText?.secondary || '#4a4945', '--sy-accent': theme.button?.primary || '#111111', '--sy-heading': theme.typography?.fontHeading || '"Abril Fatface", serif', '--sy-body': theme.typography?.fontBody || 'Bellefair, serif' }}>
    <FloatingMultimedia invitation={invitation} isOpen={opened} defaultColor="var(--sy-accent)" />
    {customLogo && loading && <div className="seraya-loader"><img className={`loading-${theme.loadingAnimation || 'reveal'}`} src={resolveImageUrl(theme.customLogoUrl)} alt="Logo undangan" /></div>}
    <div className={`seraya-opening ${templateCovers.openingIsArtwork ? 'is-default-artwork' : ''} ${opened ? `is-open opening-${theme.openingAnimation || 'slide-up'}` : ''}`} style={{ backgroundImage: templateCovers.openingIsArtwork ? undefined : `linear-gradient(#15151522,#15151566),url(${coverPhoto})` }}>
      {templateCovers.openingIsArtwork && <div className="seraya-editorial-art" aria-hidden="true">
        <div className="seraya-editorial-masthead"><span>SERAYA</span><small>WEDDING JOURNAL</small></div>
        <span className="seraya-editorial-volume">VOL. 01<br />CELEBRATION EDITION</span>
        <strong className="seraya-editorial-monogram">{brideName[0]}<i>{groomName[0]}</i></strong>
        <span className="seraya-editorial-date">PUBLISHED · {dateLabel}</span>
        <span className="seraya-editorial-barcode">|||| || ||| |||| | |||</span>
      </div>}
      {!templateCovers.openingIsArtwork && <div className="seraya-photo-edition" aria-hidden="true">
        <div className="seraya-photo-masthead"><strong>SERAYA</strong><span>WEDDING JOURNAL</span></div>
        <span className="seraya-photo-issue">CELEBRATION EDITION · № {String(new Date(mainEvent?.date || invitation.weddingDate || '2026-12-20').getFullYear()).slice(-2)}</span>
        <span className="seraya-photo-caption">A PORTRAIT OF TWO SOULS · {dateLabel}</span>
        <i className="seraya-photo-cropmark" />
      </div>}
      <div className="seraya-opening-copy">{customLogo && <img src={resolveImageUrl(theme.customLogoUrl)} alt="Logo" />}<span>THE WEDDING OF</span><h1>{brideName}<br />&amp; {groomName}</h1><p>Kepada Yth.</p><strong>{guestName}</strong><button onClick={() => setOpened(true)}>Buka Undangan</button></div>
    </div>

    <main className="seraya-flow">
      <section className="seraya-hero" data-section="cover">
        <div className="seraya-issue"><span>CELEBRATION EDITION</span><strong>№ {String(new Date(mainEvent?.date || invitation.weddingDate || '2026-12-20').getFullYear()).slice(-2)}</strong></div>
        <p className="seraya-side-note">A PORTRAIT OF TWO SOULS · {formatWeekday(mainEvent?.date || invitation.weddingDate)}</p>
        <figure className={`seraya-hero-photo ${templateCovers.mainIsArtwork ? 'is-default-artwork' : ''}`}>
          {templateCovers.mainIsArtwork ? <div className="seraya-default-cover" aria-label={`Monogram ${brideName} dan ${groomName}`}><small>THE WEDDING OF</small><strong>{brideName[0]}<i>&amp;</i>{groomName[0]}</strong><span>{brideName} · {groomName}</span></div> : <img src={mainCoverPhoto} alt={`Cover utama pernikahan ${brideName} dan ${groomName}`} />}
        </figure>
        <div className="seraya-cover-title"><small>THE WEDDING OF</small><h1>{brideName}<i>&amp;</i>{groomName}</h1></div>
        <footer className="seraya-cover-meta"><strong>{formatNumericDate(mainEvent?.date || invitation.weddingDate)}</strong><span>TOGETHER IS<br />A BEAUTIFUL PLACE TO BE</span><em>#{brideName.toLowerCase()}with{groomName.toLowerCase()}</em></footer>
      </section>

      <section className="seraya-quote" data-section="quote"><h2>{quote.source}</h2><blockquote>“{quote.text}”</blockquote></section>

      <section className="seraya-section seraya-profile" data-section="profile"><Header title="MEET THE LOVERS" /><div className="seraya-couple"><Person kind="The Bride" image={bridePhoto} name={brideName} full={profile.brideFullName} parents={`Putri dari ${profile.brideFather || 'Adikara Wicaksana'} & ${profile.brideMother || 'Sekar Ayuningtyas'}`} bio={theme.brideBioEnabled !== false ? (profile.brideBio || (editorPreview ? getDummyBrideBio(brideName) : '')) : ''} ig={profile.brideInstagram || profile.brideIg} /><i>&amp;</i><Person kind="The Groom" image={groomPhoto} name={groomName} full={profile.groomFullName} parents={`Putra dari ${profile.groomFather || 'Bramantya Narendra'} & ${profile.groomMother || 'Ratih Puspitasari'}`} bio={theme.groomBioEnabled !== false ? (profile.groomBio || (editorPreview ? getDummyGroomBio(groomName) : '')) : ''} ig={profile.groomInstagram || profile.groomIg} /></div></section>

      <section className="seraya-section seraya-date" data-section="countdown"><Header kicker="A DATE TO REMEMBER" title="Save the Date" /><SaveTheDate className="save-the-date-seraya" date={mainEvent?.date || invitation.weddingDate} countdown={countdown} calendarUrl={calendarUrl} /></section>

      <section className="seraya-section" data-section="events"><Header kicker="COME AND CELEBRATE" title="Hari Bahagia Kami" /><div className="seraya-events">{events.map((event, index) => <article key={event.id || index}><span>{event.type || `Acara ${index + 1}`}</span><h3>{formatDate(event.date)}</h3><p>{shortTime(event.startTime)}–{shortTime(event.endTime)} WIB</p><strong>{event.venueName}</strong><p>{event.address || event.venueAddress}</p>{(event.googleMapsUrl || event.mapUrl) && <a href={event.googleMapsUrl || event.mapUrl} target="_blank" rel="noreferrer"><i className="fa-solid fa-location-dot" aria-hidden="true"></i> Lihat di Google Maps</a>}</article>)}</div></section>

      {showDresscode && <section className="seraya-section" data-section="dresscode"><Header kicker="WHAT TO WEAR" title="Dresscode" /><p className="seraya-intro">Kami mengharapkan kehadiran Anda dengan mengenakan palet warna berikut.</p><div className="seraya-dress">{dressItems.map((item, index) => <article key={`${item.title}-${index}`}><h3>{item.title}</h3><p>{item.desc}</p><div>{(item.colors || []).map((color) => <i key={color} style={{ background: color }} />)}</div></article>)}</div></section>}

      {features.galleryEnabled !== false && <section className="seraya-section seraya-gallery-section" data-section="gallery"><Header kicker="LOVE IN FRAMES" title="Galeri Perjalanan" /><div className={`seraya-gallery layout-${theme.galleryLayout || 'editorial'} ${galleryCountClasses(photos.length)}`}>{photos.map((url, index) => <button key={url} onClick={() => setLightboxIndex(index)}><img src={url} alt={`Galeri ${index + 1}`} /></button>)}</div>{videos.map((video) => <div className="seraya-video" key={video.id || video.url}><Video url={video.url} /></div>)}</section>}

      {features.rundownEnabled !== false && <section className="seraya-section" data-section="rundown"><Header kicker="ORDER OF EVENT" title="Rundown Acara" /><div className="seraya-rundown">{rundowns.map((item, index) => <article key={item.id || index}><time>{item.time}</time><div><h3>{item.activity || item.title}</h3>{item.description && <p>{item.description}</p>}</div></article>)}</div></section>}

      {(previewStory.mainStory || previewStory.timeline.length) && <section className="seraya-section seraya-story" data-section="story">
        <div className="seraya-story-paper">
          <header className="seraya-story-masthead">
            <div className="seraya-story-edition"><span>THE WEDDING EDITION</span><span>{formatNumericDate(mainEvent?.date || invitation.weddingDate)}</span></div>
            <h2>The Love Chronicle</h2>
            <div className="seraya-story-byline"><span>A STORY OF</span><strong>{brideName} &amp; {groomName}</strong><span>EST. {new Date(mainEvent?.date || invitation.weddingDate || '2026-12-20').getFullYear()}</span></div>
          </header>
          {previewStory.mainStory && <div className="seraya-story-lead"><p>{previewStory.mainStory}</p></div>}
          {previewStory.timeline.length > 0 && <div className="seraya-story-news">
            {previewStory.timeline.map((item, index) => <article key={item.id || index}>
              <div className="seraya-story-meta"><span>CHAPTER {String(index + 1).padStart(2, '0')}</span><time>{formatStoryDate(item.date)}</time></div>
              <h3>{item.title}</h3><p>{item.description}</p>
            </article>)}
          </div>}
          <footer className="seraya-story-footer"><span>OUR STORY · CONTINUED FOREVER</span><span>UNDANGANMANTEN</span></footer>
        </div>
      </section>}

      {showLivestream && <section className="seraya-section" data-section="livestream"><Header kicker="WATCH FROM ANYWHERE" title="Live Streaming" /><p className="seraya-intro">Bagi keluarga dan sahabat yang belum dapat hadir secara langsung.</p><LivestreamCard className="livestream-card-seraya" url={livestream.url} coverImage={resolveImageUrl(livestream.coverImageUrl || mainCoverPhoto)} /></section>}

      {showIgFilter && <section className="seraya-section seraya-ig-filter" data-section="igFilter"><Header kicker="SHARE THE MOMENT" title="Instagram Filter" />{theme.igFilterImageUrl && <img src={resolveImageUrl(theme.igFilterImageUrl)} alt="Pratinjau filter Instagram" />}<p className="seraya-intro">Abadikan momen pernikahan kami dengan filter khusus di Instagram.</p><a className="seraya-button" href={igFilterUrl || '#'} target={igFilterUrl && igFilterUrl !== '#' ? '_blank' : undefined} rel={igFilterUrl && igFilterUrl !== '#' ? 'noreferrer' : undefined} onClick={!igFilterUrl || igFilterUrl === '#' ? (event) => event.preventDefault() : undefined}>Coba Filter</a></section>}

      {features.rsvpEnabled !== false && <section className="seraya-section seraya-form" data-section="rsvp"><Header kicker="BE OUR GUEST" title="Konfirmasi Kehadiran" /><PublicForms invitation={invitation} previewGuest={guest} templateStyle="seraya" previewMode={editorPreview} formType="rsvp" /></section>}

      {showGift && <section className="seraya-section seraya-form" data-section="gift"><Header kicker="A TOKEN OF LOVE" title="Tanda Kasih" />{giftReady ? <GiftSection gift={{ ...gifts, bankAccounts: banks }} accent={theme.button?.primary || '#111111'} templateStyle="seraya" /> : <p className="seraya-placeholder">Informasi rekening atau alamat hadiah akan tampil di sini.</p>}</section>}

      {features.wishesEnabled !== false && <section className="seraya-section seraya-form" data-section="wishes"><Header kicker="WARM WORDS" title="Ucapan & Doa" /><PublicForms invitation={invitation} previewGuest={guest} templateStyle="seraya" previewMode={editorPreview} formType="wishes" /></section>}

      <footer className="seraya-footer" data-section="footer"><span>THANK YOU</span><h2>{brideName} &amp; {groomName}</h2><p>{theme.closingText || 'Merupakan kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.'}</p><strong>{dateLabel}</strong><small>UndanganManten</small></footer>
    </main>
    {lightboxIndex !== null && <Lightbox mediaList={[...photos.map((url) => ({ type: 'photo', url })), ...videos]} currentIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />}
  </div>;
}

function Header({ kicker, title }) { return <header className="seraya-header"><span>{kicker}</span><h2>{title}</h2></header>; }
function Person({ kind, image, name, full, parents, bio, ig }) { return <article><div><img src={image} alt={name} /></div><span>{kind}</span><h3>{name}</h3><strong>{full || name}</strong><p>{parents}</p>{bio && <p>{bio}</p>}{ig && <a href={String(ig).startsWith('http') ? ig : `https://instagram.com/${String(ig).replace('@', '')}`} target="_blank" rel="noreferrer"><i className="fa-brands fa-instagram" aria-hidden="true"></i><span>@{String(ig).split('/').filter(Boolean).pop().replace('@', '')}</span></a>}</article>; }
function Video({ url = '' }) { const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/); return match ? <iframe src={`https://www.youtube.com/embed/${match[1]}`} title="Video pernikahan" allowFullScreen /> : <CenteredVideoPlayer src={resolveImageUrl(url)} />; }
function shortTime(value) { return value ? String(value).slice(0, 5) : '--:--'; }
function formatDate(value) { if (!value) return 'Minggu, 20 Desember 2026'; return new Date(value).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
function formatNumericDate(value) { const date = value ? new Date(value) : new Date('2026-12-20'); return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }); }
function formatWeekday(value) { const date = value ? new Date(value) : new Date('2026-12-20'); return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(); }
function formatStoryDate(value) { if (!value) return 'A MOMENT TO REMEMBER'; const date = new Date(value); return Number.isNaN(date.getTime()) ? String(value).toUpperCase() : date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase(); }
