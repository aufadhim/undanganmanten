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
        themeId: selectedThemeId || 'exclusive-olan'
    });
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
            const res = await api.post('/invitations', form);
            onCreated(res.data.invitation);
        } catch (err) {
            setError(err.response?.data?.error || t('panels.fail') || 'Gagal membuat undangan.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h2 className="modal-title">{isFirstInvitation ? (t('dashboard.create_first') || 'Buat Undangan Pertamamu') : 'Buat Undangan Baru'}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} style={{ padding: '4px 8px' }}>✕</Button>
                </div>
                <p className="modal-subtitle">
                    Masukkan <strong>nama panggilan</strong> untuk tampilan awal. Nama lengkap &amp; gelar diisi di tab Profil nanti.
                </p>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="field-group">
                        <label>Nama Panggilan Mempelai Wanita</label>
                        <input
                            type="text"
                            placeholder="Contoh: Lita"
                            value={form.brideName}
                            onChange={(e) => setForm({ ...form, brideName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="field-group">
                        <label>Nama Panggilan Mempelai Pria</label>
                        <input
                            type="text"
                            placeholder="Contoh: Dzul"
                            value={form.groomName}
                            onChange={(e) => setForm({ ...form, groomName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="field-group">
                        <label>Tanggal Pernikahan</label>
                        <input
                            type="date"
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
                        <Button type="submit" variant="primary" isLoading={loading}>
                            Lanjut ke Editor
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
