// Render the actual template hero with sample identities; no account or stored invitation is used.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const registry=JSON.parse(await fs.readFile(new URL('../../shared/template-registry.json',import.meta.url)));
const output=new URL('../public/assets/theme-thumbnails/heroes/',import.meta.url);
await fs.mkdir(output,{recursive:true});
const base=process.env.PREVIEW_BASE_URL||'http://127.0.0.1:4175';
const browser=await chromium.launch({headless:true});
const queue=registry.templates.filter(t=>t.active&&(!process.env.POSTER_ENGINE||t.engine===Number(process.env.POSTER_ENGINE))&&(!process.env.POSTER_THEME||process.env.POSTER_THEME.split(',').includes(t.id))),results=[];
async function worker(){const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 page.on('pageerror',e=>console.error('PAGE',e.message));
 await page.route('http://localhost:4000/api/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{"wishes":[],"guests":[]}'}));
 while(queue.length){const t=queue.shift();try{
 await page.goto(`${base}/tests/fixtures/template-poster.html?theme=${t.id}`,{waitUntil:'domcontentloaded'});
 await page.waitForSelector('body[data-mounted=true]',{state:'attached',timeout:15000});
 if(t.engine){await page.waitForFunction(()=>{const f=document.querySelector('iframe');return f&&Number(getComputedStyle(f).opacity)===1},{},{timeout:45000});const f=page.frames().find(f=>f.url().includes('/templates/'));await f.locator('#open').click({timeout:20000});}
 else{if(t.id==='eternal')await page.locator('#openWithMusic').click({timeout:30000});else await page.getByRole('button',{name:/^(Buka Undangan|Open Invitation)$/i}).first().click({timeout:30000});}
 await page.waitForTimeout(t.engine===2?8500:t.engine?5500:2200);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))});
 const temp=`/tmp/samavaya-hero-${t.id}.png`;await page.locator('#poster').screenshot({path:temp});
 execFileSync('cwebp',['-quiet','-q','82',temp,'-o',new URL(`${t.id}.webp`,output).pathname]);await fs.unlink(temp);results.push(t.id);console.log('Captured',t.id);
 }catch(e){console.error('FAILED',t.id,e.message);process.exitCode=1;}}
 await page.close();}
await Promise.all([worker(),worker(),worker()]);await browser.close();console.log(`${results.length} hero posters captured`);
