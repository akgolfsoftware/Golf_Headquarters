import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import pg from "pg";
import { assertLocalUsersDatabase, assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";

const targets = assertLocalUsersTargets(process.env);
const users = parse(readFileSync(".codex/environments/brukere/.env.users"));
const prefix = `local-summary-${randomUUID()}`;
const db = new pg.Pool({ connectionString: targets.database.toString() });
let sessionId: string;
const ids: string[] = [];

async function login(page: Page, context: BrowserContext, key = "P01") {
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" && ["3061", "55621"].includes(url.port)) await route.continue();
    else await route.abort();
  });
  const email = users[`LOCAL_${key}_EMAIL`], password = users[`LOCAL_${key}_PASSWORD`];
  if (!email?.endsWith("@akgolf.test") || !password) throw Error("Synthetic account required");
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Logg inn med passord", exact: true }).click();
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/portal$/);
  await page.getByRole("button", { name: "Kun nødvendige", exact: true }).click();
}

test.beforeAll(async () => { await assertLocalUsersDatabase(db); });
test.beforeEach(async () => {
  sessionId = `${prefix}-${randomUUID()}`; ids.push(sessionId);
  await db.query(`INSERT INTO training_sessions_v2 (id,title,"studentId","coachId","startTime","endTime",miljo,"practiceType",status,"updatedAt")
    VALUES ($1,'Syntetisk oppsummering',$2,$3,NOW(),NOW()+INTERVAL '30 minutes','M1','BLOKK','COMPLETED',NOW())`, [sessionId, users.LOCAL_P01_ID, users.LOCAL_COACH_A_ID]);
  for (let i = 0; i < 2; i++) await db.query(`INSERT INTO training_drills_v2 (id,"sessionId",name,"sortOrder","durationMinutes",pyramide,"repType","repAntall","pPosisjoner") VALUES ($1,$2,$3,$4,15,'TEK','BALLER_SLATT',20,'{}')`, [`${sessionId}-d${i}`,sessionId,`Syntetisk øvelse ${i+1}`,i]);
  await db.query('UPDATE training_drills_v2 SET repetitions=20 WHERE "sessionId"=$1',[sessionId]);
  await db.query('UPDATE training_drills_v2 SET "actualDurationSec"=600 WHERE id=$1',[`${sessionId}-d0`]);
  await db.query(`INSERT INTO drill_logs_v2 (id,"drillId","loggedBy","repsTotal","successRate",notes,"loggedAt") VALUES ($1,$2,$3,10,0,NULL,NOW())`,[`${sessionId}-base-log`,`${sessionId}-d0`,users.LOCAL_P01_ID]);
  await db.query('UPDATE training_sessions_v2 SET "completedSummary"=$1::jsonb WHERE id=$2', [JSON.stringify({liveSummary:{durationSec:1200,completedDrillIds:[`${sessionId}-d0`]},coachBrief:{melding:"Bevares"}}),sessionId]);
});
test.afterAll(async () => { try { await db.query('DELETE FROM training_sessions_v2 WHERE id=ANY($1::text[])',[ids]); } finally { await db.end(); } });
async function row() { return (await db.query('SELECT status,"completedSummary" FROM training_sessions_v2 WHERE id=$1',[sessionId])).rows[0]; }
async function open(page: Page, context: BrowserContext) {
  await login(page,context); expect((await row()).status).toBe("COMPLETED");
  const response = await page.goto(`/portal/live/${sessionId}/summary`);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("group",{name:"Kvalitet",exact:true})).toBeVisible();
}
async function choose(page: Page, label: string, n: number) { await page.getByRole("group",{name:label,exact:true}).getByRole("button",{name:String(n),exact:true}).click(); }
async function saved(page: Page) { await expect(page.getByRole("status").filter({hasText:"Lagret"})).toBeVisible(); }

