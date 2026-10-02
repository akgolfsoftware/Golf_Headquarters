import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import pg from 'pg';
const users=parse(readFileSync('.codex/environments/workbench/.env.users'));
const playerId=users.LOCAL_P01_ID;
async function openWeekPlan(page: Page) {
 const more=page.locator('.a9-mer');
 if(await more.isVisible()) {
  await more.getByRole('button',{name:'Mer',exact:true}).click();
  await page.locator('.pa-sheet[role=dialog]').getByRole('listitem').filter({hasText:'Ukeplan og mål'}).click();
 } else {await page.getByRole('button',{name:'Ukeplan og mål',exact:true}).click();}
}
async function saved(){
 const sql=new pg.Pool({connectionString:process.env.DATABASE_URL});
 try{return (await sql.query('SELECT "planningDetails", "plannedHoursSlag" FROM week_plans WHERE "playerId"=$1 AND "isoYear"=2027 AND "weekNumber"=1',[playerId])).rows[0];} finally{await sql.end();}
}
test('ukeplan lagres og gjenleses i ekte trener-/spillerreise',async({page,context,browser},testInfo)=>{
 const failures:string[]=[];page.on('pageerror',error=>failures.push(error.message));
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='127.0.0.1' && ['3072','55721'].includes(url.port))await route.continue();else await route.abort();
 });
 await page.goto('/auth/login');
 await page.getByRole('button',{name:'Logg inn med passord',exact:true}).click();
 await page.locator('input[type=email]').fill(users.LOCAL_COACH_A_EMAIL);
 await page.locator('input[type=password]').fill(users.LOCAL_COACH_A_PASSWORD);
 await page.locator('form button[type=submit]').click();
 await expect(page).toHaveURL(/\/admin\/agencyos$/);
 await page.goto(`/admin/workbench/${playerId}?visning=uke&uke=2027-01-04`);
 const banner=page.getByRole('button',{name:'Kun nødvendige',exact:true});
 await expect(banner).toBeVisible(); await banner.click();
 await expect(page.getByRole('heading',{name:'Workbench',exact:true})).toBeVisible();
 await expect(page.getByRole('region',{name:'Uke',exact:true}).getByText(/^Uke 1 · 04.01/)).toBeVisible();
 await openWeekPlan(page);
 const sheet=page.locator('.pa-sheet[role=dialog]');await expect(sheet).toBeVisible();
 const location=`Syntetisk UI ${testInfo.project.name}`;
 await sheet.getByRole('radio',{name:'Grunnuke',exact:true}).click();
 await sheet.getByRole('textbox',{name:'Oppholdssted',exact:true}).fill(location);
 await sheet.getByRole('combobox',{name:'SLAG prioritet',exact:true}).selectOption('VEDLIKEHOLDE');
 await sheet.getByRole('textbox',{name:'SLAG fokus',exact:true}).fill('Syntetisk fokus fra nettleser');
 await sheet.getByRole('spinbutton',{name:'SLAG timer',exact:true}).fill('0');
 await sheet.getByRole('spinbutton',{name:'SLAG økter',exact:true}).fill('2');
 await sheet.getByRole('button',{name:'Lagre ukeplan',exact:true}).click();
 await expect(sheet).not.toBeVisible();
 await expect.poll(async()=> (await saved())?.planningDetails?.location).toBe(location);
 await page.reload();
 await openWeekPlan(page);
 await expect(sheet.getByRole('textbox',{name:'Oppholdssted',exact:true})).toHaveValue(location);
 await expect(sheet.getByRole('textbox',{name:'SLAG fokus',exact:true})).toHaveValue('Syntetisk fokus fra nettleser');
 await expect(sheet.getByRole('spinbutton',{name:'SLAG timer',exact:true})).toHaveValue('0');
 await expect(sheet.getByRole('spinbutton',{name:'SLAG økter',exact:true})).toHaveValue('2');
 await page.screenshot({path:`/tmp/ak-workbench-ukeplan-${testInfo.project.name}.png`,fullPage:false});
 await sheet.getByRole('textbox',{name:'Oppholdssted',exact:true}).fill('');
 await sheet.getByRole('spinbutton',{name:'SLAG timer',exact:true}).fill('');
 await sheet.getByRole('button',{name:'Lagre ukeplan',exact:true}).click();
 await expect(sheet).not.toBeVisible();await expect.poll(async()=> (await saved())?.planningDetails?.location).toBeNull();
 expect((await saved()).plannedHoursSlag).toBeNull();
 const playerContext=await browser.newContext({viewport:page.viewportSize() ?? {width:390,height:844},isMobile:testInfo.project.name==='mobil',hasTouch:testInfo.project.name==='mobil',serviceWorkers:'block'});
 const player=await playerContext.newPage();player.on('pageerror',error=>failures.push(error.message));
 await playerContext.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='127.0.0.1' && ['3072','55721'].includes(url.port))await route.continue();else await route.abort();
 });
 try {
  await player.goto('http://127.0.0.1:3072/auth/login');
  await player.getByRole('button',{name:'Logg inn med passord',exact:true}).click();
  await player.locator('input[type=email]').fill(users.LOCAL_P01_EMAIL);
  await player.locator('input[type=password]').fill(users.LOCAL_P01_PASSWORD);
  await player.locator('form button[type=submit]').click();
  await expect(player).toHaveURL(/\/portal$/);
  await player.goto('http://127.0.0.1:3072/portal/planlegge/workbench?visning=uke&uke=2027-01-04');
  await openWeekPlan(player);
  const playerSheet=player.locator('.pa-sheet[role=dialog]');
  await expect(playerSheet.getByRole('textbox',{name:'Oppholdssted',exact:true})).toHaveValue('');
  await expect(playerSheet.getByRole('textbox',{name:'SLAG fokus',exact:true})).toHaveValue('Syntetisk fokus fra nettleser');
  await expect(playerSheet.getByRole('spinbutton',{name:'SLAG økter',exact:true})).toHaveValue('2');
 } finally {await playerContext.close();}
 expect(failures).toEqual([]);
});
