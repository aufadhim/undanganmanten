import { Flower } from './Brand.jsx';

export default function LoadingScreen({ label, compact = false }) {
  return <div className={`loading-screen samavaya-loader${compact ? ' samavaya-loader-compact' : ''}`} role="status">
    <div className="loader-garden" aria-hidden="true">
      <svg viewBox="0 0 96 100" fill="none">
        <ellipse cx="48" cy="91" rx="32" ry="5" fill="#9ca77b" opacity=".25" />
        <path className="loader-stem" d="M48 90Q43 63 48 40" stroke="#778b58" strokeWidth="2.5" strokeLinecap="round" />
        <g className="loader-leaves" stroke="#778b58" strokeWidth="1">
          <path d="M46 78Q26 79 23 63Q39 63 46 78Z" fill="#b0bb8d" />
          <path d="M46 70Q49 53 67 52Q65 67 46 70Z" fill="#a0ae7c" />
        </g>
      </svg>
      <Flower className="loader-flower" />
    </div>
    <span className="samavaya-loader-brand">samavaya</span>
    <span>{label}</span>
  </div>;
}