test("eldre notat skjuler ikke vurdering; samlet lagring og endring bevarer øvrige felter", async ({page,context},info)=>{
  const before=(await row()).completedSummary;
  await db.query('UPDATE training_sessions_v2 SET "completedSummary"=$1::jsonb WHERE id=$2',[JSON.stringify({...before,dineOrd:{tekst:"Eldre notat"},spillerVurdering:{kvalitet:4,nesteFokus:"Rytme",folelse:"Fokusert"}}),sessionId]);
  await open(page,context);
  await expect(page.getByRole("button",{name:"Lagre økta",exact:true})).toBeVisible();
  await expect(page.getByText("AV 40 PLANLAGT",{exact:true})).toBeVisible();
  await expect(page.getByText("REPS",{exact:true}).locator("..").getByText("10",{exact:true})).toBeVisible();
  await choose(page,"Kvalitet",5); await choose(page,"Belastning",7); await choose(page,"Fokus (valgfritt)",8);
  await page.getByLabel("Notat til coach").fill("Samlet notat");
  await page.getByRole("button",{name:"Lagre økta",exact:true}).click(); await saved(page);
  await page.screenshot({path:`/Users/anderskristiansen/Documents/Claude/akgolf-hq/natt-pr-bilder-2026-10-02/etter-okt-golf-app-${info.project.name}.png`,fullPage:false});
  const stored=(await row()).completedSummary;
  expect(stored.spillerVurdering).toMatchObject({kvalitet:5,rpe:7,fokus:8,nesteFokus:"Rytme",folelse:"Fokusert",sRpe:140});
  expect(stored.dineOrd.tekst).toBe("Samlet notat"); expect(stored.liveSummary).toEqual(before.liveSummary);
  await page.reload(); await saved(page);
  await page.getByText("Tidligere vurdering",{exact:true}).click();
  await expect(page.getByText("Neste fokus: Rytme",{exact:true})).toBeVisible();
  await expect(page.getByRole("group",{name:"Kvalitet",exact:true}).getByRole("button",{name:"5",exact:true})).toBeDisabled();
  await page.getByRole("button",{name:"Endre",exact:true}).click();
  await page.getByLabel("Notat til coach").fill(""); await choose(page,"Belastning",8);
  await page.getByRole("button",{name:"Lagre økta",exact:true}).click(); await saved(page);
  await page.reload(); await expect(page.getByLabel("Notat til coach")).toHaveValue("");
  expect((await row()).completedSummary.spillerVurdering.rpe).toBe(8);
});
test("lagre uten vurdering og gjenåpne uten oppdiktede tall",async ({page,context})=>{
  await open(page,context); await page.getByLabel("Notat til coach").fill("Kun notat");
  await page.getByRole("button",{name:"Lagre uten vurdering",exact:true}).click();await saved(page);
  const stored=(await row()).completedSummary;expect(stored.spillerVurdering).toBeUndefined();expect(stored.etterOkt.utenVurdering).toBe(true);
  await page.reload();await saved(page);await expect(page.getByLabel("Notat til coach")).toHaveValue("Kun notat");
});
test("nettfeil beholder valgene og nytt forsøk lagrer samlet",async ({page,context})=>{
  await open(page,context);await choose(page,"Kvalitet",4);await choose(page,"Belastning",6);
  await page.getByLabel("Notat til coach").fill("Behold meg");
  await context.setOffline(true);await page.getByRole("button",{name:"Lagre økta",exact:true}).click();
  await expect(page.getByText("Vurderingen kunne ikke lagres",{exact:true})).toBeVisible();
  await expect(page.getByLabel("Notat til coach")).toHaveValue("Behold meg");expect((await row()).completedSummary.etterOkt).toBeUndefined();
  await context.setOffline(false);await page.getByRole("button",{name:"Prøv igjen",exact:true}).click();await saved(page);
  expect((await row()).completedSummary.spillerVurdering).toMatchObject({kvalitet:4,rpe:6});
});
test("fremmed spiller får ikke se oppsummeringen",async ({page,context})=>{
  const before=await row();await login(page,context,"P03");await page.goto(`/portal/live/${sessionId}/summary`);
  await expect(page).not.toHaveURL(new RegExp(`/portal/live/${sessionId}/summary$`));expect(await row()).toEqual(before);
});
test("fysiske detaljer viser faktisk varighet, serier, vekt og notat",async ({page,context},info)=>{
  await db.query(`UPDATE training_drills_v2 SET pyramide='FYS',"fysSett"=CASE WHEN id=$1 THEN NULL ELSE 3 END WHERE "sessionId"=$2`,[`${sessionId}-d0`,sessionId]);
  await db.query('DELETE FROM drill_logs_v2 WHERE "drillId" IN ($1,$2)',[`${sessionId}-d0`,`${sessionId}-d1`]);
  for (const [i,note,total] of [[0,"Kondisjon: 10 min i sone 4 — Syntetisk fysisk notat",10],[1,"Styrke: 60 kg × 8 · 60 kg × 8",16]] as const) {
    await db.query(`INSERT INTO drill_logs_v2 (id,"drillId","loggedBy","repsTotal","repsWithoutBall","repsLowSpeed","repsAutomatic","repsHit","successRate",notes,"loggedAt") VALUES ($1,$2,$3,$4,0,0,0,$4,0,$5,NOW())`,[`${sessionId}-l${i}`,`${sessionId}-d${i}`,users.LOCAL_P01_ID,total,note]);
  }
  await open(page,context);
  await expect(page.getByText("Registrert varighet: 10 min",{exact:true})).toBeVisible();
  await expect(page.getByText("Pulssone: S4",{exact:true})).toBeVisible();
  await expect(page.getByText("Sett 1: 60 kg × 8",{exact:true})).toBeVisible();
  await expect(page.getByText("Syntetisk fysisk notat",{exact:true})).toBeVisible();
  await expect(page.getByRole("group",{name:"Fokus (valgfritt)",exact:true})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`/Users/anderskristiansen/Documents/Claude/akgolf-hq/natt-pr-bilder-2026-10-02/etter-okt-fys-app-${info.project.name}.png`,fullPage:false});
});
