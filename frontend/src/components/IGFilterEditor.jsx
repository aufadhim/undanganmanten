import React, { useState, useRef } from 'react';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function IGFilterEditor({ invitation, onUpdated, onLivePreview }) {
    const themeSettings = invitation?.themeSettings || {};
    const [url, setUrl] = useState(themeSettings.igFilterUrl || '');
    const [imageUrl, setImageUrl] = useState(themeSettings.igFilterImageUrl || '');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const { toast } = useUI();
    const fileInputRef = useRef(null);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.patch('/themes/me', {
                invitationId: invitation.id,
                igFilterUrl: url,
                igFilterImageUrl: imageUrl
            });
            onUpdated({
                ...invitation,
                themeSettings: res.data.themeSettings
            });
            toast.success('Pengaturan Filter IG berhasil disimpan!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Gagal menyimpan pengaturan Filter IG');
        } finally {
            setSaving(false);
        }
    };

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
            setImageUrl(res.data.url);
            onLivePreview?.({ themeSettings: { ...themeSettings, igFilterUrl: url, igFilterImageUrl: res.data.url } });
            toast.success('Gambar berhasil diunggah. Jangan lupa klik Simpan!');
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

    return (
        <div style={{ marginTop: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
            <div className="stack">
                <div>
                    <label className="field-label">Link / URL Filter Instagram</label>
                    <input 
                        type="text" 
                        className="text-input" 
                        value={url}
                        onChange={(e) => { const value = e.target.value; setUrl(value); onLivePreview?.({ themeSettings: { ...themeSettings, igFilterUrl: value, igFilterImageUrl: imageUrl } }); }}
                        placeholder="Contoh: https://www.instagram.com/ar/..."
                    />
                </div>

                <div>
                    <label className="field-label">Foto Pratinjau / Contoh Filter (Opsional)</label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
                        <div 
                            style={{ 
                                width: '120px', 
                                height: '210px', // ~9:16 ratio
                                background: '#e9ecef', 
                                borderRadius: '8px', 
                                border: '1px dashed #ccc',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundImage: imageUrl ? `url(${imageUrl})` : 'none'
                            }}
                        >
                            {!imageUrl && <i className="fa-solid fa-image" style={{ color: '#aaa', fontSize: '24px' }}></i>}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '12px' }}>
                                Unggah foto hasil *screenshot* filter Instagram kalian agar tamu bisa melihat pratinjaunya sebelum mencoba. Disarankan menggunakan foto potrait (berdiri).
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
                                {imageUrl && (
                                    <Button 
                                        variant="outline" 
                                    onClick={() => { setImageUrl(''); onLivePreview?.({ themeSettings: { ...themeSettings, igFilterUrl: url, igFilterImageUrl: '' } }); }}
                                        style={{ color: 'red', borderColor: 'red' }}
                                    >
                                        Hapus
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <Button variant="primary" onClick={handleSave} isLoading={saving}>
                        Simpan Filter IG
                    </Button>
                </div>
            </div>
        </div>
    );
}
