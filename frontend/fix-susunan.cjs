const fs = require('fs');
let content = fs.readFileSync('src/components/SusunanPanel.jsx', 'utf8');

// 1. Add import
content = content.replace(
  "import IGFilterEditor from './IGFilterEditor.jsx';",
  "import IGFilterEditor from './IGFilterEditor.jsx';\nimport { Reorder } from 'framer-motion';"
);

// 2. Fix useEffect
content = content.replace(
  "    }, [invitation]);",
  "    }, [invitation?.id]);"
);

// 3. Fix header
content = content.replace(
  `<div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2>Susunan & Blok Halaman</h2>
                    <p>Geser (drag & drop) untuk mengatur urutan. Aktifkan sakelar (On/Off) untuk menampilkan fitur undangan, lalu klik ⚙️ untuk mengatur konten.</p>
                </div>
                <button onClick={handleReset} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <i className="fa-solid fa-rotate-left"></i> Reset
                </button>
            </div>`,
  `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="panel-header" style={{ margin: 0 }}>Susunan & Blok Halaman</h2>
                <button onClick={handleReset} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
                    <i className="fa-solid fa-rotate-left"></i> Reset
                </button>
            </div>
            <p className="panel-sub" style={{ marginTop: '8px' }}>Geser (drag & drop) untuk mengatur urutan. Aktifkan sakelar (On/Off) untuk menampilkan fitur undangan, lalu klik ⚙️ untuk mengatur konten.</p>`
);

// 4. Remove drag refs and handlers
content = content.replace(
  /const dragItem = useRef\(\);\s*const dragOverItem = useRef\(\);/,
  ""
);

content = content.replace(
  /const handleDragStart = \(e, position\) => {[\s\S]*?};\s*const handleDragEnter = \(e, position\) => {[\s\S]*?};\s*const handleDragEnd = \(e\) => {[\s\S]*?};\s*/,
  ""
);

// 5. Replace sortable-list wrapper
content = content.replace(
  /<div className="sortable-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>\s*\{items.map\(\(item, index\) => \(\s*<div key=\{item.id\} style=\{\{ display: 'flex', flexDirection: 'column', gap: '0' \}\}>\s*<div\s*draggable\s*onDragStart=\{\(e\) => handleDragStart\(e, index\)\}\s*onDragEnter=\{\(e\) => handleDragEnter\(e, index\)\}\s*onDragEnd=\{handleDragEnd\}\s*onDragOver=\{\(e\) => e\.preventDefault\(\)\}/,
  `<Reorder.Group axis="y" values={items} onReorder={(newOrder) => { setItems(newOrder); updatePreview(newOrder); }} className="sortable-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', padding: 0, margin: 0 }}>
                    {items.map((item) => (
                        <Reorder.Item 
                            key={item.id}
                            value={item}
                            style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}
                        >
                            <div`
);

content = content.replace(
  /<\/div>\s*\}\)\}\s*<\/div>/,
  `                        </Reorder.Item>
                    ))}
                </Reorder.Group>`
);

fs.writeFileSync('src/components/SusunanPanel.jsx', content);
console.log("Done");
