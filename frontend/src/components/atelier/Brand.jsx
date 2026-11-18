import { Link } from 'react-router-dom';

export function Flower({ className = '' }) {
  return <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 20C4 22 1 9 11 8c6-1 9 6 9 12Zm0 0C18 4 31 1 32 11c1 6-6 9-12 9Zm0 0c16-2 19 11 9 12-6 1-9-6-9-12Zm0 0c2 16-11 19-12 9-1-6 6-9 12-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="20" cy="20" r="2" fill="currentColor"/></svg>;
}

export default function Brand({ compact = false, className = '' }) {
  return <Link to="/" className={`atelier-brand ${compact ? 'is-compact' : ''} ${className}`} aria-label="Samavaya — beranda"><Flower/>{!compact && <span>samavaya<small>SEBUAH KABAR BAHAGIA</small></span>}</Link>;
}
