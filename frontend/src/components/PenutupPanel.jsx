import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useUI } from '../context/UIContext.jsx';

export default function PenutupPanel({ invitation, onUpdated, onLivePreview }) {
  const [closingText, setClosingText] = useState(invitation?.themeSettings?.closingText || '');
  const [saving, setSaving] = useState(false);
  const { toast } = useUI();

  useEffect(() => setClosingText(invitation?.themeSettings?.closingText || ''), [invitation?.id]);
  useEffect(() => onLivePreview?.({ themeSettings: { ...(invitation?.themeSettings || {}), closingText } }), [closingText]);

  async function save() {
    setSaving(true);
    try {
      const { data } = await api.patch('/themes/me', { invitationId: invitation.id, closingText });
      onUpdated({ ...invitation, themeSettings: data.themeSettings });
      toast.success('Teks penutup berhasil disimpan.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal menyimpan teks penutup.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="panel-content">
    <h2 className="panel-header">Penutup</h2>
    <p className="panel-sub">Kalimat terakhir undangan. Perubahan tampil langsung pada preview.</p>
    <div className="section-block stack">
      <label className="field">
        <span className="field-label">Teks Penutup</span>
        <textarea rows="5" maxLength="1000" value={closingText} placeholder="Awal dari kisah selamanya" onChange={(event) => setClosingText(event.target.value)} />
      </label>
      <button className="btn-save" type="button" onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Penutup'}</button>
    </div>
  </div>;
}
