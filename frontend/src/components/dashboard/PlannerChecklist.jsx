import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const empty = { title: '', dueDate: '', category: 'Umum', owner: '' };
const localDate = new Intl.DateTimeFormat('sv-SE');
const readableDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'UTC' });
const shortcuts = { details: 'Edit detail acara', guests: 'Kelola tamu', preview: 'Siapkan publikasi', share: 'Bagikan undangan', rsvp: 'Lihat RSVP' };

export default function WeddingPlanner({ wedding, onShortcut }) {
  const endpoint = '/weddings/' + wedding.id + '/planner';
  const [tasks, setTasks] = useState(null);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    api.get(endpoint, { notification: false })
      .then(({ data }) => { if (active) setTasks(data.tasks); })
      .catch(() => { if (active) setError('Checklist belum bisa dimuat.'); });
    return () => { active = false; };
  }, [endpoint, reload]);

  async function change(action, after) {
    setBusy(true);
    setError('');
    try {
      await action();
      after?.();
      const { data } = await api.get(endpoint, { notification: false });
      setTasks(data.tasks);
    } catch {
      setError('Checklist belum bisa diperbarui. Muat ulang daftar sebelum mencoba lagi.');
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setForm(empty);
    setEditing(null);
  }

  const soon = localDate.format(new Date(Date.now() + 7 * 86400000));
  const groups = [
    ['Segera jatuh tempo', task => !task.done && task.dueDate.slice(0, 10) <= soon],
    ['Perlu dikerjakan', task => !task.done && task.dueDate.slice(0, 10) > soon],
    ['Selesai', task => task.done],
  ];

  return <div className="workspace-planner">
    <p className="workspace-subtitle">Atur tenggat dan cek progres persiapan pernikahan.</p>
    {error && <p role="alert">{error} <button type="button" onClick={() => { setError(''); setReload(value => value + 1); }}>Muat ulang</button></p>}
    {!tasks ? (!error && <p role="status">Memuat checklist…</p>) : <>
      {<button disabled={busy} onClick={() => change(() => api.post(endpoint + '/starter', {}))}>Tambahkan saran checklist</button>}
      <form onSubmit={event => {
        event.preventDefault();
        change(() => editing ? api.patch(endpoint + '/' + editing, form) : api.post(endpoint, form), resetForm);
      }}>
        <label>Nama tugas<input id="planner-task-form" required maxLength={140} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
        <label>Tenggat<input required type="date" min="1900-01-01" value={form.dueDate} onChange={event => setForm({ ...form, dueDate: event.target.value })} /></label>
        <label>Kategori<input required maxLength={50} value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} /></label>
        <label>Penanggung jawab<input maxLength={100} value={form.owner} onChange={event => setForm({ ...form, owner: event.target.value })} /></label>
        <button className="workspace-primary" disabled={busy}>{editing ? 'Simpan perubahan' : 'Tambah tugas'}</button>
        {editing && <button type="button" onClick={resetForm}>Batal</button>}
      </form>
      <p role="status">{tasks.filter(task => task.done).length} dari {tasks.length} tugas selesai</p>
      {groups.map(([label, filter]) => <section key={label}>
        <h2>{label}</h2>
        <ul>{tasks.filter(filter).map(task => <li key={task.id}>
          <label><input type="checkbox" checked={task.done} disabled={busy} onChange={event => change(() => api.patch(endpoint + '/' + task.id, { done: event.target.checked }))} />{task.title}</label>
          <p className="planner-attribution">{task.updatedBy && <>Terakhir diperbarui {task.updatedBy} · {new Date(task.updatedAt).toLocaleString('id-ID')}</>}</p>
          <small>{task.category}{task.owner && ' · ' + task.owner}</small>
          <time dateTime={task.dueDate.slice(0, 10)}>{readableDate.format(new Date(task.dueDate))}</time>
          <div>
            {onShortcut && shortcuts[task.preset] && <button type="button" onClick={() => onShortcut(task.preset)}>{shortcuts[task.preset]}</button>}
            <button type="button" disabled={busy} onClick={() => { setEditing(task.id); setForm({ title: task.title, dueDate: task.dueDate.slice(0, 10), category: task.category, owner: task.owner }); document.getElementById('planner-task-form').focus(); }}>Edit</button>
            <button type="button" disabled={busy} onClick={() => { if (window.confirm('Hapus tugas ini?')) change(() => api.delete(endpoint + '/' + task.id), editing === task.id ? resetForm : undefined); }}>Hapus</button>
          </div>
        </li>)}</ul>
        {!tasks.some(filter) && <p>Belum ada tugas di bagian ini.</p>}
      </section>)}
    </>}
  </div>;
}
