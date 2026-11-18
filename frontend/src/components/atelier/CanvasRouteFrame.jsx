import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/dashboard-dark.css';

const DashboardAppearance = createContext(null);
const appearanceKey = 'samavaya-dashboard-appearance';
const accountRoutes = new Set(['/login', '/signin', '/signup', '/forgot-password', '/reset-password']);

export function DashboardThemeToggle({ className = 'dashboard-theme-toggle', english = false } = {}) {
  const appearance = useContext(DashboardAppearance);
  if (!appearance) return null;
  const { dark, toggle } = appearance;
  const label = english ? (dark ? 'Switch to light mode' : 'Switch to dark mode') : (dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
  return <button type="button" className={className} onClick={toggle} aria-label={label} title={label}>
    <i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" />
  </button>;
}

const titles = {'/planner':'Wedding Planner','/login':'Masuk','/signin':'Masuk','/signup':'Daftar','/forgot-password':'Lupa password','/reset-password':'Password baru','/dashboard':'Ruang undangan','/sandbox':'Mode Coba','/admin':'Administrasi','/contact':'Kontak','/guide':'Panduan','/terms':'Syarat & Ketentuan','/privacy':'Kebijakan Privasi','/guest-desk':'Meja penerima tamu','/depth-lab':'Studio depth'};

export default function CanvasRouteFrame({ children }) {
  const { pathname } = useLocation();
  const active = Boolean(titles[pathname]);
  const [preference, setPreference] = useState(() => {
    try { return localStorage.getItem(appearanceKey); } catch { return null; }
  });
  const dark = preference === 'dark';
  function toggle() {
    const next = dark ? 'light' : 'dark';
    setPreference(next);
    try { localStorage.setItem(appearanceKey, next); } catch { /* browser storage is optional */ }
  }
  useEffect(() => { if (titles[pathname]) document.title = `${titles[pathname]} — Samavaya`; }, [pathname]);
  const dashboard = active && !accountRoutes.has(pathname);
  const landing = pathname === '/';
  const account = accountRoutes.has(pathname);
  const className = active
    ? ['atelier-app', dark && dashboard && 'dashboard-dark', dark && account && 'auth-dark'].filter(Boolean).join(' ')
    : landing && dark ? 'landing-dark' : undefined;
  return <DashboardAppearance.Provider value={dashboard || landing || account ? { dark, toggle } : null}>
    <div className={className}>{children}</div>
  </DashboardAppearance.Provider>;
}
