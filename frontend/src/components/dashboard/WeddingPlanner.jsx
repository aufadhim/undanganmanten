import {FundingPlan,PaymentHistory,PlannerAccess,RundownSharing} from './PlannerExtras.jsx';
import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import PlannerChecklist from './PlannerChecklist.jsx';
import './planner.css';

const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const financial = [['estimate', 'Estimasi (Rp)', 'number'], ['actual', 'Biaya aktual (Rp)', 'number'], ['paid', 'Sudah dibayar (Rp)', 'number'], ['due', 'Jatuh tempo', 'date']];
const notes = ['notes', 'Catatan', 'textarea'];
const modules = {
  savings: {title:'Tabungan',description:'Catat kontribusi nyata yang sudah disisihkan. Ini pencatatan dana, bukan rekening penyimpanan uang.',fields:[['title','Keterangan setoran'],['contributor','Penyetor'],['value','Nominal (Rp)','number'],['date','Tanggal setoran','date'],notes]},
  documents: {title:'Administrasi',description:'Pantau kebutuhan dokumen sesuai ketentuan instansi setempat.',fields:[['title','Nama dokumen'],['authority','Instansi / keperluan'],['owner','Yang mengurus'],['due','Tenggat','date'],['status','Status',['Belum diurus','Dalam proses','Lengkap']],['url','Tautan dokumen','url'],notes]},
  uniforms: {title:'Seragam',fields:[['title','Nama penerima'],['group','Keluarga / panitia'],['size','Ukuran'],['fabric','Bahan & warna'],['tailor','Penjahit'],['quantity','Jumlah','number',1],['due','Target selesai','date'],['status','Status',['Belum dipesan','Dipesan','Dijahit','Siap','Dibagikan']],notes]},
  songs: { title: 'Daftar Lagu', description: 'Susun lagu untuk tiap momen acara dan bagikan daftar ini ke operator musik.', fields: [['title', 'Judul lagu'], ['artist', 'Penyanyi'], ['moment', 'Momen acara'], ['start', 'Waktu putar', 'time'], ['owner', 'PIC musik'], ['url', 'Tautan lagu', 'url'], ['ready', 'Sudah dikonfirmasi operator', 'checkbox'], notes] },
  moodboard: { title: 'Moodboard', description: 'Simpan referensi dekorasi, busana, buket, atau warna. Gunakan tautan gambar langsung untuk menampilkan pratinjau.', fields: [['title', 'Judul referensi'], ['category', 'Kategori'], ['imageUrl', 'Tautan gambar langsung', 'url'], ['url', 'Tautan sumber', 'url'], ['owner', 'Vendor atau PIC terkait'], ['selected', 'Pilihan disetujui', 'checkbox'], notes] },
  shots: { title: 'Momen Foto', description: 'Catat momen dan kelompok yang perlu difoto. Tandai selesai setelah diabadikan.', fields: [['title', 'Momen atau kelompok foto'], ['moment', 'Sesi acara'], ['people', 'Orang yang harus ada'], ['location', 'Lokasi foto'], ['owner', 'Fotografer atau PIC'], ['done', 'Sudah difoto', 'checkbox'], notes] },
  budget: { title: 'Anggaran', fields: [['title', 'Pos biaya'], ['category', 'Kategori'], ...financial, notes] },
  vendors: { title: 'Vendor', fields: [['title', 'Nama vendor'], ['category', 'Kategori (venue, katering, dll.)'], ['contact', 'Kontak'], ['package','Isi paket / penawaran','textarea'], ['url','Tautan penawaran','url'], ['status','Status pemesanan',['Riset','Dihubungi','Dipesan','Selesai']], ['capacity', 'Kapasitas', 'number'], ...financial, ['selected', 'Masukkan ke anggaran', 'checkbox'], notes] },
  gifts: { title: 'Seserahan & Mahar', fields: [['title', 'Nama barang'], ['category', 'Jenis', ['Seserahan', 'Mahar']], ['quantity', 'Jumlah', 'number', 1], ['package','Isi paket','textarea'], ['url','Tautan toko','url'], ['status','Status pemesanan',['Riset','Dipesan','Diterima','Siap']], ['estimate', 'Estimasi per barang (Rp)', 'number'], ['owner', 'Penanggung jawab'], ['ready', 'Sudah siap', 'checkbox'], notes] },
  schedule: { title: 'Hari H', fields: [['title', 'Kegiatan'], ['event', 'Acara (akad, resepsi, dll.)'], ['date', 'Tanggal', 'date'], ['start', 'Jam mulai', 'time'], ['end', 'Jam selesai', 'time'], ['location', 'Lokasi'], ['owner', 'PIC'], notes] },
};
function PlannerIcon({id}) { return <svg className="planner-icon" viewBox="0 0 24 24" aria-hidden="true"><use href={'/templates/shared/planner-icons.svg#'+id} /></svg>; }
const navigation = [
 {label:'',items:[['summary','Ringkasan']]},
 {label:'Rencana & dana',items:[['checklist','Checklist'],['budget','Anggaran'],['savings','Tabungan']]},
 {label:'Persiapan acara',items:[['vendors','Vendor'],['documents','Administrasi'],['uniforms','Seragam'],['gifts','Seserahan & Mahar'],['schedule','Hari H']]},
 {label:'Inspirasi',items:[['songs','Daftar Lagu'],['moodboard','Moodboard'],['shots','Momen Foto']]},
 {label:'Bersama',items:[['guests','Tamu'],['access','Akses pasangan']]},
];
const tabs = navigation.flatMap(group=>group.items);
const outstanding = row => Math.max(0, (row.actual || row.estimate) - row.paid);
const emptyForm = fields => Object.fromEntries(fields.map(([name, , type, initial]) => [name, initial ?? (Array.isArray(type) ? type[0] : type === 'checkbox' ? false : type === 'number' ? 0 : '')]));

