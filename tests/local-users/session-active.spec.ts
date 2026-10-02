import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import pg from "pg";
import { assertLocalUsersDatabase, assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";

const targets = assertLocalUsersTargets(process.env);
const users = parse(readFileSync(".codex/environments/brukere/.env.users"));
const prefix = `local-active-${randomUUID()}`;
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
    VALUES ($1,'Syntetisk aktiv økt',$2,$3,NOW(),NOW()+INTERVAL '30 minutes','M1','BLOKK','PLANNED',NOW())`, [sessionId, users.LOCAL_P01_ID, users.LOCAL_COACH_A_ID]);
  for (let i = 0; i < 2; i++) await db.query(`INSERT INTO training_drills_v2 (id,"sessionId",name,"sortOrder","durationMinutes",pyramide,"repType","repAntall","pPosisjoner") VALUES ($1,$2,$3,$4,15,'TEK','BALLER_SLATT',20,'{}')`, [`${sessionId}-d${i}`,sessionId,`Syntetisk øvelse ${i+1}`,i]);
});
test.afterAll(async () => { try { await db.query('DELETE FROM training_sessions_v2 WHERE id=ANY($1::text[])',[ids]); } finally { await db.end(); } });
async function row() { return (await db.query('SELECT status,"completedSummary" FROM training_sessions_v2 WHERE id=$1',[sessionId])).rows[0]; }
async function open(page: Page, context: BrowserContext) {
  await login(page,context); await page.goto(`/portal/live/${sessionId}/active`);
  await expect(page.getByRole("button",{name:"Legg til fem Treff",exact:true})).toBeEnabled();
}
test("tellere, pause og notater beholdes etter nettbrudd og omlasting", async ({page,context}) => {
  await open(page,context);
  await context.setOffline(true);
  await page.getByRole("button",{name:"Legg til fem Treff",exact:true}).click();
  await page.getByRole("button",{name:"Trekk fra én Treff",exact:true}).click();
  await expect(page.getByTestId("teller-repsHit")).toHaveText("4 av —");
  await page.getByRole("button",{name:"Pause",exact:true}).click();
  await page.getByText("Notater",{exact:true}).click();
  await page.getByLabel("Skriv eller rediger notat").fill("Syntetisk huskelapp");
  await page.getByRole("button",{name:"Legg til notat",exact:true}).click();
  await expect(page.getByText("Syntetisk huskelapp",{exact:true})).toBeVisible();
  await context.setOffline(false);
  await expect.poll(async () => (await db.query('SELECT "repsHit" FROM drill_logs_v2 WHERE "drillId"=$1',[`${sessionId}-d0`])).rows[0]?.repsHit).toBe(4);
  await page.reload();
  await expect(page.getByTestId("teller-repsHit")).toHaveText("4 av —");
  await expect(page.getByRole("button",{name:"Fortsett",exact:true})).toHaveAttribute("aria-pressed","true");
  await page.getByText("Notater (1)",{exact:true}).click();
  await expect(page.getByText("Syntetisk huskelapp",{exact:true})).toBeVisible();
});
test("hopp over overlever omlasting, og avslutning krever bekreftelse", async ({page,context}) => {
  await open(page,context);
  await page.getByRole("button",{name:"Legg til fem Treff",exact:true}).click();
  await page.getByRole("button",{name:"Rekkefølge og hopp over",exact:true}).click();
  await page.getByRole("button",{name:"Hopp over Syntetisk øvelse 1",exact:true}).click();
  await page.getByRole("button",{name:"Lukk",exact:true}).filter({hasText:"Lukk"}).click();
  await expect(page.getByRole("heading",{name:"Syntetisk øvelse 2",exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole("listitem",{name:"Drill 1 hoppet over",exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Syntetisk øvelse 2",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Legg til én Treff",exact:true}).click();
  await page.getByRole("button",{name:"Ferdig med drillen",exact:true}).click();
  await expect(page.getByRole("alertdialog",{name:"Avslutte økta?"})).toBeVisible();
  expect((await row()).status).toBe("IN_PROGRESS");
  await context.setOffline(true);
  await page.getByRole("button",{name:"Avslutt og lagre",exact:true}).click();
  await expect(page.getByRole("alert").filter({hasText:"Fullføringen ble ikke bekreftet"})).toBeVisible();
  expect((await row()).status).toBe("IN_PROGRESS");
  await context.setOffline(false);
  await page.getByRole("button",{name:"Prøv fullføring igjen",exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/portal/live/${sessionId}/summary$`));
  const saved=await row(); expect(saved.status).toBe("COMPLETED");
  expect(saved.completedSummary.liveSummary.completedDrillIds).toEqual([`${sessionId}-d1`]);
  await page.reload(); expect((await row()).status).toBe("COMPLETED");
});
test("fremmed spiller kan ikke åpne eller starte økta",async ({page,context})=>{
  await login(page,context,"P03"); await page.goto(`/portal/live/${sessionId}/active`);
  await expect(page).not.toHaveURL(new RegExp(`/portal/live/${sessionId}/active$`));
  expect((await row()).status).toBe("PLANNED");
});

