import LandscapeEngine from '../engines/landscape/LandscapeEngine.jsx';
import scenePack from './defaultConfig.json';

// Engine 3; runtime bersama, konfigurasi dan ilustrasi milik template ini.
export default function EdinburghTemplate(props) {
  return <LandscapeEngine {...props} scenePack={scenePack} entryPath="/templates/edinburgh/index.html" templateName="Glenmore" />;
}
