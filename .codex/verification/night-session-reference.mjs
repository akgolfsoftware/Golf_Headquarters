import { chromium } from 'playwright';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1280,height:900}});
try {
  await page.goto('http://127.0.0.1:3068/ui_kits/playerhq/screen.html?id=PH-03&state=data&theme=lys');
  await page.waitForFunction(()=>window.__phqReady, {timeout:30000});
  console.log((await page.locator('button').allTextContents()).slice(0,18));
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'/Users/anderskristiansen/Documents/Claude/akgolf-hq/natt-pr-bilder-2026-10-02/referanse-ph03-lys-390.png',fullPage:true});
  await page.setViewportSize({width:1280,height:900});
  await page.screenshot({path:'/Users/anderskristiansen/Documents/Claude/akgolf-hq/natt-pr-bilder-2026-10-02/referanse-ph03-lys-1280.png',fullPage:true});
} finally {await browser.close();}