test("nye øvelser lagres, kan gjenåpnes og fjernes uten å miste andre resultater",async ({page,context})=>{
  await open(page,context);
  await page.getByRole("button",{name:"Legg til fem Treff",exact:true}).click();
  await page.getByRole("button",{name:"Rekkefølge og hopp over",exact:true}).click();
  await page.getByRole("button",{name:"Legg til drill underveis",exact:true}).click();
  await page.getByLabel("Navn på ny drill").fill("Syntetisk ekstraøvelse");
  await page.getByRole("button",{name:"Legg til",exact:true}).click();
  await expect.poll(async ()=>(await db.query('SELECT count(*)::int AS n FROM training_drills_v2 WHERE "sessionId"=$1 AND name=$2',[sessionId,"Syntetisk ekstraøvelse"])).rows[0].n).toBe(1);
  await page.reload();
  await page.getByRole("button",{name:"Rekkefølge og hopp over",exact:true}).click();
  await expect(page.getByText("03 · Syntetisk ekstraøvelse",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Fjern Syntetisk øvelse 1 fra økta",exact:true}).click();
  await expect(page.getByRole("alert").filter({hasText:"Øvelsen kunne ikke fjernes"})).toBeVisible();
  await page.getByRole("button",{name:"Fjern Syntetisk ekstraøvelse fra økta",exact:true}).click();
  await expect.poll(async ()=>(await db.query('SELECT count(*)::int AS n FROM training_drills_v2 WHERE "sessionId"=$1',[sessionId])).rows[0].n).toBe(2);
  await page.reload();
  await expect(page.getByTestId("teller-repsHit")).toHaveText("5 av —");
});

test("fysisk registrering gjenåpnes med faktisk varighet, sone og notat",async ({page,context})=>{
  await db.query(`UPDATE training_drills_v2 SET pyramide='FYS',"fysTreningstype"='kondisjon',"repType"='TID',"repMinutter"=10 WHERE id=$1`,[`${sessionId}-d0`]);
  await login(page,context); await page.goto(`/portal/live/${sessionId}/active`);
  const note=page.getByPlaceholder("F.eks. «kjentes tungt siste sett»");
  await page.getByRole("button",{name:/S4 Terskel/}).click();
  await note.fill("Syntetisk fysisk notat");
  await expect.poll(async ()=>(await db.query('SELECT notes FROM drill_logs_v2 WHERE "drillId"=$1',[`${sessionId}-d0`])).rows[0]?.notes).toContain("Syntetisk fysisk notat");
  await page.reload(); await expect(note).toHaveValue("Syntetisk fysisk notat");
  await note.fill("Syntetisk fysisk notat etter omlasting");
  await expect.poll(async ()=>(await db.query('SELECT notes FROM drill_logs_v2 WHERE "drillId"=$1',[`${sessionId}-d0`])).rows[0]?.notes).toBe("Kondisjon: 10 min i sone 4 — Syntetisk fysisk notat etter omlasting");
});
