import LandscapeEngine from '../engines/landscape/LandscapeEngine.jsx';
import scenePack from './defaultConfig.json';
export default function LudoraTemplate(props){return <LandscapeEngine {...props} scenePack={scenePack} entryPath="/templates/ludora/index.html" templateName="Ludora"/>}
