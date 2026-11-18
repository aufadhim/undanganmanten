import { createPortal } from 'react-dom';
import { Flower } from './atelier/Brand.jsx';
import { QRCodeSVG } from 'qrcode.react';
import {invitationStatusLabel} from '../utils/invitationStatus.js';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';
import './billing-invoice.css';

const PACKAGES = {
  STANDARD: { name: 'Standard', price: 99000, photos: 10, guests: 'Hingga 100 tamu' },
  PREMIUM: { name: 'Premium', price: 129000, photos: 30, guests: 'Tanpa batas kuota tamu dari paket' },
};

const ADDONS_CONFIG = [
  { id: 'QR_GUESTBOOK', name: 'Buku Tamu QR Code Scanner', price: 20000, desc: 'Check-in tamu di lokasi acara dengan QR' },
];

const retail = { ALFAMART: 'Alfamart', INDOMARET: 'Indomaret', ALFAMIDI: 'Alfamidi' };
const wallets = { OVO: 'OVO', DANA: 'DANA', SHOPEEPAY: 'ShopeePay' };
const banks = { PERMATAVA:'Permata', BNIVA:'BNI', BRIVA:'BRI', MANDIRIVA:'Mandiri', BCAVA:'BCA', MUAMALATVA:'Muamalat', CIMBVA:'CIMB Niaga', BSIVA:'BSI', OCBCVA:'OCBC', DANAMONVA:'Danamon', OTHERBANKVA:'Bank lain', BCASVA:'BCA Syariah', JATIMVA:'Bank Jatim' };
const paymentGroups = ['QRIS', 'Virtual account', 'Gerai ritel', 'Dompet digital', 'Metode lainnya'];
const paymentIcons = ['fa-qrcode', 'fa-building-columns', 'fa-store', 'fa-wallet', 'fa-credit-card'];
function methodGroup(code = '') {
  if (code.startsWith('QRIS')) return paymentGroups[0];
  if (banks[code] || code.endsWith('VA')) return paymentGroups[1];
  if (retail[code]) return paymentGroups[2];
  if (wallets[code]) return paymentGroups[3];
  return paymentGroups[4];
}
function methodName(code) {
  return ({ QRIS2:'QRIS', QRIS:'QRIS by ShopeePay', QRISC:'QRIS Custom', QRIS_SHOPEEPAY:'QRIS Custom by ShopeePay' })[code] || banks[code] || retail[code] || wallets[code] || code;
}

const providerLogoCodes = new Set([...Object.keys(banks).filter(code => code !== 'OTHERBANKVA'), ...Object.keys(retail), ...Object.keys(wallets), 'QRIS', 'QRIS2']);

function PaymentMethodLogo({ code, icon }) {
  const [failed, setFailed] = useState(false);
  return <span className="sam-method-logo" aria-hidden="true">
    {providerLogoCodes.has(code) && !failed
      ? <img src={`/assets/payment-methods/${code}.png`} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      : <i className={`fa-solid ${icon}`} />}
  </span>;
}

