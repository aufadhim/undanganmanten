import { useState } from 'react';
import { api } from '../api/client.js';
import { useUI } from '../context/UIContext.jsx';

const CATALOG_TEMPLATES = [
    {
        id: 'eternal',
        name: 'Eternal',
        category: 'CUSTOM',
        previewImg: '/assets/eternal/images/hero/background.webp',
        description: 'Template eksklusif bernuansa elegan dan personal.'
    },
    {
        id: 'samaya',
        name: 'Samaya',
        category: 'PREMIUM',
        previewImg: '/assets/samaya/Orn-09.png',
        description: 'Desain elegan natural dengan ornamen botanical, warna sage green hangat, dan layout split-view.'
    },
    {
        id: 'nisera',
        name: 'Nisera',
        category: 'PREMIUM',
        previewImg: '/assets/nisera/nisera-thumb.jpg',
        description: 'Desain luxury kustom dari referensi Katsudoto dengan tata letak side-to-side klasik.'
    }
];

export default function TemaPanel({ invitation, onUpdated }) {
    const [applyingId, setApplyingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');
    
    const { toast } = useUI();

    const categories = ['Semua', ...new Set(CATALOG_TEMPLATES.map(t => t.category))];

    const filteredTemplates = CATALOG_TEMPLATES.filter(tmpl => {
        const matchesSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'Semua' || tmpl.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    async function handleSelectTheme(themeId) {
        setApplyingId(themeId);
        try {
            // Memanggil API update preset tema
            const res = await api.post('/themes/apply-preset', {
                invitationId: invitation.id,
                presetId: themeId,
            });

            // Panggil callback agar iPhone di kanan langsung berubah desainnya!
            onUpdated(res.data.invitation);
            toast.success('Tema berhasil diganti!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Gagal mengganti tema');
        } finally {
            setApplyingId(null);
        }
    }

    return (
        <div className="panel-content">
            <h3 className="panel-title">Katalog Desain Undangan</h3>
            <p className="panel-sub">Pilih desain wajah undanganmu. Seluruh data nama, acara, & foto yang sudah kamu isi tidak akan hilang.</p>

            <div className="theme-filters">
                <div className="theme-search-wrapper">
                    <i className="fa-solid fa-magnifying-glass theme-search-icon"></i>
                    <input 
                        type="text" 
                        className="theme-search-input" 
                        placeholder="Cari tema..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="theme-category-chips">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            className={`theme-chip ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {filteredTemplates.length === 0 ? (
                <div className="theme-empty-state">
                    Tema tidak ditemukan. Coba kata kunci lain.
                </div>
            ) : (
                <div className="theme-grid">
                    {filteredTemplates.map((tmpl) => {
                        const isActive = invitation.themeId === tmpl.id;
                        return (
                        <div
                            key={tmpl.id}
                            onClick={() => handleSelectTheme(tmpl.id)}
                            style={{
                                border: isActive ? '2px solid #7a2436' : '1px solid #e3d6b4',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                background: '#ffffff',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                position: 'relative'
                            }}
                        >
                            <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                                <img src={tmpl.previewImg} alt={tmpl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {isActive && (
                                    <div style={{ position: 'absolute', top: 8, right: 8, background: '#7a2436', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                                        Aktif
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '10px', textAlign: 'center' }}>
                                <strong style={{ fontSize: '13px', display: 'block', color: '#182420' }}>{tmpl.name}</strong>
                                <span style={{ fontSize: '10px', color: '#8c8c8c' }}>{tmpl.category}</span>
                                <button
                                    className={isActive ? 'btn-primary' : 'btn-secondary'}
                                    style={{ width: '100%', marginTop: '12px', fontSize: '12px', padding: '8px 0', borderRadius: '8px' }}
                                    disabled={applyingId === tmpl.id}
                                >
                                    {applyingId === tmpl.id ? 'Memuat...' : isActive ? 'Terpakai' : 'Ganti Desain'}
                                </button>
                            </div>
                        </div>
                    );
                })}
                </div>
            )}
        </div>
    );
}