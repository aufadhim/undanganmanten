import React, { useState, useRef } from 'react';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function LivestreamEditor({ invitation, onUpdated, onLivePreview }) {
    const livestream = invitation.livestreamSettings || {};
    const [url, setUrl] = useState(livestream.url || '');
    const [coverImageUrl, setCoverImageUrl] = useState(livestream.coverImageUrl || '');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    
    const [livestreamEnabled, setLivestreamEnabled] = useState(invitation?.invitationFeatures?.livestreamEnabled || false);
    const { toast } = useUI();

    async function handleSave() {
        setSaving(true);
        try {
            const res = await api.patch('/invitations/me/livestream-settings', { 
                url, 
                coverImageUrl 
            });
            onUpdated({
                ...invitation,
                livestreamSettings: res.data.livestreamSettings
            });
            toast.success('Pengaturan Live Streaming berhasil disimpan');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Gagal menyimpan live streaming');
        } finally {
            setSaving(false);
        }
    }

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (invitation.id) {
            formData.append('invitationId', invitation.id);
        }

        try {
            const res = await api.post('/themes/upload-asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCoverImageUrl(res.data.url);
            onLivePreview?.({ livestreamSettings: { ...livestream, url, coverImageUrl: res.data.url } });
            toast.success('Cover Livestream berhasil diunggah. Jangan lupa klik Simpan!');
        } catch (err) {
            console.error(err);
            toast.error('Gagal mengunggah gambar');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Handle Toggle Livestream On/Off
    async function handleToggleLivestream() {
        const checked = !livestreamEnabled;
        setLivestreamEnabled(checked);
        try {
            await api.patch('/invitations/me/features', { livestreamEnabled: checked });
            const updatedFeatures = { ...invitation.invitationFeatures, livestreamEnabled: checked };
            onUpdated({ ...invitation, invitationFeatures: updatedFeatures });
            if (onLivePreview) {
                onLivePreview({ invitationFeatures: updatedFeatures });
            }
        } catch (err) {
            console.error(err);
            setLivestreamEnabled(!checked); // revert
            toast.error(err.response?.data?.error || 'Gagal mengubah pengaturan fitur Live Streaming.');
        }
    }

    return (
        <div className="section-block">
            <div className="section-title">
                Link Live Streaming
            </div>

            <div className="stack">
                <div>
                    <span className="field-label">URL / Link Live Streaming (Misal: YouTube, Zoom, dll)</span>
                    <input 
                        className="text-input" 
                        value={url} 
                        onChange={e => { const value = e.target.value; setUrl(value); onLivePreview?.({ livestreamSettings: { ...livestream, url: value, coverImageUrl } }); }} 
                        placeholder="https://youtube.com/live/..." 
                    />
                </div>

                <div>
                    <label className="field-label">Foto / Gambar Sampul Live Streaming (Opsional)</label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
                        <div 
                            style={{ 
                                width: '160px', 
                                height: '90px', // 16:9 ratio
                                background: '#e9ecef', 
                                borderRadius: '8px', 
                                border: '1px dashed #ccc',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : 'none'
                            }}
                        >
                            {!coverImageUrl && <i className="fa-solid fa-image" style={{ color: '#aaa', fontSize: '24px' }}></i>}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '12px' }}>
                                Unggah foto atau *thumbnail* yang akan ditampilkan sebelum tamu mengeklik tombol Putar. Direkomendasikan rasio lanskap (16:9).
                            </p>
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleUpload}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button 
                                    variant="outline" 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Mengunggah...' : 'Pilih Gambar'}
                                </Button>
                                {coverImageUrl && (
                                    <Button 
                                        variant="outline" 
                                    onClick={() => { setCoverImageUrl(''); onLivePreview?.({ livestreamSettings: { ...livestream, url, coverImageUrl: '' } }); }}
                                        style={{ color: 'red', borderColor: 'red' }}
                                    >
                                        Hapus
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <Button 
                        variant="primary" 
                        onClick={handleSave} 
                        isLoading={saving}
                    >
                        Simpan Pengaturan Live
                    </Button>
                </div>
            </div>
        </div>
    );
}
