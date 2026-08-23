import React from 'react';
import { Link } from 'react-router-dom';

export default function Privacy() {
    return (
        <div style={{ padding: '60px 8%', maxWidth: '900px', margin: '0 auto', fontFamily: 'var(--font-ui)', color: 'var(--ink)' }}>
            <Link to="/" style={{ color: 'var(--wine-deep)', textDecoration: 'none', marginBottom: '30px', display: 'inline-block' }}>
                &larr; Kembali ke Beranda
            </Link>
            
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', marginBottom: '20px' }}>Kebijakan Privasi</h1>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '40px' }}>Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>

            <div style={{ lineHeight: '1.8' }}>
                <section style={{ marginBottom: '30px' }}>
                    <h2>1. Informasi yang Kami Kumpulkan</h2>
                    <p>
                        Saat Anda menggunakan layanan UndanganManten, kami mengumpulkan beberapa jenis informasi pribadi:
                    </p>
                    <ul>
                        <li><strong>Data Pendaftaran:</strong> Alamat email, nama, dan nomor telepon Anda saat membuat akun.</li>
                        <li><strong>Data Acara:</strong> Informasi detail pernikahan (nama mempelai, tanggal, lokasi) dan aset foto/video yang Anda unggah ke galeri.</li>
                        <li><strong>Data Tamu (Pihak Ketiga):</strong> Nama dan detail kontak tamu yang Anda masukkan ke dalam sistem "Guest List" atau yang masuk melalui form RSVP. Anda menjamin bahwa Anda memiliki hak untuk memberikan data tamu Anda ke sistem kami.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2>2. Penggunaan Informasi</h2>
                    <p>Kami menggunakan data Anda murni untuk menyediakan layanan utama platform ini, yaitu:</p>
                    <ul>
                        <li>Membuat dan menampilkan undangan digital secara publik (melalui URL/Slug).</li>
                        <li>Mengirimkan notifikasi akun (OTP, reset password).</li>
                        <li>Mengelola daftar tamu dan fitur RSVP atas nama Anda.</li>
                    </ul>
                    <p><strong>Kami tidak pernah menjual data pribadi Anda atau daftar tamu Anda kepada pihak ketiga manapun.</strong></p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2>3. Keterbukaan Informasi Publik</h2>
                    <p>
                        Mengingat sifat produk ini adalah "Undangan Digital Publik", informasi yang Anda masukkan terkait data mempelai, tanggal, lokasi, dan foto (galeri) akan dapat diakses oleh siapa saja yang memiliki tautan/URL undangan Anda. Mohon bijak dalam memilih informasi yang ingin Anda bagikan.
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2>4. Keamanan Data</h2>
                    <p>
                        Kami menggunakan metode keamanan standar industri (seperti enkripsi kata sandi dan JWT) untuk melindungi akun Anda. Namun, tidak ada metode transmisi di internet yang 100% aman, sehingga kami tidak bisa memberikan jaminan keamanan mutlak.
                    </p>
                </section>
                
                <section style={{ marginBottom: '30px' }}>
                    <h2>5. Hubungi Kami</h2>
                    <p>
                        Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di <strong>support@undanganmanten.com</strong>.
                    </p>
                </section>
            </div>
        </div>
    );
}
