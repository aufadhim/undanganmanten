import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from './ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function CeritaPanel({ invitation, onUpdated, onLivePreview }) {
    const { t } = useTranslation();
    const [stories, setStories] = useState(invitation.timelineStories || []);
    const [storyEnabled, setStoryEnabled] = useState(invitation.invitationFeatures?.storyEnabled || false);
    const [timelineEnabled, setTimelineEnabled] = useState(invitation?.invitationFeatures?.timelineEnabled ?? true);
    
    const [mainStory, setMainStory] = useState(invitation?.themeSettings?.mainStory || '');
    const [savingMain, setSavingMain] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    
    // Form state for Add/Edit
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ title: '', date: '', description: '' });
    
    const { toast, confirm } = useUI();

    // Sync from parent if changed outside
    useEffect(() => {
        setStories(invitation.timelineStories || []);
        setStoryEnabled(invitation.invitationFeatures?.storyEnabled || false);
        setTimelineEnabled(invitation.invitationFeatures?.timelineEnabled || false);
    }, [invitation.timelineStories, invitation.invitationFeatures]);

    // Handle Toggle On/Off
    async function handleToggle(key, currentState) {
        const checked = !currentState;
        
        if (key === 'storyEnabled') setStoryEnabled(checked);
        else if (key === 'timelineEnabled') setTimelineEnabled(checked);

        try {
            await api.patch('/invitations/me/features', { [key]: checked });
            const updatedFeatures = { ...invitation.invitationFeatures, [key]: checked };
            onUpdated({ ...invitation, invitationFeatures: updatedFeatures });
            if (onLivePreview) {
                onLivePreview({ invitationFeatures: updatedFeatures });
            }
        } catch (err) {
            console.error(err);
            if (key === 'storyEnabled') setStoryEnabled(!checked);
            else if (key === 'timelineEnabled') setTimelineEnabled(!checked);
            toast.error(err.response?.data?.error || `Gagal mengubah pengaturan fitur.`);
        }
    }

    // Reset Form
    function resetForm() {
        setForm({ title: '', date: '', description: '' });
        setEditingId(null);
        setShowForm(false);
    }

    // Handle Edit Click
    function handleEdit(story) {
        setEditingId(story.id);
        setForm({
            title: story.title,
            date: story.date ? story.date.slice(0, 10) : '',
            description: story.description || ''
        });
        setShowForm(true);
    }

    // Handle Save (Add/Edit)
    async function handleSaveStory(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                title: form.title,
                date: form.date ? new Date(form.date).toISOString() : null,
                description: form.description
            };

            let res;
            if (editingId) {
                res = await api.patch(`/invitations/me/timeline/${editingId}`, payload);
            } else {
                res = await api.post('/invitations/me/timeline', payload);
            }

            // Refetch or update locally
            const updatedStory = res.data.story;
            let newStories = [];
            if (editingId) {
                newStories = stories.map(s => s.id === editingId ? updatedStory : s);
            } else {
                newStories = [...stories, updatedStory];
            }
            
            setStories(newStories);
            onUpdated({ ...invitation, timelineStories: newStories });
            if (onLivePreview) {
                onLivePreview({ timelineStories: newStories });
            }
            resetForm();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Gagal menyimpan cerita.');
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveMainStory() {
        setSavingMain(true);
        try {
            const res = await api.patch('/invitations/me/theme', {
                mainStory: mainStory
            });
            onUpdated({ ...invitation, themeSettings: res.data.themeSettings });
            if (onLivePreview) {
                onLivePreview({ themeSettings: { ...invitation.themeSettings, mainStory } });
            }
            toast.success('Teks Cerita Utama berhasil disimpan!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Gagal menyimpan cerita utama.');
        } finally {
            setSavingMain(false);
        }
    }

    // Handle Delete
    async function handleDelete(id) {
        const isConfirmed = await confirm(
            'Hapus Cerita',
            'Yakin ingin menghapus cerita ini?'
        );
        if (!isConfirmed) return;
        
        setLoading(true);
        try {
            await api.delete(`/invitations/me/timeline/${id}`);
            const newStories = stories.filter(s => s.id !== id);
            setStories(newStories);
            onUpdated({ ...invitation, timelineStories: newStories });
            if (onLivePreview) {
                onLivePreview({ timelineStories: newStories });
            }
            toast.success('Cerita berhasil dihapus.');
        } catch (err) {
            console.error(err);
            toast.error('Gagal menghapus cerita.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="panel-content">
            <h2 className="panel-header">Cerita Cinta & Timeline</h2>
            <p className="panel-sub">Ceritakan perjalanan cinta Anda (Our Story) atau rangkaian tanggal penting (Timeline).</p>

            <div className="section-block" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ink)' }}>Teks Cerita Utama (Our Story)</div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Tuliskan ringkasan perjalanan kalian. Biarkan kosong jika bagian ini tidak diperlukan.</div>
                    </div>
                </div>
                <div className="stack">
                    <textarea 
                        className="text-area" 
                        rows={6} 
                        value={mainStory}
                        onChange={(e) => setMainStory(e.target.value)}
                        placeholder="Contoh: Kami bertemu tanpa rencana, bertumbuh dalam banyak cerita, lalu memilih berjalan bersama menuju selamanya."
                    ></textarea>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="primary" onClick={handleSaveMainStory} isLoading={savingMain}>
                            Simpan Cerita Utama
                        </Button>
                    </div>
                </div>
            </div>

            <div className="section-block" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ink)' }}>Tampilkan Timeline Perjalanan</div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Munculkan garis waktu kejadian (misal: Pertemuan Pertama, Lamaran).</div>
                    </div>
                    <label className="switch" style={{ flex: '0 0 40px', marginLeft: '16px' }}>
                        <input type="checkbox" checked={timelineEnabled} onChange={() => handleToggle('timelineEnabled', timelineEnabled)} />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            {/* LIST OF STORIES */}
            <div className="stack" style={{ marginBottom: '24px' }}>
                {stories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', background: '#fafafa', borderRadius: '8px', border: '1px dashed #ccc' }}>
                        <p style={{ color: '#888', margin: 0, fontSize: '13px' }}>Belum ada cerita yang ditambahkan.</p>
                    </div>
                ) : (
                    stories.map((story, idx) => (
                        <div key={story.id} style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--wine)', fontWeight: 700, marginBottom: '4px' }}>Babak {idx + 1}</div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px' }}>{story.title}</h4>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>{story.date ? new Date(story.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year:'numeric'}) : ''}</div>
                                <p style={{ fontSize: '13px', margin: 0, color: '#444' }}>{story.description}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button size="sm" variant="secondary" onClick={() => handleEdit(story)}>
                                    <i className="fa-solid fa-pen"></i>
                                </Button>
                                <Button size="sm" variant="danger" onClick={() => handleDelete(story.id)} disabled={loading}>
                                    <i className="fa-solid fa-trash"></i>
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ADD/EDIT FORM */}
            {!showForm ? (
                <Button 
                    fullWidth
                    variant="primary"
                    onClick={() => setShowForm(true)} 
                    icon={<i className="fa-solid fa-plus"></i>}
                >
                    Tambah Babak Cerita Baru
                </Button>
            ) : (
                <form onSubmit={handleSaveStory} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>{editingId ? 'Edit Cerita' : 'Tambah Cerita'}</h3>
                    
                    <div className="stack" style={{ gap: '12px' }}>
                        <div>
                            <span className="field-label">Judul (Misal: Pertama Bertemu) *</span>
                            <input required className="text-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Awal Bertemu" />
                        </div>
                        <div>
                            <span className="field-label">Tanggal Kejadian</span>
                            <input type="date" className="text-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                        </div>
                        <div>
                            <span className="field-label">Deskripsi Cerita *</span>
                            <textarea required className="text-area" rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Ceritakan bagaimana momen tersebut terjadi..."></textarea>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <Button type="button" variant="ghost" onClick={resetForm} disabled={loading} style={{ flex: 1 }}>
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" isLoading={loading} style={{ flex: 1 }}>
                            Simpan Cerita
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