function MoodboardImage({ url, title }) {
  const [failed, setFailed] = useState(false);
  return failed ? <p>Gambar belum dapat ditampilkan. Buka tautan gambar untuk memeriksanya.</p> : <img className="planner-moodboard-image" src={url} alt={title} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
}

function EntryEditor({ module, rows, onSave, onDelete, onPayment, onRemovePayment, pending }) {
  const { fields, title } = modules[module];
  const [editing, setEditing] = useState(null);
  const [exportError, setExportError] = useState(false);
  const [form, setForm] = useState(() => emptyForm(fields));
  const reset = () => { setEditing(null); setForm(emptyForm(fields)); };
  const columns = fields.filter(([name]) => !['notes', 'imageUrl', 'url'].includes(name));
  const ordered = module === 'schedule' ? [...rows].sort((a,b) => (a.details.date + a.details.start).localeCompare(b.details.date + b.details.start)) : rows;

  async function exportSchedule() {
    const xlsx = await import('@e965/xlsx');
    const sheet = xlsx.utils.json_to_sheet(ordered.map(({ details }) => Object.fromEntries(fields.map(([key, label]) => [label, details[key]]))));
    const book = xlsx.utils.book_new();
    sheet['!cols'] = fields.map(() => ({ wch: 25 }));
    xlsx.utils.book_append_sheet(book, sheet, title.slice(0, 31));
    xlsx.writeFile(book, module + '-samavaya.xlsx');
  }

  return <section className="planner-card">
    <h2>{title}</h2>
    {modules[module].description && <p>{modules[module].description}</p>}
    {module === 'vendors' && <p>Bandingkan penawaran. Tandai vendor yang dipilih agar nilainya ikut dihitung di Anggaran.</p>}
    <form className="planner-entry-form" onSubmit={async event => {
      event.preventDefault();
      if (await onSave(module, editing, form)) reset();
    }}>
      {fields.map(([name, label, type, initial]) => {
        const props = { name, value: form[name] ?? '', onChange: event => setForm(values => ({ ...values, [name]: type === 'checkbox' ? event.target.checked : type === 'number' ? Number(event.target.value) : event.target.value })) };
        return <label key={name} className={type === 'textarea' ? 'planner-wide' : undefined}>
          {label}
          {Array.isArray(type) ? <select {...props}>{type.map(option => <option key={option}>{option}</option>)}</select>
            : type === 'textarea' ? <textarea {...props} maxLength={2000} rows={2} />
            : type === 'checkbox' ? <input name={name} type="checkbox" checked={Boolean(form[name])} onChange={props.onChange} />
            : <input {...props} type={type || 'text'} disabled={name === 'paid' && Array.isArray(form.payments)} min={type === 'number' ? initial ?? 0 : undefined} step={type === 'number' ? 1 : undefined} maxLength={type === 'url' ? 2000 : 140} required={['title', 'event', 'start', 'quantity'].includes(name)} />}
        </label>;
      })}
      <div className="planner-wide planner-actions">
        <button type="submit" className="workspace-primary" disabled={pending}>{editing ? 'Simpan perubahan' : 'Tambah'}</button>
        {editing && <button type="button" onClick={reset}>Batal</button>}
        {['schedule', 'songs', 'shots'].includes(module) && ordered.length > 0 && <button type="button" onClick={() => { setExportError(false); exportSchedule().catch(() => setExportError(true)); }}>Unduh {module === 'schedule' ? 'rundown' : title.toLowerCase()} Excel</button>}
      </div>
    </form>
    {exportError && <p role="alert">Daftar belum bisa diunduh. Coba lagi.</p>}
    {ordered.length === 0 && <p>Belum ada data.</p>}
    <div className="planner-entry-list">{ordered.map(entry => <article key={entry.id}>
      {module === 'moodboard' && entry.details.imageUrl && <MoodboardImage key={entry.details.imageUrl} url={entry.details.imageUrl} title={entry.details.title} />}
      <h3>{entry.details.title}</h3>
      {(entry.details.url || (module === 'moodboard' && entry.details.imageUrl)) && <div className="planner-reference-links">
        {entry.details.url && <a href={entry.details.url} target="_blank" rel="noopener noreferrer">{module === 'songs' ? 'Buka lagu' : 'Lihat sumber'} ↗</a>}
        {module === 'moodboard' && entry.details.imageUrl && <a href={entry.details.imageUrl} target="_blank" rel="noopener noreferrer">Buka gambar ↗</a>}
      </div>}
      <dl>{columns.slice(1).filter(([key]) => entry.details[key] != null && entry.details[key] !== '').map(([key, label, type]) =>
        <div key={key}><dt>{label}</dt><dd>{type === 'checkbox' ? (entry.details[key] ? 'Ya' : 'Belum') : ['estimate','actual','paid','value'].includes(key) ? money.format(entry.details[key]) : entry.details[key]}</dd></div>
      )}</dl>
      {entry.details.notes && <p>{entry.details.notes}</p>}
      {entry.updatedBy && <p className="planner-attribution">Terakhir diperbarui {entry.updatedBy} · {new Date(entry.updatedAt).toLocaleString('id-ID')}</p>}
      {['budget','vendors'].includes(module) && <PaymentHistory entry={entry} onAdd={onPayment} onRemove={onRemovePayment} pending={pending}/>}
      <div className="planner-actions">
        <button type="button" disabled={pending} onClick={event => { setEditing(entry.id); setForm({...emptyForm(fields),...entry.details}); event.currentTarget.closest('section').querySelector('input[name=title]').focus(); }}>Edit</button>
        <button type="button" disabled={pending} onClick={async () => { if (window.confirm('Hapus data ini?') && await onDelete(module, entry.id) && editing === entry.id) reset(); }}>Hapus</button>
      </div>
    </article>)}</div>
  </section>;
}

