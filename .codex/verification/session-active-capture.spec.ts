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
async function open(page: Page, context: BrowserContext) {
  await login(page,context); await page.goto(`/portal/live/${sessionId}/active`);
  await expect(page.getByRole("button",{name:"Legg til fem Treff",exact:true})).toBeEnabled();
}
test("visuell appkontroll",async ({page,context},info)=>{
  await open(page,context);
  await page.getByRole("button",{name:"Legg til fem Treff",exact:true}).click();
  await page.getByRole("button",{name:"Pause",exact:true}).click();
  const coach = await page.getByRole("button",{name:"Åpne AI Golf Coach",exact:true}).boundingBox();
  const done = await page.getByRole("button",{name:"Ferdig med drillen",exact:true}).boundingBox();
  expect(coach).not.toBeNull(); expect(done).not.toBeNull();
  expect(coach!.y + coach!.height).toBeLessThanOrEqual(done!.y);
  await page.screenshot({path:`/Users/anderskristiansen/Documents/Claude/akgolf-hq/natt-pr-bilder-2026-10-02/ph05-app-${info.project.name}.png`,fullPage:true});
  await page.getByRole("button",{name:"Rekkefølge og hopp over",exact:true}).click();
  await page.screenshot({path:`/Users/anderskristiansen/Documents/Claude/akgolf-hq/natt-pr-bilder-2026-10-02/ph05-ark-${info.project.name}.png`,fullPage:true});
});
