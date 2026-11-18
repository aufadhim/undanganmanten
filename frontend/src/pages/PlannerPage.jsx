import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import Brand from '../components/atelier/Brand.jsx';
import { DashboardThemeToggle } from '../components/atelier/CanvasRouteFrame.jsx';
import WeddingPlanner from '../components/dashboard/WeddingPlanner.jsx';
import '../components/dashboard/planner.css';

export default function PlannerPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [weddings, setWeddings] = useState(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setError(false);
    api.get('/planner/weddings').then(({data}) => { if (active) setWeddings(data.weddings); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [revision]);
  const wedding = weddings?.find(item => item.id === params.get('wedding')) || weddings?.[0];
  const view = params.get('view') || 'summary';
  function changeView(next) {
    setParams({ wedding: wedding.id, view: next });
  }
  return <div className="planner-app">
    <header className="planner-app-header"><Brand /><div><Link to="/dashboard" className="planner-dashboard-link" aria-label="Dashboard undangan"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="/templates/shared/dock-watercolor.svg#rsvp" /></svg><span className="planner-dashboard-label-desktop">Dashboard undangan</span><span className="planner-dashboard-label-mobile">Undangan</span><span aria-hidden="true">↗</span></Link><DashboardThemeToggle /></div></header>
    <main className="planner-app-main">
      {error ? <p role="alert">Planner belum bisa dimuat. <button onClick={() => setRevision(value => value + 1)}>Coba lagi</button></p>
        : !weddings ? <p role="status">Memuat pernikahan…</p>
        : !wedding ? <section className="planner-card"><h1>Mulai persiapan kalian</h1><p>Buat undangan untuk mulai menyusun rencana pernikahan.</p><Link to="/dashboard?section=invitations">Buat undangan</Link></section>
        : <>
          <div className="planner-page-intro"><div><p>WEDDING PLANNER</p><h1>{wedding.title}</h1><span className="planner-wedding-date">{new Intl.DateTimeFormat('id-ID', {dateStyle:'long',timeZone:'UTC'}).format(new Date(wedding.weddingDate))}</span></div>
            <label>Pernikahan<select value={wedding.id} onChange={event => setParams({ wedding: event.target.value, view })}>{weddings.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          </div>
          <WeddingPlanner key={wedding.id} wedding={wedding} activeView={view} onViewChange={changeView} onShortcut={wedding.role === 'member' ? undefined : preset => {
            const invitation = wedding.invitations?.find(item => item.status !== 'trashed') || wedding.invitations?.[0];
            const target = new URLSearchParams({ wedding: wedding.id, section: preset === 'details' || preset === 'preview' ? 'invitations' : 'guests' });
            if (invitation) target.set('invitation', invitation.id);
            navigate('/dashboard?' + target);
          }} />
        </>}
    </main>
  </div>;
}
