import {isImmersiveTemplate} from '../config/templateRegistry.generated.js';
import {cachedCharacterRender} from './characterRenderCache.js';
import sharp from 'sharp';
import {readOwnedImage} from '../lib/storage.js';
/** Authenticated preview or published invitation only. Inline applied art so WebGL never relies on bucket CORS. */
export async function characterRenderAssets(invitation){
 if(!isImmersiveTemplate(invitation.themeId))return {};
 const t=invitation.themeSettings||{};if(t.characterSettings?.mode==='default')return {};
 const cover=t.coverImageUrl||t.coverSecondImageUrl,hero=cover;
 const memo=new Map();const data=async url=>{if(!url)return null;if(!memo.has(url))memo.set(url,cachedCharacterRender(invitation.userId+':'+url,async()=>{const bytes=await readOwnedImage(invitation.userId,url);const image=await sharp(bytes).rotate().resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toBuffer();return `data:image/webp;base64,${image.toString('base64')}`}) );return memo.get(url)};
 const [coverData,heroData]=await Promise.all([data(cover),data(hero)]);return coverData?{coverCouple:coverData}:{};
}
