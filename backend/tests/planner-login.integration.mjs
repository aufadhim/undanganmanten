import 'dotenv/config';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash,randomBytes} from 'node:crypto';
import bcrypt from 'bcryptjs';
import {prisma} from '../src/lib/prisma.js';
const require=createRequire(new URL('../../frontend/package.json',import.meta.url));
const {chromium}=require('playwright');
let user,browser;
try{
 const password=randomBytes(20).toString('hex');
 user=await prisma.user.create({data:{email:'planner-login-'+Date.now()+'@example.invalid',passwordHash:await bcrypt.hash(password,10),isVerified:true}});
 const wedding=await prisma.wedding.create({data:{userId:user.id,title:'Uji kembali dari login',weddingDate:new Date('2027-02-14')}});
 const token=randomBytes(32).toString('hex');
 await prisma.plannerMember.create({data:{weddingId:wedding.id,email:user.email,tokenHash:createHash('sha256').update(token).digest('hex'),expiresAt:new Date(Date.now()+86400000)}});
 browser=await chromium.launch({channel:'chrome'});const page=await browser.newPage({viewport:{width:393,height:852}});
 await page.goto('http://127.0.0.1:4080/planner/invite/'+token);
 assert.equal(await page.getByRole('link',{name:'Daftar dengan email penerima',exact:true}).getAttribute('href'),'/signup?plannerInvite='+token);
 await page.getByRole('link',{name:'Masuk',exact:true}).click();await page.locator('input[type=email]').fill(user.email);await page.locator('input[type=password]').fill(password);
 await page.locator('button[type=submit]').click();await page.waitForURL('**/planner/invite/'+token);
 await page.getByRole('button',{name:'Terima undangan',exact:true}).waitFor();
 console.log('PASS: email invitation -> login -> return to the same invitation. Signup link also preserves context.');
}finally{if(browser)await browser.close();if(user)await prisma.user.deleteMany({where:{id:user.id}});await prisma.$disconnect()}
