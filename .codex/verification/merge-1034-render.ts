import { chromium } from '@playwright/test';
import { byggEndretTimeEpost } from '../../src/lib/email/booking-endret-time';
import { mkdir } from 'node:fs/promises';
async function main() {
 const dir='/tmp/ak-hq-1034-render'; await mkdir(dir,{recursive:true});
 const browser=await chromium.launch();
 let cases=0;
 for(const width of [390,1280]) for(const dark of [false,true]) for(const harKonto of [false,true]) {
  const {html}=byggEndretTimeEpost({appUrl:'https://akgolf.test',bookingId:'synthetic',startAt:new Date(2026,9,5,16),endAt:new Date(2026,9,5,17),oldStartAt:new Date(2026,9,4,16),fornavn:'Testspiller',epost:'spiller@akgolf.test',tjenesteNavn:'Privattime',varighetMin:60,stedNavn:'Testlokale',stedAdresse:null,coachNavn:'Testcoach',priceOre:95000,erKlipp:harKonto,stripePaymentIntentId:harKonto?null:'pi_synthetic',harKonto,dark});
  const page=await browser.newPage({viewport:{width,height:950},colorScheme:dark?'dark':'light'});
  await page.setContent(html);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow');
  await page.screenshot({path:`${dir}/${width}-${dark?'dark':'light'}-${harKonto?'app':'guest'}.png`,fullPage:true});
  await page.close(); cases++;
 }
 await browser.close(); console.log(`${cases} email renders without horizontal overflow`);
}
main().catch(e=>{console.error(e);process.exit(1)});
