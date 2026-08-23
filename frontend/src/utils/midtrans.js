let snapPromise;

export function loadMidtransSnap() {
  if (window.snap) return Promise.resolve(window.snap);
  if (snapPromise) return snapPromise;

  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
  if (!clientKey) {
    return Promise.reject(new Error('VITE_MIDTRANS_CLIENT_KEY belum dikonfigurasi.'));
  }

  const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
  const src = isProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

  snapPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    const script = existing || document.createElement('script');
    script.src = src;
    script.dataset.clientKey = clientKey;
    script.onload = () => window.snap ? resolve(window.snap) : reject(new Error('Midtrans Snap gagal diinisialisasi.'));
    script.onerror = () => reject(new Error('Script Midtrans Snap gagal dimuat.'));
    if (!existing) document.head.appendChild(script);
  });

  return snapPromise;
}
