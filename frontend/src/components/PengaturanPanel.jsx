import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormDraft } from '../hooks/useFormDraft.js';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function PengaturanPanel({ invitation, onUpdated, onDeleted }) {
  const { t } = useTranslation();

  const [savingSlug, setSavingSlug] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const draftKeySlug = `draft_pengaturan_slug_${invitation?.id}`;
  const [slug, setSlug, clearDraftSlug] = useFormDraft(draftKeySlug, invitation?.slug || '');
  
  const { toast, confirm } = useUI();

  if (!invitation) return null;

  async function saveSlug() {
    if (!slug || slug.trim() === '') {
      toast.error('Tautan URL tidak boleh kosong.');
      return;
    }
    setSavingSlug(true);
    try {
      const res = await api.patch(`/invitations/${invitation.id}`, {
        slug: slug.trim(),
      });
      onUpdated({ ...invitation, slug: res.data.invitation.slug });
      clearDraftSlug();
      toast.success('Tautan berhasil disimpan!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengubah tautan URL (mungkin nama sudah dipakai).');
    } finally {
      setSavingSlug(false);
    }
  }

  // Handlers

  // Handler Hapus Undangan
  async function handleDelete() {
    const bride = invitation.coupleProfile?.brideName || 'Wanita';
    const groom = invitation.coupleProfile?.groomName || 'Pria';

    const isConfirmed = await confirm(
      'Hapus Undangan',
      `Apakah Anda yakin ingin menghapus undangan "${bride} & ${groom}"? Data yang dihapus tidak dapat dikembalikan.`,
      { danger: true }
    );

    if (!isConfirmed) return;

    setDeleting(true);
    try {
      await api.delete(`/invitations/${invitation.id}`);
      if (onDeleted) onDeleted(invitation.id);
      toast.success('Undangan berhasil dihapus.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus undangan.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="panel-content">
      <h2 className="panel-header">Sistem URL & Pengaturan Lanjut</h2>
      <p className="panel-sub">Atur URL undangan atau hapus undangan di sini.</p>

      <div className="section-block">
        <div className="section-title">Tautan URL Undangan (Slug)</div>
        <div className="stack">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>undanganmanten.id/</span>
            <input
              className="text-input"
              value={typeof slug === 'string' ? slug : ''}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="nama-kamu"
              style={{ flex: 1, margin: 0 }}
            />
          </div>
          <Button variant="primary" onClick={saveSlug} isLoading={savingSlug} disabled={slug === invitation.slug}>
            Simpan Tautan
          </Button>
        </div>
      </div>

      {/* Area Danger Zone untuk Hapus Undangan */}
      <div className="section-block" style={{ border: '1px solid #ff4d4f', padding: '15px', borderRadius: '8px', marginTop: '30px', background: '#fff5f5' }}>
        <div className="section-title" style={{ color: '#ff4d4f' }}>Area Berbahaya</div>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
          Menghapus undangan ini akan menghapus seluruh data terkait (profil, acara, galeri, daftar tamu, dan ucapan) secara permanen.
        </p>
        <Button
          type="button"
          variant="danger"
          onClick={handleDelete}
          isLoading={deleting}
          style={{ background: '#ff4d4f', color: 'white' }}
        >
          Hapus Undangan Ini
        </Button>
      </div>
    </div>
  );
}
