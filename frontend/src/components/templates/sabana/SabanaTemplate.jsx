import LandscapeEngine from '../engines/landscape/LandscapeEngine.jsx';
import scenePack from './defaultConfig.json';

// Engine 3; runtime bersama, konfigurasi dan ilustrasi milik template ini.
export default function SabanaTemplate(props) {
  return <LandscapeEngine {...props} scenePack={scenePack} entryPath="/templates/sabana/index.html" templateName="Meadow" />;
}
