import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const base=process.env.PREVIEW_BASE_URL||'http://127.0.0.1:4175';
const browser=await chromium.launch({headless:true});
const errors=[];const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
const out=new URL('../../docs/screenshots/',import.meta.url);await fs.mkdir(out,{recursive:true});
for(const width of [390,1280]){
 await page.setViewportSize({width,height:900});
 for(const path of ['/guide','/terms','/privacy','/']){
  await page.goto(base+path,{waitUntil:'domcontentloaded'});await page.waitForTimeout(700);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))throw Error('Horizontal overflow '+path+' '+width);
  if(path==='/guide'){
   await page.getByRole('searchbox').fill('QR');
   if(!await page.locator('.guide-topic').count())throw Error('Guide search empty');
   await page.getByRole('searchbox').fill('');
   await page.screenshot({path:new URL(`samavaya-guide-${width}.png`,out).pathname});
  }
  if(path==='/'){
   const collection=page.locator('#koleksi');await collection.scrollIntoViewIfNeeded();
   await page.locator('.cl-study-art img').evaluateAll(images=>images.forEach(i=>i.loading='eager'));
   await page.waitForFunction(()=>[...document.querySelectorAll('.cl-study-art img')].every(i=>i.complete&&i.naturalWidth>0));
   await collection.screenshot({path:new URL(`samavaya-collection-${width}.png`,out).pathname});
  }
 }
}
if(errors.length)throw Error(errors.join('\n'));await browser.close();console.log('Guide search, legal pages, landing images and 390/1280 layouts passed');
