import { useState } from 'react';
import { api } from '../api/client.js';
import { useUI } from '../context/UIContext.jsx';
import ThemeThumbnail from './ThemeThumbnail.jsx';

const CATALOG_TEMPLATES = [
    {
        id: 'eternal',
        name: 'Eternal',
        category: 'CUSTOM',
        previewImg: '/assets/eternal/images/hero/background.webp',
        description: 'Template eksklusif bernuansa elegan dan personal.'
    },
    {
        id: 'seraya',
        name: 'Seraya',
        category: 'PREMIUM',
        previewImg: '/assets/gallery/dummy-gallery-03.webp',
        description: 'Editorial modern dengan cover sinematik, lembar undangan seperti majalah, dan ruang putih elegan.'
    },
    {
        id: 'nawasena',
        name: 'Nawasena',
        category: 'PREMIUM',
        previewImg: '/assets/nawasena/enchanted-joglo-hero.webp',
        description: 'Taman Jawa penuh ilustrasi, kabut, burung, kelopak, dan animasi sinematik.'
    },
    {
        id: 'isvara',
        name: 'Isvara',
        category: 'PREMIUM',
        previewImg: '/assets/isvara/thumb-md-717117-1400-1400-9632766178daf24c67babd5c-642061.jpg',
        description: 'Editorial monokrom yang beralih ke kertas ivory, ilustrasi pasangan, dan botani sage berlapis.'
    },
    {
        id: 'lanqing',
        name: 'Lanqing',
        category: 'PREMIUM',
        previewImg: '/assets/gallery/dummy-gallery-01.webp',
        description: 'Chinese lacquer merah dengan segel 囍, parchment hangat, prosesi bergaya gulungan, dan detail emas antik.'
    },
    {
        id: 'celluloid',
        name: 'Celluloid',
        category: 'PREMIUM',
        previewImg: '/assets/theme-thumbnails/celluloid-key-visual-v1.webp',
        description: 'Sinema vintage dengan proyektor, gulungan film, tirai panggung, dan atmosfer premiere.'
    },
    {
        id: 'nocturne',
        name: 'Nocturne',
        category: 'PREMIUM',
        previewImg: '/assets/nocturne/backgrounds/opening-stage-background.webp',
        description: 'Black-tie wedding gala dengan panggung Art Deco, velvet burgundy, spotlight, dan editorial malam yang sinematik.'
    },
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0 18px', padding: '10px 12px', borderRadius: '10px', background: '#f2f7f3', color: '#496052', fontSize: '13px' }}>
                <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i>
                Tema langsung diterapkan dan tersimpan otomatis saat dipilih.
            </div>

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
                            <div style={{ height: '190px', overflow: 'hidden', position: 'relative' }}>
                                <ThemeThumbnail theme={tmpl} />
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
