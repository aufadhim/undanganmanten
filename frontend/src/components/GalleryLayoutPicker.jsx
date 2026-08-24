const LAYOUTS = [
  ['editorial', 'Editorial', 'Dua kolom dinamis'],
  ['grid', 'Grid Rapi', 'Kotak seragam'],
  ['masonry', 'Masonry', 'Tinggi natural'],
  ['carousel', 'Slideshow', 'Geser horizontal'],
  ['collage', 'Collage', 'Potongan memenuhi bidang'],
  ['wall', 'Wall Board', 'Foto tempel berlapis'],
];

export default function GalleryLayoutPicker({ value, onChange }) {
  return <div className="gallery-layout-picker">
    {LAYOUTS.map(([id, name, description]) => <button type="button" key={id} className={`gallery-layout-choice ${value === id ? 'active' : ''}`} onClick={() => onChange(id)} aria-pressed={value === id}>
      <span className={`gallery-layout-mini mini-${id}`} aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
      </span>
      <span className="gallery-layout-copy"><strong>{name}</strong><small>{description}</small></span>
      {value === id && <i className="fa-solid fa-circle-check gallery-layout-check" />}
    </button>)}
    <style>{`
      .gallery-layout-picker{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}
      .gallery-layout-choice{position:relative;display:grid;gap:9px;padding:10px;text-align:left;border:1px solid #ddd6cf;border-radius:12px;background:#fff;cursor:pointer;transition:.2s ease}
      .gallery-layout-choice:hover{border-color:#8a625c;transform:translateY(-1px)}.gallery-layout-choice.active{border-color:#6f3d3d;box-shadow:0 0 0 2px rgba(111,61,61,.12)}
      .gallery-layout-mini{height:76px;display:grid;gap:3px;padding:5px;border-radius:8px;overflow:hidden;background:#eee8e2}.gallery-layout-mini i{display:block;background:#8d796d;border-radius:2px;min-width:0;min-height:0}
      .mini-editorial{grid-template-columns:1.2fr 1fr;grid-template-rows:repeat(3,1fr)}.mini-editorial i:first-child{grid-row:span 2}.mini-editorial i:nth-child(4){grid-row:span 2}
      .mini-grid{grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr)}
      .mini-masonry{grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr)}.mini-masonry i:nth-child(1),.mini-masonry i:nth-child(4){grid-row:span 3}.mini-masonry i:nth-child(2),.mini-masonry i:nth-child(3),.mini-masonry i:nth-child(5),.mini-masonry i:nth-child(6){grid-row:span 2}
      .mini-carousel{grid-template-columns:8px 2.4fr 1fr 8px;align-items:center}.mini-carousel i:nth-child(n+5){display:none}.mini-carousel i:first-child,.mini-carousel i:nth-child(4){height:70%;opacity:.35}
      .mini-collage{grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(4,1fr)}.mini-collage i:first-child{grid-column:span 3;grid-row:span 3}.mini-collage i:nth-child(2){grid-column:span 2;grid-row:span 2}.mini-collage i:nth-child(3){grid-column:span 2;grid-row:span 2}.mini-collage i:nth-child(4){grid-column:span 2}.mini-collage i:nth-child(5){grid-column:span 2}.mini-collage i:nth-child(6){grid-column:span 1}
      .mini-wall{position:relative;background:repeating-linear-gradient(#705a4e 0 15px,#634d43 16px 17px)}.mini-wall i{position:absolute;width:33%;height:44%;border:4px solid #fff;box-shadow:0 3px 6px #0005}.mini-wall i:nth-child(1){left:5%;top:10%;transform:rotate(-5deg)}.mini-wall i:nth-child(2){left:34%;top:4%;transform:rotate(3deg)}.mini-wall i:nth-child(3){right:3%;top:15%;transform:rotate(-2deg)}.mini-wall i:nth-child(4){left:13%;bottom:2%;transform:rotate(4deg)}.mini-wall i:nth-child(5){left:43%;bottom:5%;transform:rotate(-3deg)}.mini-wall i:nth-child(6){right:2%;bottom:0;transform:rotate(5deg)}
      .gallery-layout-copy{display:grid;gap:2px}.gallery-layout-copy strong{font-size:12px}.gallery-layout-copy small{font-size:10px;color:#766f68}.gallery-layout-check{position:absolute;right:8px;top:8px;color:#6f3d3d;background:#fff;border-radius:50%}
      @media(max-width:380px){.gallery-layout-picker{grid-template-columns:1fr}}
    `}</style>
  </div>;
}
