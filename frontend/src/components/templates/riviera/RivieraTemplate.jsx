import LandscapeEngine from '../engines/landscape/LandscapeEngine.jsx';
import scenePack from './defaultConfig.json';
export default function RivieraTemplate(props){return <LandscapeEngine {...props} scenePack={scenePack} entryPath="/templates/riviera/index.html" templateName="Riviera"/>}
