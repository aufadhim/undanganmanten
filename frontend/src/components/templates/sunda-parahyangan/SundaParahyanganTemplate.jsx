import LandscapeEngine from '../engines/landscape/LandscapeEngine.jsx';
import scenePack from './defaultConfig.json';

// Engine 3; runtime bersama, konfigurasi dan ilustrasi milik template ini.
export default function SundaParahyanganTemplate(props) {
  return <LandscapeEngine {...props} scenePack={scenePack} entryPath="/templates/sunda-parahyangan/index.html" templateName="Halimun" />;
}
