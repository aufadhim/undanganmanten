import {youtubeId} from './gallery.js';
export function livestreamTarget(value=''){
 try{const u=new URL(String(value).trim());if(!['https:','http:'].includes(u.protocol))return null;
 const id=youtubeId(u.href);return {url:u.href,embed:id?`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`:'',video:!id&&/\.(mp4|webm|ogg)$/i.test(u.pathname),thumbnail:id?`https://i.ytimg.com/vi/${id}/hqdefault.jpg`:''};
 }catch{return null}
}
