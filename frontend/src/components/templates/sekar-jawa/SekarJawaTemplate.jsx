import RoomsEngine from '../engines/rooms/RoomsEngine.jsx';
import scenePack from './defaultConfig.json';

export default function SekarJawaTemplate(props){
 return <RoomsEngine {...props} scenePack={scenePack} entryPath="/templates/sekar-jawa/index.html" templateName="Sogan"/>;
}
