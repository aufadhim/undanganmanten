import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function DresscodeEditor({ invitation, onUpdated, onLivePreview }) {
    const themeSettings = invitation?.themeSettings || {};
    
    // Default structure for dresscode details
    const defaultDetails = {
        title: themeSettings.dresscodeText || 'We kindly ask that guests please attend wearing our wedding colors.',
        items: [
            { icon: 'men', title: 'Men', desc: 'Garden', colors: ['#AABBCC', '#DDEEFF'] },
            { icon: 'women', title: 'Women', desc: 'Garden Party', colors: ['#AABBCC', '#DDEEFF'] }
        ]
    };

    const [details, setDetails] = useState(
        themeSettings.dresscodeDetails ? themeSettings.dresscodeDetails : defaultDetails
    );
    const [saving, setSaving] = useState(false);
    const { toast } = useUI();

    useEffect(() => {
        onLivePreview?.({ themeSettings: { ...themeSettings, dresscodeDetails: details } });
    }, [details]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.patch('/themes/me', {
                invitationId: invitation.id,
                dresscodeDetails: details
            });
            onUpdated({
                ...invitation,
                themeSettings: res.data.themeSettings
            });
            toast.success('Pengaturan Dresscode berhasil disimpan!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Gagal menyimpan pengaturan dresscode');
        } finally {
            setSaving(false);
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...details.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setDetails({ ...details, items: newItems });
    };

    const addColor = (index) => {
        const newItems = [...details.items];
        newItems[index].colors.push('#CCCCCC');
        setDetails({ ...details, items: newItems });
    };

    const updateColor = (itemIndex, colorIndex, val) => {
        const newItems = [...details.items];
        newItems[itemIndex].colors[colorIndex] = val;
        setDetails({ ...details, items: newItems });
    };

    const removeColor = (itemIndex, colorIndex) => {
        const newItems = [...details.items];
        newItems[itemIndex].colors = newItems[itemIndex].colors.filter((_, i) => i !== colorIndex);
        setDetails({ ...details, items: newItems });
    };

    return (
        <div style={{ marginTop: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
            <div style={{ marginBottom: '16px' }}>
                <label className="field-label">Teks Pembuka Dresscode</label>
                <textarea 
                    className="text-input" 
                    rows={2}
                    value={details.title}
                    onChange={(e) => setDetails({ ...details, title: e.target.value })}
                    placeholder="Contoh: We kindly ask that guests please attend wearing our wedding colors."
                />
            </div>

            {details.items.map((item, idx) => (
                <div key={idx} style={{ padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="field-label">Kategori (Cth: Pria/Men)</label>
                            <input 
                                type="text" 
                                className="text-input" 
                                value={item.title}
                                onChange={(e) => updateItem(idx, 'title', e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="field-label">Deskripsi Tambahan</label>
                            <input 
                                type="text" 
                                className="text-input" 
                                value={item.desc}
                                onChange={(e) => updateItem(idx, 'desc', e.target.value)}
                            />
                        </div>
                        <div style={{ width: '100px' }}>
                            <label className="field-label">Ikon</label>
                            <select 
                                className="text-input" 
                                value={item.icon}
                                onChange={(e) => updateItem(idx, 'icon', e.target.value)}
                            >
                                <option value="men">Jas (Pria)</option>
                                <option value="women">Gaun (Wanita)</option>
                                <option value="none">Tanpa Ikon</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="field-label">Palet Warna (Klik warna untuk ubah)</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {item.colors.map((c, cIdx) => (
                                <div key={cIdx} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input 
                                        type="color" 
                                        value={c}
                                        onChange={(e) => updateColor(idx, cIdx, e.target.value)}
                                        style={{ width: '36px', height: '36px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    />
                                    <button 
                                        onClick={() => removeColor(idx, cIdx)}
                                        style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <i className="fa-solid fa-times"></i>
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={() => addColor(idx)}
                                style={{ width: '36px', height: '36px', background: '#f0f0f0', border: '1px dashed #ccc', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <i className="fa-solid fa-plus" style={{ color: '#888' }}></i>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <Button variant="primary" onClick={handleSave} isLoading={saving}>
                    Simpan Dresscode
                </Button>
            </div>
        </div>
    );
}
