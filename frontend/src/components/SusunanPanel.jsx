import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api/client.js';
import { useTranslation } from 'react-i18next';
import { useUI } from '../context/UIContext.jsx';
import debounce from 'lodash.debounce';

import DresscodeEditor from './DresscodeEditor.jsx';
import IGFilterEditor from './IGFilterEditor.jsx';
import { Reorder } from 'framer-motion';

const DEFAULT_LAYOUT = [
    { id: 'cover', label: 'Cover Depan', icon: 'fa-book-open', enabled: true },
    { id: 'quote', label: 'Quote / Doa', icon: 'fa-quote-left', enabled: true, nav: ['konten', 'kutipan'] },
    { id: 'profile', label: 'Mempelai', icon: 'fa-user-group', enabled: true, nav: ['konten', 'profil'] },
    { id: 'events', label: 'Informasi Acara', icon: 'fa-calendar-days', enabled: true, nav: ['konten', 'acara'] },
    { id: 'countdown', label: 'Save The Date', icon: 'fa-clock', enabled: true, nav: ['konten', 'acara'] },
    { id: 'gallery', label: 'Galeri Foto & Video', icon: 'fa-images', enabled: true, nav: ['konten', 'galeri'] },
    { id: 'rundown', label: 'Rundown Acara', icon: 'fa-list-ol', enabled: true, nav: ['konten', 'acara'], featureKey: 'rundownEnabled' },
    { id: 'story', label: 'Cerita Cinta', icon: 'fa-heart', enabled: true, nav: ['konten', 'cerita'], featureKey: 'storyEnabled' },
    { id: 'dresscode', label: 'Panduan Dresscode', icon: 'fa-shirt', enabled: true, nav: ['konten', 'dresscode'], featureKey: 'dresscodeEnabled' },
    { id: 'livestream', label: 'Live Streaming', icon: 'fa-video', enabled: true, nav: ['tamu', 'livestream'], featureKey: 'livestreamEnabled' },
    { id: 'igFilter', label: 'Filter Instagram', icon: 'fa-camera-retro', enabled: true, inlineEditor: 'igFilter', featureKey: 'igFilterEnabled' },
    { id: 'rsvp', label: 'RSVP', icon: 'fa-clipboard-check', enabled: true, nav: ['tamu', 'tamu'], featureKey: 'rsvpEnabled' },
    { id: 'wishes', label: 'Ucapan & Doa', icon: 'fa-comment-dots', enabled: true, nav: ['tamu', 'ucapan'], featureKey: 'wishesEnabled' },
    { id: 'gift', label: 'Informasi Hadiah', icon: 'fa-gift', enabled: true, nav: ['konten', 'hadiah'], featureKey: 'giftEnabled' },
    { id: 'footer', label: 'Penutup (Terima Kasih)', icon: 'fa-hands-praying', enabled: true }
];

