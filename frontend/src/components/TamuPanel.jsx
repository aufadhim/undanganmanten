import { whatsappTemplates } from '../utils/whatsappTemplates.js';
import { normalizeWhatsAppPhone } from '../utils/whatsapp.js';
import GuestCheckIn from './GuestCheckIn.jsx';
import WishesPanel from './WishesPanel.jsx';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormDraft } from '../hooks/useFormDraft.js';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import TamuTableModal from './TamuTableModal.jsx';
import ScannerModal from './ScannerModal.jsx';
import Papa from 'papaparse';
import { useUI } from '../context/UIContext.jsx';

export default function TamuPanel({ invitation, onUpdated, onSelectPreviewGuest, onLivePreview, autoPreview=true, fullPage=false }) {
  const { t } = useTranslation();
  const [guestTab,setGuestTab]=useState(()=>new URLSearchParams(location.search).has('checkin')?'checkin':'list');
  const [checkinGuest,setCheckinGuest]=useState('');
  const [permissions,setPermissions]=useState(null);
  const [browserLock, setBrowserLock] = useState(false);
  const [accessBusy, setAccessBusy] = useState(false);
  const hasQrGuestbook = invitation?.orders?.some((order) => Array.isArray(order.addons) && order.addons.includes('QR_GUESTBOOK')&&order.status==='SUCCESS');
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
  const defaultWaTemplate = whatsappTemplates.Netral;
  const [waTemplate, setWaTemplate] = useState(invitation?.themeSettings?.waTemplate || defaultWaTemplate);
  const [savingWa, setSavingWa] = useState(false);
  const [waPreset, setWaPreset] = useState('');
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
    return api
      .get('/invitations/me/guests',{headers:{'x-invitation-id':invitation.id}})
      .then((res) => {
        const list = res.data?.guests || [];
        setGuests(list);
        setBrowserLock(res.data.browserLock);
        setPermissions(res.data.entitlements||null);
        if (autoPreview && list.length > 0 && onSelectPreviewGuest && !activePreviewId) {
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
      loadGuests();window.dispatchEvent(new Event('refresh_dashboard'));

      if (autoPreview && newGuest && onSelectPreviewGuest) {
        onSelectPreviewGuest(newGuest);
        setActivePreviewId(newGuest.id);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menambahkan tamu.');
    }
  }

  // Import CSV / Excel
  const [importing, setImporting] = useState(false);
  async function downloadGuestTemplate() {
    try {
      const XLSX = await import('@e965/xlsx');
      const sheet = XLSX.utils.aoa_to_sheet([
        ['Nama', 'No HP', 'Kategori'],
        ['Ayu Pratama', '', 'Teman Kuliah'],
        ['Keluarga Bapak Budi', '', 'Keluarga'],
      ]);
      sheet['!cols'] = [{ wch: 32 }, { wch: 22 }, { wch: 24 }];
      for (let row = 2; row <= 100; row++) {
        sheet[`B${row}`] = { t: 's', v: '', z: '@' };
      }
      sheet['!ref'] = 'A1:C100';
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'Daftar Tamu');
      XLSX.writeFile(workbook, 'contoh-daftar-tamu-samavaya.xlsx');
    } catch {
      toast.error('Contoh Excel belum bisa diunduh. Coba lagi.');
    }
  }
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
    await loadGuests();window.dispatchEvent(new Event('refresh_dashboard'));
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
      loadGuests();window.dispatchEvent(new Event('refresh_dashboard'));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui tamu.');
    }
  }

  async function handleDelete(id) {
    const isConfirmed = await confirm('Hapus tamu dari pernikahan?', 'Tamu ini beserta RSVP dan check-in akan dihapus dari semua desain dalam pernikahan yang sama.');
    if (!isConfirmed) return;
    try {
      await api.delete(`/invitations/me/guests/${id}`);
      loadGuests();window.dispatchEvent(new Event('refresh_dashboard'));
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

  async function saveBrowserAccess(action, guest) {
    const settings = { headers: { 'x-invitation-id': invitation.id }, notification: false };
    if (action === 'toggle' && !await confirm(
      browserLock ? 'Matikan kunci browser?' : 'Aktifkan kunci browser?',
      browserLock ? 'Isi undangan akan bisa diakses melalui tautan umum.' : 'Tamu perlu tautan pribadi. Tautan langsung dikunci ke browser pertama yang membukanya.',
    )) return;
    if (action === 'rotate' && !await confirm('Ganti tautan pribadi?', 'Tautan lama dan akses browser tamu ini akan dicabut. Salin dan bagikan tautan yang baru.')) return;
    if (action === 'reset' && !await confirm('Reset akses browser?', 'Tautan tetap sama dan bisa diaktifkan kembali dari browser pertama yang membukanya.')) return;
    setAccessBusy(true);
    try {
      if (action === 'toggle') {
        await api.patch('/invitations/me/browser-lock', { enabled: !browserLock }, settings);
      } else {
        await api.patch('/invitations/me/guests/' + guest.id + '/browser-access', { action }, settings);
      }
      await loadGuests();
      toast.success(action === 'rotate' ? 'Tautan baru siap disalin.' : 'Akses undangan diperbarui.');
    } catch (failure) {
      toast.error(failure.response?.data?.error || 'Akses belum bisa diperbarui.');
    } finally {
      setAccessBusy(false);
    }
  }

  function getGuestUrl(guest) {
    const slug = invitation?.slug || 'undangan';
    return `${window.location.origin}/${slug}?g=${guest.linkToken || guest.id}`;
  }

  function handleCopyLink(guest) {
    const link = getGuestUrl(guest);
    navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className={`panel-content ${fullPage?'guest-full-page':''}`}>
      <h2 className="panel-header">{t('panels.tamu_title') || 'Daftar Tamu & Link Undangan'}</h2>
      <p className="panel-sub">
        Kelola siapa saja yang diundang, atur pesan WhatsApp (*Smart WA*), dan pantau RSVP tamu.
      </p>
      {fullPage&&<nav className="guest-hub-tabs" role="tablist" aria-label="Kelola tamu">{[['list','Daftar tamu'],['distribution','Undangan & WhatsApp'],['rsvp','RSVP'],['checkin','Buku tamu & QR'],['wishes','Ucapan & doa']].map(([id,label])=><button type="button" key={id} role="tab" aria-selected={guestTab===id} onClick={()=>setGuestTab(id)}>{label}</button>)}</nav>}
      {fullPage&&guestTab==='wishes'&&<WishesPanel invitation={invitation} onUpdated={onUpdated}/>}
      {fullPage&&guestTab==='checkin'&&<GuestCheckIn invitation={invitation} guests={guests} initialGuestId={checkinGuest} enabled={permissions?.qrGuestbook??hasQrGuestbook} onUpdated={loadGuests}/>}
      {fullPage && guestTab === 'rsvp' && <section className="guest-hub-note">
        <h3>Ringkasan RSVP</h3>
        <p>Hadir <strong>{guests.filter(guest => guest.rsvp?.attending === true).length}</strong>
          {' · '}Tidak hadir <strong>{guests.filter(guest => guest.rsvp?.attending === false).length}</strong>
          {' · '}Belum menjawab <strong>{guests.filter(guest => !guest.rsvp).length}</strong></p>
        <Button type="button" variant="secondary" onClick={() => setGuestTab('list')}>Lihat jawaban per tamu</Button>
      </section>}
      <details hidden={fullPage&&guestTab!=='rsvp'} className="guest-rsvp-details" open>{fullPage&&<summary>Aturan RSVP</summary>}
        <div className="section-title">Aturan RSVP</div>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 12px' }}>RSVP diaktifkan melalui Susunan &amp; Blok dan hanya dapat diisi melalui link pribadi tamu.</p>
        <label className="field-label">Batas waktu RSVP (opsional)</label>
        <input className="text-input" type="datetime-local" value={rsvpSettings.deadline} onChange={(e) => setRsvpSettings((s) => ({ ...s, deadline: e.target.value }))} />
        <Button type="button" variant="secondary" onClick={saveRsvpSettings} style={{ marginTop: 10 }}>Simpan Aturan RSVP</Button>
      </details>

      <div className="guest-tools" style={{ marginBottom: 20, display: fullPage?'none':'flex', gap: 10 }}>
        <Button
          variant="secondary"
          style={{ flex: 1, display: fullPage?'none':undefined }}
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
      {fullPage && guestTab === 'distribution' && <section className="guest-hub-note">
        <h3>Kunci browser pertama</h3>
        <p>Batasi isi undangan ke browser pertama yang membuka setiap tautan pribadi.</p>
        <Button type="button" variant="secondary" disabled={accessBusy} onClick={() => saveBrowserAccess('toggle')}>
          {browserLock ? 'Matikan kunci browser' : 'Aktifkan kunci browser'}
        </Button>
        {browserLock && <div className="guest-desk-list">
          {guests.map(guest => <div key={guest.id}>
            <span><strong>{guest.name}</strong><small>{guest.browserActive ? 'Akses aktif' : 'Belum dibuka'}</small></span>
            <button type="button" onClick={() => handleCopyLink(guest)}>{copiedId === guest.id ? 'Tersalin' : 'Salin tautan'}</button>
            <button type="button" disabled={accessBusy || !guest.browserActive} onClick={() => saveBrowserAccess('reset', guest)}>Reset akses</button>
            <button type="button" disabled={accessBusy} onClick={() => saveBrowserAccess('rotate', guest)}>Ganti tautan</button>
          </div>)}
        </div>}
      </section>}
      <details hidden={fullPage&&guestTab!=='distribution'} className="guest-wa-details" open>{fullPage&&<summary>Template pesan WhatsApp</summary>}
        <div className="section-title">Template Pesan WhatsApp</div>
        <p style={{ fontSize: '12px', color: 'var(--ui-muted, #666)', marginBottom: '8px' }}>
          Gunakan variabel <strong>[Nama Tamu]</strong> dan <strong>[Link Undangan]</strong>. Sistem akan otomatis menggantinya.
        </p>
        <div className="guest-hub-tabs">
          <label className="field-label">
            Versi pesan
            <select className="text-input" value={waPreset} onChange={event => {
              const preset = event.target.value;
              setWaPreset(preset);
              setWaTemplate(whatsappTemplates[preset]);
            }}>
              <option value="" disabled>Pilih versi pesan</option>
              {Object.keys(whatsappTemplates).map(label => <option key={label}>{label}</option>)}
            </select>
          </label>
        </div>
        <textarea
          aria-label="Isi pesan WhatsApp"
          className="text-area"
          maxLength={2000}
          value={waTemplate}
          onChange={(e) => setWaTemplate(e.target.value)}
          rows={10}
        />
        <Button variant="primary" onClick={handleSaveWaTemplate} isLoading={savingWa} style={{ marginTop: '8px' }}>
          Simpan Template
        </Button>
      </details>

      {/* FORM TAMBAH TAMU */}
      <form hidden={fullPage&&guestTab!=='list'} onSubmit={handleAdd} className="stack guest-add-form" style={{ marginBottom: 20 }}>
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
            style={{ background: 'var(--ui-card, #fff)' }}
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

        <div className="guest-add-actions">
          <Button variant="primary" type="submit">
            <i className="fa-solid fa-user-plus"></i> {t('panels.add_guest') || 'Tambah Tamu'}
          </Button>

        </div>
        <section className="guest-import-box" aria-label="Impor daftar tamu">
          <div>
            <strong>Impor daftar tamu</strong>
            <p>Unduh contoh Excel dan ganti nama pada baris contoh. Pertahankan judul kolom <code>Nama</code>, <code>No HP</code>, dan <code>Kategori</code>. Nomor HP dan kategori boleh kosong.</p>
          </div>
          <div className="guest-import-actions">
            <button type="button" className="guest-import-control" onClick={downloadGuestTemplate}><i className="fa-solid fa-download" aria-hidden="true" /> Unduh contoh Excel</button>
            <label className="guest-import-control">
              <i className={importing ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-arrow-up'} aria-hidden="true" />
              {importing ? 'Mengimpor…' : 'Impor CSV / Excel'}
              <input type="file" accept=".csv,.xls,.xlsx" aria-label="Impor CSV atau Excel" onChange={handleImportGuests} disabled={importing} />
            </label>
          </div>
        </section>
      </form>

      {fullPage && <section hidden={guestTab !== 'distribution'} aria-label="Antrean WhatsApp">
        <div className="guest-hub-note">
          <h3>Antrean WhatsApp</h3>
          <p>Pilih kelompok atau cari nama untuk menyiapkan pesan undangan. Pesan dikirim satu per satu dari WhatsApp.</p>
        </div>
        <TamuTableModal embedded mode="distribution" guests={guests} waTemplate={waTemplate}
          invitationSlug={invitation.slug} onUpdateStatus={loadGuests} />
      </section>}
      {fullPage && guestTab === 'list' && <TamuTableModal embedded mode="directory" guests={guests} waTemplate={waTemplate} invitationSlug={invitation.slug} onEditGuest={handleStartEdit} onDeleteGuest={handleDelete} onRequestCheckin={id=>{setCheckinGuest(id);setGuestTab('checkin')}} onUpdateStatus={loadGuests}/>}
      {/* LIST DAFTAR TAMU */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {guests.filter(guest=>!fullPage||(guestTab === 'list' && editingGuestId === guest.id)).map((guest) => {
          const isEditing = editingGuestId === guest.id;
          const isPreviewing = activePreviewId === guest.id;
          const guestUrl = getGuestUrl(guest);

          let msg = waTemplate;
          msg = msg.replace(/\[Nama Tamu\]/g, guest.name);
          msg = msg.replace(/\[Link Undangan\]/g, guestUrl);
          msg = msg.replace(/\[Kategori Tamu\]/g, guest.groupName || 'Umum');

          const cleanPhone = normalizeWhatsAppPhone(guest.phone);
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
                borderLeft: isPreviewing ? '4px solid var(--wine, #7a2436)' : '1px solid var(--line, #e3d6b4)',
                background: isPreviewing ? 'var(--dashboard-active, #faf3e3)' : 'var(--ui-card, #ffffff)',
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
                      style={{ fontSize: '12px', padding: '6px 8px', background: 'var(--ui-card, #fff)' }}
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
                        {guest.name} {isPreviewing && <span style={{ fontSize: '10px', color: 'var(--ui-danger-ink, #7a2436)' }}>(Preview)</span>}
                      </strong>
                      <div style={{ fontSize: '11px', color: 'var(--ui-muted, #666)', marginTop: '2px' }}>
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
          waTemplate={waTemplate}
          invitationSlug={invitation.slug}
          onEditGuest={handleStartEdit}
          onDeleteGuest={handleDelete}
          onRequestCheckin={id=>{setCheckinGuest(id);setGuestTab('checkin')}} onUpdateStatus={loadGuests}
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
