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
  const [guests, setGuests] = useState([]);
  const [rsvpEnabled, setRsvpEnabled] = useState(invitation?.invitationFeatures?.rsvpEnabled || false);

  const packageType = invitation?.packageType || 'TRIAL';
  const maxGuests = packageType === 'TRIAL' ? 10 : (packageType === 'PRO' ? 100 : Infinity);

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

    if (guests.length >= maxGuests) {
      toast.error(`Batas maksimum daftar tamu untuk paket ${packageType} adalah ${maxGuests}. Silakan upgrade paket Anda.`);
      return;
    }

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

  // Import CSV
  const [importing, setImporting] = useState(false);
  function handleImportCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const guestsData = results.data.map(row => ({
            name: row.Nama || row.name || row.Name,
            phone: row['No HP'] || row.phone || row.Phone || '',
            category: row.Kategori || row.category || row.Category || 'Umum'
          })).filter(g => g.name); // Hanya ambil yang ada namanya

          if (guestsData.length === 0) {
            toast.error('Tidak ada data yang valid untuk diimport. Pastikan header CSV adalah: Nama, No HP, Kategori');
            setImporting(false);
            return;
          }

          if (guests.length + guestsData.length > maxGuests) {
            toast.error(`Import gagal. Total tamu akan melebihi batas maksimum paket ${packageType} (${maxGuests} tamu).`);
            setImporting(false);
            return;
          }

          const res = await api.post('/invitations/me/guests/bulk', { guests: guestsData });
          toast.success(res.data.message || 'Import berhasil!');
          loadGuests();
        } catch (err) {
          toast.error('Gagal mengimport tamu dari CSV.');
        } finally {
          setImporting(false);
          e.target.value = null; // reset input
        }
      },
      error: () => {
        toast.error('Gagal membaca file CSV.');
        setImporting(false);
        e.target.value = null;
      }
    });
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
            if (packageType === 'PREMIUM') {
              setIsScannerOpen(true);
            } else {
              toast.error('Fitur QR Code Scanner Buku Tamu hanya tersedia untuk Paket Premium.');
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
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
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <Button variant="secondary" type="submit" style={{ flex: 1 }}>
            <i className="fa-solid fa-user-plus"></i> {t('panels.add_guest') || 'Tambah Tamu'}
          </Button>

          <label style={{ flex: 1 }}>
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              padding: '12px 16px', background: '#e3f2fd', color: '#1976d2', borderRadius: '8px',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer', height: '100%'
            }}>
              {importing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-csv"></i>}
              {importing ? 'Mengimpor...' : 'Import CSV'}
            </div>
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportCSV} disabled={importing} />
          </label>
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