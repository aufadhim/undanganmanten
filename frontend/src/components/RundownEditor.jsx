import { useState } from 'react';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function RundownEditor({ invitation, onUpdated, onLivePreview }) {
    const rundowns = invitation.rundowns || [];
    const [adding, setAdding] = useState(false);
    const [newTime, setNewTime] = useState('');
    const [newActivity, setNewActivity] = useState('');
    const [saving, setSaving] = useState(false);
    
    const [rundownEnabled, setRundownEnabled] = useState(invitation?.invitationFeatures?.rundownEnabled || false);
    const { toast, confirm } = useUI();

    async function handleAdd() {
        if (!newTime || !newActivity) return toast.error('Waktu dan kegiatan wajib diisi');
        setSaving(true);
        try {
            const res = await api.post('/invitations/me/rundowns', {
                time: newTime,
                activity: newActivity,
                order: rundowns.length
            });
            const newRundown = res.data.rundown;
            onUpdated({
                ...invitation,
                rundowns: [...rundowns, newRundown]
            });
            setNewTime('');
            setNewActivity('');
            setAdding(false);
        } catch (err) {
            console.error(err);
            toast.error('Gagal menambah rundown');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        const isConfirmed = await confirm('Hapus Kegiatan', 'Hapus kegiatan ini?');
        if (!isConfirmed) return;
        try {
            await api.delete(`/invitations/me/rundowns/${id}`);
            onUpdated({
                ...invitation,
                rundowns: rundowns.filter(r => r.id !== id)
            });
            toast.success('Rundown berhasil dihapus');
        } catch (err) {
            console.error(err);
            toast.error('Gagal menghapus rundown');
        }
    }

    // Handle Toggle Rundown On/Off
    async function handleToggleRundown() {
        const checked = !rundownEnabled;
        setRundownEnabled(checked);
        try {
            await api.patch('/invitations/me/features', { rundownEnabled: checked });
            const updatedFeatures = { ...invitation.invitationFeatures, rundownEnabled: checked };
            onUpdated({ ...invitation, invitationFeatures: updatedFeatures });
            if (onLivePreview) {
                onLivePreview({ invitationFeatures: updatedFeatures });
            }
        } catch (err) {
            console.error(err);
            setRundownEnabled(!checked); // revert
            toast.error(err.response?.data?.error || 'Gagal mengubah pengaturan fitur Rundown.');
        }
    }

    return (
        <div className="section-block">
            <div className="section-title">
                Rundown Acara
            </div>

            <div className="stack">
                {rundowns.length === 0 ? (
                    <div style={{ padding: '16px', background: '#f9f9f9', textAlign: 'center', borderRadius: '8px', color: '#888', fontSize: '13px' }}>
                        Belum ada kegiatan.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {rundowns.map((r, i) => (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', border: '1px solid #eee', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ background: 'var(--wine-deep)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 600 }}>
                                    {r.time}
                                </div>
                                <div style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>
                                    {r.activity}
                                </div>
                                <Button variant="secondary" onClick={() => handleDelete(r.id)} style={{ padding: '6px 10px', color: 'red', border: 'none', background: '#fce8e8' }}>
                                    <i className="fa-solid fa-trash"></i>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {adding ? (
                    <div style={{ background: '#f4f5f7', padding: '16px', borderRadius: '8px', marginTop: '8px' }}>
                        <div className="grid-2">
                            <div>
                                <span className="field-label">Waktu (Misal: 08:00 - 10:00)</span>
                                <input className="text-input" value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="08:00" />
                            </div>
                            <div>
                                <span className="field-label">Kegiatan (Misal: Akad Nikah)</span>
                                <input className="text-input" value={newActivity} onChange={e => setNewActivity(e.target.value)} placeholder="Akad Nikah" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                            <Button variant="secondary" onClick={() => setAdding(false)}>Batal</Button>
                            <Button variant="primary" onClick={handleAdd} isLoading={saving}>Simpan Kegiatan</Button>
                        </div>
                    </div>
                ) : (
                    <Button variant="secondary" onClick={() => setAdding(true)} style={{ marginTop: '8px', borderStyle: 'dashed' }}>
                        <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i> Tambah Kegiatan
                    </Button>
                )}
            </div>
        </div>
    );
}
