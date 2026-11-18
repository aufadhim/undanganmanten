import { normalizeWhatsAppPhone } from '../utils/whatsapp.js';
import React, { useState, useMemo, useRef } from 'react';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function TamuTableModal({
  guests,
  embedded=false,
  mode = 'all',
  onClose,
  waTemplate,
  invitationSlug,
  onEditGuest,
  onRequestCheckin,
  onDeleteGuest,
  onUpdateStatus // Callback to update status in parent state
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  
  const { toast } = useUI();
  
  // Broadcast State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastQueue, setBroadcastQueue] = useState([]);
  const [currentBroadcastIndex, setCurrentBroadcastIndex] = useState(0);

  const whatsappTab = useRef(null);
  const [chatOpened, setChatOpened] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Generate unique groups for filter dropdown
  const uniqueGroups = useMemo(() => {
    const groups = guests.map(g => g.groupName || 'Umum');
    return ['All', ...new Set(groups)];
  }, [guests]);

  // Filtered guests based on search and group
  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      const matchSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGroup = groupFilter === 'All' || (g.groupName || 'Umum') === groupFilter;
      return matchSearch && matchGroup;
    });
  }, [guests, searchTerm, groupFilter]);

  // WhatsApp link generator (same as in TamuPanel)
  const generateWaLink = (guest) => {
    if (!guest.phone) return '#';
    const basePhone = normalizeWhatsAppPhone(guest.phone);
    if (!basePhone) return "#";
    const invLink = `${window.location.origin}/${invitationSlug}?g=${guest.linkToken || guest.id}`;
    const txt = (waTemplate || 'Halo [Nama Tamu], ini link undangan: [Link Undangan]')
      .replace(/\[Nama Tamu\]/gi, guest.name)
      .replace(/\[Link Undangan\]/gi, invLink);
    return `https://wa.me/${basePhone}?text=${encodeURIComponent(txt)}`;
  };

  async function toggleCheckIn(guest) {
    try {
      if (guest.checkedIn) await api.delete(`/invitations/me/guests/${guest.id}/checkin`);
      else {onRequestCheckin?.(guest.id);return;}
      window.dispatchEvent(new Event('guest_updated'));
      toast.success(guest.checkedIn ? 'Check-in dibatalkan.' : 'Check-in berhasil.');
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal memperbarui check-in.'); }
  }

  // BROADCAST LOGIC
  const startBroadcast = () => {
    // Only queue guests that haven't been sent yet and have a phone number
    const pendingGuests = filteredGuests.filter(g => !['sent', 'opened'].includes(g.inviteStatus) && normalizeWhatsAppPhone(g.phone));
    if (pendingGuests.length === 0) {
      toast.info('Semua tamu di filter ini sudah dikirimi pesan atau tidak memiliki nomor WA.');
      return;
    }
    setBroadcastQueue(pendingGuests);
    setCurrentBroadcastIndex(0);
    setIsBroadcasting(true);
    openBroadcastChat(pendingGuests[0]);
  };

  const cancelBroadcast = () => {
    setIsBroadcasting(false);
    setBroadcastQueue([]);
    setChatOpened(false);
    setCurrentBroadcastIndex(0);
  };

  const openBroadcastChat = (guest, allowNewTab = true) => {
    const url = new URL(generateWaLink(guest));
    const phone = url.pathname.slice(1);
    const webUrl = 'https://web.whatsapp.com/send?phone=' + phone + '&' + url.searchParams;
    if (whatsappTab.current && !whatsappTab.current.closed) {
      whatsappTab.current.location.href = webUrl;
      whatsappTab.current.focus();
    } else if (allowNewTab) {
      whatsappTab.current = window.open(webUrl, '_blank');
      if (whatsappTab.current) whatsappTab.current.opener = null;
    }
    const opened = Boolean(whatsappTab.current && !whatsappTab.current.closed);
    setChatOpened(opened);
    if (!opened && allowNewTab) toast.info('Izinkan pop-up, lalu klik Buka chat.');
  };

  const advanceBroadcast = () => {
    const nextIndex = currentBroadcastIndex + 1;
    const nextGuest = broadcastQueue[nextIndex];
    if (!nextGuest) {
      cancelBroadcast();
      toast.success('Antrean selesai. Tamu yang dilewati bisa diproses lagi.');
      return;
    }
    setCurrentBroadcastIndex(nextIndex);
    openBroadcastChat(nextGuest, false);
  };

  const confirmBroadcastMessage = async () => {
    const guest = broadcastQueue[currentBroadcastIndex];
    setSavingProgress(true);
    try {
      await api.post('/invitations/me/guests/blast', { guestIds: [guest.id] });
      onUpdateStatus?.(guest.id, 'sent');
      advanceBroadcast();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Progres gagal disimpan. Coba konfirmasi lagi.');
    } finally {
      setSavingProgress(false);
    }
  };

  return (
    <div className={embedded?"guest-table-embedded":"fullscreen-modal-overlay"}>
      <div className="fullscreen-modal-container">
        
        {/* Header */}
        {!embedded&&<div className="fullscreen-modal-header">
          <div className="header-title">
            <i className="fa-solid fa-users"></i> Kelola Tamu (Layar Penuh)
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i> Tutup
          </button>
        </div>}

        {/* Action Bar (Filters & Broadcst) */}
        <div className="fullscreen-action-bar">
          <div className="filters">
            <input 
              type="text" 
              placeholder="Cari nama tamu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input search-input"
            />
            <select 
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="form-input"
            >
              {uniqueGroups.map(group => (
                <option key={group} value={group}>{group==='All'?'Semua kelompok':group}</option>
              ))}
            </select>
          </div>
          {mode !== 'directory' && <div className="actions">
            {!isBroadcasting ? (
              <Button variant="primary" onClick={startBroadcast} icon={<i className="fa-solid fa-paper-plane"></i>}>
                Kirim massal
              </Button>
            ) : (
              <Button variant="danger" onClick={cancelBroadcast} disabled={savingProgress} icon={<i className="fa-solid fa-stop"></i>}>
                Hentikan Proses
              </Button>
            )}
          </div>}
        </div>

        {/* Broadcast Overlay / Banner */}
        {isBroadcasting && (
          <div className="broadcast-banner">
            <div className="broadcast-info">
              <span className="badge">Antrean {currentBroadcastIndex + 1} / {broadcastQueue.length}</span>
              <strong>Chat untuk: {broadcastQueue[currentBroadcastIndex]?.name}</strong>
              <span className="phone">({broadcastQueue[currentBroadcastIndex]?.phone})</span>
            </div>
            <div className="broadcast-actions">
              <Button variant="secondary" disabled={savingProgress}
                onClick={() => openBroadcastChat(broadcastQueue[currentBroadcastIndex])}>
                {chatOpened ? 'Buka ulang chat' : 'Buka chat'}
              </Button>
              <Button variant="secondary" disabled={savingProgress} onClick={advanceBroadcast}>
                Lewati
              </Button>
              <Button variant="primary" disabled={!chatOpened || savingProgress} onClick={confirmBroadcastMessage}>
                {savingProgress ? 'Menyimpan…' : currentBroadcastIndex + 1 === broadcastQueue.length ? 'Sudah kirim, selesai' : 'Sudah kirim, lanjut'}
              </Button>
            </div>
          </div>
        )}

        {/* Data Table */}
        {mode !== 'distribution' && <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Tamu</th>
                <th>No. WhatsApp</th>
                <th>Grup</th>
                <th>RSVP</th>
                <th>Status WA</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">Tidak ada tamu yang ditemukan.</td>
                </tr>
              ) : (
                filteredGuests.map((guest, idx) => {
                  const rsvpText = guest.rsvp 
                    ? (guest.rsvp.attending ? `✅ Hadir (${guest.rsvp.guestCount} org)` : '❌ Tidak Hadir')
                    : 'Belum RSVP';
                  
                  return (
                    <tr key={guest.id} className={guest.inviteStatus === 'sent' ? 'row-sent' : ''}>
                      <td>{idx + 1}</td>
                      <td><strong>{guest.name}</strong></td>
                      <td>{guest.phone || '-'}</td>
                      <td>{guest.groupName || 'Umum'}</td>
                      <td>{rsvpText}</td>
                      <td>
                        <span className={`status-badge status-${guest.inviteStatus}`}>
                          {guest.inviteStatus === 'opened' ? 'Undangan Dibuka' : guest.inviteStatus === 'sent' ? 'Dibuka di WhatsApp' : 'Belum Diproses'}
                        </span>
                      </td>
                      <td className="table-actions">
                        <Button 
                          as="a" 
                          href={generateWaLink(guest)} 
                          target="_blank"
                          variant="secondary" 
                          size="sm"
                          icon={<i className="fa-brands fa-whatsapp"></i>}
                          style={{ color: '#25D366' }}
                          aria-disabled={!guest.phone}
                          onClick={async (event) => {
                            if(!guest.phone){event.preventDefault();return}
                            if (guest.inviteStatus !== 'sent') {
                              try {
                                await api.post('/invitations/me/guests/blast', { guestIds: [guest.id] });
                                if (onUpdateStatus) onUpdateStatus(guest.id, 'sent');
                              } catch (e) {}
                            }
                          }}
                        >
                          WA
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleCheckIn(guest)} icon={<i className={`fa-solid ${guest.checkedIn ? 'fa-rotate-left' : 'fa-ticket'}`}></i>}>
                          {guest.checkedIn ? 'Batalkan Check-in' : 'Check-in Manual'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if(!embedded)onClose();
                            onEditGuest(guest);
                          }}
                          icon={<i className="fa-solid fa-pen"></i>}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDeleteGuest(guest.id)}
                          icon={<i className="fa-solid fa-trash-can"></i>}
                          style={{ color: '#ff4d4f' }}
                        >
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>}
      </div>
    </div>
  );
}
