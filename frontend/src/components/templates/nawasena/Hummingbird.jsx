import {useId} from 'react';

/** Separate feathered wings rotate at the shoulder; the body stays steady in hover. */
export default function Hummingbird({direction='ltr',context='opening'}) {
 const id=useId().replace(/:/g,'');
 return <div className={`nw-hummingbird nw-bird-${direction} nw-bird-${context}`} aria-hidden="true"><div className="nw-bird-hover"><svg viewBox="0 0 140 120" fill="none">
  <defs><linearGradient id={`${id}-green`} x1="48" y1="50" x2="93" y2="88" gradientUnits="userSpaceOnUse"><stop stopColor="#8f9870"/><stop offset=".55" stopColor="#586b51"/><stop offset="1" stopColor="#c1af83"/></linearGradient><linearGradient id={`${id}-wing`} x1="67" y1="64" x2="26" y2="12" gradientUnits="userSpaceOnUse"><stop stopColor="#88866a"/><stop offset="1" stopColor="#dfd3b4" stopOpacity=".65"/></linearGradient></defs>
  <path className="nw-humming-wing nw-wing-far" d="M69 65C57 40 39 16 21 11C26 34 38 57 64 74Z" fill={`url(#${id}-wing)`}/>
  <path d="M60 72L22 106L39 98L29 112L65 84Z" fill="#784a4e"/><path d="M59 74L31 105L65 80" stroke="#b5a47d" strokeWidth="1.2"/>
  <path d="M46 78C53 64 62 59 75 59C80 45 91 41 99 48C105 54 103 63 94 68C85 74 80 91 66 92C55 93 47 86 46 78Z" fill={`url(#${id}-green)`}/>
  <path d="M94 62C86 65 83 79 72 86C63 93 55 87 52 83C65 85 76 70 83 61Z" fill="#e8d6b3"/>
  <path d="M87 62L96 62C93 68 90 71 86 72L81 70Z" fill="#8c4859"/>
  <path d="M99 53L135 49L100 57Z" fill="#524d43"/>
  <circle cx="95" cy="52" r="2.2" fill="#302f29"/><circle cx="95.7" cy="51.4" r=".65" fill="#f7f0dc"/>
  <path className="nw-humming-wing nw-wing-near" d="M68 70C48 62 22 37 12 13C33 22 58 37 74 63Z" fill={`url(#${id}-wing)`} stroke="#9b9477" strokeWidth=".7"/>
  <g className="nw-humming-wing nw-wing-near" stroke="#f1e8cf" strokeWidth="1" opacity=".65"><path d="M67 66L19 23M66 69L21 33M63 70L27 43M59 71L36 54"/></g>
  <path d="M68 91L73 94L78 92M75 89L81 91L84 89" stroke="#786b52" strokeLinecap="round"/>
 </svg></div></div>;
}
