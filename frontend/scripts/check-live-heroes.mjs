import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4175/',{waitUntil:'domcontentloaded'});await page.locator('#koleksi').scrollIntoViewIfNeeded();
await page.waitForFunction(()=>document.querySelectorAll('.cl-live-hero.is-ready').length===3,{},{timeout:60000});
const info=await page.locator('.cl-live-hero').evaluateAll(els=>els.map(el=>{const w=el.querySelector('iframe').contentWindow;return {hero:w.document.querySelector('#hero')?.classList.contains('hero-entered'),playing:w.heroScene.running&&!w.heroScene.paused,audio:[...w.document.querySelectorAll('audio')].every(a=>a.paused),controls:getComputedStyle(w.document.querySelector('.bottom-ui')).display}}));
if(info.some(i=>!i.hero||!i.audio||i.controls!=='none'))throw Error(JSON.stringify(info));
await page.waitForTimeout(2000);await page.screenshot({path:'/tmp/samavaya-live-heroes.png'});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(700);
const paused=await page.locator('.cl-live-hero iframe').evaluateAll(fs=>fs.every(f=>f.contentWindow.heroScene.paused));if(!paused)throw Error('Offscreen heroes did not pause');
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({heroes:info,offscreenPaused:paused}));await browser.close();
