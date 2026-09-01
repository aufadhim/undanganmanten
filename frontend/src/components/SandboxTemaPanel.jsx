import { useState } from 'react';
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
        description: 'Editorial modern dengan cover sinematik dan lembar undangan seperti majalah.'
    },
    {
        id: 'nawasena',
        name: 'Nawasena',
        category: 'PREMIUM',
        previewImg: '/assets/nawasena/enchanted-joglo-hero.webp',
        description: 'Taman Jawa ilustratif dengan kabut, burung, kelopak, dan animasi sinematik.'
    },
    {
        id: 'isvara',
        name: 'Isvara',
        category: 'PREMIUM',
        previewImg: '/assets/isvara/thumb-md-717117-1400-1400-9632766178daf24c67babd5c-642061.jpg',
        description: 'Editorial monokrom, kertas ivory, ilustrasi pasangan, dan botani sage.'
    },
    {
        id: 'lanqing', name: 'Lanqing', category: 'PREMIUM',
        previewImg: '/assets/gallery/dummy-gallery-01.webp',
        description: 'Chinese lacquer merah dengan segel 囍, ceremonial scroll, parchment, dan emas antik.'
    },
    {
        id: 'celluloid', name: 'Celluloid', category: 'PREMIUM',
        previewImg: '/assets/theme-thumbnails/celluloid-key-visual-v1.webp',
        description: 'Sinema vintage dengan proyektor, gulungan film, tirai panggung, dan atmosfer premiere.'
    },
    {
        id: 'nocturne', name: 'Nocturne', category: 'PREMIUM',
        previewImg: '/assets/nocturne/backgrounds/opening-stage-background.webp',
        description: 'Black-tie wedding gala dengan panggung Art Deco, velvet burgundy, spotlight, dan editorial malam.'
    },
];

export const SANDBOX_THEME_SETTINGS = {
    eternal: { background: { primary: '#fafaf9', secondary: '#f5f5f4', enabled: true }, bodyText: { primary: '#292524', secondary: '#57534e', enabled: true }, button: { primary: '#292524', text: '#fafaf9', enabled: true }, typography: {} },
    seraya: { background: { primary: '#f4f1ea', secondary: '#dedad1', enabled: true }, bodyText: { primary: '#0a0a0a', secondary: '#4a4945', enabled: true }, button: { primary: '#111111', text: '#ffffff', enabled: true }, typography: { fontHeading: 'Abril Fatface', fontBody: 'Bellefair' } },
    nawasena: { background: { primary: '#f4eddf', secondary: '#d9c9ad', enabled: true }, bodyText: { primary: '#741d2b', secondary: '#243322', enabled: true }, button: { primary: '#a4894e', text: '#ffffff', enabled: true }, typography: { fontHeading: 'Cormorant Garamond', fontBody: 'Montserrat' }, animationType: 'petals' },
    isvara: { background: { primary: '#f3f0e8', secondary: '#dfe3d5', enabled: true }, bodyText: { primary: '#465440', secondary: '#30372f', enabled: true }, button: { primary: '#78846c', text: '#ffffff', enabled: true }, typography: { fontHeading: 'Cormorant Garamond', fontBody: 'Montserrat' }, animationType: 'petals' },
    'lanqing': { background: { primary: '#f6ebdd', secondary: '#e9c9b6', enabled: true }, bodyText: { primary: '#8d1b24', secondary: '#341b18', enabled: true }, button: { primary: '#a8232d', text: '#fff8e8', enabled: true }, typography: { fontHeading: 'Cormorant Garamond', fontBody: 'Montserrat' }, animationType: 'petals' },
    celluloid: { background: { primary: '#211913', secondary: '#211913', enabled: true }, bodyText: { primary: '#8a2d2d', secondary: '#efe1c8', enabled: true }, button: { primary: '#8a2d2d', text: '#211913', enabled: true }, typography: { fontHeading: 'Cormorant Garamond', fontBody: 'Montserrat' }, animationType: 'cinematic' },
    nocturne: { background: { primary: '#08090b', secondary: '#121014', enabled: true }, bodyText: { primary: '#751c30', secondary: '#eee7dc', enabled: true }, button: { primary: '#c5a46a', text: '#08090b', enabled: true }, typography: { fontHeading: 'Bodoni Moda', fontBody: 'Manrope' }, animationType: 'cinematic' },
};

export default function SandboxTemaPanel({ invitation, onUpdated }) {
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
        // Simulate network delay
        setTimeout(() => {
            onUpdated({ ...invitation, themeId, themeSettings: SANDBOX_THEME_SETTINGS[themeId] });
            toast.success('Tema di Mode Coba berhasil diganti!');
            setApplyingId(null);
        }, 300);
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
