import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormDraft } from '../hooks/useFormDraft.js';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function AcaraPanel({ invitation, onUpdated, onLivePreview, client = api }) {
    const { t } = useTranslation();
    const events = invitation.events || [];
    const initialAkad = events.find((e) => e.type === 'akad') || {};
    const initialResepsi = events.find((e) => ['resepsi','ngunduh_mantu'].includes(e.type)) || {};

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
    }, client === api);

    const [resepsi, setResepsi, clearDraftResepsi] = useFormDraft(draftKeyResepsi, {
        date: initialResepsi.date ? initialResepsi.date.slice(0, 10) : '',
        startTime: initialResepsi.startTime || '',
        endTime: initialResepsi.endTime || '',
        venueName: initialResepsi.venueName || '',
        address: initialResepsi.address || '',
        googleMapsUrl: initialResepsi.googleMapsUrl || initialResepsi.mapsUrl || '',
        lat: initialResepsi.lat || '',
        lng: initialResepsi.lng || '',
    }, client === api);

    // Tentukan apakah default isSameLocation true/false
    const isActuallySame = (initialResepsi.venueName === initialAkad.venueName) && 
                           (initialResepsi.address === initialAkad.address) &&
                           ((initialResepsi.googleMapsUrl || initialResepsi.mapsUrl || '') === (initialAkad.googleMapsUrl || initialAkad.mapsUrl || '')) &&
                           (initialAkad.venueName || initialAkad.address); // Make sure it's not just empty

    const [settings, setSettings, clearDraftSettings] = useFormDraft(draftKeySettings, {
        mode: initialResepsi.type === 'ngunduh_mantu' ? 'ngunduh_mantu' : initialResepsi.id && !initialAkad.id ? 'resepsi' : 'both',
        isSameLocation: initialResepsi.id ? !!isActuallySame : true // Default true for new invites
    }, client === api);

    const [saving, setSaving] = useState(false);
    
    const { toast } = useUI();

    const mode = settings.mode || 'both';
    const both = mode === 'both';
    const sameLocation = both && settings.isSameLocation;
    function selectedEvents() {
        const finalReception = sameLocation ? {
            ...resepsi, venueName: akad.venueName, address: akad.address,
            googleMapsUrl: akad.googleMapsUrl, lat: akad.lat, lng: akad.lng,
        } : resepsi;
        const reception = { ...finalReception, type: mode === 'ngunduh_mantu' ? mode : 'resepsi' };
        return both ? [{ ...akad, type: 'akad' }, reception] : [reception];
    }
    useEffect(() => {
        onLivePreview?.({ events: selectedEvents() });
    }, [akad, resepsi, mode, sameLocation, onLivePreview]);

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
        const selected = selectedEvents();
        const removed = events.some(event => !selected.some(next => next.type === event.type));
        if (removed && !window.confirm('Jenis acara yang tidak dipilih akan dihapus dari undangan ini. Lanjutkan?')) return;
        setSaving(true);
        try {
            const { data } = await client.put('/invitations/me/events', { events: selected }, {
                headers: { 'x-invitation-id': invitation.id }, notification: false,
            });
            onUpdated({ ...invitation, events: data.events, weddingDate: data.weddingDate });
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

            <label className="field-label">Jenis acara
                <select className="text-input" value={mode} onChange={e => setSettings(current => ({ ...current, mode: e.target.value }))}>
                    <option value="both">Akad &amp; Resepsi</option>
                    <option value="resepsi">Resepsi saja</option>
                    <option value="ngunduh_mantu">Ngunduh Mantu</option>
                </select>
            </label>

            {both && (
            <div className="section-block" style={{ borderBottom: '2px dashed #e3d6b4', paddingBottom: '24px', marginBottom: '24px' }}>
                <div className="section-title">Akad Nikah / Pemberkatan</div>
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
                        <small style={{ fontSize: '11px', color: 'var(--ui-muted, #5c655d)', marginTop: '4px', display: 'block' }}>
                            Buka Google Maps di HP/Laptop → klik <strong>Bagikan</strong> → tempelkan link-nya di sini.
                        </small>
                    </div>

                    
                </div>
            </div>

            )}

            {/* RESEPSI */}
            <div className="section-block">
                <div className="section-title">{mode === 'ngunduh_mantu' ? 'Ngunduh Mantu' : 'Resepsi / Perayaan'}</div>
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

                    {both && <div style={{ margin: '8px 0 16px', padding: '12px 16px', background: 'var(--ui-card, #f8f9fa)', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px', lineHeight: 1.45, color: 'var(--ui-muted, #333)' }}>
                            <input 
                                type="checkbox" 
                                checked={settings.isSameLocation} 
                                onChange={(e) => setSettings(current => ({ ...current, isSameLocation: e.target.checked }))} 
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            Tempat dan lokasi resepsi sama dengan Akad Nikah
                        </label>
                    </div>}

                    {!sameLocation && (
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

                            
                        </>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '32px' }}>
                <Button saveAction 
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
