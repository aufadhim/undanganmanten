import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormDraft } from '../hooks/useFormDraft.js';
import { api } from '../api/client.js';
import ImageCropperModal from './ImageCropperModal.jsx';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';
import { getDummyBrideBio, getDummyGroomBio } from '../config/dummyProfile.js';
import { resolveImageUrl } from '../config/env.js';

function getImageUrl(path) {
    return resolveImageUrl(path);
}

export default function ProfilPanel({ invitation, onUpdated, onLivePreview }) {
    const { t } = useTranslation();
    const profile = invitation?.coupleProfile || {};
    const fileInputRefGroom = useRef(null);
    const fileInputRefBride = useRef(null);

    const draftKey = `draft_profil_${invitation.id}`;

    const [form, setForm, clearDraft] = useFormDraft(draftKey, {
        groomName: invitation?.coupleProfile?.groomName || '',
        groomFullName: invitation?.coupleProfile?.groomFullName || '',
        groomFather: invitation?.coupleProfile?.groomFather || '',
        groomMother: invitation?.coupleProfile?.groomMother || '',
        groomIg: invitation?.coupleProfile?.groomIg || '',
        groomBio: invitation?.coupleProfile?.groomBio || '',
        brideName: invitation?.coupleProfile?.brideName || '',
        brideFullName: invitation?.coupleProfile?.brideFullName || '',
        brideFather: invitation?.coupleProfile?.brideFather || '',
        brideMother: invitation?.coupleProfile?.brideMother || '',
        brideIg: invitation?.coupleProfile?.brideIg || '',
        brideBio: invitation?.coupleProfile?.brideBio || '',
    });
    const [saving, setSaving] = useState(false);
    const [bioVisibility, setBioVisibility] = useState({
        bride: invitation?.themeSettings?.brideBioEnabled ?? Boolean(invitation?.coupleProfile?.brideBio),
        groom: invitation?.themeSettings?.groomBioEnabled ?? Boolean(invitation?.coupleProfile?.groomBio),
    });
    const [uploading, setUploading] = useState('');
    const [cropConfig, setCropConfig] = useState(null);
    
    const { toast } = useUI();

    useEffect(() => {
        setBioVisibility({
            bride: invitation?.themeSettings?.brideBioEnabled ?? Boolean(invitation?.coupleProfile?.brideBio),
            groom: invitation?.themeSettings?.groomBioEnabled ?? Boolean(invitation?.coupleProfile?.groomBio),
        });
    }, [invitation?.id]);

    function emitLivePreview(nextForm, nextBioVisibility) {
        onLivePreview?.({
            coupleProfile: { ...profile, ...nextForm },
            themeSettings: {
                ...(invitation?.themeSettings || {}),
                brideBioEnabled: nextBioVisibility.bride,
                groomBioEnabled: nextBioVisibility.groom,
            },
        });
    }

    function update(field, value) {
        setForm((currentForm) => {
            const nextForm = { ...currentForm, [field]: value };
            emitLivePreview(nextForm, bioVisibility);
            return nextForm;
        });
    }

    function updateBioVisibility(side, value) {
        setBioVisibility((currentVisibility) => {
            const nextVisibility = { ...currentVisibility, [side]: value };
            emitLivePreview(form, nextVisibility);
            return nextVisibility;
        });
    }

    async function handleSave() {
        setSaving(true);
        try {
            const [res, themeRes] = await Promise.all([
                api.patch('/invitations/me/couple-profile', form),
                api.patch('/invitations/me/theme', {
                    brideBioEnabled: bioVisibility.bride,
                    groomBioEnabled: bioVisibility.groom,
                }),
            ]);
            const updatedProfile = res.data?.coupleProfile || res.data;
            onUpdated({ ...invitation, coupleProfile: updatedProfile, themeSettings: themeRes.data.themeSettings });
            clearDraft();
            toast.success('Profil mempelai berhasil disimpan!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Gagal menyimpan profil.');
        } finally {
            setSaving(false);
        }
    }

    function handleFileSelect(side, e) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Tampilkan modal cropper
        setCropConfig({
            side,
            file,
            url: URL.createObjectURL(file)
        });
        
        // Reset input file agar bisa memilih file yang sama lagi jika batal
        e.target.value = '';
    }

    async function handleCroppedUpload(blob) {
        if (!cropConfig) return;
        const { side, file } = cropConfig;
        
        // Tutup cropper
        setCropConfig(null);
        setUploading(side);

        const formData = new FormData();
        // Upload blob dengan nama original (atau nama baru .jpeg)
        formData.append('photo', blob, file.name);
        formData.append('side', side);

        try {
            const res = await api.post(`/invitations/me/couple-profile/photo?side=${side}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const updatedProfile = res.data?.coupleProfile || res.data;
            onUpdated({
                ...invitation,
                coupleProfile: updatedProfile,
            });
            toast.success(`Foto ${side === 'bride' ? 'Mempelai Wanita' : 'Mempelai Pria'} berhasil diunggah!`);
        } catch (err) {
            console.error('Error upload photo:', err);
            toast.error(err.response?.data?.error || 'Gagal mengunggah foto.');
        } finally {
            setUploading('');
        }
    }

    return (
        <div className="panel-content">
            <h2 className="panel-header">{t('panels.profil_title')}</h2>
            <p className="panel-sub">{t('panels.profil_sub')}</p>

            {/* BRIDE */}
            <div className="section-block">
                <div className="section-title">{t('panels.bride')}</div>
                <div className="stack">
                    <div className="photo-upload">
                        {profile.bridePhoto ? (
                            <img src={getImageUrl(profile.bridePhoto)} className="photo-thumb" alt="bride" />
                        ) : (
                            <div className="photo-thumb" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#888' }}>
                                No Photo
                            </div>
                        )}
                        <Button
                            as="label"
                            variant="secondary"
                            isLoading={uploading === 'bride'}
                            icon={<i className="fa-solid fa-camera"></i>}
                            style={{ cursor: 'pointer' }}
                        >
                            {uploading === 'bride' ? 'Mengunggah...' : 'Pilih Foto'}
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                disabled={uploading === 'bride'}
                                onChange={(e) => handleFileSelect('bride', e)}
                            />
                        </Button>
                    </div>
                    <div className="grid-2">
                        <div>
                            <span className="field-label">Nama Panggilan</span>
                            <input className="text-input" value={form.brideName} onChange={(e) => update('brideName', e.target.value)} />
                        </div>
                        <div>
                            <span className="field-label">Nama Lengkap</span>
                            <input className="text-input" value={form.brideFullName} onChange={(e) => update('brideFullName', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid-2">
                        <div>
                            <span className="field-label">{t('panels.father')}</span>
                            <input className="text-input" value={form.brideFather} onChange={(e) => update('brideFather', e.target.value)} />
                        </div>
                        <div>
                            <span className="field-label">{t('panels.mother')}</span>
                            <input className="text-input" value={form.brideMother} onChange={(e) => update('brideMother', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <span className="field-label">Username/Link Instagram</span>
                        <input className="text-input" value={form.brideIg} onChange={(e) => update('brideIg', e.target.value)} placeholder="@username atau url" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                            <span className="field-label" style={{ margin: 0 }}>Tampilkan Profil Singkat / Bio</span>
                            <label className="switch" style={{ margin: 0 }}><input type="checkbox" checked={bioVisibility.bride} onChange={(e) => updateBioVisibility('bride', e.target.checked)} /><span className="slider"></span></label>
                        </div>
                        <textarea className="text-input" value={form.brideBio} onChange={(e) => update('brideBio', e.target.value)} placeholder={getDummyBrideBio(form.brideName || 'Arunika')} rows={5} disabled={!bioVisibility.bride} />
                        <small style={{ color: '#777' }}>{bioVisibility.bride ? 'Teks ini akan tampil di bawah profil mempelai.' : 'Aktifkan jika ingin menampilkan bio di undangan.'}</small>
                    </div>
                </div>
            </div>

            {/* GROOM */}
            <div className="section-block">
                <div className="section-title">{t('panels.groom')}</div>
                <div className="stack">
                    <div className="photo-upload">
                        {profile.groomPhoto ? (
                            <img src={getImageUrl(profile.groomPhoto)} className="photo-thumb" alt="groom" />
                        ) : (
                            <div className="photo-thumb" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#888' }}>
                                No Photo
                            </div>
                        )}
                        <Button
                            as="label"
                            variant="secondary"
                            isLoading={uploading === 'groom'}
                            icon={<i className="fa-solid fa-camera"></i>}
                            style={{ cursor: 'pointer' }}
                        >
                            {uploading === 'groom' ? 'Mengunggah...' : 'Pilih Foto'}
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                disabled={uploading === 'groom'}
                                onChange={(e) => handleFileSelect('groom', e)}
                            />
                        </Button>
                    </div>
                    <div className="grid-2">
                        <div>
                            <span className="field-label">Nama Panggilan</span>
                            <input className="text-input" value={form.groomName} onChange={(e) => update('groomName', e.target.value)} />
                        </div>
                        <div>
                            <span className="field-label">Nama Lengkap</span>
                            <input className="text-input" value={form.groomFullName} onChange={(e) => update('groomFullName', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid-2">
                        <div>
                            <span className="field-label">{t('panels.father')}</span>
                            <input className="text-input" value={form.groomFather} onChange={(e) => update('groomFather', e.target.value)} />
                        </div>
                        <div>
                            <span className="field-label">{t('panels.mother')}</span>
                            <input className="text-input" value={form.groomMother} onChange={(e) => update('groomMother', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <span className="field-label">Username/Link Instagram</span>
                        <input className="text-input" value={form.groomIg} onChange={(e) => update('groomIg', e.target.value)} placeholder="@username atau url" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                            <span className="field-label" style={{ margin: 0 }}>Tampilkan Profil Singkat / Bio</span>
                            <label className="switch" style={{ margin: 0 }}><input type="checkbox" checked={bioVisibility.groom} onChange={(e) => updateBioVisibility('groom', e.target.checked)} /><span className="slider"></span></label>
                        </div>
                        <textarea className="text-input" value={form.groomBio} onChange={(e) => update('groomBio', e.target.value)} placeholder={getDummyGroomBio(form.groomName || 'Deva')} rows={5} disabled={!bioVisibility.groom} />
                        <small style={{ color: '#777' }}>{bioVisibility.groom ? 'Teks ini akan tampil di bawah profil mempelai.' : 'Aktifkan jika ingin menampilkan bio di undangan.'}</small>
                    </div>
                </div>
            </div>

            <Button variant="primary" onClick={handleSave} isLoading={saving} style={{ marginTop: '16px' }}>
                {t('panels.save')}
            </Button>

            {cropConfig && (
                <ImageCropperModal
                    imageSrc={cropConfig.url}
                    aspect={1} // Foto profil 1:1 bulat
                    onComplete={handleCroppedUpload}
                    onCancel={() => setCropConfig(null)}
                />
            )}
        </div>
    );
}
