import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';

export default function CreateInvitationModal({ selectedThemeId, onClose, onCreated, isFirstInvitation = true }) {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        brideName: '',
        groomName: '',
        weddingDate: '',
        themeId: selectedThemeId || 'garden-canvas'
    });
    const [availableThemes,setAvailableThemes]=useState([]);
    useEffect(()=>{api.get('/themes/presets').then(({data})=>{setAvailableThemes(data.themes);setForm(f=>data.themes.some(t=>t.id===f.themeId)?f:{...f,themeId:data.themes[0]?.id||''})}).catch(()=>setError('Pilihan tema belum dapat dimuat. Tutup dan coba lagi.'))},[]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedThemeId) {
            setForm((prev) => ({ ...prev, themeId: selectedThemeId }));
        }
    }, [selectedThemeId]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const weddingDate = new FormData(e.currentTarget).get('weddingDate');
            const res = await api.post('/invitations', { ...form, weddingDate });
            onCreated(res.data.invitation);
        } catch (err) {
            setError(err.response?.data?.error || t('panels.fail') || 'Gagal membuat undangan.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-card create-invitation-modal" role="dialog" aria-modal="true" aria-labelledby="create-invitation-title">
                <div className="modal-header">
                    <h2 className="modal-title" id="create-invitation-title">{isFirstInvitation ? (t('dashboard.create_first') || 'Buat Undangan Pertamamu') : 'Buat Undangan Baru'}</h2>
                    <button type="button" className="create-invitation-close" aria-label="Tutup formulir" onClick={onClose}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg></button>
                </div>
                <p className="modal-subtitle">
                    Masukkan <strong>nama panggilan</strong> untuk tampilan awal. Nama lengkap &amp; gelar diisi di tab Profil nanti.
                </p>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="field-group"><label htmlFor="create-theme">Tema awal</label><select id="create-theme" value={form.themeId} onChange={e=>setForm({...form,themeId:e.target.value})} required>{availableThemes.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                    <div className="field-group">
                        <label htmlFor="create-brideName">Nama Panggilan Mempelai Wanita</label>
                        <input
                            type="text"
                            placeholder="Contoh: Lita"
                            id="create-brideName"
                            value={form.brideName}
                            onChange={(e) => setForm({ ...form, brideName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="field-group">
                        <label htmlFor="create-groomName">Nama Panggilan Mempelai Pria</label>
                        <input
                            type="text"
                            placeholder="Contoh: Dzul"
                            id="create-groomName"
                            value={form.groomName}
                            onChange={(e) => setForm({ ...form, groomName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="field-group">
                        <label htmlFor="create-weddingDate">Tanggal Pernikahan</label>
                        <input
                            type="date"
                            id="create-weddingDate"
                            name="weddingDate"
                            value={form.weddingDate}
                            onChange={(e) => setForm({ ...form, weddingDate: e.target.value })}
                            required
                        />
                    </div>

                    {error && <div className="form-error" style={{ marginTop: '12px' }}>{error}</div>}

                    <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" isLoading={loading} disabled={!availableThemes.length}>
                            Lanjut ke Editor
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
