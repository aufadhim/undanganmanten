import BookEngine from '../engines/book/BookEngine.jsx';
import scenePack from './defaultConfig.json';

// Engine 2; runtime bersama, konfigurasi dan ilustrasi milik template ini.
export default function PeranakanTemplate(props) {
  return <BookEngine {...props} scenePack={scenePack} entryPath="/templates/peranakan/index.html" templateName="Porcelaine" />;
}