export default function WeddingPlanner({ wedding, onShortcut, activeView, onViewChange }) {
  const endpoint = '/weddings/' + wedding.id + '/planner';
  const [localTab, setLocalTab] = useState('summary');
  const requested = activeView ?? localTab;
  const tab = tabs.some(([id]) => id === requested) ? requested : 'summary';
  const setTab = next => onViewChange ? onViewChange(next) : setLocalTab(next);
  const [moreOpen, setMoreOpen] = useState(false);
  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function refresh() {
    const [records, checklist] = await Promise.all([api.get(endpoint + '/entries'), api.get(endpoint)]);
    setData(records.data);
    setTasks(checklist.data.tasks);
  }
  function retry() {
    setError('');
    refresh().catch(() => setError('Planner belum bisa dimuat. Coba lagi.'));
  }
  useEffect(retry, [endpoint, tab]);

  async function update(action) {
    setPending(true);
    setError('');
    try {
      await action();
      try { await refresh(); }
      catch { setError('Perubahan sudah tersimpan. Muat ulang daftar untuk melihat hasilnya.'); }
      return true;
    } catch {
      setError('Perubahan belum tersimpan. Periksa isian lalu coba lagi.');
      return false;
    } finally {
      setPending(false);
    }
  }

  const entries = data?.entries || [];
  const selectedVendors = entries.filter(entry => entry.module === 'vendors' && entry.details.selected);
  const finances = [...entries.filter(entry => entry.module === 'budget'), ...selectedVendors].map(entry => entry.details);
  const balance = finances.reduce((total, row) => total + outstanding(row), 0);
  const payments = finances.filter(row => row.due && outstanding(row)).sort((a,b) => a.due.localeCompare(b.due)).slice(0, 5);
  const relevantTasks = tasks.filter(task => !task.done).slice(0, 5);
  const days = Math.ceil((Date.parse(wedding.weddingDate.slice(0,10)) - Date.parse(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date()))) / 86400000);

  return <div className="workspace-planner planner-layout">
    <aside className="planner-sidebar"><nav className="planner-tabs" aria-label="Bagian Wedding Planner">{navigation.map(group=><div className="planner-nav-group" key={group.label}>{group.label&&<p>{group.label}</p>}{group.items.map(([id,label])=><button key={id} type="button" aria-current={tab===id?'page':undefined} onClick={()=>setTab(id)}><PlannerIcon id={id}/><span>{label}</span></button>)}</div>)}</nav></aside>
    <div className="planner-content">
    <nav className="planner-bottom-nav" aria-label="Navigasi Wedding Planner">
      {[['summary', 'Ringkasan', 'cover'], ['checklist', 'Checklist', 'rundown'], ['budget', 'Anggaran', 'gift']].map(([id, label, icon]) => <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => { setTab(id); setMoreOpen(false); }}><PlannerIcon id={id}/>{label}</button>)}
      <button type="button" aria-expanded={moreOpen} aria-current={!['summary','checklist','budget'].includes(tab)?'page':undefined} aria-controls="planner-more" onClick={() => setMoreOpen(value => !value)}><span aria-hidden="true">•••</span>Lainnya</button>
    </nav>
    {moreOpen && <><button className="planner-menu-scrim" aria-label="Tutup menu planner" onClick={() => setMoreOpen(false)} /><nav id="planner-more" className="planner-more-menu" aria-label="Fitur planner lainnya">{navigation.map(group=>{const items=group.items.filter(([id])=>!['summary','checklist','budget'].includes(id));return items.length>0&&<div className="planner-nav-group" key={group.label}>{group.label&&<p>{group.label}</p>}{items.map(([id,label])=><button key={id} type="button" aria-current={tab===id?'page':undefined} onClick={()=>{setTab(id);setMoreOpen(false)}}><PlannerIcon id={id}/><span>{label}</span><span aria-hidden="true">›</span></button>)}</div>})}</nav></>}
    {error && <p role="alert">{error} <button type="button" onClick={retry}>Muat ulang</button></p>}
    {!data && !error && <p role="status">Memuat planner…</p>}
    {tab === 'checklist' && <PlannerChecklist wedding={wedding} onShortcut={onShortcut} />}
    {data && tab === 'summary' && <>
      <section className="planner-welcome">
        <div><p>SELANGKAH MENUJU HARI BAHAGIA</p><h2>Rencana kecil,<br/><em>hari yang berarti.</em></h2><p>Mulai dari satu tugas, lalu siapkan setiap detail bersama.</p><button className="workspace-primary" onClick={() => setTab('checklist')}>{tasks.length ? 'Lanjutkan persiapan' : 'Susun checklist kalian'}</button></div>
        <div className="planner-progress" role="img" aria-label={tasks.filter(task=>task.done).length+' dari '+tasks.length+' tugas selesai'} style={{'--progress':(tasks.length ? tasks.filter(task=>task.done).length/tasks.length*100 : 0)+'%'}}>
          <div><strong>{tasks.length ? Math.round(tasks.filter(task=>task.done).length/tasks.length*100) : 0}%</strong><span>Tugas selesai</span></div>
        </div>
      </section>
      <div className="planner-metrics">
        <article><small>Hari pernikahan</small><strong>{days < 0 ? 'Sudah lewat' : days === 0 ? 'Hari ini' : days + ' hari lagi'}</strong></article>
        <article><small>Checklist selesai</small><strong>{tasks.filter(task => task.done).length} / {tasks.length}</strong></article>
        <article><small>Sisa pembayaran</small><strong>{money.format(balance)}</strong></article>
        <article><small>Undangan dengan RSVP</small><strong>{data.responses} / {data.guests}</strong></article>
      </div>
      <div className="planner-summary-grid">
        <section className="planner-card"><h2><PlannerIcon id="checklist"/>Tugas berikutnya</h2>{relevantTasks.length ? <ul>{relevantTasks.map(task => <li key={task.id}>{task.title} <time>{task.dueDate.slice(0,10)}</time></li>)}</ul> : <p>Belum ada tugas terbuka.</p>}<button onClick={() => setTab('checklist')}>Buka checklist</button></section>
        <section className="planner-card"><h2><PlannerIcon id="budget"/>Pembayaran berikutnya</h2>{payments.length ? <ul>{payments.map((row,index) => <li key={index}>{row.title} · {money.format(outstanding(row))} <time>{row.due}</time></li>)}</ul> : <p>Belum ada tagihan dengan jatuh tempo.</p>}<button onClick={() => setTab('budget')}>Buka anggaran</button></section>
      </div>
    </>}
    {data && tab === 'budget' && <div className="planner-metrics">
      {[['Estimasi', 'estimate'], ['Biaya aktual', 'actual'], ['Sudah dibayar', 'paid']].map(([label, key]) => <article key={key}><small>{label}</small><strong>{money.format(finances.reduce((total,row) => total + row[key], 0))}</strong></article>)}
      <article><small>Sisa pembayaran</small><strong>{money.format(balance)}</strong></article>
    </div>}
    {data && tab === 'budget' && selectedVendors.length > 0 && <section className="planner-card"><h2>Vendor masuk anggaran</h2><ul>{selectedVendors.map(({ id, details }) => <li key={id}>{details.title} · {money.format(details.actual || details.estimate)} · Sisa {money.format(outstanding(details))}</li>)}</ul><button onClick={() => setTab('vendors')}>Kelola vendor</button></section>}
    {data && ['budget','savings'].includes(tab) && <FundingPlan mode={tab} settings={data.settings} finances={finances} contributions={entries.filter(e=>e.module==='savings')} pending={pending} onSave={form=>update(()=>api.put(endpoint+'/settings',form))}/>}
    {data && tab==='access' && <PlannerAccess endpoint={endpoint} role={data.role}/>}
    {data && tab==='schedule' && <RundownSharing endpoint={endpoint} role={data.role} wedding={wedding} rows={entries.filter(e=>e.module==='schedule')}/>}
    {data && modules[tab] && <EntryEditor key={tab} module={tab} rows={entries.filter(entry => entry.module === tab)} pending={pending}
      onSave={(module, id, form) => update(() => id ? api.put(endpoint + '/entries/' + module + '/' + id, form) : api.post(endpoint + '/entries/' + module, form))}
      onPayment={(id,form)=>update(()=>api.post(endpoint+'/payments/'+id,form))}
      onRemovePayment={(id,paymentId)=>update(()=>api.delete(endpoint+'/payments/'+id+'/'+paymentId))}
      onDelete={(module, id) => update(() => api.delete(endpoint + '/entries/' + module + '/' + id))} />}
    {data && tab === 'guests' && <section className="planner-card"><h2>Tamu & RSVP</h2><p>{data.guests} undangan tamu · {data.responses} sudah merespons · {data.attending} orang konfirmasi hadir</p>{onShortcut && <button onClick={() => onShortcut('guests')}>Kelola daftar tamu dan RSVP</button>}</section>}
  </div></div>;
}

