const POSTERS = {
  eternal:['#f5f3ef','#161616','#aaa39a','eternal'], seraya:['#e8e1d5','#151515','#8d2636','seraya'],
  nawasena:['#f2e7d2','#6f1d2b','#aa8948','nawasena'], isvara:['#e8e8df','#344237','#8b7354','isvara'],
  lanqing:['#941f28','#f8dfad','#d49b42','lanqing'], celluloid:['#17110d','#f1dfbd','#8a2d2d','celluloid'],
  daguerre:['#292724','#ded7ca','#998a70','daguerre'], kodachrome:['#e8b94f','#46241b','#bd4a2f','kodachrome'],
  nocturne:['#09090b','#eee5db','#8c1828','nocturne'], maison:['#eeeae3','#171717','#8d1933','maison'],
  gatsby:['#0d1c1b','#eee1bd','#b08b46','gatsby'], bauhaus:['#eee7d6','#111','#cf342d','bauhaus'],
  helvetica:['#f5f4ee','#111','#e93424','helvetica'], monolith:['#bdbbb4','#151515','#a32923','monolith'],
  vellum:['#eee8dc','#433b31','#a89678','vellum'], hanami:['#eee7dd','#292522','#a94757','hanami'],
  hanji:['#eee9dc','#26352f','#b2463b','hanji'], zellige:['#efe5cf','#123d46','#c3923d','zellige'],
  mughal:['#173d32','#f0dfbd','#c49b4b','mughal'], safavid:['#122e3b','#f1dfbd','#d0a54a','safavid'],
  songket:['#2b1718','#f1dfbd','#c49a48','songket'], ulos:['#181514','#e8d8c2','#a42b2b','ulos'],
  'puspa-sunda':['#e8e4d5','#273a31','#9a4450','puspa'], taksu:['#211b16','#efe0c4','#b98c45','taksu'],
  samudra:['#112f40','#e6dbc1','#6e9ba0','samudra'], astralis:['#101326','#ede5cf','#8369b3','astralis'],
  herbarium:['#e5e5d8','#2f4235','#8e4c52','herbarium'], storybook:['#eee1cf','#392c35','#9c4655','storybook'],
  cathedral:['#15131e','#e9dfd2','#7d2948','cathedral'], chrome:['#d9dde0','#14161a','#6848cf','chrome'],
};

const ORIGINAL_KEY_VISUALS = { isvara:'/assets/theme-thumbnails/isvara-key-visual-v1.png' };
Object.assign(ORIGINAL_KEY_VISUALS, Object.fromEntries([
  'eternal','seraya','lanqing','celluloid','daguerre','kodachrome','nocturne','maison',
  'gatsby','bauhaus','helvetica','monolith','vellum','hanami','hanji','zellige','mughal','safavid',
  'songket','ulos','puspa-sunda','taksu','samudra','astralis','herbarium','storybook','cathedral','chrome',
].map((id) => [id, `/assets/theme-thumbnails/${id}-key-visual-v1.webp`])));

