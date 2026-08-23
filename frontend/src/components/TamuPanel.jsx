import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormDraft } from '../hooks/useFormDraft.js';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import TamuTableModal from './TamuTableModal.jsx';
import ScannerModal from './ScannerModal.jsx';
import Papa from 'papaparse';
import { useUI } from '../context/UIContext.jsx';

export default function TamuPanel({ invitation, onUpdated, onSelectPreviewGuest, onLivePreview }) {
  const { t } = useTranslation();
  const hasQrGuestbook = invitation?.orders?.some((order) => Array.isArray(order.addons) && order.addons.includes('QR_GUESTBOOK'));
  const [guests, setGuests] = useState([]);
  const [rsvpEnabled, setRsvpEnabled] = useState(invitation?.invitationFeatures?.rsvpEnabled || false);
  const [rsvpSettings, setRsvpSettings] = useState({ openToPublic: false, deadline: invitation?.rsvpDeadline?.slice?.(0, 16) || '' });

  const draftKeyTamu = `draft_tamu_add_${invitation?.id}`;
  const [form, setForm, clearDraftTamu] = useFormDraft(draftKeyTamu, {
    name: '',
    phone: '',
    category: 'Umum',
    paxLimit: 2,
  });

  const [blasting, setBlasting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activePreviewId, setActivePreviewId] = useState(null);

  // State untuk Mode Edit Inline
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', category: 'Umum' });

  // State untuk Template WA
  const defaultWaTemplate = `Kepada Yth. [Nama Tamu],\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk menghadiri pernikahan kami.\n\nTautan undangan:\n[Link Undangan]\n\nTerima kasih.`;
  const [waTemplate, setWaTemplate] = useState(invitation?.themeSettings?.waTemplate || defaultWaTemplate);
  const [savingWa, setSavingWa] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  const { toast, confirm } = useUI();

  useEffect(() => {
    loadGuests();
    if (invitation?.themeSettings?.waTemplate) {
      setWaTemplate(invitation.themeSettings.waTemplate);
    }

    const handleGuestUpdated = () => {
      loadGuests();
    };
    window.addEventListener('guest_updated', handleGuestUpdated);
    return () => window.removeEventListener('guest_updated', handleGuestUpdated);
  }, [invitation?.id, invitation?.themeSettings?.waTemplate]);

  useEffect(() => {
    setRsvpEnabled(invitation?.invitationFeatures?.rsvpEnabled || false);
  }, [invitation?.invitationFeatures]);

  // Handle Toggle RSVP On/Off
  async function handleToggleRsvp() {
      const checked = !rsvpEnabled;
      setRsvpEnabled(checked);
      try {
          await api.patch('/invitations/me/features', { rsvpEnabled: checked });
          const updatedFeatures = { ...invitation.invitationFeatures, rsvpEnabled: checked };
          onUpdated({ ...invitation, invitationFeatures: updatedFeatures });
          if (onLivePreview) {
              onLivePreview({ invitationFeatures: updatedFeatures });
          }
      } catch (err) {
          console.error(err);
          setRsvpEnabled(!checked); // revert
          toast.error(err.response?.data?.error || 'Gagal mengubah pengaturan fitur RSVP.');
      }
  }

  async function saveRsvpSettings() {
    try {
      const res = await api.patch(`/invitations/${invitation.id}`, { rsvpOpenToPublic: false, rsvpDeadline: rsvpSettings.deadline || null });
      onUpdated?.(res.data.invitation || { ...invitation, rsvpOpenToPublic: false, rsvpDeadline: rsvpSettings.deadline || null });
      toast.success('Aturan RSVP disimpan.');
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal menyimpan aturan RSVP.'); }
  }

  function loadGuests() {
    api
      .get('/invitations/me/guests')
      .then((res) => {
        const list = res.data?.guests || [];
        setGuests(list);
        if (list.length > 0 && onSelectPreviewGuest && !activePreviewId) {
          onSelectPreviewGuest(list[0]);
          setActivePreviewId(list[0].id);
        }
      })
      .catch((err) => console.error('Gagal memuat tamu:', err));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      const res = await api.post('/invitations/me/guests', {
        name: form.name,
        phone: form.phone,
        paxLimit: Number(form.paxLimit),
        category: form.category,
      });

      const newGuest = res.data?.guest;
      clearDraftTamu();
      // Also reset state manually in case clearDraftTamu doesn't re-render immediately
      setForm({ name: '', phone: '', category: 'Umum', paxLimit: 2 });
      loadGuests();

      if (newGuest && onSelectPreviewGuest) {
        onSelectPreviewGuest(newGuest);
        setActivePreviewId(newGuest.id);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menambahkan tamu.');
    }
  }

  // Import CSV / Excel
  const [importing, setImporting] = useState(false);
  function normalizeGuestRows(rows) {
    return rows.map((row) => ({
      name: String(row.Nama || row.name || row.Name || '').trim(),
      phone: String(row['No HP'] || row['Nomor HP'] || row.phone || row.Phone || '').trim(),
      category: String(row.Kategori || row.category || row.Category || 'Umum').trim() || 'Umum',
    })).filter((guest) => guest.name);
  }

  async function submitImportedGuests(rows, input) {
    const guestsData = normalizeGuestRows(rows);
    if (guestsData.length === 0) {
      throw new Error('Tidak ada data valid. Gunakan header: Nama, No HP, Kategori.');
    }

    const res = await api.post('/invitations/me/guests/bulk', { guests: guestsData });
    toast.success(res.data.message || 'Import berhasil!');
    await loadGuests();
    input.value = '';
  }

  async function handleImportGuests(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let rows;

      if (extension === 'csv') {
        const text = await file.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        if (parsed.errors.length) throw new Error(parsed.errors[0].message);
        rows = parsed.data;
      } else {
        const XLSX = await import('@e965/xlsx');
        const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!firstSheet) throw new Error('Spreadsheet tidak memiliki sheet yang dapat dibaca.');
        rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
      }

      await submitImportedGuests(rows, e.target);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Gagal mengimpor data tamu.');
      e.target.value = '';
    } finally {
      setImporting(false);
    }
  }

  // Mulai Mode Edit
  function handleStartEdit(guest) {
    setEditingGuestId(guest.id);
    setEditForm({
      name: guest.name || '',
      phone: guest.phone || '',
      category: guest.groupName || 'Umum',
    });
  }

  // Simpan Hasil Edit
  async function handleSaveEdit(guestId) {
    if (!editForm.name.trim()) return toast.error('Nama tamu tidak boleh kosong');

    try {
      await api.patch(`/invitations/me/guests/${guestId}`, {
        name: editForm.name,
        phone: editForm.phone,
        category: editForm.category,
      });

      setEditingGuestId(null);
      loadGuests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui tamu.');
    }
  }

  async function handleDelete(id) {
    const isConfirmed = await confirm('Hapus Tamu', 'Yakin ingin menghapus tamu ini?');
    if (!isConfirmed) return;
    try {
      await api.delete(`/invitations/me/guests/${id}`);
      loadGuests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus tamu.');
    }
  }

  function handlePreview(guest) {
    setActivePreviewId(guest.id);
    if (onSelectPreviewGuest) {
      onSelectPreviewGuest(guest);
    }
  }

  async function handleSaveWaTemplate() {
    setSavingWa(true);
    try {
      await api.patch('/themes/me', {
        invitationId: invitation.id,
        waTemplate,
      });
      toast.success('Template WhatsApp berhasil disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan template WhatsApp.');
    } finally {
      setSavingWa(false);
    }
  }

  function getGuestUrl(guest) {
    const slug = invitation?.slug || 'undangan';
    return `${window.location.origin}/${slug}?g=${guest.id}`;
  }

  function handleCopyLink(guest) {
    const link = getGuestUrl(guest);
    navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="panel-content">
      <h2 className="panel-header">{t('panels.tamu_title') || 'Daftar Tamu & Link Undangan'}</h2>
      <p className="panel-sub">
        Kelola siapa saja yang diundang, atur pesan WhatsApp (*Smart WA*), dan pantau RSVP tamu.
      </p>
      <div className="section-block" style={{ marginBottom: 20 }}>
        <div className="section-title">Aturan RSVP</div>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 12px' }}>RSVP diaktifkan melalui Susunan &amp; Blok dan hanya dapat diisi melalui link pribadi tamu.</p>
        <label className="field-label">Batas waktu RSVP (opsional)</label>
        <input className="text-input" type="datetime-local" value={rsvpSettings.deadline} onChange={(e) => setRsvpSettings((s) => ({ ...s, deadline: e.target.value }))} />
        <Button type="button" variant="secondary" onClick={saveRsvpSettings} style={{ marginTop: 10 }}>Simpan Aturan RSVP</Button>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <Button
          variant="secondary"
          style={{ flex: 1 }}
          onClick={() => setIsTableModalOpen(true)}
          icon={<i className="fa-solid fa-expand"></i>}
        >
          Kelola Tamu
        </Button>
        <Button
          variant="primary"
          style={{ flex: 1 }}
          onClick={() => {
            if (hasQrGuestbook) {
              setIsScannerOpen(true);
            } else {
              toast.error('Buku Tamu QR Code Scanner memerlukan add-on Rp20.000.');
            }
          }}
          icon={<i className="fa-solid fa-qrcode"></i>}
        >
          QR Scanner
        </Button>
      </div>

      {/* SMART WA TEMPLATE */}
      <div className="section-block" style={{ marginBottom: 20 }}>
        <div className="section-title">Template Pesan WhatsApp</div>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Gunakan variabel <strong>[Nama Tamu]</strong> dan <strong>[Link Undangan]</strong>. Sistem akan otomatis menggantinya.
        </p>
        <textarea
          className="text-area"
          value={waTemplate}
          onChange={(e) => setWaTemplate(e.target.value)}
          rows={5}
        />
        <Button variant="primary" onClick={handleSaveWaTemplate} isLoading={savingWa} style={{ marginTop: '8px' }}>
          Simpan Template
        </Button>
      </div>

      {/* FORM TAMBAH TAMU */}
      <form onSubmit={handleAdd} className="stack" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: 10 }}>
          <input
            type="text"
            className="text-input"
            placeholder="Keluarga Bpk. Budi"
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            type="text"
            className="text-input"
            placeholder="08123456789"
            value={form.phone}
            onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
          />
          <select
            className="text-input"
            value={form.category}
            onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
            style={{ background: '#fff' }}
          >
            <option value="Umum">Umum</option>
            <option value="Keluarga">Keluarga</option>
            <option value="VIP">VIP</option>
            <option value="Teman Kantor">Teman Kantor</option>
            <option value="Teman Sekolah">Teman Sekolah</option>
            <option value="Teman Kuliah">Teman Kuliah</option>
          </select>
          <select className="text-input" value={form.paxLimit} onChange={(e) => setForm((f) => ({ ...f, paxLimit: Number(e.target.value) }))}><option value="1">Maks. 1 orang</option><option value="2">Maks. 2 orang</option></select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10, alignItems: 'stretch' }}>
          <Button variant="secondary" type="submit" style={{ flex: 1 }}>
            <i className="fa-solid fa-user-plus"></i> {t('panels.add_guest') || 'Tambah Tamu'}
          </Button>

          <label style={{ display: 'flex' }}>
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              padding: '12px 16px', background: '#e3f2fd', color: '#1976d2', borderRadius: '8px',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer', minHeight: '42px', width: '100%', boxSizing: 'border-box'
            }}>
              {importing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-excel"></i>}
              {importing ? 'Mengimpor...' : 'Import CSV / Excel'}
            </div>
            <input type="file" accept=".csv,.xls,.xlsx" style={{ display: 'none' }} onChange={handleImportGuests} disabled={importing} />
          </label>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f7f4ef', fontSize: 12, color: '#675f58' }}>
          <strong>Format file:</strong> baris pertama harus memakai kolom <code>Nama</code>, <code>No HP</code>, dan <code>Kategori</code>. Nama wajib; nomor HP dan kategori boleh kosong. Contoh: <code>Ayu | 08123456789 | Teman Kuliah</code>.
        </div>
      </form>

      {/* LIST DAFTAR TAMU */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {guests.map((guest) => {
          const isEditing = editingGuestId === guest.id;
          const isPreviewing = activePreviewId === guest.id;
          const guestUrl = getGuestUrl(guest);

          let msg = waTemplate;
          msg = msg.replace(/\[Nama Tamu\]/g, guest.name);
          msg = msg.replace(/\[Link Undangan\]/g, guestUrl);
          msg = msg.replace(/\[Kategori Tamu\]/g, guest.groupName || 'Umum');

          const cleanPhone = guest.phone ? guest.phone.replace(/^0/, '62').replace(/[^0-9]/g, '') : '';
          const waLink = cleanPhone
            ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
            : `https://wa.me/?text=${encodeURIComponent(msg)}`;

          const rsvpStatus = guest.rsvp
            ? (guest.rsvp.attending ? `✅ Hadir (${guest.rsvp.guestCount} org)` : '❌ Tidak Hadir')
            : 'Belum RSVP';

          const checkInStatus = guest.checkedIn
            ? `🎟️ Checked In (${new Date(guest.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})`
            : '';

          return (
            <div
              key={guest.id}
              style={{
                borderLeft: isPreviewing ? '4px solid #7a2436' : '1px solid #e3d6b4',
                background: isPreviewing ? '#faf3e3' : '#ffffff',
                padding: '12px',
                borderRadius: '10px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* JIKA DALAM MODE EDIT */}
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    className="text-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Nama Tamu"
                    style={{ fontSize: '12px', padding: '6px 8px' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      className="text-input"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="No. WhatsApp"
                      style={{ fontSize: '12px', padding: '6px 8px' }}
                    />
                    <select
                      className="text-input"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      style={{ fontSize: '12px', padding: '6px 8px', background: '#fff' }}
                    >
                      <option value="Umum">Umum</option>
                      <option value="Keluarga">Keluarga</option>
                      <option value="VIP">VIP</option>
                      <option value="Teman Kantor">Teman Kantor</option>
                      <option value="Teman Sekolah">Teman Sekolah</option>
                      <option value="Teman Kuliah">Teman Kuliah</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingGuestId(null)}
                    >
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSaveEdit(guest.id)}
                    >
                      ✓ Simpan
                    </Button>
                  </div>
                </div>
              ) : (
                /* JIKA TAMPILAN NORMAL */
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: isPreviewing ? '#7a2436' : '#182420', wordBreak: 'break-word' }}>
                        {guest.name} {isPreviewing && <span style={{ fontSize: '10px', color: '#7a2436' }}>(Preview)</span>}
                      </strong>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        {guest.phone || 'Tanpa No. WA'} · <span style={{ fontWeight: '600' }}>[{guest.groupName || 'Umum'}]</span>
                      </div>
                      <div style={{ fontSize: '10px', color: guest.rsvp ? (guest.rsvp.attending ? '#52c41a' : '#ff4d4f') : '#8c8c8c', marginTop: '4px', fontWeight: 'bold' }}>
                        RSVP: {rsvpStatus} {guest.checkedIn && <span style={{ color: '#1890ff', marginLeft: '6px' }}>{checkInStatus}</span>}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(guest)}
                      style={{ color: '#1890ff' }}
                      icon={<i className="fa-solid fa-pen"></i>}
                    >
                      Edit
                    </Button>
                  </div>

                  {/* BARIS TOMBOL AKSI RAPI & TERSTRUKTUR DENGAN GRID 3 KOLOM */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '10px', marginTop: '6px', borderTop: '1px dashed #e3d6b4' }}>
                    <Button
                      type="button"
                      variant={isPreviewing ? "primary" : "secondary"}
                      size="sm"
                      fullWidth
                      onClick={() => handlePreview(guest)}
                      icon={<i className="fa-solid fa-eye"></i>}
                    >
                      Preview
                    </Button>



                    <Button
                      as="a"
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      variant="secondary"
                      size="sm"
                      fullWidth
                      style={{ color: '#25D366', borderColor: '#25D366' }}
                      icon={<i className="fa-brands fa-whatsapp"></i>}
                    >
                      WA
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      fullWidth
                      onClick={() => handleDelete(guest.id)}
                      icon={<i className="fa-solid fa-trash-can"></i>}
                    >
                      Hapus
                    </Button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {isTableModalOpen && (
        <TamuTableModal
          isOpen={isTableModalOpen}
          onClose={() => setIsTableModalOpen(false)}
          guests={guests}
          onUpdated={loadGuests}
        />
      )}

      {isScannerOpen && (
        <ScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
}
