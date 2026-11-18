import BookEngine from '../engines/book/BookEngine.jsx';
import scenePack from './defaultConfig.json';

// Engine 2; runtime bersama, konfigurasi dan ilustrasi milik template ini.
export default function MalukuTemplate(props) {
  return <BookEngine {...props} scenePack={scenePack} entryPath="/templates/maluku/index.html" templateName="Nirwana" />;
}