export default function SusunanPanel({ invitation, onUpdated, onLivePreview, onNavigateTab }) {
    const { toast } = useUI();
    const [saving, setSaving] = useState(false);
    const [items, setItems] = useState(DEFAULT_LAYOUT);
    const [expandedInline, setExpandedInline] = useState(null);

    

    useEffect(() => {
        if (invitation?.themeSettings?.layoutOrder) {
            try {
                const savedOrder = typeof invitation.themeSettings.layoutOrder === 'string' 
                    ? JSON.parse(invitation.themeSettings.layoutOrder) 
                    : invitation.themeSettings.layoutOrder;
                
                if (Array.isArray(savedOrder) && savedOrder.length > 0) {
                    const mergedItems = savedOrder.map(saved => {
                        const defaultMatch = DEFAULT_LAYOUT.find(d => d.id === saved.id);
                        return defaultMatch ? { ...defaultMatch, enabled: saved.enabled } : saved;
                    }).filter(Boolean);

                    DEFAULT_LAYOUT.forEach(def => {
                        if (!mergedItems.find(mi => mi.id === def.id)) {
                            // If it's a new feature block, initialize its enabled state from invitationFeatures
                            let isEnabled = def.enabled;
                            if (def.featureKey && invitation?.invitationFeatures) {
                                isEnabled = !!invitation.invitationFeatures[def.featureKey];
                            }
                            mergedItems.push({ ...def, enabled: isEnabled });
                        }
                    });

                    // Sync state from invitationFeatures just in case it was toggled elsewhere
                    const finalItems = mergedItems.map(item => {
                        if (item.featureKey && invitation?.invitationFeatures && invitation.invitationFeatures.hasOwnProperty(item.featureKey)) {
                            return { ...item, enabled: !!invitation.invitationFeatures[item.featureKey] };
                        }
                        return item;
                    });

                    setItems(finalItems);
                }
            } catch(e) {
                console.error("Error parsing layoutOrder:", e);
            }
        } else {
            // First time loading without layoutOrder, sync with features
            const syncItems = DEFAULT_LAYOUT.map(item => {
                if (item.featureKey && invitation?.invitationFeatures && invitation.invitationFeatures.hasOwnProperty(item.featureKey)) {
                    return { ...item, enabled: !!invitation.invitationFeatures[item.featureKey] };
                }
                return item;
            });
            setItems(syncItems);
        }
    }, [invitation?.id]);

    const updatePreview = useCallback(
        debounce((newOrder) => {
            if (onLivePreview) {
                onLivePreview({
                    themeSettings: {
                        ...invitation?.themeSettings,
                        layoutOrder: newOrder
                    }
                });
            }
        }, 300),
        [invitation, onLivePreview]
    );

    const toggleItem = (id) => {
        const newItems = items.map(item => 
            item.id === id ? { ...item, enabled: !item.enabled } : item
        );
        setItems(newItems);
        updatePreview(newItems);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Build features payload to sync them perfectly
            const featureUpdates = {};
            items.forEach(item => {
                if (item.featureKey) {
                    featureUpdates[item.featureKey] = item.enabled;
                }
            });

            // Parallel save to both endpoints
            const [themeRes, featuresRes] = await Promise.all([
                api.patch('/invitations/me/theme', { layoutOrder: items }),
                api.patch('/invitations/me/features', featureUpdates)
            ]);

            if (onUpdated) {
                onUpdated({ 
                    ...invitation, 
                    themeSettings: { ...invitation.themeSettings, ...themeRes.data.themeSettings },
                    invitationFeatures: featuresRes.data.features
                });
            }
            toast.success('Susunan blok & fitur berhasil disimpan!');
            if (onLivePreview) onLivePreview(null);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Gagal menyimpan susunan blok');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setItems(DEFAULT_LAYOUT);
        updatePreview(DEFAULT_LAYOUT);
    };

    return (
        <div className="panel-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="panel-header" style={{ margin: 0 }}>Susunan & Blok Halaman</h2>
                <button onClick={handleReset} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
                    <i className="fa-solid fa-rotate-left"></i> Reset
                </button>
            </div>
            <p className="panel-sub" style={{ marginTop: '8px' }}>Geser (drag & drop) untuk mengatur urutan. Aktifkan sakelar (On/Off) untuk menampilkan fitur undangan, lalu klik ⚙️ untuk mengatur konten.</p>

            <div className="panel-form" style={{ marginTop: '20px' }}>
                <Reorder.Group axis="y" values={items} onReorder={(newOrder) => { setItems(newOrder); updatePreview(newOrder); }} className="sortable-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', padding: 0, margin: 0 }}>
                    {items.map((item) => (
                        <Reorder.Item 
                            key={item.id}
                            value={item}
                            style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'var(--paper)',
                                    padding: '14px 16px',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    borderRadius: expandedInline === item.id ? '8px 8px 0 0' : '8px',
                                    cursor: 'grab',
                                    userSelect: 'none',
                                    opacity: item.enabled ? 1 : 0.6,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <i className="fa-solid fa-grip-vertical" style={{ color: '#ccc', fontSize: '14px', cursor: 'grab' }}></i>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: item.enabled ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                        <i className={`fa-solid ${item.icon}`} style={{ width: '20px', textAlign: 'center', color: item.enabled ? 'var(--wine-deep)' : '#ccc' }}></i>
                                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{item.label}</span>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {/* Edit / Gear Button */}
                                    {(item.nav || item.inlineEditor) && (
                                        <button 
                                            onClick={() => {
                                                if (!item.enabled) {
                                                    toast.info(`Aktifkan ${item.label} terlebih dahulu untuk mengedit.`);
                                                    return;
                                                }
                                                if (item.inlineEditor) {
                                                    setExpandedInline(expandedInline === item.id ? null : item.id);
                                                } else if (item.nav && onNavigateTab) {
                                                    onNavigateTab(item.nav[0], item.nav[1]);
                                                }
                                            }}
                                            style={{
                                                background: 'var(--background)',
                                                border: '1px solid rgba(0,0,0,0.05)',
                                                borderRadius: '6px',
                                                padding: '6px 10px',
                                                cursor: 'pointer',
                                                color: item.enabled ? 'var(--text-secondary)' : '#ccc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                fontSize: '12px',
                                                transition: '0.2s'
                                            }}
                                            className="btn-settings-block"
                                        >
                                            <i className="fa-solid fa-gear"></i> Atur
                                        </button>
                                    )}

                                    {/* Toggle Switch */}
                                    <div className="toggle-switch-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '12px', color: item.enabled ? 'var(--wine-deep)' : '#ff4d4f', fontWeight: 600, width: '22px', textAlign: 'right' }}>
                                            {item.enabled ? 'On' : 'Off'}
                                        </span>
                                        <label className="switch" style={{ margin: 0 }}>
                                            <input 
                                                type="checkbox" 
                                                checked={item.enabled} 
                                                onChange={() => toggleItem(item.id)} 
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Inline Editors */}
                            {expandedInline === item.id && item.inlineEditor === 'dresscode' && item.enabled && (
                                <div style={{ padding: '20px', background: '#fafafa', border: '1px solid rgba(0,0,0,0.05)', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                                    <DresscodeEditor invitation={invitation} onUpdated={onUpdated} />
                                </div>
                            )}
                            {expandedInline === item.id && item.inlineEditor === 'igFilter' && item.enabled && (
                                <div style={{ padding: '20px', background: '#fafafa', border: '1px solid rgba(0,0,0,0.05)', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                                    <IGFilterEditor invitation={invitation} onUpdated={onUpdated} />
                                </div>
                            )}
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                <div className="panel-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-save" onClick={handleSave} disabled={saving} style={{ padding: '12px 24px', fontSize: '15px' }}>
                        {saving ? (
                            <span><i className="fa-solid fa-spinner fa-spin"></i> Menyimpan...</span>
                        ) : (
                            <span><i className="fa-solid fa-floppy-disk"></i> Simpan Susunan & Blok</span>
                        )}
                    </button>
                </div>
            </div>
            
            <style>{`
                .sortable-list > div:active {
                    cursor: grabbing !important;
                }
                .btn-settings-block:hover {
                    background: #eaeaea !important;
                    color: var(--text-primary) !important;
                }
            `}</style>
        </div>
    );
}
