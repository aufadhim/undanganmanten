import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import PhonePreview from '../components/PhonePreview.jsx';

export default function PublicInvitation() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const guestId = searchParams.get('g');

  const [invitation, setInvitation] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [previewGuest, setPreviewGuest] = useState(null);

  useEffect(() => {
    // 1. Fetch public invitation
    api
      .get(`/invitations/public/${slug}`)
      .then((res) => {
          setInvitation(res.data.invitation);
          // 1.b Record visit
          api.post(`/invitations/public/${slug}/visit`).catch(e => console.error(e));
      })
      .catch(() => setNotFound(true));
      
    // 2. Fetch specific guest info if guestId exists
    if (guestId) {
      api.get(`/invitations/public/${slug}/guest/${guestId}`)
        .then((res) => {
           if (res.data.guest) {
             setPreviewGuest(res.data.guest);
           }
        })
        .catch(() => {
           // Fallback if guest not found or invalid
           setPreviewGuest({ id: guestId, name: 'Tamu Spesial' });
        });
    }
  }, [slug, guestId]);

  if (notFound) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>Undangan tidak ditemukan.</div>;
  if (!invitation) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>Memuat undangan...</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
        <PhonePreview invitation={invitation} previewGuest={previewGuest} />
    </div>
  );
}