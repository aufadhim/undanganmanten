import RoomsEngine from '../engines/rooms/RoomsEngine.jsx';
import scenePack from './defaultConfig.json';

// Engine 1; runtime bersama, konfigurasi dan ilustrasi milik template ini.
export default function SundaPendopoTemplate(props) {
  return <RoomsEngine {...props} scenePack={scenePack} entryPath="/templates/sunda-pendopo/index.html" templateName="Paseban" />;
}
