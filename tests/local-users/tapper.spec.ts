import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import pg from "pg";
import { assertLocalUsersDatabase, assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";
const targets = assertLocalUsersTargets(process.env);
const users = parse(readFileSync(".codex/environments/brukere/.env.users"));
const db = new pg.Pool({connectionString: targets.database.toString()});
const ids: string[] = [];
async function login(page:Page, context:BrowserContext, key="P01") {
 await context.route("**/*", async route => {
  const url=new URL(route.request().url());
  if(url.hostname==="127.0.0.1" && ["3061","55621"].includes(url.port)) await route.continue(); else await route.abort();
 });
 const email=users[`LOCAL_${key}_EMAIL`],password=users[`LOCAL_${key}_PASSWORD`];
 if(!email?.endsWith("@akgolf.test")||!password)throw Error("Synthetic account required");
 await page.goto("/auth/login"); await page.getByRole("button",{name:"Logg inn med passord",exact:true}).click();
 await page.locator('input[type="email"]').fill(email);await page.locator('input[type="password"]').fill(password);
 await page.locator('form button[type="submit"]').click();await expect(page).toHaveURL(/\/portal$/);
 await page.getByRole("button",{name:"Kun nødvendige",exact:true}).click();
}
async function session(kind:"wb"|"plan"="wb") {
 const id=`local-tapper-${randomUUID()}`;ids.push(id);
 if(kind==="wb")await db.query(`INSERT INTO workbench_sessions (id,"playerId","coachId",date,"startMinute","durationMinutes",title,pyramid,status,"createdBy","updatedAt") VALUES ($1,$2,$3,CURRENT_DATE,600,30,'Syntetisk slagteller','SLAG','IN_PROGRESS',$3,NOW())`,[id,users.LOCAL_P01_ID,users.LOCAL_COACH_A_ID]);
 else {
  await db.query(`INSERT INTO training_plans (id,"userId",name,"startDate",status,"updatedAt") VALUES ($1,$2,'Syntetisk plan',NOW(),'ACTIVE',NOW())`,[id,users.LOCAL_P01_ID]);
  await db.query(`INSERT INTO training_plan_sessions (id,"planId","scheduledAt","durationMin",title,"pyramidArea",status,"pPosisjoner","updatedAt") VALUES ($1,$1,NOW(),30,'Syntetisk slagteller','SLAG','ACTIVE','{}',NOW())`,[id]);
 }
 return id;
}
async function open(page:Page,id:string) { await page.goto(`/portal/live/${id}/tapper`);await expect(page.locator('[data-od-id="tapper-pluss-5"]')).toBeEnabled(); }
async function total(id:string){return Number((await db.query('SELECT COALESCE(SUM(count),0)::int AS total FROM session_ball_logs WHERE "planSessionId"=$1',[id])).rows[0].total);}
async function queued(page:Page,id:string){return page.evaluate(async({id,owner})=>new Promise<number>((resolve,reject)=>{
 const req=indexedDB.open("akgolf-offline-ko",2);req.onerror=()=>reject(Error("queue unavailable"));req.onsuccess=()=>{
 const db=req.result;const read=db.transaction("tapper-ko-v2","readonly").objectStore("tapper-ko-v2").get(`${encodeURIComponent(owner)}:${id}`);
 read.onsuccess=()=>{resolve((read.result?.counts??[]).reduce((n:number,r:{count:number})=>n+r.count,0));db.close();};read.onerror=()=>reject(Error("queue read failed"));
 };}),{id,owner:users.LOCAL_P01_ID});}
test.beforeAll(async()=>{await assertLocalUsersDatabase(db);});
test.afterAll(async()=>{try{
 await db.query('DELETE FROM session_ball_logs WHERE "planSessionId"=ANY($1::text[])',[ids]);
 await db.query('DELETE FROM workbench_sessions WHERE id=ANY($1::text[])',[ids]);
 await db.query('DELETE FROM training_plans WHERE id=ANY($1::text[])',[ids]);
}finally{await db.end();}});
for(const kind of ["wb","plan"] as const)test(`${kind}: raske trykk, nettbrudd, omlasting og avslutning beholder alle tellinger`,async({page,context})=>{
 const id=await session(kind);await login(page,context);await open(page,id);
 await context.setOffline(true);
 await page.locator('[data-od-id="tapper-pluss-5"]').click();
 await expect(page.locator('[data-od-id="tapper-total"]')).toHaveText("5");
 await expect.poll(()=>queued(page,id)).toBe(5);
 expect(await total(id)).toBe(0);
 await context.setOffline(false);await page.reload();
 await expect(page.locator('[data-od-id="tapper-total"]')).toHaveText("5");
 await page.locator('[data-od-id="tapper-pluss-1"]').click();await page.locator('[data-od-id="tapper-angre"]').click();
 await expect(page.locator('[data-od-id="tapper-total"]')).toHaveText("5");
 await expect.poll(()=>total(id)).toBe(5);
 await context.setOffline(true);await page.locator('[data-od-id="tapper-avslutt"]').click();await page.locator('[data-od-id="tapper-avslutt-bekreft"]').click();
 await expect(page.getByText("Økta ble ikke avsluttet. Behold siden åpen og prøv igjen når nettet er tilbake.")).toBeVisible();
 await context.setOffline(false);await page.locator('[data-od-id="tapper-avslutt"]').click();await page.locator('[data-od-id="tapper-avslutt-bekreft"]').click();
 await expect(page).toHaveURL(new RegExp(`/portal/live/${id}/summary$`));
 expect(await total(id)).toBe(5);
 const table=kind==="wb"?"workbench_sessions":"training_plan_sessions";
 expect((await db.query(`SELECT status FROM ${table} WHERE id=$1`,[id])).rows[0].status).toBe("COMPLETED");
});
test("eldre kvittering mister ikke tellinger fra nyere trykk",async({page,context})=>{
 const id=await session();await login(page,context);await open(page,id);
 let release!:()=>void;const held=new Promise<void>(resolve=>{release=resolve;});let received=false;
 await page.route(`**/portal/live/${id}/tapper`,async route=>{
  if(route.request().method()==="POST"&&!received){received=true;const response=await route.fetch();await held;await route.fulfill({response});}else await route.continue();
 });
 try{
  await page.locator('[data-od-id="tapper-pluss-5"]').click();await expect.poll(()=>received).toBe(true);
  await page.locator('[data-od-id="tapper-pluss-5"]').click();await expect.poll(()=>queued(page,id)).toBe(10);
  release();await expect.poll(()=>total(id)).toBe(10);await page.reload();await expect(page.locator('[data-od-id="tapper-total"]')).toHaveText("10");
 }finally{release();}
});
test("lokal lagringsfeil vises ærlig og mister ikke synlig telling",async({page,context})=>{
 const id=await session();await login(page,context);
 await page.addInitScript(()=>{Object.defineProperty(IDBFactory.prototype,"open",{configurable:true,value(){throw new Error("synthetic unavailable storage");}});});
 await open(page,id);await page.locator('[data-od-id="tapper-pluss-5"]').click();
 await expect(page.getByText("Tellingene kunne ikke lagres på denne enheten. Behold siden åpen og prøv igjen.")).toBeVisible();
 await expect(page.locator('[data-od-id="tapper-total"]')).toHaveText("5");expect(await total(id)).toBe(0);
});
test("fremmed spiller kan ikke åpne en annen spillers slagteller",async({page,context})=>{
 const id=await session();await login(page,context,"P03");await page.goto(`/portal/live/${id}/tapper`);
 await expect(page).not.toHaveURL(new RegExp(`/portal/live/${id}/tapper$`));expect(await total(id)).toBe(0);
});
