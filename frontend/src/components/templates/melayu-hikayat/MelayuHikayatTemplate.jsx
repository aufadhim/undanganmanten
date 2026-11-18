import BookEngine from '../engines/book/BookEngine.jsx';
import scenePack from './defaultConfig.json';

// Engine 2; runtime bersama, konfigurasi dan ilustrasi milik template ini.
export default function MelayuHikayatTemplate(props) {
  return <BookEngine {...props} scenePack={scenePack} entryPath="/templates/melayu-hikayat/index.html" templateName="Hikayat" />;
}
