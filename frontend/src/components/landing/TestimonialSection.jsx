export default function TestimonialSection() {
  return (
    <section className="guestbook">
      <div className="section-head reveal">
        <div className="eyebrow center">Cerita Pengguna</div>
        <h2>Testimoni Pasangan</h2>
        <p className="section-sub">Konten contoh ini dapat diganti dengan testimoni asli sebelum peluncuran.</p>
      </div>

      <div className="guestbook-page reveal">
        {[
          { name: 'Nama Pasangan 01', date: 'Testimoni contoh', text: 'Tempat untuk testimoni asli mengenai pengalaman membuat dan membagikan undangan.' },
          { name: 'Nama Pasangan 02', date: 'Testimoni contoh', text: 'Tempat untuk testimoni asli mengenai desain, kemudahan editor, dan respons para tamu.' },
          { name: 'Nama Pasangan 03', date: 'Testimoni contoh', text: 'Tempat untuk testimoni asli mengenai RSVP, galeri, atau fitur lain yang paling membantu.' },
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
