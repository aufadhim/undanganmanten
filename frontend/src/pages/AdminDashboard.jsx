import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, clearToken } from '../api/client.js';
import { useUI } from '../context/UIContext.jsx';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, invitations, users
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { toast, confirm } = useUI();

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setLoading(true);
    setError('');
    try {
      const [statsRes, ordersRes, invRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/orders'),
        api.get('/admin/invitations'),
        api.get('/admin/users'),
      ]);

      setStats(statsRes.data.stats);
      setOrders(ordersRes.data.orders);
      setInvitations(invRes.data.invitations);
      setUsers(usersRes.data.users);
    } catch (err) {
      console.error('Error fetchAdminData:', err);
      setError(err.response?.data?.error || 'Akses ditolak atau gagal memuat data admin.');
    } finally {
      setLoading(false);
    }
  }

  async function handleManualActivate(orderId) {
    const isConfirmed = await confirm(
      'Aktivasi Manual',
      'Apakah Anda yakin ingin mengaktifkan order ini secara manual?'
    );
    if (!isConfirmed) return;
    
    setActionLoading(true);
    try {
      const res = await api.post(`/admin/orders/${orderId}/activate`);
      toast.success(res.data.message);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengaktifkan order.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleUserRole(userId, currentRole) {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const isConfirmed = await confirm(
      'Ubah Hak Akses',
      `Ubah hak akses pengguna menjadi ${nextRole}?`
    );
    if (!isConfirmed) return;
    
    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: nextRole });
      toast.success(res.data.message);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengubah role.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTogglePublish(invitationId, currentStatus) {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/invitations/${invitationId}`, { status: nextStatus });
      toast.success(res.data.message);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengubah status undangan.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  if (loading) {
    return <div className="loading-screen">Memuat Superadmin Dashboard...</div>;
  }

  if (error) {
    return (
      <div className="loading-screen" style={{ flexDirection: 'column', gap: 16 }}>
        <h3 style={{ color: '#d9383a' }}>⚠️ {error}</h3>
        <p>Halaman ini khusus untuk Superadmin UndanganManten.</p>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>Kembali ke Dashboard Utama</button>
      </div>
    );
  }

  return (
    <div className="admin-shell" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      {/* Header Admin - Harmonized 1:1 dengan Landing Page */}
      <header className="admin-header">
        <Link to="/" className="admin-brand">
          <img src="/logo.png" alt="UndanganManten" style={{ height: 28 }} />
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            UndanganManten
          </span>
          <span style={{ background: 'var(--wine)', color: 'var(--panel)', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.05em' }}>
            SUPERADMIN
          </span>
        </Link>
        
        <div className="admin-actions">
          <Link to="/dashboard" className="lp-btn-ghost" style={{ fontSize: 12, padding: '6px 14px', textDecoration: 'none' }}>
            🖥️ Dashboard User
          </Link>
          <button className="logout-btn" onClick={handleLogout} style={{ fontSize: 12, padding: '6px 14px' }}>
            Keluar
          </button>
        </div>
      </header>

      {/* Grid Utama Admin */}
      <div style={{ maxWidth: 1200, margin: '30px auto', padding: '0 20px' }}>
        {/* Navigasi Tab Admin */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '2px solid var(--line)', paddingBottom: 12 }}>
          {[
            { key: 'overview', label: '📊 Overview Bisnis' },
            { key: 'orders', label: `💳 Transaksi (${orders.length})` },
            { key: 'invitations', label: `💌 Undangan Platform (${invitations.length})` },
            { key: 'users', label: `👥 Pengguna (${users.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`admin-nav-btn ${activeTab === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & STATISTIK SANGAT LENGKAP + GRAFIK */}
        {activeTab === 'overview' && stats && (
          <div>
            {/* Grid Top Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 24 }}>
              <div className="admin-card">
                <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: '0.05em' }}>Total Omzet Penjualan</span>
                <h2 style={{ margin: '6px 0 0', color: 'var(--wine)', fontSize: 28, fontFamily: 'Fraunces, serif' }}>
                  Rp{stats.totalRevenue.toLocaleString('id-ID')}
                </h2>
              </div>
              <div className="admin-card">
                <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: '0.05em' }}>Total Pengguna Terdaftar</span>
                <h2 style={{ margin: '6px 0 0', color: 'var(--ink)', fontSize: 28, fontFamily: 'Fraunces, serif' }}>
                  {stats.totalUsers} User
                </h2>
              </div>
              <div className="admin-card">
                <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: '0.05em' }}>Undangan Published (Aktif)</span>
                <h2 style={{ margin: '6px 0 0', color: '#137333', fontSize: 28, fontFamily: 'Fraunces, serif' }}>
                  {stats.publishedInvitations} Undangan
                </h2>
              </div>
              <div className="admin-card">
                <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: '0.05em' }}>Undangan Draft (TRIAL)</span>
                <h2 style={{ margin: '6px 0 0', color: '#b06000', fontSize: 28, fontFamily: 'Fraunces, serif' }}>
                  {stats.draftInvitations} Draft
                </h2>
              </div>
            </div>

            {/* Visual Section: Grafik Omzet + Distribusi Paket */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 30 }}>
              {/* Chart Bar Omzet 6 Bulan Terakhir */}
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 16, color: 'var(--ink)' }}>📈 Grafik Pendapatan Omzet (6 Bulan Terakhir)</h3>
                  <span style={{ fontSize: 11, background: 'var(--paper)', padding: '4px 10px', borderRadius: 12, border: '1px solid var(--line)' }}>Bulanan</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 180, padding: '20px 0 10px', borderBottom: '2px solid var(--line)' }}>
                  {stats.chartData?.map((item, idx) => {
                    const maxRevenue = Math.max(...stats.chartData.map((c) => c.revenue), 100000);
                    const barHeightPct = Math.max((item.revenue / maxRevenue) * 100, 10);
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--wine)', marginBottom: 6 }}>
                          {item.revenue > 0 ? `Rp${(item.revenue / 1000).toLocaleString('id-ID')}k` : 'Rp0'}
                        </span>
                        <div
                          style={{
                            width: '40%',
                            height: `${barHeightPct}%`,
                            background: item.revenue > 0 ? 'linear-gradient(180deg, var(--wine) 0%, var(--gold) 100%)' : 'var(--line)',
                            borderRadius: '6px 6px 0 0',
                            transition: 'height 0.4s ease'
                          }}
                        />
                        <span style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 8, fontWeight: 600 }}>{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pie/Progress Distribusi Paket */}
              <div className="admin-card">
                <h3 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--ink)' }}>💎 Distribusi Paket</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>Paket Standard (Rp 79rb)</span>
                      <strong>{stats.distribution?.standardCount || 0} Undangan</strong>
                    </div>
                    <div style={{ background: 'var(--paper)', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${(stats.distribution?.standardCount / (stats.totalInvitations || 1)) * 100}%`, height: '100%', background: 'var(--gold)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>Paket Premium (Rp 129rb)</span>
                      <strong>{stats.distribution?.premiumCount || 0} Undangan</strong>
                    </div>
                    <div style={{ background: 'var(--paper)', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${(stats.distribution?.premiumCount / (stats.totalInvitations || 1)) * 100}%`, height: '100%', background: 'var(--wine)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>Paket Trial (Gratis)</span>
                      <strong>{stats.distribution?.trialCount || 0} Undangan</strong>
                    </div>
                    <div style={{ background: 'var(--paper)', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${(stats.distribution?.trialCount / (stats.totalInvitations || 1)) * 100}%`, height: '100%', background: 'var(--ink-soft)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSAKSI & MANUAL ACTIVATION */}
        {activeTab === 'orders' && (
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: 'var(--ink)' }}>Riwayat Transaksi Masuk</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--paper)', textAlign: 'left' }}>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)' }}>Order ID</th>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)' }}>Pengantin / Email</th>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)' }}>Rincian Paket &amp; Add-ons</th>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)' }}>Total Nominal</th>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)' }}>Status</th>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)', textAlign: 'right' }}>Aksi Admin</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 10, fontFamily: 'monospace', fontSize: 12 }}>{o.midtransOrderId}</td>
                    <td style={{ padding: 10 }}>
                      <strong>{o.invitation?.coupleProfile?.brideName || 'Undangan'} &amp; {o.invitation?.coupleProfile?.groomName || ''}</strong><br />
                      <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{o.invitation?.user?.email}</span>
                    </td>
                    <td style={{ padding: 10 }}>
                      <strong>{o.packageType}</strong>
                      {Array.isArray(o.addons) && o.addons.length > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
                          ➕ {o.addons.join(', ')}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: 10 }}>
                      <span style={{ color: 'var(--wine)', fontWeight: 700 }}>Rp{o.amount.toLocaleString('id-ID')}</span>
                    </td>
                    <td style={{ padding: 10 }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                        background: o.status === 'SUCCESS' ? '#e6f4ea' : o.status === 'PENDING' ? '#fef7e0' : '#fff2f0',
                        color: o.status === 'SUCCESS' ? '#137333' : o.status === 'PENDING' ? '#b06000' : '#d9383a'
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: 10, textAlign: 'right' }}>
                      {o.status !== 'SUCCESS' && (
                        <button
                          onClick={() => handleManualActivate(o.id)}
                          disabled={actionLoading}
                          style={{ background: '#137333', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                        >
                          ⚡ Manual Aktifkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: DAFTAR UNDANGAN PLATFORM */}
        {activeTab === 'invitations' && (
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', color: 'var(--ink)' }}>Semua Undangan Terbuat</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--paper)', textAlign: 'left' }}>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)' }}>Pengantin</th>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)' }}>Slug URL</th>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)' }}>Paket</th>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)' }}>Status</th>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)', textAlign: 'right' }}>Aksi Status</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 10 }}>
                      <strong>{inv.coupleProfile?.brideName || 'Wanita'} &amp; {inv.coupleProfile?.groomName || 'Pria'}</strong><br />
                      <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{inv.user?.email}</span>
                    </td>
                    <td style={{ padding: 10 }}>
                      <a href={`/i/${inv.slug}`} target="_blank" rel="noreferrer" style={{ color: 'var(--wine)', fontWeight: 600 }}>
                        /{inv.slug}
                      </a>
                    </td>
                    <td style={{ padding: 10 }}>
                      <span style={{ fontWeight: 700 }}>{inv.packageType}</span>
                    </td>
                    <td style={{ padding: 10 }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                        background: inv.status === 'published' ? '#e6f4ea' : '#fef7e0',
                        color: inv.status === 'published' ? '#137333' : '#b06000'
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: 10, textAlign: 'right' }}>
                      <button
                        onClick={() => handleTogglePublish(inv.id, inv.status)}
                        disabled={actionLoading}
                        style={{
                          background: inv.status === 'published' ? '#fff2f0' : '#e6f4ea',
                          color: inv.status === 'published' ? '#d9383a' : '#137333',
                          border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {inv.status === 'published' ? 'Unpublish' : 'Publish Sekarang'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: DAFTAR USERS & ROLE MANAGEMENT */}
        {activeTab === 'users' && (
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', color: 'var(--ink)' }}>Manajemen Pengguna Platform</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--paper)', textAlign: 'left' }}>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)' }}>Email</th>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)' }}>No Telepon</th>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)' }}>Jumlah Undangan</th>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)' }}>Role</th>
                  <th style={{ padding: 10, borderBottom: '2px solid var(--line)', textAlign: 'right' }}>Aksi Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 10, fontWeight: 600 }}>{u.email}</td>
                    <td style={{ padding: 10 }}>{u.phone || '-'}</td>
                    <td style={{ padding: 10 }}>{u._count?.invitation || 0} Undangan</td>
                    <td style={{ padding: 10 }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                        background: u.role === 'ADMIN' ? 'var(--wine)' : 'rgba(24,36,32,0.08)',
                        color: u.role === 'ADMIN' ? 'var(--panel)' : 'var(--ink)'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: 10, textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleUserRole(u.id, u.role)}
                        disabled={actionLoading}
                        style={{ background: 'var(--ink)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      >
                        {u.role === 'ADMIN' ? 'Jadikan User biasa' : 'Jadikan ADMIN'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