export default function BillingPanel({ invitation, onUpdated, onManagePublication, client = api }) {
  const { t } = useTranslation();
  const [paymentsEnabled, setPaymentsEnabled] = useState(null);
  const [sandbox, setSandbox] = useState(false);
  const [methods, setMethods] = useState([]);
  const [method, setMethod] = useState('');
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [payment, setPayment] = useState(null);
  const paymentInstructions = useRef(null);
  useEffect(() => {
    if (!payment || !paymentInstructions.current) return;
    const section = paymentInstructions.current;
    section.focus({ preventScroll: true });
    section.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [payment]);
  useEffect(() => {
    client.get('/payments/availability').then(({data}) => { setPaymentsEnabled(data.enabled); setSandbox(data.sandbox); setMethods(data.methods || []); setMethod(data.methods?.find(code => code === 'QRIS2') || data.methods?.[0] || ''); }).catch(() => setPaymentsEnabled(false));
  }, []);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState('STANDARD');
  const [selectedAddons, setSelectedAddons] = useState([]);
  
  const { toast } = useUI();

  useEffect(() => {
    setSelectedPkg(invitation.packageType === 'PREMIUM' ? 'PREMIUM' : 'STANDARD');
    setSelectedAddons([]);
    setPayment(null);
    fetchOrders();
  }, [invitation.id]);

  async function fetchOrders() {
    try {
      const res = await client.get('/payments/orders',{headers:{'x-invitation-id':invitation.id}});
      setOrders(res.data.orders);
      return res.data.orders;
    } catch (err) {
      console.error('Failed to fetch orders', err);
      return [];
    }
  }

  const [checking, setChecking] = useState(false);

  async function refreshStatus(reference) {
    if (checking) return;
    setChecking(true);
    try {
      const availableOrders = reference && !orders.some(item => item.tripay?.reference === reference) ? await fetchOrders() : orders;
      const order = reference
        ? availableOrders.find(item => item.tripay?.reference === reference)
        : orders.find(item => item.status === 'PENDING' && item.tripay?.reference);
      if (!order) {
        await fetchOrders();
        toast.info('Riwayat transaksi telah diperiksa.');
        return;
      }
      const { data } = await client.post('/payments/orders/' + order.id + '/refresh', null, { notification: false });
      await fetchOrders();
      if (data.status === 'PAID') {
        setPayment(current => current?.payment?.reference === order.tripay?.reference ? null : current);
        toast.success(order.tripay?.mode === 'sandbox' ? 'Simulasi berhasil. Invoice uji tersedia. Paket undangan tetap Trial jika belum diaktifkan.' : 'Pembayaran terkonfirmasi. Invoice tersedia di riwayat transaksi.');
        if (order.tripay?.mode === 'production') {
          const { data: updated } = await client.get('/invitations');
          const fresh = updated.invitations.find(item => item.id === invitation.id);
          if (fresh) onUpdated?.(fresh);
        }
      } else {
        toast.info(({ UNPAID: 'Tripay masih mencatat transaksi ini sebagai Belum Dibayar.', EXPIRED: 'Batas pembayaran sudah lewat.', FAILED: 'Tripay mencatat transaksi gagal.', REFUND: 'Tripay mencatat pengembalian dana.' })[data.status] || 'Status Tripay: ' + data.status);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Status pembayaran belum dapat diperiksa.');
    } finally {
      setChecking(false);
    }
  }

  function toggleAddon(addonId) {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  }

  // Hitung total harga checkout
  const packageActive = invitation.packageType !== 'TRIAL' && new Date(invitation.expiresAt) > new Date() && !invitation.suspendedAt;
  const [qrActive,setQrActive]=useState(Boolean(invitation.entitlements?.qrGuestbook));
  useEffect(()=>{client.get('/invitations/me/guests',{headers:{'x-invitation-id':invitation.id}}).then(r=>setQrActive(Boolean(r.data.entitlements?.qrGuestbook))).catch(()=>{})},[invitation.id,orders]);
  const basePrice = packageActive ? 0 : PACKAGES[selectedPkg].price;
  const addonsTotal = selectedAddons.filter(id=>!(id==='QR_GUESTBOOK'&&qrActive)).reduce((sum, id) => sum + (ADDONS_CONFIG.find((a) => a.id === id)?.price || 0), 0);
  const grandTotal = basePrice + addonsTotal;

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await client.post('/payments/checkout', {
        packageType: packageActive ? invitation.packageType : selectedPkg,
        selectedAddons: selectedAddons.filter(id=>!(id==='QR_GUESTBOOK'&&qrActive)),
        kind: packageActive?'ADDON':'PACKAGE',
        method: method || undefined,
      },{headers:{'x-invitation-id':invitation.id}});
      setPayment(res.data);
      void fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memulai transaksi pembayaran.');
    } finally {
      setLoading(false);
    }
  }

  const rupiah = value => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  const invoiceFee = invoice?.tripay?.fee || 0;
  const pkg = invitation?.packageType || 'TRIAL';
  const isPublished = invitation?.status === 'published';
  const pendingOrder = orders.find(order => order.status === 'PENDING' && order.tripay?.reference && (!order.tripay?.mode || order.tripay.mode === (sandbox ? 'sandbox' : 'production')));

  const isFailedAttempt = order => order.status === 'FAILED' && !order.tripay?.reference;
  const failedAttempts = orders.filter(isFailedAttempt);
  const visibleOrders = orders.filter(order => !isFailedAttempt(order));
  const renderOrders = entries => (
          <ul className="sam-order-list">
            {entries.map(order => (
              <li key={order.id} className="sam-order">
                <div className="sam-order-info">
                  <strong>{PACKAGES[order.packageType]?.name || order.packageType}</strong>
                  <time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleDateString('id-ID')}</time>
                  <span className="sam-order-id" aria-label={`Order ID ${order.midtransOrderId}`}>{order.midtransOrderId}</span>
                </div>
                <div className="sam-order-state">
                  <span className="sam-order-badge" data-status={order.status}>{({SUCCESS:'Dibayar',PENDING:'Menunggu pembayaran',EXPIRED:'Kedaluwarsa',FAILED:'Gagal'})[order.status] || order.status}</span>
                  {order.tripay?.mode === 'sandbox' && <small>Simulasi</small>}
                </div>
                <div className="sam-order-actions">
                  {order.tripay?.reference && order.tripay.mode === (sandbox ? 'sandbox' : 'production') && <Button size="sm" variant="secondary" disabled={checking} onClick={() => refreshStatus(order.tripay.reference)}>Periksa status</Button>}
                  {order.status === 'PENDING' && order.tripay?.checkoutUrl && <Button size="sm" variant="primary" onClick={() => setPayment({ payment: order.tripay, checkoutUrl: order.tripay.checkoutUrl, amount: order.amount })}>Lihat cara bayar</Button>}
                  {order.status === 'SUCCESS' && order.paidAt && (order.activationSource === 'gateway' || order.tripay?.mode === 'sandbox') && <Button size="sm" variant="primary" onClick={() => setInvoice(order)}>Lihat invoice</Button>}
                </div>
              </li>
            ))}
          </ul>
  );

  return (
    <>
      {invoice && createPortal(
        <div className="sam-invoice-overlay">
          <section className="sam-invoice" role="dialog" aria-modal="true" aria-labelledby="sam-invoice-title">
            <header className="sam-invoice-heading">
              <div className="sam-invoice-brand"><Flower /><span>samavaya<small>Sebuah kabar bahagia</small></span></div>
              <h2 id="sam-invoice-title">Invoice pembayaran</h2>
              <span className="sam-invoice-status">{invoice.tripay?.mode === 'sandbox' ? 'Simulasi' : invoice.tripay?.refundedAt ? 'Dana dikembalikan' : 'Lunas'}</span>
            </header>
            <img className="sam-invoice-art" src="/assets/landing-canvas/garden.webp" alt="" />
            <dl className="sam-invoice-meta">
              <div><dt>Nomor invoice</dt><dd>{invoice.midtransOrderId}</dd></div>
              <div><dt>Tanggal pembayaran</dt><dd>{new Date(invoice.paidAt || invoice.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</dd></div>
            </dl>
            <dl className="sam-invoice-items">
              <div><dt>{invoice.kind === 'ADDON' ? 'Add-on Buku Tamu QR' : 'Paket ' + invoice.packageType + (invoice.addons?.includes('QR_GUESTBOOK') ? ' + Buku Tamu QR' : '')}</dt><dd>{rupiah(invoice.amount)}</dd></div>
              {invoiceFee > 0 && <div><dt>Biaya layanan</dt><dd>{rupiah(invoiceFee)}</dd></div>}
              <div className="sam-invoice-total"><dt>Total pembayaran</dt><dd>{rupiah(invoice.amount + invoiceFee)}</dd></div>
            </dl>
            {invoice.tripay?.mode === 'sandbox' && <p className="sam-invoice-note">Invoice simulasi. Tidak ada pembayaran nyata.</p>}
            <p className="sam-invoice-contact">Samavaya · mail@samavaya.web.id</p>
            <footer><Button variant="secondary" onClick={() => setInvoice(null)}>Tutup</Button><Button onClick={() => window.print()}>Cetak atau simpan PDF</Button></footer>
          </section>
        </div>, document.body)}
      <h2 className="panel-header">{t('panels.paket_title')}</h2>
      <p className="panel-sub">Satu paket lengkap dengan add-on buku tamu QR opsional.</p>

      {/* Info Paket Saat Ini */}
      <div style={{ padding: 18, background: 'var(--ui-card, #faf3e3)', border: '1px solid #e3d6b4', borderRadius: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ui-danger-ink, #7a2436)', fontWeight: 700, letterSpacing: '0.05em' }}>Status Undangan</span>
            <h3 style={{ margin: '4px 0 0', color: 'var(--ui-muted, #182420)', fontSize: 18 }}>
              Paket {pkg} · {pkg==='TRIAL'?'Belum diaktivasi':'Sudah diaktivasi'}
            </h3>
          </div>
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: isPublished ? 'var(--dashboard-active, #e6f4ea)' : 'var(--ui-danger-surface, #fff2f0)', color: isPublished ? 'var(--ink, #137333)' : 'var(--ui-danger-ink, #d9383a)'
          }}>
            {invitationStatusLabel(invitation)}
          </span>
        </div>
      </div>

      <p className="panel-sub">Aktivasi paket dan publikasi adalah dua langkah terpisah. Setelah paket aktif, lengkapi checklist lalu terbitkan melalui Undangan Saya agar tautan dapat diakses tamu.</p>
      {onManagePublication&&<button type="button" className="editor-library-back" onClick={onManagePublication}>{packageActive && !isPublished ? 'Lanjutkan ke publikasi' : 'Kembali ke kesiapan undangan'}</button>}

      {packageActive ? (
        <p className="panel-sub">Paket {PACKAGES[pkg]?.name || pkg} aktif. Kamu bisa membeli Buku Tamu QR secara terpisah.</p>
      ) : (
        <fieldset disabled={loading} style={{ border: 0, padding: 0, margin: '16px 0 24px', minInlineSize: 0 }}>
          <legend>Pilih paket undangan</legend>
          <p className="panel-sub">Kedua paket aktif hingga H+30 dan mencakup editor, RSVP, ucapan, hadiah, dan live streaming.</p>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))' }}>
            {Object.entries(PACKAGES).map(([id, plan]) => (
              <label key={id} style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10, alignItems: 'start',
                padding: 16, borderRadius: 12, cursor: 'pointer',
                background: selectedPkg === id ? 'var(--dashboard-active, #f2f2e6)' : 'var(--ui-card, #fffdf5)',
                border: selectedPkg === id ? '1px solid var(--wine)' : '1px solid var(--line)',
              }}>
                <input type="radio" name="invitation-package" value={id} checked={selectedPkg === id} onChange={() => setSelectedPkg(id)} />
                <span>
                  <strong>{plan.name} · Rp{plan.price.toLocaleString('id-ID')}</strong><br />
                  Hingga {plan.photos} foto<br />
                  {plan.guests}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {(
        <div style={{ background: 'var(--ui-card, #faf3e3)', padding: 18, borderRadius: 14, border: '1px dashed #e3d6b4', marginBottom: 24 }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 14, color: 'var(--ui-muted, #182420)' }}>Buku tamu tambahan</h4>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--ui-muted, #5c655d)' }}>Buku tamu berlaku untuk seluruh desain dalam pernikahan yang sama. Paket aktif tidak ditagih ulang.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ADDONS_CONFIG.map((addon) => {
              const alreadyActive = addon.id==='QR_GUESTBOOK'&&qrActive;
              const isChecked = alreadyActive || selectedAddons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => !alreadyActive&&toggleAddon(addon.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: 'var(--ui-card, #ffffff)', borderRadius: 10, border: `1px solid ${isChecked ? 'var(--wine)' : 'var(--line)'}`, cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" disabled={alreadyActive} checked={isChecked} onChange={() => {}} />
                    <div>
                      <strong style={{ fontSize: 13, color: 'var(--ui-muted, #182420)', display: 'block' }}>{addon.name}</strong>
                      <span style={{ fontSize: 11, color: 'var(--ui-muted, #5c655d)' }}>{addon.desc}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ui-danger-ink, #7a2436)' }}>{alreadyActive?'Aktif untuk pernikahan ini':`Rp${addon.price.toLocaleString('id-ID')}`}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {paymentsEnabled && methods.length > 0 && <fieldset className="sam-payment-methods" disabled={loading}>
        <legend>Metode pembayaran</legend>
        {paymentGroups.map((group, index) => {
          const options = methods.filter(code => methodGroup(code) === group);
          if (!options.length) return null;
          const selected = options.includes(method);
          const expanded = (expandedGroup ?? methodGroup(method)) === group;
          return <div key={group} className="sam-method-group">
            <button type="button" className="sam-method-heading" aria-expanded={expanded} onClick={() => setExpandedGroup(expanded ? '' : group)}>
              <i className={`fa-solid ${paymentIcons[index]}`} aria-hidden="true" />
              <span>{group}</span>
              {selected && <small>{methodName(method)}</small>}
              <i className="fa-solid fa-chevron-down sam-method-chevron" aria-hidden="true" />
            </button>
            {expanded && <div className="sam-method-grid" role="group" aria-label={group}>{options.map(code => <label key={code} className={method === code ? 'is-selected' : ''}>
              <input type="radio" name="tripay-method" checked={method === code} onChange={() => { setMethod(code); setPayment(null); }} />
              <PaymentMethodLogo code={code} icon={paymentIcons[index]} />
              <span>{methodName(code)}</span>
            </label>)}</div>}
          </div>;
        })}
      </fieldset>}
      {payment && <section ref={paymentInstructions} tabIndex={-1} className="sam-payment" aria-label="Instruksi pembayaran">
        <header className="sam-payment-header"><div><p>Samavaya</p><h2>Pembayaran {methodName(payment.payment?.method) || ''}</h2></div><div className="sam-payment-total"><span>Total tagihan</span><strong>{rupiah(payment.amount + (payment.payment?.fee || 0))}</strong></div></header>
        {payment.payment?.mode === 'sandbox' && <p className="sam-payment-note"><strong>Mode uji</strong> · {client === api ? 'Gunakan simulator Tripay untuk menandai transaksi sebagai dibayar.' : 'Kode contoh. Tekan Muat ulang status untuk menyimulasikan pembayaran.'}</p>}
        {payment.payment?.qrString && <div className="sam-payment-qr"><QRCodeSVG value={payment.payment.qrString} size={200} marginSize={4} title="Kode pembayaran QRIS" /></div>}
        {payment.payment?.payCode && <div className="sam-payment-code"><div><span>{methodGroup(payment.payment.method) === 'Virtual account' ? 'Nomor virtual account' : 'Kode bayar'}</span><strong>{payment.payment.payCode}</strong></div> <Button variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(payment.payment.payCode); toast.success('Kode bayar disalin.'); } catch { toast.error('Salin kode dari halaman pembayaran.'); } }}>Salin</Button></div>}
        <dl className="sam-payment-details"><div><dt>Referensi Tripay</dt><dd>{payment.payment?.reference || "—"}</dd></div>
        {payment.payment?.expiresAt && <div><dt>Bayar sebelum</dt><dd>{new Date(payment.payment.expiresAt * 1000).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</dd></div>}</dl>
        <footer>{client === api && <a className="sam-action-link" href={payment.checkoutUrl} target="_blank" rel="noreferrer">Buka instruksi Tripay</a>}<Button variant="secondary" isLoading={checking} onClick={() => refreshStatus(payment.payment?.reference)}>Muat ulang status</Button></footer>
      </section>}
      {sandbox && <p role="status">Tripay Sandbox · Uji checkout dan invoice dengan transaksi simulasi. Paket publik tetap mengikuti aktivasi resmi.</p>}
      {/* Ringkasan Total & Tombol Checkout */}
      <div className="sam-checkout-summary" style={{ background: '#182420', color: '#faf3e3', padding: 20, borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <span style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total pilihan</span>
          <h2 style={{ margin: '2px 0 0', color: '#faf3e3', fontSize: 24, fontFamily: 'Fraunces, serif' }}>
            Rp{grandTotal.toLocaleString('id-ID')}
          </h2>
        </div>
        {pendingOrder ? (
          <div><p>Masih ada transaksi yang menunggu konfirmasi.</p><Button variant="secondary" isLoading={checking} onClick={()=>refreshStatus(pendingOrder.tripay.reference)}>Periksa status pembayaran</Button></div>
        ) : paymentsEnabled === false ? (
          <a className="sam-action-link" href={'mailto:mail@samavaya.web.id?subject=' + encodeURIComponent('Aktivasi undangan ' + invitation.slug) + '&body=' + encodeURIComponent('Halo Samavaya, saya ingin mengaktifkan undangan ' + invitation.slug + ' dengan paket ' + (packageActive ? invitation.packageType : selectedPkg) + (selectedAddons.includes('QR_GUESTBOOK') ? ' dan Buku Tamu QR.' : '.'))}>Hubungi Samavaya untuk aktivasi</a>
        ) : <Button
          variant="primary"
          onClick={handleCheckout}
          isLoading={loading}
          disabled={grandTotal===0 || paymentsEnabled !== true}
          style={{ padding: '12px 24px', fontSize: 14 }}
        >
          {grandTotal===0?'Paket sudah aktif':sandbox?'Uji pembayaran Tripay':packageActive?'Bayar add-on':'Lanjut ke pembayaran'}
        </Button>}
      </div>

      {orders.length > 0 && (
        <section className="sam-order-history" aria-labelledby="sam-order-title">
          <h3 id="sam-order-title">Riwayat transaksi</h3>
          {visibleOrders.length > 0 && renderOrders(visibleOrders)}
          {failedAttempts.length > 0 && <details className="sam-failed-orders">
            <summary>Percobaan gagal ({failedAttempts.length})</summary>
            {renderOrders(failedAttempts)}
          </details>}
        </section>
      )}
    </>
  );
}
