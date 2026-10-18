import {chromium} from 'playwright';
const browser=await chromium.launch();const page=await browser.newPage();
page.on('pageerror',e=>console.log('pageerror',e.message));
page.on('requestfailed',r=>console.log('requestfailed',r.url(),r.failure()?.errorText));
await page.goto('http://127.0.0.1:3081/ui_kits/agencyos/screen.html?id=AG-06-NY&state=data&theme=lys');
await page.waitForTimeout(8000);console.log(await page.evaluate(()=>({react:!!window.React,babel:!!window.Babel,ready:!!window.__agReady,root:document.getElementById('root')?.textContent?.slice(0,200)})));await browser.close();
