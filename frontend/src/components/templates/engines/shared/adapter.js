import {DEFAULT_INVITATION_MUSIC} from '../../../../utils/invitationMusic.js';
import {getTemplate} from '../../../../config/templateRegistry.js';
import {resolveImageUrl} from '../../../../config/env.js';
import {resolveInvitationQuote} from '../../../../config/quotePresets.js';

const FALLBACK_DATE='2026-12-20';
const safeDate=value=>Number.isFinite(Date.parse(value))?new Date(value).toISOString():new Date(`${FALLBACK_DATE}T08:00:00+07:00`).toISOString();
export function createGardenPayload(invitation={},guest,preview=false,packDefaults){
 const config=structuredClone(packDefaults),p=invitation.coupleProfile||{},t=invitation.themeSettings||{},events=Array.isArray(invitation.events)?invitation.events:[],first=events.find(e=>['akad','CEREMONY'].includes(e.type))||events[0]||{},gift=invitation.giftSettings||{},account=Array.isArray(gift.bankAccounts)?gift.bankAccounts[0]||{}:gift;
 const bride=p.brideName||'Mempelai wanita',groom=p.groomName||'Mempelai pria';
 config.identity={title:t.gardenTitle||getTemplate(invitation.themeId)?.name||config.identity.title,bride,groom,brideFull:p.brideFullName||bride,groomFull:p.groomFullName||groom,monogram:`${bride[0]} & ${groom[0]}`};
 const date=String(first.date||invitation.weddingDate||FALLBACK_DATE).slice(0,10),start=safeDate(`${date}T${String(first.startTime||'08:00').slice(0,5)}:00+07:00`);
 const endTime=String(first.endTime||'').slice(0,5);
 const endAt=endTime ? Date.parse(`${date}T${endTime}:00+07:00`) : NaN;
 const eventLabel=first.type==='ngunduh_mantu'?'Ngunduh Mantu':'Pernikahan';
 config.event={start,end:new Date(Number.isFinite(endAt)&&endAt>Date.parse(start)?endAt:Date.parse(start)+6*3600000).toISOString(),location:[first.venueName,first.address].filter(Boolean).join(', '),description:`${eventLabel} ${bride} dan ${groom}`};
 if(events.length===1 && ['ngunduh_mantu','resepsi'].includes(first.type)){
  const section=config.sections.find(item=>item.id==='akad');
  if(section)section.title=first.type==='ngunduh_mantu'?'Ngunduh Mantu':'Resepsi';
 }
 const url=v=>typeof v==='string'&&/^https?:\/\//i.test(v)?v:'';
 const ig=value=>{const v=String(value||'').trim();if(!v)return '';if(url(v))return url(v);if(/^(www\.)?instagram\.com\//i.test(v))return `https://${v}`;const name=v.replace(/^@/,'').replace(/\/$/,'');return /^[a-z0-9._]+$/i.test(name)?`https://www.instagram.com/${name}/`:''};
 const parent=(value,title)=>{const text=String(value||'').trim();if(!text)return '';return /^(bapak|bpk\.?|pak|ayah|ibu|bu)(\s|$)/i.test(text)?text:`${title} ${text}`};
 config.links={brideInstagram:t.brideInstagramEnabled===false?'':ig(p.brideIg||p.brideInstagram),groomInstagram:t.groomInstagramEnabled===false?'':ig(p.groomIg||p.groomInstagram),location:url(first.googleMapsUrl||first.mapUrl),livestream:url(invitation.livestreamSettings?.url||invitation.livestreamSettings?.streamUrl||t.livestreamUrl),filter:url(t.igFilterUrl)};
 config.gift={bank:account.bankName||'',number:account.accountNumber||'',holder:account.accountHolder||''};
 const asset=v=>{if(typeof v!=='string'||!v)return '';if(/^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(v))return v;if(v.startsWith('/'))return new URL(resolveImageUrl(v),globalThis.location?.origin||'http://localhost').href;return url(v)};
 const character=t.characterSettings;
 if(config.composition?.grounding?.version>=2){
  const baseWidth=config.layout.closingWidth||config.layout.heroWidth*.72,baseScale=config.layout.closingScale||1;
  const scale=character?.closing?.scale===undefined?1:character.closing.scale/baseScale;
  config.layout.closingWidth=baseWidth*scale;
  config.layout.closingX=(config.layout.closingX||0)+(character?.closing?.x||0);
  if(config.composition.grounding.horizontalAlignment==='visible-body-center'){
   const b=config.composition.art.hero.bounds,mid=(b.left+b.right)/2-.5;
   const nextMid=character?.mode!=='default'&&asset(t.coverImageUrl)?0:mid;
   config.layout.closingX+=mid*baseWidth-nextMid*config.layout.closingWidth;
  }
  config.layout.closingY=(config.layout.closingY||0)+(character?.closing?.y||0);
  if(config.composition.grounding.version>=4&&config.template!=='mental-canvas-3'){const art=config.composition.art.hero;config.layout.closingY+=(baseWidth-config.layout.closingWidth)/art.aspect*((config.layout.closingFootY??1)-.5);}
 }else{config.layout.closingWidth=config.layout.heroWidth*(character?.closing?.scale??config.layout.closingScale??.72);config.layout.closingX=character?.closing?.x||0;config.layout.closingY=character?.closing?.y||0;}
 if(character?.mode!=='default'&&asset(t.coverImageUrl))config.assets.coverCouple=asset(t.coverImageUrl);
 if(character?.mode!=='default'){if(character?.separatePose===false&&asset(t.coverImageUrl))config.assets.heroCouple=asset(t.coverImageUrl);else if(asset(t.coverSecondImageUrl))config.assets.heroCouple=asset(t.coverSecondImageUrl);else if(asset(t.coverImageUrl))config.assets.heroCouple=asset(t.coverImageUrl);}
 if(character){
  for(const side of ['cover','hero']){
   const point=character[side]||{},baseWidth=config.layout[side+'Width'],baseY=config.layout[side+'Y'];
   const scale=Number(point.scale)||1;
   const authoredAspect=config.composition?.art?.[side]?.aspect||2/3;
   const aspect=character.mode==='default'?authoredAspect:((side==='hero'&&!character.separatePose?character.cover?.aspect:point.aspect)||2/3);
   // Fit inside the template character bounds without stretching or clipping wide poses.
   const baseHeight=baseWidth/authoredAspect,width=Math.min(baseHeight*scale*aspect,baseWidth*scale),height=width/aspect;
   config.layout[side+'Width']=width;
   config.layout[side+'X']+=(point.x||0);
   if(config.composition?.grounding?.horizontalAlignment==='visible-body-center'){
    const b=config.composition.art[side].bounds,mid=(b.left+b.right)/2-.5;
    config.layout[side+'X']+=mid*baseWidth-(character.mode==='default'?mid:0)*width;
   }
   const footY=character.mode==='default'?(config.layout[side+'FootY']??1):1;
   config.layout[side+'FootY']=footY;config.layout[side+'Y']=baseY+(point.y||0)+(baseHeight-height)*(footY-.5);
   if(side==='hero')for(const camera of config.cameras.filter(c=>['wanita','pria'].includes(c.id))){
    const who=camera.id==='wanita'?'bride':'groom';
    const original=who==='bride'?{x:.68,y:.3}:{x:.3,y:.15};
    const anchors=character.mode==='default'?undefined:(point.anchors||(!character.separatePose?character.cover?.anchors:undefined)),head=anchors?.[who]||original;
    config.layout['hero'+(who==='bride'?'Bride':'Groom')+'HeadX']=anchors?.[who]?.x??config.layout['hero'+(who==='bride'?'Bride':'Groom')+'HeadX']??head.x;
    config.layout['hero'+(who==='bride'?'Bride':'Groom')+'HeadY']=anchors?.[who]?.y??config.layout['hero'+(who==='bride'?'Bride':'Groom')+'HeadY']??head.y;
    for(const mode of ['mobile','wide']){
     camera[mode].x+=(point.x||0)+(head.x-.5)*width-(original.x-.5)*baseWidth;
     camera[mode].y+=config.layout.heroY-baseY+(head.y-.5)*height-(original.y-.5)*baseHeight;
    }
   }
  }
 }
 // All scenes use one pair; retain old stored hero URL only as a fallback.
 if(character?.mode!=='default'){const shared=asset(t.coverImageUrl)||asset(t.coverSecondImageUrl);if(shared)config.assets.coverCouple=shared;}
 config.assets.heroCouple=config.assets.coverCouple;
 if(character?.mode!=='default'&&asset(t.coverImageUrl)){
  Object.assign(config.layout,{profileBodyTop:0,profileBodyBottom:1,profileBodyLeft:0,profileBodyRight:1,closingFootY:1});
  if(config.composition?.grounding?.version>=4){
   const art=config.composition.art.hero,aspect=character.cover?.aspect||2/3,baseWidth=packDefaults.layout.closingWidth;
   const scale=config.layout.closingWidth/baseWidth;
   config.layout.closingWidth=Math.min(baseWidth/art.aspect*scale*aspect,baseWidth*scale);
   if(config.template!=='mental-canvas-3'){
    const foot=packDefaults.layout.closingY+baseWidth/art.aspect*((packDefaults.layout.closingFootY??1)-.5);
    config.layout.closingY=foot-config.layout.closingWidth/aspect*.5+(character.closing?.y||0);
   }
  }
 }
 config.assets.music=asset(t.musicUrl)||asset(DEFAULT_INVITATION_MUSIC);
 const pack=t.gardenAssets||{};for(const key of Object.keys(config.assets))if(asset(pack[key]))config.assets[key]=asset(pack[key]);
 for(const [key,fallback]of Object.entries(config.assets))if(fallback.startsWith('assets/'))config.assets[key]=`/templates/viridarium/${fallback}`;
 if(character?.mode!=='default')for(const key of ['coverCouple','heroCouple']){const inline=invitation.characterRenderAssets?.[key];if(typeof inline==='string'&&inline.startsWith('data:image/'))config.assets[key]=inline;}
 config.assets.heroCouple=config.assets.coverCouple;
 // Immersia uses the curated palette of its illustration pack. Legacy color settings stay stored but do not override it.
 const put=(key,value)=>{config.copy[key].value=String(value??'')};
 put('t006','');put('t015',guest?.name||'Tamu Tersayang');put('t023','');put('t036',first.venueName||'');
 put('t049',config.identity.brideFull);put('t050','');put('t052',parent(p.brideFather,'Bapak'));put('t054',parent(p.brideMother,'Ibu'));put('t057',config.links.brideInstagram?'':'Instagram belum diisi');
 put('t061',config.identity.groomFull);put('t062','');put('t064',parent(p.groomFather,'Bapak'));put('t066',parent(p.groomMother,'Ibu'));put('t069',config.links.groomInstagram?'':'Instagram belum diisi');
 for(const key of ['t086','t101','t121','t134','t142','t154','t175','t187','t207'])put(key,'');
 const quote=resolveInvitationQuote(invitation.quoteSettings||{});put('t043',quote.text);put('t044',quote.source);put('t042',quote.source||'JANJI KAMI');put('t037',quote.source||'JANJI KAMI');config.sections[1].title=quote.source||'Janji kami';
 if(t.closingText)put('t212',t.closingText);
 put('t169',config.identity.monogram);put('t220','Samavaya · Sebuah kabar bahagia');
 for(const key of Object.keys(config.assets))config.assets[key]=config.assets[key].replace(/^\/templates\/garden-canvas\//,'/templates/viridarium/');
 return {galleryLayout:t.galleryLayout||'editorial',profiles:{brideBio:t.brideBioEnabled===false?'':String(p.brideBio||'').trim(),groomBio:t.groomBioEnabled===false?'':String(p.groomBio||'').trim()},config,preview,guest:guest?{name:guest.name,paxLimit:guest.paxLimit||2}:null,events,stories:invitation.timelineStories||[],rundowns:invitation.rundowns||[],gallery:(invitation.galleryMedia||[]).filter(x=>['photo','video'].includes(x.type)).map(x=>({...x,url:asset(x.url)})),wishes:(invitation.wishes||[]).filter(x=>!x.isHidden),dresscode:t.dresscodeDetails||{},dresscodeText:t.dresscodeText||'',features:invitation.invitationFeatures||{},layoutOrder:Array.isArray(t.layoutOrder)?t.layoutOrder:[],typography:t.typography||{},giftType:gift.type||'both',quoteEnabled:invitation.quoteSettings?.enabled!==false,mainStory:t.mainStory||'',musicEnabled:invitation.invitationFeatures?.musicEnabled!==false,shippingAddress:gift.shippingAddress||'',accounts:Array.isArray(gift.bankAccounts)?gift.bankAccounts:[gift]};
}
