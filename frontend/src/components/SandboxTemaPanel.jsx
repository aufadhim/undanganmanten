import { useState } from 'react';
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
        previewImg: '/assets/nisera/nisera-aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzk2ODQxLzcyMzE3L3RodW1ibmFpbC90aHVtYi1sZy05NzI4NTEtMjAwMC0yMDAwLWVkOGUzYWVjODFhZGE4NDc3MzVkOGJlYi1jZjI1MjUuanBn.webp',
        description: 'Desain luxury kustom dari referensi Katsudoto dengan tata letak side-to-side klasik.'
    }
];

const SANDBOX_THEME_SETTINGS = {
    eternal: { background: { primary: '#fafaf9', secondary: '#f5f5f4', enabled: true }, bodyText: { primary: '#292524', secondary: '#57534e', enabled: true }, button: { primary: '#292524', text: '#fafaf9', enabled: true }, typography: {} },
    samaya: { background: { primary: '#f4f0e8', secondary: '#dfe7da', enabled: true }, bodyText: { primary: '#334238', secondary: '#667269', enabled: true }, button: { primary: '#61715f', text: '#fff', enabled: true }, typography: {} },
    nisera: { background: { primary: '#f8f3ed', secondary: '#eaded2', enabled: true }, bodyText: { primary: '#49372f', secondary: '#7b6458', enabled: true }, button: { primary: '#7a2436', text: '#fff', enabled: true }, typography: {} },
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
            toast.success('Tema (Sandbox) berhasil diganti!');
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
