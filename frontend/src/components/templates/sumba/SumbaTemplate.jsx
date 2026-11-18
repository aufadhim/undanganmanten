import LandscapeEngine from '../engines/landscape/LandscapeEngine.jsx';
import scenePack from './defaultConfig.json';

// Engine 3; runtime bersama, konfigurasi dan ilustrasi milik template ini.
export default function SumbaTemplate(props) {
  return <LandscapeEngine {...props} scenePack={scenePack} entryPath="/templates/sumba/index.html" templateName="Savana" />;
}
