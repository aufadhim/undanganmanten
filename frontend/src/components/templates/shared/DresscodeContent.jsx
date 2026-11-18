import {normalizeDresscode} from '../../../utils/dresscode.js';
import './dresscode-content.css';
export default function DresscodeContent({theme={}}){
 const d=normalizeDresscode(theme.dresscodeDetails,theme.dresscodeText||'');
 return <div className="dress-guide">{d.title&&<p className="dress-guide-intro">{d.title}</p>}<div className="dress-guide-groups">{d.items.map((x,i)=><article key={i}>{d.items.length>1&&x.title&&<h3>{x.title}</h3>}{x.desc&&<p>{x.desc}</p>}<div className="dress-guide-colors">{x.colors.map((c,j)=><div key={j}><span style={{backgroundColor:c}}/>{x.colorLabels[j]&&<small>{x.colorLabels[j]}</small>}</div>)}</div></article>)}</div>{d.note&&<p className="dress-guide-note">{d.note}</p>}</div>;
}
