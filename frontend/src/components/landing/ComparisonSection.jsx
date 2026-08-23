export default function ComparisonSection() {
  return (
    <section className="comparison">
      <div className="section-head reveal">
        <div className="eyebrow center">Realitas Perencanaan</div>
        <h2>Mengapa Membayar Ratusan Ribu<br/>Untuk Kertas yang Dibuang?</h2>
      </div>

      <div className="compare-grid reveal">
        <div className="compare-col old-way">
          <div className="cc-head">
            <h3>Undangan Fisik</h3>
            <div className="cc-price">Rp 300rb - 1jt+</div>
          </div>
          <ul>
            <li><i className="fa-solid fa-xmark" /> <span>Biaya cetak per lembar (makin banyak tamu, makin mahal)</span></li>
            <li><i className="fa-solid fa-xmark" /> <span>Repot kirim via kurir / door-to-door</span></li>
            <li><i className="fa-solid fa-xmark" /> <span>Tidak bisa direvisi jika ada salah ketik</span></li>
            <li><i className="fa-solid fa-xmark" /> <span>Rekap RSVP tamu dilakukan manual</span></li>
            <li><i className="fa-solid fa-xmark" /> <span>Berakhir di tempat sampah setelah acara</span></li>
          </ul>
        </div>
        
        <div className="compare-vs">VS</div>

        <div className="compare-col new-way">
            <div className="cc-head">
            <h3>UndanganManten</h3>
            <div className="cc-price">Mulai Rp 99rb</div>
            <span className="cc-badge">Sekali Bayar</span>
          </div>
          <ul>
            <li><i className="fa-solid fa-check" /> <span>Satu harga untuk 100 atau 1.000+ tamu (tanpa batas)</span></li>
            <li><i className="fa-solid fa-check" /> <span>Kirim instan via link WhatsApp</span></li>
            <li><i className="fa-solid fa-check" /> <span>Bebas revisi data & tema kapan saja</span></li>
            <li><i className="fa-solid fa-check" /> <span>Dashboard RSVP & Ucapan otomatis</span></li>
            <li><i className="fa-solid fa-check" /> <span>Tersimpan abadi sebagai kenangan digital</span></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
