import test from 'node:test';
import assert from 'node:assert/strict';
import {mountTypography} from '../public/templates/shared/typography-runtime.js';
function fixture(){
 const node=(id,heading,size)=>{const values=new Map();return {childNodes:[{nodeType:3,textContent:'Text'}],style:{getPropertyValue:k=>values.get(k)||'',getPropertyPriority:()=>'',setProperty:(k,v)=>values.set(k,v),removeProperty:k=>values.delete(k)},closest(selector){if(selector.startsWith('svg'))return null;if(selector.startsWith('h1'))return heading?this:null;return {id,dataset:{}}},size}};
 const quote=node('janji',false,24),bride=node('wanita',true,48),groom=node('pria',true,48);
 const win={MutationObserver:class{observe(){}disconnect(){}},addEventListener(){},removeEventListener(){},getComputedStyle:el=>({fontSize:el.style.getPropertyValue('font-size')||`${el.size}px`})};
 return {quote,bride,groom,root:{ownerDocument:{defaultView:win},querySelectorAll:()=>[quote,bride,groom]}};
}
test('quote and bride sizes are independent across updates and section reset',()=>{
 const {root,quote,bride,groom}=fixture();const settings={metricsMode:'template',sections:{quote:{metricsMode:'custom',bodyScale:.75},bride:{metricsMode:'custom',headingScale:1.4}}};
 const runtime=mountTypography(root,settings);
 assert.equal(quote.style.getPropertyValue('font-size'),'18px');assert.equal(bride.style.getPropertyValue('font-size'),'67.19999999999999px');assert.equal(groom.style.getPropertyValue('font-size'),'');
 runtime.update({...settings,sections:{...settings.sections,bride:{metricsMode:'custom',headingScale:1.5}}});
 assert.equal(quote.style.getPropertyValue('font-size'),'18px');assert.equal(bride.style.getPropertyValue('font-size'),'72px');
 runtime.update({...settings,sections:{...settings.sections,bride:{metricsMode:'template'}}});
 assert.equal(quote.style.getPropertyValue('font-size'),'18px');assert.equal(bride.style.getPropertyValue('font-size'),'');runtime.destroy();assert.equal(quote.style.getPropertyValue('font-size'),'');
});

import {composeInvitationPreview} from '../src/utils/mergePreviewOverride.js';
test('autosave completion cannot restore stale content typography for bride or groom heading/body',()=>{
 for(const section of ['bride','groom'])for(const key of ['headingScale','bodyScale']){
  const old={metricsMode:'template',sections:{[section]:{metricsMode:'custom',[key]:1}}};
  const saved={themeSettings:{typography:old,coverImageUrl:'art.webp'},coupleProfile:{brideName:'Saved'}};
  const draft={themeSettings:{typography:old,characterSettings:{mode:'custom'}},coupleProfile:{brideName:'Unsaved name'}};
  const latest={...old,sections:{[section]:{metricsMode:'custom',[key]:.95}}};
  const during=composeInvitationPreview(saved,draft,latest);
  const after=composeInvitationPreview({...saved,themeSettings:{...saved.themeSettings,typography:latest}},draft,null);
  assert.deepEqual(after.themeSettings.typography,during.themeSettings.typography);
  assert.equal(after.coupleProfile.brideName,'Unsaved name');assert.equal(after.themeSettings.characterSettings.mode,'custom');
 }
});
test('reset and pending typography win over stale draft without mutating it',()=>{
 const stale={sections:{bride:{metricsMode:'custom',headingScale:1.4,bodyScale:1.3}}},reset={sections:{bride:{metricsMode:'template',headingScale:1,bodyScale:1}}};
 const draft={themeSettings:{typography:stale}};const saved={themeSettings:{typography:reset}};
 assert.equal(composeInvitationPreview(saved,draft,null).themeSettings.typography,reset);
 assert.equal(composeInvitationPreview(saved,draft,stale).themeSettings.typography,stale);
 assert.equal(draft.themeSettings.typography,stale);
});

import {resolveTypographyMetrics} from '../public/templates/shared/typography-settings.js';
test('template metrics and reset report 100% rather than dormant legacy slider values',()=>{
 const settings={metricsMode:'template',bodyScale:.85,headingScale:1.4};
 assert.equal(resolveTypographyMetrics(settings,'bride').bodyScale,1);
 assert.equal(resolveTypographyMetrics(settings,'bride').headingScale,1);
 assert.equal(resolveTypographyMetrics({...settings,sections:{bride:{metricsMode:'custom',headingScale:1.2}}},'bride').bodyScale,1);
 assert.equal(resolveTypographyMetrics({...settings,sections:{bride:{metricsMode:'template',headingScale:1.2}}},'bride').headingScale,1);
 assert.equal(resolveTypographyMetrics({fontBody:'Lora'},'bride').metricsMode,'template');
});
test('RSVP input/textarea typography, wish scope and form sizing apply independently and reset restores authored styles',()=>{
 const style=initial=>{const map=new Map(Object.entries(initial||{}));return{getPropertyValue:k=>map.get(k)||'',getPropertyPriority:()=>'',setProperty:(k,v)=>map.set(k,v),removeProperty:k=>map.delete(k)}};
 const make=(scope,tagName)=>({tagName,childNodes:[],style:style(),closest(selector){if(selector.startsWith('svg')||selector.startsWith('h1'))return null;return{dataset:{typographyScope:scope}}}});
 const input=make('rsvp','INPUT'),textarea=make('wishes','TEXTAREA'),fieldset={style:style({gap:'12px'})};
 const form={style:style({width:'90%'}),closest:()=>({dataset:{typographyScope:'rsvp'}}),querySelectorAll:()=>[fieldset]};
 const win={MutationObserver:class{observe(){}disconnect(){}},addEventListener(){},removeEventListener(){},getComputedStyle:()=>({fontSize:'11px'})};
 const root={ownerDocument:{defaultView:win},querySelectorAll:s=>s==='form'?[form]:[input,textarea]};
 const settings={metricsMode:'template',fontBody:'Lora',sections:{rsvp:{metricsMode:'custom',bodyScale:1.3,formWidth:.8,formGap:22},wishes:{metricsMode:'custom',bodyScale:1.1}}};
 const runtime=mountTypography(root,settings);
 assert.equal(parseFloat(input.style.getPropertyValue('font-size')),14.3);assert.ok(Math.abs(parseFloat(textarea.style.getPropertyValue('font-size'))-12.1)<.001);
 assert.equal(input.style.getPropertyValue('font-family'),'"Lora"');assert.equal(input.style.getPropertyValue('line-height'),'');
 assert.equal(form.style.getPropertyValue('width'),'80%');assert.equal(fieldset.style.getPropertyValue('gap'),'22px');
 runtime.update({...settings,sections:{...settings.sections,rsvp:{metricsMode:'template'}}});
 assert.equal(input.style.getPropertyValue('font-size'),'');assert.equal(form.style.getPropertyValue('width'),'90%');assert.equal(fieldset.style.getPropertyValue('gap'),'12px');
 assert.ok(parseFloat(textarea.style.getPropertyValue('font-size'))>12);runtime.destroy();assert.equal(textarea.style.getPropertyValue('font-size'),'');
});
