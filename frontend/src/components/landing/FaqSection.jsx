import { useState, useEffect, useRef } from 'react';

export default function FaqSection() {
  return (
    <section className="faq">
      <div className="section-head reveal">
        <div className="eyebrow center">Keterangan</div>
        <h2>Pertanyaan yang Sering Ditanyakan</h2>
      </div>

      <FaqList
        items={[
          ['Apakah saya bisa mencoba dulu sebelum bayar?', 'Bisa. Paket Trial gratis 2 hari untuk mencoba semua fitur dasarnya.'],
          ['Berapa lama undangan saya aktif?', 'Paket Standard & Premium aktif hingga 30 hari setelah tanggal pernikahan (H+30).'],
          ['Ada batas jumlah tamu yang diundang?', 'Tidak ada. Sebar ke sebanyak apapun tamu, RSVP tercatat otomatis.'],
          ['Bisa ganti tema setelah memilih?', 'Bisa, kapan saja selama masa aktif. Data yang sudah diisi tidak hilang.'],
          ['Data tamu saya aman?', 'Aman. Semua data dienkripsi dan tidak dibagikan ke pihak ketiga.'],
        ]}
      />
    </section>
  );
}

function FaqList({ items }) {
  const [openIndex, setOpenIndex] = useState(0);
  const itemRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="faq-list">
      {items.map(([q, a], i) => {
        const isOpen = openIndex === i;
        return (
          <div
            className="faq-item reveal"
            key={q}
            ref={(el) => (itemRefs.current[i] = el)}
            style={{ transitionDelay: `${i * 0.06}s` }}
          >
            <button
              className="faq-q"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
              <span className="faq-index">{String(i + 1).padStart(2, '0')}</span>
              <span className="faq-q-text">{q}</span>
              <span className={`faq-chev ${isOpen ? 'open' : ''}`}>
                <i className="fa-solid fa-chevron-down" />
              </span>
            </button>
            <div className={`faq-a-wrap ${isOpen ? 'open' : ''}`}>
              <div className="faq-a-inner">
                <p>{a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
