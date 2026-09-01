import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormDraft } from '../hooks/useFormDraft.js';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function AcaraPanel({ invitation, onUpdated, onLivePreview }) {
    const { t } = useTranslation();
    const events = invitation.events || [];
    const initialAkad = events.find((e) => e.type === 'akad') || {};
    const initialResepsi = events.find((e) => e.type === 'resepsi') || {};

    const draftKeyAkad = `draft_acara_akad_${invitation.id}`;
    const draftKeyResepsi = `draft_acara_resepsi_${invitation.id}`;
    const draftKeySettings = `draft_acara_settings_${invitation.id}`;

    const [akad, setAkad, clearDraftAkad] = useFormDraft(draftKeyAkad, {
        date: initialAkad.date ? initialAkad.date.slice(0, 10) : '',
        startTime: initialAkad.startTime || '',
        endTime: initialAkad.endTime || '',
        venueName: initialAkad.venueName || '',
        address: initialAkad.address || '',
        googleMapsUrl: initialAkad.googleMapsUrl || initialAkad.mapsUrl || '',
        lat: initialAkad.lat || '',
        lng: initialAkad.lng || '',
    });

    const [resepsi, setResepsi, clearDraftResepsi] = useFormDraft(draftKeyResepsi, {
        date: initialResepsi.date ? initialResepsi.date.slice(0, 10) : '',
        startTime: initialResepsi.startTime || '',
        endTime: initialResepsi.endTime || '',
        venueName: initialResepsi.venueName || '',
        address: initialResepsi.address || '',
        googleMapsUrl: initialResepsi.googleMapsUrl || initialResepsi.mapsUrl || '',
        lat: initialResepsi.lat || '',
        lng: initialResepsi.lng || '',
    });

    // Tentukan apakah default isSameLocation true/false
    const isActuallySame = (initialResepsi.venueName === initialAkad.venueName) && 
                           (initialResepsi.address === initialAkad.address) &&
                           (initialAkad.venueName || initialAkad.address); // Make sure it's not just empty

    const [settings, setSettings, clearDraftSettings] = useFormDraft(draftKeySettings, {
        isSameLocation: initialResepsi.id ? !!isActuallySame : true // Default true for new invites
    });

    const [saving, setSaving] = useState(false);
    const [showAdvancedAkad, setShowAdvancedAkad] = useState(false);
    const [showAdvancedResepsi, setShowAdvancedResepsi] = useState(false);
    
    const { toast } = useUI();

    useEffect(() => {
        if (onLivePreview) {
            const finalResepsi = { ...resepsi };
            if (settings.isSameLocation) {
                finalResepsi.venueName = akad.venueName;
                finalResepsi.address = akad.address;
                finalResepsi.googleMapsUrl = akad.googleMapsUrl;
                finalResepsi.lat = akad.lat;
                finalResepsi.lng = akad.lng;
            }
            onLivePreview({
                events: [
                    { type: 'akad', ...akad },
                    { type: 'resepsi', ...finalResepsi }
                ]
            });
        }
    }, [akad, resepsi, settings.isSameLocation, onLivePreview]);

    // Helpers
    function handleMapsUrlChange(url, formState, setFormState) {
        let latVal = formState.lat;
        let lngVal = formState.lng;
        const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
            latVal = parseFloat(match[1]);
            lngVal = parseFloat(match[2]);
        }
        setFormState((f) => ({ ...f, googleMapsUrl: url, lat: latVal, lng: lngVal }));
    }

    async function handleSave() {
        setSaving(true);
        try {
            const finalResepsi = { ...resepsi };
            if (settings.isSameLocation) {
                finalResepsi.venueName = akad.venueName;
                finalResepsi.address = akad.address;
                finalResepsi.googleMapsUrl = akad.googleMapsUrl;
                finalResepsi.lat = akad.lat;
                finalResepsi.lng = akad.lng;
            }

            const [resAkad, resResepsi] = await Promise.all([
                api.post('/invitations/me/events', { type: 'akad', ...akad }),
                api.post('/invitations/me/events', { type: 'resepsi', ...finalResepsi })
            ]);

            onUpdated({ 
                ...invitation, 
                events: [resAkad.data.event, resResepsi.data.event]
            });
            clearDraftAkad();
            clearDraftResepsi();
            clearDraftSettings();
            toast.success('Seluruh rangkaian acara berhasil disimpan!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || `Gagal menyimpan rangkaian acara.`);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="panel-content">
            <h2 className="panel-header">{t('panels.acara_title')}</h2>
            <p className="panel-sub">Lengkapi detail waktu dan lokasi seluruh rangkaian acara Anda.</p>

            {/* AKAD */}
            <div className="section-block" style={{ borderBottom: '2px dashed #e3d6b4', paddingBottom: '24px', marginBottom: '24px' }}>
                <div className="section-title">Ring 1: Akad Nikah / Pemberkatan</div>
                <div className="stack">
                    <div>
                        <span className="field-label">{t('panels.date')}</span>
                        <input type="date" className="text-input" value={akad.date} onChange={(e) => setAkad(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div className="grid-2">
                        <div>
                            <span className="field-label">{t('panels.time')} (Mulai)</span>
                            <input type="time" className="text-input" value={akad.startTime} onChange={(e) => setAkad(f => ({ ...f, startTime: e.target.value }))} />
                        </div>
                        <div>
                            <span className="field-label">{t('panels.time')} (Selesai)</span>
                            <input type="time" className="text-input" value={akad.endTime} onChange={(e) => setAkad(f => ({ ...f, endTime: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                        <span className="field-label">{t('panels.location')}</span>
                        <input className="text-input" placeholder="Contoh: Gedung Serbaguna PP Polri" value={akad.venueName} onChange={(e) => setAkad(f => ({ ...f, venueName: e.target.value }))} />
                    </div>
                    <div>
                        <span className="field-label">{t('panels.address')}</span>
                        <textarea className="text-area" rows={2} placeholder="Jl. Siaga Raya, Pejaten Barat, Pasar Minggu" value={akad.address} onChange={(e) => setAkad(f => ({ ...f, address: e.target.value }))} />
                    </div>
                    <div>
                        <span className="field-label"><i className="fa-solid fa-map-location-dot" style={{marginRight: '6px'}}></i>Link Google Maps Lokasi Acara</span>
                        <input
                            className="text-input"
                            placeholder="Contoh: https://maps.app.goo.gl/xxx"
                            value={akad.googleMapsUrl}
                            onChange={(e) => handleMapsUrlChange(e.target.value, akad, setAkad)}
                        />
                        <small style={{ fontSize: '11px', color: '#5c655d', marginTop: '4px', display: 'block' }}>
                            Buka Google Maps di HP/Laptop → klik <strong>Bagikan</strong> → tempelkan link-nya di sini.
                        </small>
                    </div>

                    <div style={{ marginTop: '4px' }}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowAdvancedAkad(!showAdvancedAkad)}
                            style={{ color: '#7a2436', padding: 0 }}
                        >
                            {showAdvancedAkad ? <><i className="fa-solid fa-minus" style={{marginRight: '4px'}}></i> Sembunyikan Koordinat Manual</> : <><i className="fa-solid fa-plus" style={{marginRight: '4px'}}></i> Atur Koordinat Lat/Lng Manual (Opsional)</>}
                        </Button>
                    </div>

                    {showAdvancedAkad && (
                        <div className="grid-2" style={{ background: '#faf3e3', padding: '12px', borderRadius: '8px', border: '1px solid #e3d6b4' }}>
                            <div>
                                <span className="field-label">Latitude</span>
                                <input className="text-input" value={akad.lat} onChange={(e) => setAkad(f => ({ ...f, lat: e.target.value }))} placeholder="-6.200000" />
                            </div>
                            <div>
                                <span className="field-label">Longitude</span>
                                <input className="text-input" value={akad.lng} onChange={(e) => setAkad(f => ({ ...f, lng: e.target.value }))} placeholder="106.816666" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RESEPSI */}
            <div className="section-block">
                <div className="section-title">Ring 2: Resepsi / Perayaan</div>
                <div className="stack">
                    <div>
                        <span className="field-label">{t('panels.date')}</span>
                        <input type="date" className="text-input" value={resepsi.date} onChange={(e) => setResepsi(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div className="grid-2">
                        <div>
                            <span className="field-label">{t('panels.time')} (Mulai)</span>
                            <input type="time" className="text-input" value={resepsi.startTime} onChange={(e) => setResepsi(f => ({ ...f, startTime: e.target.value }))} />
                        </div>
                        <div>
                            <span className="field-label">{t('panels.time')} (Selesai)</span>
                            <input type="time" className="text-input" value={resepsi.endTime} onChange={(e) => setResepsi(f => ({ ...f, endTime: e.target.value }))} />
                        </div>
                    </div>

                    <div style={{ margin: '8px 0 16px', padding: '12px 16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px', lineHeight: 1.45, color: '#333' }}>
                            <input 
                                type="checkbox" 
                                checked={settings.isSameLocation} 
                                onChange={(e) => setSettings({ isSameLocation: e.target.checked })} 
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            Tempat dan lokasi resepsi sama dengan Akad Nikah
                        </label>
                    </div>

                    {!settings.isSameLocation && (
                        <>
                            <div>
                                <span className="field-label">{t('panels.location')}</span>
                                <input className="text-input" placeholder="Contoh: Gedung Serbaguna PP Polri" value={resepsi.venueName} onChange={(e) => setResepsi(f => ({ ...f, venueName: e.target.value }))} />
                            </div>
                            <div>
                                <span className="field-label">{t('panels.address')}</span>
                                <textarea className="text-area" rows={2} placeholder="Jl. Siaga Raya, Pejaten Barat, Pasar Minggu" value={resepsi.address} onChange={(e) => setResepsi(f => ({ ...f, address: e.target.value }))} />
                            </div>
                            <div>
                                <span className="field-label"><i className="fa-solid fa-map-location-dot" style={{marginRight: '6px'}}></i>Link Google Maps Lokasi Acara</span>
                                <input
                                    className="text-input"
                                    placeholder="Contoh: https://maps.app.goo.gl/xxx"
                                    value={resepsi.googleMapsUrl}
                                    onChange={(e) => handleMapsUrlChange(e.target.value, resepsi, setResepsi)}
                                />
                            </div>

                            <div style={{ marginTop: '4px' }}>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowAdvancedResepsi(!showAdvancedResepsi)}
                                    style={{ color: '#7a2436', padding: 0 }}
                                >
                                    {showAdvancedResepsi ? <><i className="fa-solid fa-minus" style={{marginRight: '4px'}}></i> Sembunyikan Koordinat Manual</> : <><i className="fa-solid fa-plus" style={{marginRight: '4px'}}></i> Atur Koordinat Lat/Lng Manual (Opsional)</>}
                                </Button>
                            </div>

                            {showAdvancedResepsi && (
                                <div className="grid-2" style={{ background: '#faf3e3', padding: '12px', borderRadius: '8px', border: '1px solid #e3d6b4' }}>
                                    <div>
                                        <span className="field-label">Latitude</span>
                                        <input className="text-input" value={resepsi.lat} onChange={(e) => setResepsi(f => ({ ...f, lat: e.target.value }))} placeholder="-6.200000" />
                                    </div>
                                    <div>
                                        <span className="field-label">Longitude</span>
                                        <input className="text-input" value={resepsi.lng} onChange={(e) => setResepsi(f => ({ ...f, lng: e.target.value }))} placeholder="106.816666" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '32px' }}>
                <Button 
                    variant="primary" 
                    fullWidth 
                    onClick={handleSave} 
                    isLoading={saving}
                >
                    Simpan Perubahan Acara
                </Button>
            </div>
        </div>
    );
}
