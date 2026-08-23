import React from 'react';
import { Link } from 'react-router-dom';

export default function Terms() {
    return (
        <div style={{ padding: '60px 8%', maxWidth: '900px', margin: '0 auto', fontFamily: 'var(--font-ui)', color: 'var(--ink)' }}>
            <Link to="/" style={{ color: 'var(--wine-deep)', textDecoration: 'none', marginBottom: '30px', display: 'inline-block' }}>
                &larr; Kembali ke Beranda
            </Link>
            
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', marginBottom: '20px' }}>Syarat & Ketentuan</h1>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '40px' }}>Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>

            <div style={{ lineHeight: '1.8' }}>
                <section style={{ marginBottom: '30px' }}>
                    <h2>1. Penerimaan Ketentuan</h2>
                    <p>
                        Dengan mengakses dan menggunakan platform UndanganManten, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian manapun dari ketentuan ini, Anda tidak diperkenankan untuk menggunakan layanan kami.
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2>2. Penggunaan Layanan</h2>
                    <p>
                        Layanan kami disediakan "sebagaimana adanya" untuk memfasilitasi pembuatan undangan digital. Anda setuju untuk:
                    </p>
                    <ul>
                        <li>Tidak menggunakan layanan ini untuk tujuan ilegal atau tidak sah.</li>
                        <li>Tidak mengunggah konten yang mengandung kebencian, pornografi, ancaman, kekerasan, atau melanggar hak cipta.</li>
                        <li>Bertanggung jawab penuh atas semua aktivitas yang terjadi di bawah akun Anda.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2>3. Paket dan Pembayaran</h2>
                    <p>
                        Kami menawarkan beberapa paket (Trial, Standard, Premium). Fitur dan batasan untuk setiap paket diuraikan di halaman Harga. Transaksi yang telah berhasil dilakukan tidak dapat dikembalikan (non-refundable) kecuali jika terjadi kesalahan dari sistem kami.
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2>4. Masa Aktif Undangan</h2>
                    <p>
                        Undangan digital Anda akan tetap aktif sesuai dengan ketentuan paket yang Anda pilih. Untuk paket STANDARD dan PREMIUM, undangan akan otomatis diarsipkan atau tidak dapat diakses publik setelah 30 hari dari tanggal pernikahan (H+30).
                    </p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2>5. Penghentian Layanan</h2>
                    <p>
                        Kami berhak untuk menangguhkan atau menghentikan akun Anda kapan saja jika kami mencurigai adanya pelanggaran terhadap Syarat dan Ketentuan ini, tanpa pemberitahuan sebelumnya atau pengembalian dana.
                    </p>
                </section>
                
                <section style={{ marginBottom: '30px' }}>
                    <h2>6. Hubungi Kami</h2>
                    <p>
                        Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami di <strong>support@undanganmanten.com</strong>.
                    </p>
                </section>
            </div>
        </div>
    );
}
