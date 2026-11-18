import LandscapeEngine from '../engines/landscape/LandscapeEngine.jsx';
import scenePack from './defaultConfig.json';
export default function WasesaTemplate(props){return <LandscapeEngine {...props} scenePack={scenePack} entryPath="/templates/wasesa/index.html" templateName="Wasesa"/>}
