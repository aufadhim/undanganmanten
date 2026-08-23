import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AnalitikPanel({ invitation }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    views: 0,
    guestsCount: 0,
    rsvpAttending: 0,
    rsvpNotAttending: 0,
    rsvpPending: 0, sent: 0, opened: 0, checkedIn: 0, checkedInPeople: 0
  });

  useEffect(() => {
    if (invitation) {
      loadStats();
    }
  }, [invitation]);

  function loadStats() {
    api.get('/invitations/me/guests')
      .then(res => {
        const guests = res.data?.guests || [];
        let attending = 0;
        let notAttending = 0;
        let pending = 0;
        let sent = 0, opened = 0, checkedIn = 0, checkedInPeople = 0;
        
        guests.forEach(g => {
          if (g.rsvp) {
            if (g.rsvp.attending) attending += g.rsvp.guestCount || 1;
            else notAttending++;
          } else {
            pending++;
          }
          if (g.inviteStatus === 'sent' || g.inviteStatus === 'opened') sent++;
          if (g.inviteStatus === 'opened' || g.openedAt) opened++;
          if (g.checkedIn) { checkedIn++; checkedInPeople += g.rsvp?.attending ? (g.rsvp.guestCount || 1) : 1; }
        });

        setStats({
          views: invitation.views || 0,
          guestsCount: guests.length,
          rsvpAttending: attending,
          rsvpNotAttending: notAttending,
          rsvpPending: pending, sent, opened, checkedIn, checkedInPeople
        });
      })
      .catch(err => console.error(err));
  }

  async function exportReport() {
    const res = await api.get('/invitations/me/guests/export', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const link = document.createElement('a'); link.href = url; link.download = `laporan-tamu-${invitation.slug}.csv`; link.click();
    URL.revokeObjectURL(url);
  }

  const pieData = [
    { name: 'Hadir', value: stats.rsvpAttending, color: '#4caf50' },
    { name: 'Tidak Hadir', value: stats.rsvpNotAttending, color: '#f44336' },
    { name: 'Belum RSVP', value: stats.rsvpPending, color: '#ff9800' },
  ];

  const barData = [
    { name: 'Kunjungan Halaman', total: stats.views }
  ];

  return (
    <>
      <h2 className="panel-header">Dashboard Analitik</h2>
      <p className="panel-sub">Pantau statistik pengunjung dan konfirmasi kehadiran undanganmu.</p>

      <button type="button" onClick={exportReport} style={{ marginBottom: 16 }}>Ekspor laporan tamu (CSV)</button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <i className="fa-solid fa-eye" style={{ fontSize: '24px', color: '#1976d2', marginBottom: '10px' }}></i>
          <h3 style={{ margin: 0, fontSize: '24px' }}>{stats.views}</h3>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Kunjungan</div>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, textAlign: 'center' }}><h3 style={{ margin: 0 }}>{stats.sent}</h3><div style={{ fontSize: 12 }}>WA Dibuka untuk Dikirim</div></div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, textAlign: 'center' }}><h3 style={{ margin: 0 }}>{stats.opened}</h3><div style={{ fontSize: 12 }}>Undangan Dibuka</div></div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, textAlign: 'center' }}><h3 style={{ margin: 0 }}>{stats.checkedInPeople}</h3><div style={{ fontSize: 12 }}>Orang Check-in ({stats.checkedIn} undangan)</div></div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <i className="fa-solid fa-users" style={{ fontSize: '24px', color: '#4caf50', marginBottom: '10px' }}></i>
          <h3 style={{ margin: 0, fontSize: '24px' }}>{stats.rsvpAttending}</h3>
          <div style={{ fontSize: '12px', color: '#666' }}>Tamu Hadir</div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '24px', color: '#ff9800', marginBottom: '10px' }}></i>
          <h3 style={{ margin: 0, fontSize: '24px' }}>{stats.rsvpPending}</h3>
          <div style={{ fontSize: '12px', color: '#666' }}>Belum Konfirmasi</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="section-block">
          <div className="section-title">Rasio Kehadiran (RSVP)</div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '12px' }}>
            {pieData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: 10, height: 10, background: d.color, borderRadius: '50%' }}></span>
                {d.name}
              </div>
            ))}
          </div>
        </div>

        <div className="section-block">
          <div className="section-title">Kunjungan Undangan</div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="total" fill="#1976d2" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
