export default function TestimonialSection() {
  return (
    <section className="guestbook">
      <div className="section-head reveal">
        <div className="eyebrow center">Dari Buku Tamu Kami</div>
        <h2>Bukan Testimoni yang Dipoles</h2>
        <p className="section-sub">Ini cuplikan asli dari kolom ucapan pengantin yang sudah pakai UndanganManten.</p>
      </div>

      <div className="guestbook-page reveal">
        {[
          { name: 'Rina & Aldi', date: 'Okt 2025', text: 'Tamu-tamu kami sampai kira kami sewa wedding planner mahal. Padahal isi datanya cuma 5 menit.' },
          { name: 'Dian & Surya', date: 'Mar 2026', text: 'WA Blast-nya beneran nyata membantu. Upload daftar tamu, klik kirim, selesai — gak perlu chat satu-satu.' },
          { name: 'Fitri & Arman', date: 'Jun 2026', text: 'Awalnya ragu karena harganya murah. Ternyata hasilnya jauh lebih rapi dari yang kami bayangkan.' },
        ].map((g) => (
          <div className="signature-line" key={g.name}>
            <p className="sig-text">"{g.text}"</p>
            <div className="sig-name">{g.name} <span>— {g.date}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}
