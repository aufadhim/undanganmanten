import RoomsEngine from '../engines/rooms/RoomsEngine.jsx';
import scenePack from './defaultConfig.json';

// Engine 1; runtime bersama, konfigurasi dan ilustrasi milik template ini.
export default function BaliPekaranganTemplate(props) {
  return <RoomsEngine {...props} scenePack={scenePack} entryPath="/templates/bali-pekarangan/index.html" templateName="Paduraksa" />;
}