function Motif({ type, ink, accent }) {
  const common = { fill:'none', stroke:ink, strokeWidth:2 };
  switch(type) {
    case 'eternal': return <><circle cx="70" cy="65" r="38" {...common}/><path d="M28 112h84M45 124h50" {...common}/><text x="70" y="76" textAnchor="middle" fill={ink} fontSize="38">∞</text></>;
    case 'seraya': return <><rect x="18" y="22" width="62" height="92" fill={ink}/><rect x="72" y="48" width="50" height="74" fill={accent}/><circle cx="91" cy="40" r="18" fill="none" stroke={ink}/><path d="M24 31h45M24 38h30" stroke="#fff"/></>;
    case 'isvara': return <><path d="M72 132C38 100 39 57 72 24c31 34 31 76 0 108Z" fill={accent} opacity=".25"/><path d="M72 130V35M71 72c-18-20-29-23-43-20M72 91c20-22 31-25 44-23" {...common}/><circle cx="72" cy="34" r="6" fill={accent}/></>;
    case 'lanqing': return <><path d="M22 130V35Q70 3 118 35v95M70 18v112" stroke={ink} strokeWidth="4" fill="none"/><circle cx="70" cy="72" r="25" fill="none" stroke={accent} strokeWidth="3"/><text x="70" y="82" textAnchor="middle" fill={ink} fontSize="30">囍</text></>;
    case 'celluloid': return <><rect x="34" y="10" width="72" height="130" {...common}/>{[18,40,62,84,106,128].map(y=><g key={y}><rect x="23" y={y} width="7" height="12" fill={ink}/><rect x="110" y={y} width="7" height="12" fill={ink}/></g>)}<circle cx="70" cy="74" r="26" fill={accent}/><path d="m62 58 25 16-25 16Z" fill={ink}/></>;
    case 'daguerre': return <><rect x="20" y="12" width="100" height="128" rx="50" fill="none" stroke={accent} strokeWidth="8"/><rect x="29" y="21" width="82" height="110" rx="41" {...common}/><path d="M48 94q22-58 44 0M44 105h52" {...common}/></>;
    case 'kodachrome': return <><g transform="rotate(-7 70 75)"><rect x="15" y="27" width="110" height="98" fill="#f4ead5" stroke={ink} strokeWidth="3"/><rect x="28" y="40" width="84" height="62" fill={accent}/><path d="m28 92 28-27 18 16 15-12 23 33" fill={ink} opacity=".7"/></g></>;
    case 'nocturne': return <><path d="M10 33h120M10 117h120" stroke={ink}/><rect x="25" y="45" width="90" height="60" fill={ink}/><path d="m58 55 36 20-36 20Z" fill={accent}/><circle cx="20" cy="20" r="4" fill={accent}/></>;
    case 'maison': return <><text x="8" y="52" fill={ink} fontSize="48" fontWeight="900">M</text><path d="M15 68h110M15 77h70M15 122h110" stroke={ink}/><rect x="86" y="20" width="39" height="90" fill={accent}/><text x="91" y="103" fill="#fff" fontSize="10" transform="rotate(-90 91 103)">EDITORIAL</text></>;
    case 'gatsby': return <><path d="M70 10 126 75 70 140 14 75Z" {...common}/><path d="M70 24 112 75 70 126 28 75Z" fill="none" stroke={accent} strokeWidth="5"/><path d="M17 75h106M70 15v120" stroke={ink}/><circle cx="70" cy="75" r="13" fill={accent}/></>;
    case 'bauhaus': return <><circle cx="42" cy="48" r="30" fill={accent}/><rect x="65" y="18" width="57" height="57" fill={ink}/><path d="m18 132 52-58 52 58Z" fill="#e0b626"/><circle cx="92" cy="103" r="16" fill="#315da7"/></>;
    case 'helvetica': return <><text x="9" y="94" fill={ink} fontSize="88" fontWeight="900">H</text><rect x="96" y="18" width="18" height="114" fill={accent}/><path d="M10 17h78M10 127h78" stroke={ink}/></>;
    case 'monolith': return <><rect x="24" y="8" width="92" height="134" fill={ink}/><rect x="36" y="20" width="29" height="86" fill={accent}/><rect x="72" y="60" width="31" height="70" fill="#88857e"/><path d="M13 132h114" stroke={ink} strokeWidth="5"/></>;
    case 'vellum': return <><rect x="25" y="13" width="90" height="124" rx="45" fill="none" stroke={accent}/><path d="M70 20v110M42 48h56M42 102h56" stroke={ink} opacity=".5"/><circle cx="70" cy="75" r="22" fill="none" stroke={ink}/><path d="m58 75 8 8 17-20" {...common}/></>;
    case 'hanami': return <><path d="M20 18v120M120 18v120M28 28h84v100H28Z" {...common}/><path d="M35 112Q57 49 108 33M63 70q-24-18-31-3M84 51q11-22 25-15" {...common}/>{[[43,78],[68,62],[91,45],[106,29]].map(([x,y])=><circle key={x} cx={x} cy={y} r="7" fill={accent}/>)}</>;
    case 'hanji': return <>{[[12,12,58,52,accent],[70,12,58,34,ink],[12,66,40,70,ink],[54,48,74,88,accent]].map((r,i)=><rect key={i} x={r[0]} y={r[1]} width={r[2]} height={r[3]} fill={r[4]} opacity={i%2?'.7':'.9'}/>)}</>;
    case 'zellige': return <>{[25,70,115].map(x=>[25,70,115].map(y=><path key={`${x}${y}`} d={`M${x} ${y-19}l19 19-19 19-19-19Z`} fill="none" stroke={(x+y)%2?ink:accent} strokeWidth="4"/>))}</>;
    case 'mughal': return <><path d="M18 138V62Q18 20 52 20q18 0 18 22 0-22 18-22 34 0 34 42v76Z" {...common}/><path d="M42 138V82Q42 52 70 39q28 13 28 43v56" stroke={accent} strokeWidth="5" fill="none"/><circle cx="70" cy="78" r="12" fill={ink}/></>;
    case 'safavid': return <><rect x="12" y="10" width="116" height="130" fill="none" stroke={accent} strokeWidth="5"/><path d="M70 25c36 26 36 74 0 100-36-26-36-74 0-100Z" fill="none" stroke={ink} strokeWidth="3"/><circle cx="70" cy="75" r="23" fill={accent}/><path d="m70 48 8 19 21 8-21 8-8 19-8-19-21-8 21-8Z" fill={ink}/></>;
    case 'songket': return <><path d="M12 135 70 18l58 117Z" fill="none" stroke={accent} strokeWidth="6"/><path d="M25 116h90M35 96h70M45 76h50M55 56h30" stroke={ink} strokeWidth="4"/><path d="M20 135h100" stroke={ink} strokeWidth="8"/></>;
    case 'ulos': return <>{[18,35,52,69,86,103,120].map((x,i)=><rect key={x} x={x} y="8" width={i%2?9:5} height="134" fill={i%3===0?accent:ink}/>)}</>;
    case 'puspa': return <><path d="M70 138V45M70 74C42 60 26 72 20 97c25 4 41-4 50-23Zm0 20c25-20 44-13 52 10-24 9-41 5-52-10Z" {...common}/><circle cx="70" cy="35" r="20" fill={accent}/><circle cx="70" cy="35" r="7" fill={ink}/></>;
    case 'taksu': return <><path d="M12 138V45l34-30v123M128 138V45L94 15v123" fill={ink}/><path d="M70 20 96 62 70 136 44 62Z" fill={accent}/><circle cx="70" cy="65" r="11" fill={ink}/></>;
    case 'samudra': return <><path d="M8 92q20-18 40 0t40 0q20-18 40 0M8 112q20-18 40 0t40 0q20-18 40 0" {...common}/><path d="M70 18v70M70 22l40 48H70Z" fill={accent}/><path d="M28 88h84l-14 31H43Z" fill={ink}/></>;
    case 'astralis': return <><circle cx="70" cy="75" r="14" fill={accent}/><ellipse cx="70" cy="75" rx="56" ry="23" {...common}/><ellipse cx="70" cy="75" rx="25" ry="58" {...common} transform="rotate(38 70 75)"/><circle cx="119" cy="66" r="6" fill={ink}/><circle cx="42" cy="31" r="4" fill={ink}/></>;
    case 'herbarium': return <><path d="M67 138Q58 72 80 18M65 111Q37 86 23 96M70 82q31-29 48-16M75 54Q48 27 35 39" {...common}/>{[[23,96],[118,66],[35,39],[80,18]].map(([x,y])=><ellipse key={x} cx={x} cy={y} rx="13" ry="6" fill={accent} transform={`rotate(${x} ${x} ${y})`}/>)}</>;
    case 'storybook': return <><path d="M16 25q31-15 54 5v105q-24-19-54-5Zm108 0q-31-15-54 5v105q24-19 54-5Z" fill="none" stroke={ink} strokeWidth="3"/><text x="28" y="91" fill={accent} fontSize="60" fontFamily="serif">A</text><path d="M82 52h28M82 63h22M82 74h30" stroke={ink}/></>;
    case 'cathedral': return <><path d="M17 138V65Q17 18 70 10q53 8 53 55v73Z" {...common}/><circle cx="70" cy="61" r="27" fill="none" stroke={accent} strokeWidth="5"/><path d="M70 34v54M43 61h54M51 42l38 38M89 42 51 80" stroke={ink}/></>;
    case 'chrome': return <><defs><linearGradient id="chromeOrb"><stop stopColor="#fff"/><stop offset=".35" stopColor={accent}/><stop offset=".7" stopColor="#111"/><stop offset="1" stopColor="#fff"/></linearGradient></defs><path d="M18 88C3 43 47 8 80 31c25 17 57 1 48 47-8 41-49 66-82 49-16-8-23-22-28-39Z" fill="url(#chromeOrb)"/><circle cx="87" cy="56" r="14" fill="#fff" opacity=".8"/></>;
    default:return null;
  }
}

export default function ThemeThumbnail({ theme }) {
  const keyVisual = theme.id === 'nawasena' ? theme.previewImg : (ORIGINAL_KEY_VISUALS[theme.id] || theme.previewImg);
  return <div className={`theme-poster theme-poster-clean poster-${theme.id}`}><img className="theme-poster-photo" src={keyVisual} alt={`${theme.name} theme preview`} /></div>;
}
