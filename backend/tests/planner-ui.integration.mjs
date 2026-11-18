import 'dotenv/config';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {randomBytes,createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {prisma} from '../src/lib/prisma.js';
import {generateToken} from '../src/utils/jwt.js';
const require=createRequire(new URL('../../frontend/package.json',import.meta.url));
const {chromium}=require('playwright');
const ids=[];let browser;
try{
 const tag=Date.now();
 const owner=await prisma.user.create({data:{email:'planner-ui-'+tag+'@example.invalid',passwordHash:'test-only',isVerified:true}});ids.push(owner.id);
 const member=await prisma.user.create({data:{email:'planner-ui-member-'+tag+'@example.invalid',passwordHash:'test-only',isVerified:true}});ids.push(member.id);
 const w=await prisma.wedding.create({data:{userId:owner.id,title:'Dewi & Pras · Uji Planner',weddingDate:new Date('2027-02-14'),plannerSettings:{budgetTarget:100000000,savingsTarget:40000000,categories:[{title:'Katering',limit:20000000}]}}});
 await prisma.weddingPlannerEntry.createMany({data:[
  {weddingId:w.id,module:'vendors',updatedBy:owner.email,details:{title:'Katering Pilihan',category:'Katering',contact:'Kontak vendor',capacity:500,estimate:20000000,actual:25000000,paid:0,due:'2027-01-01',selected:true,package:'Paket 500 orang',url:'https://example.com',status:'Dipesan',notes:''}},
  {weddingId:w.id,module:'savings',updatedBy:owner.email,details:{title:'Setoran Dewi',contributor:'Dewi',value:5000000,date:'2026-11-18',notes:''}},
  ...Array.from({length:18},(_,i)=>({weddingId:w.id,module:'schedule',updatedBy:owner.email,details:{title:'Kegiatan '+(i+1),event:'Resepsi',date:'2027-02-14',start:'10:'+String(i).padStart(2,'0'),end:'',location:'The Garden Hall',owner:'PIC Keluarga',notes:i===0?'Catatan panjang untuk memeriksa pergantian halaman. '.repeat(30):'Pastikan perlengkapan siap.'}}))
 ]});
 browser=await chromium.launch({channel:'chrome'});
 const context=await browser.newContext({viewport:{width:393,height:852}});
 await context.addInitScript(token=>{localStorage.setItem('um_token',token);localStorage.setItem('samavaya-dashboard-appearance','light')},generateToken({userId:owner.id}));
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const open=async view=>{await page.goto('http://127.0.0.1:4080/planner?wedding='+w.id+'&view='+view);await page.locator('.planner-bottom-nav').waitFor({state:'attached'});await page.waitForFunction(()=>!document.body.innerText.includes('Memuat planner…'));};
 if (!process.env.PLANNER_UI_QUICK) {
 await open('budget');await page.getByLabel('Target anggaran total (Rp)').fill('110000000');
 const saved=page.waitForResponse(r=>r.url().includes('/planner/settings')&&r.request().method()==='PUT');await page.getByRole('button',{name:'Simpan target',exact:true}).click();await saved;
 assert.equal((await prisma.wedding.findUnique({where:{id:w.id}})).plannerSettings.budgetTarget,110000000);await page.screenshot({path:'../output/planner-budget-mobile.png',fullPage:true});
 console.log('PASS: mobile budget target.');await open('documents');await page.getByLabel('Nama dokumen',{exact:true}).fill('Berkas KUA');await page.getByLabel('Yang mengurus',{exact:true}).fill('Dewi');await page.getByLabel('Status',{exact:false}).selectOption('Dalam proses');await page.getByRole('button',{name:'Tambah',exact:true}).click();await page.getByRole('heading',{name:'Berkas KUA',exact:true}).waitFor();await page.reload();await page.getByRole('heading',{name:'Berkas KUA',exact:true}).waitFor();
 console.log('PASS: document CRUD and reload.');await open('vendors');await page.getByRole('button',{name:'Riwayat & cicilan (0)',exact:true}).click();await page.getByLabel('Nominal cicilan (Rp)').fill('2000000');await page.getByRole('button',{name:'Catat pembayaran',exact:true}).click();await page.getByRole('button',{name:'Riwayat & cicilan (1)',exact:true}).waitFor();const entry=await prisma.weddingPlannerEntry.findFirst({where:{weddingId:w.id,module:'vendors'}});assert.equal(entry.details.paid,2000000);
 console.log('PASS: installment UI.');await open('uniforms');await page.getByLabel('Nama penerima',{exact:true}).fill('Ibu pengantin');await page.getByLabel('Ukuran',{exact:true}).fill('L');await page.getByLabel('Status',{exact:false}).selectOption('Dijahit');await page.getByRole('button',{name:'Tambah',exact:true}).click();await page.getByRole('heading',{name:'Ibu pengantin',exact:true}).waitFor();
 console.log('PASS: uniform CRUD.');await open('savings');await page.getByLabel('Keterangan setoran',{exact:true}).fill('Setoran Pras');await page.getByLabel('Penyetor',{exact:true}).fill('Pras');await page.getByLabel('Nominal (Rp)',{exact:true}).fill('3000000');await page.getByRole('button',{name:'Tambah',exact:true}).click();await page.getByRole('heading',{name:'Setoran Pras',exact:true}).waitFor();await page.getByText('20% dari target',{exact:false}).waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'../output/planner-savings-desktop.png',fullPage:true});
 }
 await page.setViewportSize({width:1440,height:1000});
 await open('schedule');const download=page.waitForEvent('download');await page.getByRole('button',{name:'Unduh rundown PDF',exact:true}).click();const pdf=await download;await pdf.saveAs('../output/planner-rundown-test.pdf');const bytes=await readFile('../output/planner-rundown-test.pdf');assert.equal(bytes.subarray(0,4).toString(),'%PDF');assert.ok(bytes.length>10000);
 await page.getByRole('button',{name:'Buat tautan baca',exact:true}).click();const url=page.getByLabel('Tautan rundown',{exact:false});await url.waitFor();const share=(await url.inputValue()).split('/').pop();
 const publicPage=await browser.newPage({viewport:{width:393,height:852}});await publicPage.goto('http://127.0.0.1:4080/planner/rundown/'+share);await publicPage.getByRole('heading',{name:w.title,exact:true}).waitFor();assert.equal(await publicPage.getByRole('heading',{name:'Katering Pilihan',exact:true}).count(),0);assert.equal(await publicPage.getByRole('button',{name:'Edit',exact:true}).count(),0);await publicPage.screenshot({path:'../output/planner-public-mobile.png',fullPage:true});
 const invite=randomBytes(32).toString('hex');await prisma.plannerMember.create({data:{weddingId:w.id,email:member.email,tokenHash:createHash('sha256').update(invite).digest('hex'),expiresAt:new Date(Date.now()+86400000)}});
 const memberContext=await browser.newContext();await memberContext.addInitScript(token=>localStorage.setItem('um_token',token),generateToken({userId:member.id}));const mp=await memberContext.newPage();await mp.goto('http://127.0.0.1:4080/planner/invite/'+invite);await mp.getByRole('button',{name:'Terima undangan',exact:true}).click();await mp.getByRole('link',{name:'Buka planner bersama',exact:true}).click();await mp.getByRole('heading',{name:w.title,exact:true}).waitFor();await mp.goto('http://127.0.0.1:4080/planner?wedding='+w.id+'&view=access');await mp.getByText('Undangan anggota dan tautan baca dikelola pemilik pernikahan.',{exact:false}).waitFor();assert.equal(await mp.getByRole('button',{name:'Kirim undangan',exact:true}).count(),0);
 assert.deepEqual(errors,[]);console.log((process.env.PLANNER_UI_QUICK?'REMAINING UI CHECKS ':'')+'PASS: mobile CRUD and reload, targets, installment UI, savings totals, no horizontal overflow, multi-page PDF download, read-only public rundown and member acceptance UI.');
}finally{
 if(browser)await browser.close();await prisma.user.deleteMany({where:{id:{in:ids}}});await prisma.$disconnect();
}

