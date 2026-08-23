export default function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="steps">
      <div className="section-head reveal">
        <div className="eyebrow center">Cara Kerjanya</div>
        <h2>Semudah Menulis Undangan,<br />Secepat Mengirim Pesan</h2>
      </div>

      <div className="steps-list">
        <div className="steps-line" />
        {[
          {
            ord: 'Yang Pertama',
            title: 'Isi Cerita Kalian',
            desc: 'Nama mempelai, nama orang tua, tanggal akad & resepsi — isi sekali, rapi selamanya.',
            icon: 'fa-feather-pointed',
          },
          {
            ord: 'Yang Kedua',
            title: 'Pilih Wajah Undangan',
            desc: 'Puluhan tema, warna, dan tipografi yang bisa diubah sesuka hati, tanpa sentuh kode.',
            icon: 'fa-palette',
          },
          {
            ord: 'Yang Ketiga',
            title: 'Kirim, lalu Pantau',
            desc: 'Sebar lewat WhatsApp, duduk manis — RSVP dan ucapan masuk otomatis ke dashboard.',
            icon: 'fa-paper-plane',
          },
        ].map((s, i) => (
          <div className="step-row reveal" key={s.ord} style={{ transitionDelay: `${i * 0.12}s` }}>
            <div className="step-marker">
              <i className={`fa-solid ${s.icon}`} />
            </div>
            <div className="step-body">
              <div className="step-ord">{s.ord}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
