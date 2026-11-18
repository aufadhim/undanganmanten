import RoomsEngine from '../engines/rooms/RoomsEngine.jsx';
import scenePack from './defaultConfig.json';

export default function ViridariumTemplate(props){
 return <RoomsEngine {...props} scenePack={scenePack} entryPath="/templates/viridarium/index.html" templateName="Viridarium"/>;
}
