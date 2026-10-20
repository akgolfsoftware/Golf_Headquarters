import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://127.0.0.1:3081/ui_kits/agencyos/screen.html?id=AG-06-NY&state=data&theme=lys');
 await page.waitForFunction(()=>window.__agReady && document.querySelector('button'));
 await page.evaluate(()=>document.fonts.ready);
 console.log(JSON.stringify({headings:await page.locator('h1,h2').allTextContents(),buttons:(await page.locator('button').allTextContents()).slice(-15)}));
 await page.screenshot({path:'/Users/anderskristiansen/Documents/Claude/akgolf-hq/natt-pr-bilder-2026-10-02/booking-referanse-desktop.png',fullPage:false});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'/Users/anderskristiansen/Documents/Claude/akgolf-hq/natt-pr-bilder-2026-10-02/booking-referanse-mobil.png',fullPage:false});
}finally{await browser.close()}
