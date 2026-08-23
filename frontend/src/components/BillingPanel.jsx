import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

const ADDONS_CONFIG = [
  { id: 'AMPLOP_DIGITAL', name: 'Amplop Digital & Hadiah', price: 20000, desc: 'Rekening bank & e-wallet di undangan' },
  { id: 'EXTRA_GUESTS_100', name: '+100 Wa Blast / Tamu Extra', price: 15000, desc: 'Tambah kuota sebar undangan' },
  { id: 'EXTRA_GALLERY_10', name: '+10 Foto Galeri Tambahan', price: 15000, desc: 'Kapasitas foto galeri lebih luas' },
];

export default function BillingPanel({ invitation, onUpdated }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState('STANDARD');
  const [selectedAddons, setSelectedAddons] = useState([]);
  
  const { toast } = useUI();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await api.get('/payments/orders');
      setOrders(res.data.orders);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  }

  function toggleAddon(addonId) {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  }

  // Hitung total harga checkout
  const basePrice = selectedPkg === 'PREMIUM' ? 129000 : 79000;
  const addonsTotal = selectedPkg === 'STANDARD'
    ? selectedAddons.reduce((sum, id) => sum + (ADDONS_CONFIG.find((a) => a.id === id)?.price || 0), 0)
    : 0;
  const grandTotal = basePrice + addonsTotal;

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await api.post('/payments/checkout', {
        packageType: selectedPkg,
        selectedAddons: selectedPkg === 'STANDARD' ? selectedAddons : [],
      });
      const { token } = res.data;

      if (window.snap) {
        window.snap.pay(token, {
          onSuccess: function () {
            toast.success('Pembayaran berhasil! Undangan Anda kini aktif & dipublikasi.');
            api.get('/invitations').then((r) => {
              const updated = r.data.invitations.find((i) => i.id === invitation.id);
              if (updated && onUpdated) onUpdated(updated);
              fetchOrders();
            });
          },
          onPending: function () {
            toast.info('Menunggu menyelesaikan pembayaran.');
          },
          onError: function () {
            toast.error('Pembayaran tidak dapat diproses.');
          },
        });
      } else {
        toast.error('Sistem pembayaran Midtrans belum siap di halaman.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memulai transaksi pembayaran.');
    } finally {
      setLoading(false);
    }
  }

  function printInvoice(order) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.midtransOrderId}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #182420; background: #faf3e3; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #e3d6b4; padding-bottom: 20px; }
            .logo { font-family: 'Fraunces', serif; font-size: 24px; font-weight: bold; color: #7a2436; }
            .status { font-weight: bold; color: #137333; text-transform: uppercase; border: 1px solid #137333; padding: 4px 12px; border-radius: 20px; font-size: 12px; background: #e6f4ea; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .table th, .table td { border-bottom: 1px solid #e3d6b4; padding: 12px 0; text-align: left; }
            .total { font-size: 20px; font-weight: bold; text-align: right; color: #7a2436; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">💍 UndanganManten</div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #182420;">INVOICE</h2>
              <p style="margin: 5px 0 0 0; color: #5c655d;">${order.midtransOrderId}</p>
            </div>
          </div>
          <p><strong>Tanggal Pembayaran:</strong> ${order.paidAt ? new Date(order.paidAt).toLocaleString('id-ID') : '-'}</p>
          <p><strong>Status:</strong> <span class="status">${order.status}</span></p>
          <table class="table">
            <thead>
              <tr>
                <th>Deskripsi Item</th>
                <th style="text-align: right;">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Paket Undangan: ${order.packageType}</td>
                <td style="text-align: right;">Rp${order.amount.toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">
            Total Pembayaran: Rp${order.amount.toLocaleString('id-ID')}
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  const pkg = invitation?.packageType || 'TRIAL';
  const isPublished = invitation?.status === 'published';

  return (
    <>
      <h2 className="panel-header">{t('panels.paket_title')}</h2>
      <p className="panel-sub">Pilih paket dasar &amp; add-on opsional untuk mengaktifkan undangan Anda.</p>

      {/* Info Paket Saat Ini */}
      <div style={{ padding: 18, background: '#faf3e3', border: '1px solid #e3d6b4', borderRadius: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#7a2436', fontWeight: 700, letterSpacing: '0.05em' }}>Status Undangan</span>
            <h3 style={{ margin: '4px 0 0', color: '#182420', fontSize: 18 }}>
              Paket {pkg} ({isPublished ? 'Published / Aktif' : 'Draft / TRIAL'})
            </h3>
          </div>
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: isPublished ? '#e6f4ea' : '#fff2f0', color: isPublished ? '#137333' : '#d9383a'
          }}>
            {isPublished ? '✓ Siap DISEBAR' : '⚠️ Masih Draft'}
          </span>
        </div>
      </div>

      {/* Grid Pilihan Paket Utama */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
        {/* Paket Standard */}
        <div
          onClick={() => setSelectedPkg('STANDARD')}
          style={{
            border: `2px solid ${selectedPkg === 'STANDARD' ? '#7a2436' : '#e3d6b4'}`,
            background: selectedPkg === 'STANDARD' ? '#fff9f0' : '#ffffff',
            padding: 18, borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: 16, color: '#182420' }}>Paket Standard</h4>
            <input type="radio" checked={selectedPkg === 'STANDARD'} onChange={() => setSelectedPkg('STANDARD')} />
          </div>
          <h3 style={{ color: '#7a2436', margin: '8px 0 12px', fontSize: 22 }}>Rp79.000</h3>
          <ul style={{ paddingLeft: 18, fontSize: 12, color: '#5c655d', margin: 0, lineHeight: 1.6 }}>
            <li>Aktif 1 Tahun Penuh</li>
            <li>Semua Tema Eksklusif Bebas Pilih</li>
            <li>Tanpa Watermark</li>
            <li>Maksimal 10 Foto Galeri</li>
            <li>Fitur RSVP &amp; Ucapan Tamu</li>
          </ul>
        </div>

        {/* Paket Premium */}
        <div
          onClick={() => setSelectedPkg('PREMIUM')}
          style={{
            border: `2px solid ${selectedPkg === 'PREMIUM' ? '#7a2436' : '#e3d6b4'}`,
            background: selectedPkg === 'PREMIUM' ? '#fff9f0' : '#ffffff',
            padding: 18, borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
          }}
        >
          <span style={{ position: 'absolute', top: -10, right: 14, background: '#7a2436', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
            BEST VALUE
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: 16, color: '#182420' }}>Paket Premium</h4>
            <input type="radio" checked={selectedPkg === 'PREMIUM'} onChange={() => setSelectedPkg('PREMIUM')} />
          </div>
          <h3 style={{ color: '#7a2436', margin: '8px 0 12px', fontSize: 22 }}>Rp129.000</h3>
          <ul style={{ paddingLeft: 18, fontSize: 12, color: '#5c655d', margin: 0, lineHeight: 1.6 }}>
            <li>Include Semua Fitur Standard</li>
            <li><strong>Amplop Digital &amp; Rekening Bank Included</strong></li>
            <li><strong>Live Streaming Links Included</strong></li>
            <li>Maksimal 30 Foto Galeri</li>
          </ul>
        </div>
      </div>

      {/* Add-on Opsional (Khusus Paket Standard) */}
      {selectedPkg === 'STANDARD' && (
        <div style={{ background: '#faf3e3', padding: 18, borderRadius: 14, border: '1px dashed #e3d6b4', marginBottom: 24 }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 14, color: '#182420' }}>➕ Add-On Tambahan (Opsional Ketengan)</h4>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#5c655d' }}>Pilih fitur spesifik sesuai kebutuhan tanpa perlu bayar paket tertinggi:</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ADDONS_CONFIG.map((addon) => {
              const isChecked = selectedAddons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: '#ffffff', borderRadius: 10, border: `1px solid ${isChecked ? '#7a2436' : '#e3d6b4'}`, cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" checked={isChecked} onChange={() => {}} />
                    <div>
                      <strong style={{ fontSize: 13, color: '#182420', display: 'block' }}>{addon.name}</strong>
                      <span style={{ fontSize: 11, color: '#5c655d' }}>{addon.desc}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#7a2436' }}>+Rp{addon.price.toLocaleString('id-ID')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ringkasan Total & Tombol Checkout */}
      <div style={{ background: '#182420', color: '#faf3e3', padding: 20, borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <span style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Tagihan Checkout</span>
          <h2 style={{ margin: '2px 0 0', color: '#faf3e3', fontSize: 24, fontFamily: 'Fraunces, serif' }}>
            Rp{grandTotal.toLocaleString('id-ID')}
          </h2>
        </div>
        <Button
          variant="primary"
          onClick={handleCheckout}
          isLoading={loading}
          style={{ padding: '12px 24px', fontSize: 14 }}
        >
          Bayar / Aktivasi Sekarang ➔
        </Button>
      </div>

      {/* Riwayat Transaksi */}
      {orders.length > 0 && (
        <div>
          <h3 style={{ borderBottom: '1px solid #e3d6b4', paddingBottom: 10, color: '#182420' }}>Riwayat Transaksi Pembayaran</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 14 }}>
            <thead>
              <tr style={{ background: '#faf3e3', textAlign: 'left' }}>
                <th style={{ padding: 12, borderBottom: '1px solid #e3d6b4' }}>Order ID</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e3d6b4' }}>Paket</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e3d6b4' }}>Tanggal</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e3d6b4' }}>Status</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e3d6b4', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12, fontFamily: 'monospace', fontSize: 12 }}>{o.midtransOrderId}</td>
                  <td style={{ padding: 12, fontWeight: 600 }}>{o.packageType}</td>
                  <td style={{ padding: 12 }}>{new Date(o.createdAt).toLocaleDateString('id-ID')}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                      background: o.status === 'SUCCESS' ? '#e6f4ea' : o.status === 'PENDING' ? '#fef7e0' : '#fff2f0',
                      color: o.status === 'SUCCESS' ? '#137333' : o.status === 'PENDING' ? '#b06000' : '#d9383a'
                    }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    {o.status === 'SUCCESS' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => printInvoice(o)}
                        icon={<i className="fa-solid fa-print"></i>}
                      >
                        Cetak Invoice
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
