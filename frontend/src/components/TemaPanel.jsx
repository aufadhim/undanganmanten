import {THEME_CATEGORIES,THEME_CATALOG,GARDEN_DEFAULT_SETTINGS} from '../config/themeCatalog.js';
import { useState,useEffect,useRef } from 'react';
import { api } from '../api/client.js';
import { useUI } from '../context/UIContext.jsx';
import ThemeThumbnail from './ThemeThumbnail.jsx';
import {TEMPLATE_LOADERS} from '../config/templateLoaders.generated.js';
import { THEME_DEFAULT_SETTINGS } from '../config/themePresets.js';

const CATALOG_TEMPLATES = THEME_CATALOG;

export default function TemaPanel({ invitation, onUpdated, client = api }) {
    const [available,setAvailable]=useState(null);
    useEffect(()=>{client.get('/themes/presets').then(({data})=>setAvailable(data.themes.map(t=>t.id))).catch(()=>setAvailable([]))},[]);
    const applying=useRef(false);
    const [applyingId, setApplyingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');

    const { toast } = useUI();

    const categories = THEME_CATEGORIES;

    const filteredTemplates = CATALOG_TEMPLATES.filter(tmpl => {
        const matchesSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'Semua' || tmpl.category === activeCategory;
        return matchesSearch && matchesCategory && (available===null?false:available.includes(tmpl.id)||invitation.themeId===tmpl.id);
    });

    async function handleSelectTheme(themeId) {
        if(applying.current||themeId===invitation.themeId)return;
        applying.current=true;
        TEMPLATE_LOADERS[themeId]?.().catch(()=>{});
        setApplyingId(themeId);
        const prevInvitation = invitation;
        const defaultSettings = THEME_DEFAULT_SETTINGS[themeId] || {};

        // Optimistic UI update: instantly change preview in phone
        const optimisticInvitation = {
            ...invitation,
            themeId,
            themeSettings: {
                ...(invitation.themeSettings || {}),
                ...defaultSettings,
                typography: {
                    ...(invitation.themeSettings?.typography || {}),
                    ...(defaultSettings.typography || {}),
                },
                background: {
                    ...(invitation.themeSettings?.background || {}),
                    ...(defaultSettings.background || {}),
                },
                bodyText: {
                    ...(invitation.themeSettings?.bodyText || {}),
                    ...(defaultSettings.bodyText || {}),
                },
                button: {
                    ...(invitation.themeSettings?.button || {}),
                    ...(defaultSettings.button || {}),
                },
                openingAnimation: defaultSettings.openingAnimation || 'fade',
            }
        };
        onUpdated(optimisticInvitation);

        try {
            // Memanggil API update preset tema
            const res = await client.post('/themes/apply-preset', {
                invitationId: invitation.id,
                presetId: themeId,
            });

            // Panggil callback dengan data server lengkap
            onUpdated({...optimisticInvitation,...res.data.invitation,guests:prevInvitation.guests,_count:prevInvitation._count});
            toast.success('Tema berhasil diganti!');
        } catch (err) {
            onUpdated(prevInvitation);
            toast.error(err.response?.data?.error || 'Gagal mengganti tema');
        } finally {
            applying.current=false;
            setApplyingId(null);
        }
    }

    return (
        <div className="panel-content">
            <h3 className="panel-title">Katalog Desain Undangan</h3>
            <p className="panel-sub">Temukan desain berdasarkan suasana dan tema. Data undangan tetap tersimpan saat berganti desain.</p>
            <div className="studio-theme-notice">
                <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i>
                Tema langsung diterapkan dan tersimpan otomatis saat dipilih.
            </div>

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
                                    disabled={applyingId !== null || isActive}
                                    onPointerEnter={() => TEMPLATE_LOADERS[tmpl.id]?.().catch(()=>{})}
                                    onFocus={() => TEMPLATE_LOADERS[tmpl.id]?.().catch(()=>{})}
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
