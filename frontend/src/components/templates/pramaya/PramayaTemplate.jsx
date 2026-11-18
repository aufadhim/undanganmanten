import BookEngine from '../engines/book/BookEngine.jsx';
import scenePack from './defaultConfig.json';
export default function PramayaTemplate(props){return <BookEngine {...props} scenePack={scenePack} entryPath="/templates/pramaya/index.html" templateName="Pramaya"/>}
