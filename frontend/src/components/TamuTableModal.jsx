import React, { useState, useMemo } from 'react';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function TamuTableModal({
  guests,
  onClose,
  waTemplate,
  invitationSlug,
  onEditGuest,
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
    let basePhone = guest.phone.replace(/[^0-9]/g, '');
    if (basePhone.startsWith('0')) {
      basePhone = '62' + basePhone.substring(1);
    }
    const invLink = `${window.location.origin}/${invitationSlug}?g=${guest.id}`;
    const txt = (waTemplate || 'Halo [Nama Tamu], ini link undangan: [Link Undangan]')
      .replace(/\[Nama Tamu\]/gi, guest.name)
      .replace(/\[Link Undangan\]/gi, invLink);
    return `https://wa.me/${basePhone}?text=${encodeURIComponent(txt)}`;
  };

  async function toggleCheckIn(guest) {
    try {
      if (guest.checkedIn) await api.delete(`/invitations/me/guests/${guest.id}/checkin`);
      else await api.post(`/invitations/me/guests/${guest.id}/checkin`);
      window.dispatchEvent(new Event('guest_updated'));
      toast.success(guest.checkedIn ? 'Check-in dibatalkan.' : 'Check-in berhasil.');
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal memperbarui check-in.'); }
  }

  // BROADCAST LOGIC
  const startBroadcast = () => {
    // Only queue guests that haven't been sent yet and have a phone number
    const pendingGuests = filteredGuests.filter(g => g.inviteStatus !== 'sent' && g.phone);
    if (pendingGuests.length === 0) {
      toast.info('Semua tamu di filter ini sudah dikirimi pesan atau tidak memiliki nomor WA.');
      return;
    }
    setBroadcastQueue(pendingGuests);
    setCurrentBroadcastIndex(0);
    setIsBroadcasting(true);
  };

  const cancelBroadcast = () => {
    setIsBroadcasting(false);
    setBroadcastQueue([]);
    setCurrentBroadcastIndex(0);
  };

  const handleSendBroadcastMessage = async () => {
    const guest = broadcastQueue[currentBroadcastIndex];
    if (!guest) return;

    // 1. Open WA Web in new tab
    const waLink = generateWaLink(guest);
    window.open(waLink, '_blank');

    // 2. Mark as sent in backend
    try {
      await api.post('/invitations/me/guests/blast', { guestIds: [guest.id] });
      // Notify parent to update state
      if (onUpdateStatus) {
        onUpdateStatus(guest.id, 'sent');
      }
    } catch (error) {
      console.error('Gagal update status:', error);
    }
  };

  const handleNextBroadcast = () => {
    if (currentBroadcastIndex < broadcastQueue.length - 1) {
      setCurrentBroadcastIndex(prev => prev + 1);
    } else {
      toast.success('Selesai! Semua antrean telah dikirim.');
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="fullscreen-modal-overlay">
      <div className="fullscreen-modal-container">
        
        {/* Header */}
        <div className="fullscreen-modal-header">
          <div className="header-title">
            <i className="fa-solid fa-users"></i> Kelola Tamu (Layar Penuh)
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i> Tutup
          </button>
        </div>

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
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          <div className="actions">
            {!isBroadcasting ? (
              <Button variant="primary" onClick={startBroadcast} icon={<i className="fa-solid fa-paper-plane"></i>}>
                Kirim Massal (Semi-Auto)
              </Button>
            ) : (
              <Button variant="danger" onClick={cancelBroadcast} icon={<i className="fa-solid fa-stop"></i>}>
                Hentikan Proses
              </Button>
            )}
          </div>
        </div>

        {/* Broadcast Overlay / Banner */}
        {isBroadcasting && (
          <div className="broadcast-banner">
            <div className="broadcast-info">
              <span className="badge">Antrean {currentBroadcastIndex + 1} / {broadcastQueue.length}</span>
              <strong>Mengirim ke: {broadcastQueue[currentBroadcastIndex]?.name}</strong>
              <span className="phone">({broadcastQueue[currentBroadcastIndex]?.phone})</span>
            </div>
            <div className="broadcast-actions">
              <Button 
                variant="primary" 
                onClick={handleSendBroadcastMessage}
                icon={<i className="fa-brands fa-whatsapp"></i>}
              >
                1. Buka WA Web
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleNextBroadcast}
                icon={<i className="fa-solid fa-forward-step"></i>}
              >
                2. Lanjut Berikutnya
              </Button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="table-container">
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
                          onClick={async () => {
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
                            onClose();
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
        </div>
      </div>
    </div>
  );
}
