import CharacterPanel from './CharacterPanel.jsx';
import {isMentalCanvas} from './MentalCanvasMediaPanel.jsx';
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

export default function ProfilPanel({ invitation, onUpdated, onLivePreview, activeSection, sandbox=false }) {
    const { t } = useTranslation();
    const profile = invitation?.coupleProfile || {};
    const characterDraft = useRef(null);
    const fileInputRefGroom = useRef(null);
    const fileInputRefBride = useRef(null);

    const draftKey = `draft_profil_${invitation.id}`;

    const [form, setForm, clearDraft] = useFormDraft(draftKey, {
        groomName: invitation?.coupleProfile?.groomName || '',
        groomFullName: invitation?.coupleProfile?.groomFullName || '',
        groomFather: invitation?.coupleProfile?.groomFather || '',
        groomMother: invitation?.coupleProfile?.groomMother || '',
        groomIg: invitation?.coupleProfile?.groomIg || '',
        groomInstagramEnabled: invitation?.themeSettings?.groomInstagramEnabled ?? Boolean(invitation?.coupleProfile?.groomIg),
        groomBio: invitation?.coupleProfile?.groomBio || '',
        brideName: invitation?.coupleProfile?.brideName || '',
        brideFullName: invitation?.coupleProfile?.brideFullName || '',
        brideFather: invitation?.coupleProfile?.brideFather || '',
        brideMother: invitation?.coupleProfile?.brideMother || '',
        brideIg: invitation?.coupleProfile?.brideIg || '',
        brideInstagramEnabled: invitation?.themeSettings?.brideInstagramEnabled ?? Boolean(invitation?.coupleProfile?.brideIg),
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

    const instagramSettings = ({ brideInstagramEnabled, groomInstagramEnabled }) => ({ brideInstagramEnabled, groomInstagramEnabled });
    const profileFields = ({ brideInstagramEnabled, groomInstagramEnabled, ...fields }) => fields;

    function emitLivePreview(nextForm, nextBioVisibility) {
        onLivePreview?.({
            coupleProfile: { ...profile, ...profileFields(nextForm) },
            themeSettings: {
                ...(invitation?.themeSettings || {}),
                ...(characterDraft.current || {}),
                ...instagramSettings(nextForm),
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

    function previewCharacter(patch){characterDraft.current=patch;onLivePreview?.({coupleProfile:{...profile,...profileFields(form)},themeSettings:{...patch,...instagramSettings(form),brideBioEnabled:bioVisibility.bride,groomBioEnabled:bioVisibility.groom}},true)}

    function handleCharacterUpdated(updated) {
        characterDraft.current=null;
        onUpdated(updated);
        const dirty=Object.entries(form).some(([key,value])=>String(profile[key]||'')!==String(value||''));
        if(dirty)onLivePreview?.({coupleProfile:{...updated.coupleProfile,...profileFields(form)},themeSettings:{...updated.themeSettings,...instagramSettings(form),brideBioEnabled:bioVisibility.bride,groomBioEnabled:bioVisibility.groom}});
    }

    async function handleSave() {
        setSaving(true);
        try {
            if(sandbox){
                onUpdated({...invitation,coupleProfile:{...profile,...profileFields(form)},themeSettings:{...invitation.themeSettings,...(characterDraft.current||{}),...instagramSettings(form),brideBioEnabled:bioVisibility.bride,groomBioEnabled:bioVisibility.groom}});
                characterDraft.current=null;clearDraft();toast.success('Konten tersimpan di perangkat ini.');return;
            }
            const {data}=await api.patch('/invitations/me/profile-content',{
                invitationId:invitation.id,
                profile:profileFields(form),
                themeSettings:{...(characterDraft.current||{}),...instagramSettings(form),brideBioEnabled:bioVisibility.bride,groomBioEnabled:bioVisibility.groom},
            },{notification:{loading:'Menyimpan profil dan ilustrasi…',success:'Profil dan ilustrasi tersimpan.'}});
            onUpdated({...invitation,coupleProfile:data.coupleProfile,themeSettings:data.themeSettings});
            characterDraft.current=null;
            clearDraft();

        } catch (err) {
            console.error(err);

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
            if(sandbox){
                const url=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)});
                onUpdated({...invitation,coupleProfile:{...profile,...profileFields(form),[side+'Photo']:url}});toast.success('Foto tersimpan di perangkat ini.');return;
            }
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
            <fieldset disabled={saving} style={{border:0,padding:0,margin:0,minWidth:0}} aria-busy={saving}>
            <h2 className="panel-header">{t('panels.profil_title')}</h2>
            <p className="panel-sub">{t('panels.profil_sub')}</p>

            {isMentalCanvas(invitation.themeId)&&<CharacterPanel key={`${invitation.id}:${invitation.themeId}`} invitation={invitation} onUpdated={handleCharacterUpdated} onLivePreview={previewCharacter} activeSection={activeSection} sandbox={sandbox}/>}
            {/* BRIDE */}
            <div className="section-block">
                <div className="section-title">{t('panels.bride')}</div>
                <div className="stack">
                    {!isMentalCanvas(invitation.themeId)&&<div className="photo-upload">
                        {profile.bridePhoto ? (
                            <img src={getImageUrl(profile.bridePhoto)} className="photo-thumb" alt="bride" />
                        ) : (
                            <div className="photo-thumb" style={{ background: 'var(--ui-card, #eee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--ui-muted, #888)' }}>
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
                    </div>}
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
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                            <span className="field-label" style={{ margin: 0 }}>Tampilkan Instagram</span>
                            <span className="switch"><input type="checkbox" role="switch" checked={Boolean(form.brideInstagramEnabled ?? form.brideIg)} onChange={(e) => update('brideInstagramEnabled', e.target.checked)} /><span className="slider"></span></span>
                        </label>
                        <input className="text-input" disabled={!(form.brideInstagramEnabled ?? form.brideIg)} value={form.brideIg} onChange={(e) => update('brideIg', e.target.value)} placeholder="@username atau url" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                            <span className="field-label" style={{ margin: 0 }}>Tampilkan Profil Singkat / Bio</span>
                            <label className="switch" style={{ margin: 0 }}><input type="checkbox" checked={bioVisibility.bride} onChange={(e) => updateBioVisibility('bride', e.target.checked)} /><span className="slider"></span></label>
                        </div>
                        <textarea className="text-input" value={form.brideBio} onChange={(e) => update('brideBio', e.target.value)} placeholder="Tulis profil singkat mempelai wanita…" rows={5} disabled={!bioVisibility.bride} />
                        <small style={{ color: 'var(--ui-muted, #777)' }}>{bioVisibility.bride ? 'Isi bio akan tampil di bawah profil mempelai. Kolom kosong tidak ditampilkan.' : 'Aktifkan jika ingin menampilkan bio di undangan.'}</small>
                    </div>
                </div>
            </div>

            {/* GROOM */}
            <div className="section-block">
                <div className="section-title">{t('panels.groom')}</div>
                <div className="stack">
                    {!isMentalCanvas(invitation.themeId)&&<div className="photo-upload">
                        {profile.groomPhoto ? (
                            <img src={getImageUrl(profile.groomPhoto)} className="photo-thumb" alt="groom" />
                        ) : (
                            <div className="photo-thumb" style={{ background: 'var(--ui-card, #eee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--ui-muted, #888)' }}>
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
                    </div>}
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
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                            <span className="field-label" style={{ margin: 0 }}>Tampilkan Instagram</span>
                            <span className="switch"><input type="checkbox" role="switch" checked={Boolean(form.groomInstagramEnabled ?? form.groomIg)} onChange={(e) => update('groomInstagramEnabled', e.target.checked)} /><span className="slider"></span></span>
                        </label>
                        <input className="text-input" disabled={!(form.groomInstagramEnabled ?? form.groomIg)} value={form.groomIg} onChange={(e) => update('groomIg', e.target.value)} placeholder="@username atau url" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                            <span className="field-label" style={{ margin: 0 }}>Tampilkan Profil Singkat / Bio</span>
                            <label className="switch" style={{ margin: 0 }}><input type="checkbox" checked={bioVisibility.groom} onChange={(e) => updateBioVisibility('groom', e.target.checked)} /><span className="slider"></span></label>
                        </div>
                        <textarea className="text-input" value={form.groomBio} onChange={(e) => update('groomBio', e.target.value)} placeholder="Tulis profil singkat mempelai pria…" rows={5} disabled={!bioVisibility.groom} />
                        <small style={{ color: 'var(--ui-muted, #777)' }}>{bioVisibility.groom ? 'Isi bio akan tampil di bawah profil mempelai. Kolom kosong tidak ditampilkan.' : 'Aktifkan jika ingin menampilkan bio di undangan.'}</small>
                    </div>
                </div>
            </div>

            <Button saveAction variant="primary" onClick={handleSave} isLoading={saving} style={{ marginTop: '16px' }}>
                {t('panels.save')}
            </Button>

            </fieldset>
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
