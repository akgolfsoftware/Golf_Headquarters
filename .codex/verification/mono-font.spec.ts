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
async function _open(page:Page,id:string) { await page.goto(`/portal/live/${id}/tapper`);await expect(page.locator('[data-od-id="tapper-pluss-5"]')).toBeEnabled(); }
async function _total(id:string){return Number((await db.query('SELECT COALESCE(SUM(count),0)::int AS total FROM session_ball_logs WHERE "planSessionId"=$1',[id])).rows[0].total);}
async function _queued(page:Page,id:string){return page.evaluate(async({id,owner})=>new Promise<number>((resolve,reject)=>{
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
test("tall bruker gyldig skrift fra appen",async({page,context},info)=>{
 const id=await session();await login(page,context);await page.goto(`/portal/live/${id}/tapper`);
 await expect(page.getByRole("heading",{name:"Slag og repetisjoner",exact:true})).toBeVisible();
 const count=page.getByText("repetisjoner denne økta",{exact:true}).locator("..").locator("div").first();
 await expect(count).toHaveCSS("font-size","44px");
 expect(await count.evaluate(el=>getComputedStyle(el).getPropertyValue("--font-ibm-plex-mono").trim())).not.toBe("");
 expect(await count.evaluate(el=>getComputedStyle(el).fontFamily)).toMatch(/mono/i);
 await page.screenshot({path:`/Users/anderskristiansen/Documents/Claude/akgolf-hq/natt-pr-bilder-2026-10-02/mono-retting-${info.project.name}.png`,fullPage:true});
});
