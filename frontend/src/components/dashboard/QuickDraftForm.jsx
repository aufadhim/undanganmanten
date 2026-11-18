import { useState } from 'react';
import { api } from '../../api/client.js';

export default function QuickDraftForm({ invitation, onCancel, onSaved }) {
  const event = invitation.events?.find(item => item.type === 'akad') ?? invitation.events?.[0];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const type = event?.type === 'resepsi' ? 'resepsi' : 'akad';

  async function save(e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError('');
    try {
      const { data } = await api.patch('/invitations/me/quick-draft', { ...values, type }, {
        headers: { 'x-invitation-id': invitation.id },
      });
      onSaved({ ...invitation, ...data.invitation });
    } catch (err) {
      setError(err.response?.data?.error || 'Detail belum tersimpan. Coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="workspace-quick-form" onSubmit={save}>
      <h3>Edit cepat</h3>
      <p>Isi nama pasangan dan detail {type}. Pengaturan lainnya tersedia di Studio.</p>
      <fieldset disabled={busy}>
        <label>Nama mempelai wanita<input name="brideName" defaultValue={invitation.coupleProfile?.brideName} maxLength={100} required /></label>
        <label>Nama mempelai pria<input name="groomName" defaultValue={invitation.coupleProfile?.groomName} maxLength={100} required /></label>
        <div className="workspace-quick-time">
          <label>Tanggal<input name="date" type="date" defaultValue={String(event?.date || invitation.weddingDate || '').slice(0, 10)} required /></label>
          <label>Jam mulai<input name="startTime" type="time" defaultValue={event?.startTime || ''} required /></label>
        </div>
        <label>Nama lokasi<input name="venueName" defaultValue={event?.venueName} maxLength={200} required /></label>
        <label>Alamat lengkap<textarea name="address" defaultValue={event?.address} maxLength={1000} rows={2} required /></label>
        {error && <p role="alert">{error}</p>}
        <div className="workspace-quick-actions">
          <button type="submit" className="workspace-primary">{busy ? 'Menyimpan…' : 'Simpan & pratinjau'}</button>
          <button type="button" onClick={onCancel}>Batal</button>
        </div>
      </fieldset>
    </form>
  );
}
