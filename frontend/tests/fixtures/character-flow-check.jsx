import React from 'react';import {createRoot} from 'react-dom/client';import CharacterPanel from '../../src/components/CharacterPanel.jsx';import {api} from '../../src/api/client.js';
const art='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><circle cx="100" cy="100" r="55" fill="olive"/><path d="M60 140h80v150H60" fill="tan"/></svg>');
api.get=async()=>{throw Error('Character editor must not request AI status')};
api.post=async()=>{throw Error('No AI requests in character editor')};
createRoot(document.getElementById('root')).render(<CharacterPanel invitation={{id:'test',themeSettings:{characterSettings:{mode:'default',separatePose:false,cover:{scale:1,x:0,y:0},hero:{scale:1,x:0,y:0}}}}} onLivePreview={p=>{document.getElementById('check').textContent='PASS: placement reaches live preview draft; no AI call.'}}/>);
