import {THEME_DEFAULT_SETTINGS} from '../config/themePresets.js';
import {THEME_CATEGORIES,THEME_CATALOG} from '../config/themeCatalog.js';
import { useState } from 'react';
import { useUI } from '../context/UIContext.jsx';
import ThemeThumbnail from './ThemeThumbnail.jsx';

const CATALOG_TEMPLATES = THEME_CATALOG;

export const SANDBOX_THEME_SETTINGS = THEME_DEFAULT_SETTINGS;

export default function SandboxTemaPanel({ invitation, onUpdated }) {
    const [applyingId, setApplyingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');
    
    const { toast } = useUI();

    const categories = THEME_CATEGORIES;

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
            <p className="panel-sub">Temukan desain berdasarkan suasana dan tema. Data undangan tetap tersimpan saat berganti desain.</p>

            <aside className="collection-bespoke"><strong>Bespoke</strong><p>Layanan desain khusus yang dirancang berdasarkan cerita dan keinginan pasangan.</p></aside>
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
                            className={`atelier-catalog-card ${isActive ? 'is-active' : ''}`}
                            style={{
                                border: isActive ? '2px solid var(--wine)' : '1px solid #e3d6b4',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                background: 'var(--ui-card, #ffffff)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                position: 'relative'
                            }}
                        >
                            <div style={{ height: '190px', overflow: 'hidden', position: 'relative' }}>
                                <ThemeThumbnail theme={tmpl} />
                                {isActive && (
                                    <div className="theme-active-badge" style={{ position: 'absolute', top: 8, right: 8, background: '#536343', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                                        Aktif
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '10px', textAlign: 'center' }}>
                                <strong style={{ fontSize: '13px', display: 'block', color: '#182420' }}>{tmpl.name}</strong>
                                <span style={{ fontSize: '10px', color: '#8c8c8c' }}>{tmpl.category}</span>
                                <button
                                    onClick={() => handleSelectTheme(tmpl.id)}
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
