import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LangSwitcher from '../components/LangSwitcher.jsx';

export default function Guide() {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px', fontFamily: 'Inter, sans-serif', color: '#2d3436' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <Link to="/" style={{ color: '#1f3a5f', textDecoration: 'none', fontWeight: 600 }}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 8 }}></i> {t('dashboard.back_home')}
        </Link>
        <LangSwitcher style={{ background: '#f5f5f5', color: '#1f3a5f', borderColor: '#ddd' }} />
      </div>
      
      <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1f3a5f', marginBottom: 20 }}>Buku Panduan Pengguna</h1>
      <p style={{ opacity: 0.8, marginBottom: 40 }}>Langkah demi langkah menggunakan UndanganManten.</p>

      <div style={{ lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 30 }}>
        
        <div style={{ padding: 20, background: '#fdfcf0', borderRadius: 12, border: '1px solid #f4eee0' }}>
          <h3 style={{ color: '#1f3a5f', marginTop: 0 }}><i className="fa-solid fa-user-plus" style={{ marginRight: 10 }}></i>1. Membuat Akun & Memulai</h3>
          <p>
            Untuk memulai, klik tombol <strong>Buat Undangan</strong> di halaman depan. Isi alamat email dan kata sandi Anda. Kami akan mengirimkan kode OTP ke email Anda untuk memverifikasi keaslian akun. Setelah masuk, Anda siap membuat undangan pertama Anda!
          </p>
        </div>

        <div style={{ padding: 20, background: '#fdfcf0', borderRadius: 12, border: '1px solid #f4eee0' }}>
          <h3 style={{ color: '#1f3a5f', marginTop: 0 }}><i className="fa-solid fa-pen-to-square" style={{ marginRight: 10 }}></i>2. Mengisi Profil & Acara</h3>
          <p>
            Di halaman Dashboard, arahkan ke tab <strong>Profil</strong> untuk mengisi nama mempelai pria dan wanita beserta fotonya. Kemudian, di tab <strong>Acara</strong>, Anda bisa menambahkan detail waktu dan lokasi (seperti Akad dan Resepsi). Pastikan memasukkan lokasi peta agar tamu mudah mencari.
          </p>
        </div>

        <div style={{ padding: 20, background: '#fdfcf0', borderRadius: 12, border: '1px solid #f4eee0' }}>
          <h3 style={{ color: '#1f3a5f', marginTop: 0 }}><i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 10 }}></i>3. Memilih Tema & Warna</h3>
          <p>
            Buka tab <strong>Warna</strong> (atau Tema) untuk mengubah nuansa undangan Anda. Anda bisa memilih warna latar belakang, warna teks, hingga gaya font (Tipografi). Setiap perubahan akan langsung terlihat di Preview HP sebelah kanan.
          </p>
        </div>

        <div style={{ padding: 20, background: '#fdfcf0', borderRadius: 12, border: '1px solid #f4eee0' }}>
          <h3 style={{ color: '#1f3a5f', marginTop: 0 }}><i className="fa-solid fa-users" style={{ marginRight: 10 }}></i>4. Mengelola Tamu & WA Blast</h3>
          <p>
            Di tab <strong>Tamu</strong>, Anda bisa mendaftarkan nama dan nomor WhatsApp tamu. Setelah diisi, klik tombol <strong>Copy WA</strong>. Teks sapaan dan link otomatis disiapkan untuk Anda, sehingga Anda tinggal Paste (Tempel) di aplikasi WhatsApp. Link unik ini memastikan setiap tamu tidak bisa mewakilkan RSVP tamu lain.
          </p>
        </div>

        <div style={{ padding: 20, background: '#fdfcf0', borderRadius: 12, border: '1px solid #f4eee0' }}>
          <h3 style={{ color: '#1f3a5f', marginTop: 0 }}><i className="fa-solid fa-credit-card" style={{ marginRight: 10 }}></i>5. Upgrade Paket</h3>
          <p>
            Akun Anda dimulai dengan paket Trial (2 hari). Jika puas, buka tab <strong>Paket</strong> dan pilih Standard/Premium. Pembayaran dilakukan via Midtrans (GoPay, QRIS, atau transfer bank). Masa aktif undangan Anda otomatis diperpanjang hingga H+30 hari acara.
          </p>
        </div>

      </div>
    </div>
  );
}
