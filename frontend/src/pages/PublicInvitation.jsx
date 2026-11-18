import LoadingScreen from '../components/atelier/LoadingScreen.jsx';
import Brand, { Flower } from '../components/atelier/Brand.jsx';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import './public-guest-access.css';
import PhonePreview from '../components/PhonePreview.jsx';

export default function PublicInvitation() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const guestId = searchParams.get('g') || searchParams.get('to');

  const [invitation, setInvitation] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [previewGuest, setPreviewGuest] = useState(null);
  const [locked, setLocked] = useState(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const publicPath = '/invitations/public/' + encodeURIComponent(slug);
  const options = { withCredentials: true, notification: false };

  useEffect(() => {
    let active = true;
    setInvitation(null);
    setNotFound(false);
    setPreviewGuest(null);
    setLocked(null);
    setError('');
    const request = { ...options, params: { g: guestId } };
    api.get(publicPath, request)
      .then(async ({ data }) => {
        if (!active) return;
        if (data.locked?.canOpen && guestId) {
          try {
            await api.post(publicPath + '/access', {}, request);
          } catch (failure) {
            // Another browser may have claimed the link since the initial GET.
            if (failure.response?.status !== 409 && failure.response?.status !== 404) throw failure;
          }
          if (!active) return;
          ({ data } = await api.get(publicPath, request));
          if (data.locked?.canOpen) throw new Error('Browser session unavailable');
        }
        if (!active) return;
        if (data.locked) {
          setLocked(data.locked);
          return;
        }
        const invitedGuest = data.guest
          ? { ...data.guest, linkToken: guestId }
          : guestId
          ? await api.get(publicPath + '/guest/' + encodeURIComponent(guestId), options)
              .then(response => ({ ...response.data.guest, linkToken: guestId })).catch(() => null)
          : null;
        if (!active) return;
        setPreviewGuest(invitedGuest);
        setInvitation(data.invitation);
        const profile = data.invitation?.coupleProfile;
        if (profile) document.title = `The Wedding of ${profile.brideName || 'Bride'} & ${profile.groomName || 'Groom'} — Samavaya`;
        try {
          const visitKey = `um_visit_${slug}`;
          if (!sessionStorage.getItem(visitKey)) {
            sessionStorage.setItem(visitKey, '1');
            api.post(`/invitations/public/${slug}/visit`, undefined, { notification: false })
              .catch(() => sessionStorage.removeItem(visitKey));
          }
        } catch { /* Visit tracking is optional. */ }
      })
      .catch(failure => {
        if (!active) return;
        if (failure.response?.status === 404) setNotFound(true);
        else setError('Undangan belum bisa dimuat. Coba muat ulang halaman.');
      });
    return () => { active = false; };
  }, [slug, guestId, revision]);

  if (locked) {
    const { brideName, groomName } = locked.profile || {};
    return (
      <main className="private-invitation">
        <section className="private-invitation-letter" aria-labelledby="private-invitation-title">
          <Flower />
          <p className="atelier-eyebrow">UNDANGAN PRIBADI</p>
          <h1 id="private-invitation-title">{brideName && groomName ? <>{brideName} <em>&amp;</em> {groomName}</> : 'Undangan pernikahan'}</h1>
          {locked.guestName && <p>Kepada Yth. <strong>{locked.guestName}</strong></p>}
          <p className="private-invitation-notice" role="alert">{locked.message}</p>
        </section>
      </main>
    );
  }

  if (error) return (
    <main className="private-invitation">
      <section>
        <p role="alert">{error}</p>
        <button className="lp-btn-seal" type="button" onClick={() => setRevision(value => value + 1)}>Muat ulang</button>
      </section>
    </main>
  );

  if (!invitation && !notFound) return <LoadingScreen label="Memuat undangan…" />;

  if (notFound) {
    return <div className="atelier-app atelier-empty-page"><Brand/><main><Flower/><span className="atelier-eyebrow">SEBUAH KABAR BAHAGIA</span><h1>{notFound ? <>Halaman ini<br/><em>belum bisa dibuka.</em></> : <>Mempersiapkan<br/><em>lembar cerita…</em></>}</h1><p>{notFound ? 'Tautan mungkin salah ketik atau undangan sudah tidak aktif. Periksa kembali tautan dari pengirim.' : 'Sebentar, undangan untukmu sedang dimuat.'}</p>{notFound && <Link to="/" className="lp-btn-seal">Kembali ke beranda </Link>}</main></div>;
  }

  return (
    <div onClick={event => {
      if (!event.nativeEvent.isTrusted || !event.target.closest('[data-open-cover]') || !matchMedia('(pointer: coarse)').matches) return;
      if (!document.fullscreenElement && document.fullscreenEnabled) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      }
    }} className="published-invitation-viewport">
      <PhonePreview invitation={invitation} previewGuest={previewGuest} />
    </div>
  );
}
