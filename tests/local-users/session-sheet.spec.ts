import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import pg from "pg";
import { assertLocalUsersDatabase, assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";

const targets = assertLocalUsersTargets(process.env);
const users = parse(readFileSync(".codex/environments/brukere/.env.users"));
const prefix = `local-sheet-${randomUUID()}`;
const db = new pg.Pool({ connectionString: targets.database.toString() });
let wbId: string, skipId: string, v2Id: string, planId: string, planSessionId: string;

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

test.beforeAll(async () => {
  await assertLocalUsersDatabase(db);
  wbId = `${prefix}-wb`; skipId = `${prefix}-skip`; v2Id = `${prefix}-v2`;
  planId = `${prefix}-plan`; planSessionId = `${prefix}-plan-session`;
  for (const [id, title] of [[wbId, "Syntetisk øktark med to fokus"], [skipId, "Syntetisk tom økt å hoppe over"]]) {
    await db.query(`INSERT INTO workbench_sessions (id, "playerId", "coachId", date, "startMinute", "durationMinutes", title, pyramid, status, "createdBy", "publishedAt", "updatedAt", notes)
      VALUES ($1,$2,$3,CURRENT_DATE,600,30,$4,'SLAG','PUBLISHED','COACH',NOW(),NOW(),'Syntetisk coach-notat')`, [id, users.LOCAL_P01_ID, users.LOCAL_COACH_A_ID, title]);
  }
  for (const [order, name, focus] of [[0, "Syntetisk første øvelse", "Rolig vending"], [1, "Syntetisk andre øvelse", "Hold avslutningen"]] as const) {
    await db.query(`INSERT INTO workbench_drills (id,"sessionId",title,"durationMinutes","sortOrder","techniqueFocus","akFormel") VALUES ($1,$2,$3,15,$4,$5,$6)`,
      [`${wbId}-drill-${order}`, wbId, name, order, focus, JSON.stringify({ pyramid: "SLAG", area: "TEE", label: "SLAG_TEE" })]);
  }
  await db.query(`INSERT INTO training_sessions_v2 (id,title,"studentId","coachId","startTime","endTime",miljo,"practiceType",status,notes,"updatedAt")
    VALUES ($1,'Syntetisk V2-øktark',$2,$3,NOW(),NOW()+INTERVAL '30 minutes','M1','BLOKK','PLANNED','Syntetisk V2-notat',NOW())`, [v2Id, users.LOCAL_P01_ID, users.LOCAL_COACH_A_ID]);
  await db.query(`INSERT INTO training_drills_v2 (id,"sessionId",name,"sortOrder","durationMinutes",pyramide,"repType","repAntall","pPosisjoner")
    VALUES ($1,$2,'Syntetisk V2-øvelse',0,30,'TEK','BALLER_SLATT',20,'{}')`, [`${v2Id}-drill`, v2Id]);
  await db.query(`INSERT INTO training_plans (id,"userId",name,"startDate",status,"updatedAt") VALUES ($1,$2,'Syntetisk øktarkplan',NOW(),'ACTIVE',NOW())`, [planId, users.LOCAL_P01_ID]);
  await db.query(`INSERT INTO training_plan_sessions (id,"planId","scheduledAt","durationMin",title,"pyramidArea","pPosisjoner","updatedAt")
    VALUES ($1,$2,NOW(),30,'Syntetisk planøkt','SLAG','{}',NOW())`, [planSessionId, planId]);
});
test.afterAll(async () => {
  try {
    await db.query('DELETE FROM session_ball_logs WHERE "planSessionId" = ANY($1::text[])', [[wbId, skipId, planSessionId]]);
    await db.query('DELETE FROM workbench_sessions WHERE id = ANY($1::text[])', [[wbId, skipId]]);
    await db.query('DELETE FROM training_sessions_v2 WHERE id = $1', [v2Id]);
    await db.query('DELETE FROM training_plans WHERE id = $1', [planId]);
  } finally { await db.end(); }
});
async function workbench(id: string) {
  return (await db.query<{ status: string; actualMinutes: number | null; perceivedEffort: number | null }>('SELECT status,"actualMinutes","perceivedEffort" FROM workbench_sessions WHERE id=$1', [id])).rows[0];
}

test("Workbench beholder hvert øvelsesfokus, status og lagret anstrengelse", async ({ page, context }) => {
  test.setTimeout(150_000);
  await login(page, context);
  await page.goto(`/portal/tren/wb/${wbId}`);
  const exercises = page.getByRole("region", { name: "Øvelser", exact: true });
  await expect(exercises.getByRole("listitem").nth(0)).toContainText("Rolig vending");
  await expect(exercises.getByRole("listitem").nth(1)).toContainText("Hold avslutningen");
  await expect(page.getByText("Syntetisk coach-notat", { exact: true })).toBeVisible();
  await page.reload();
  await expect(exercises.getByRole("listitem").nth(0)).toContainText("Rolig vending");
  await page.getByRole("button", { name: "Start økt", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/portal/live/${wbId}/tapper$`));
  await expect.poll(async () => (await workbench(wbId)).status).toBe("IN_PROGRESS");
  await page.goto(`/portal/tren/wb/${wbId}`);
  await page.getByRole("button", { name: "5", exact: true }).click();
  await page.getByLabel("Faktisk varighet (minutter)", { exact: true }).fill("27");
  await page.getByRole("button", { name: "Fullfør økt", exact: true }).click();
  await expect.poll(async () => {
    const s = await workbench(wbId);
    return [s.status, s.actualMinutes, s.perceivedEffort];
  }).toEqual(["COMPLETED", 27, 5]);
  await page.reload();
  await expect(page.getByText("Gjennomført", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "5", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Faktisk varighet (minutter)", { exact: true })).toHaveValue("27");
  await expect(exercises.getByRole("listitem")).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("tom Workbench-økt kan hoppes over og beholder status etter omlasting", async ({ page, context }) => {
  await login(page, context);
  await page.goto(`/portal/tren/wb/${skipId}`);
  await expect(page.getByText("Økta har ingen øvelser ennå", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Hopp over", exact: true }).click();
  await page.getByRole("button", { name: "Hopp over økt", exact: true }).click();
  await expect.poll(async () => (await workbench(skipId)).status).toBe("SKIPPED");
  await page.reload();
  await expect(page.getByText("Hoppet over", { exact: true })).toBeVisible();
});

test("V2-detalj og planinngang bevarer kilden uten å bytte økt", async ({ page, context }) => {
  test.setTimeout(150_000);
  await login(page, context);
  await page.goto(`/portal/gjennomfore/${v2Id}`);
  await expect(page.getByRole("heading", { name: "Syntetisk V2-øktark", exact: true })).toBeVisible();
  await expect(page.getByText("Syntetisk V2-øvelse", { exact: true })).toBeVisible();
  await expect(page.getByText("20 BALLER", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Syntetisk V2-øvelse", { exact: true })).toBeVisible();
  const start = page.getByRole("link", { name: /Start/ }).filter({ visible: true });
  await expect(start).toHaveAttribute("href", new RegExp(`/portal/live/${v2Id}`));
  await start.click();
  await expect(page).toHaveURL(new RegExp(`/portal/live/${v2Id}/brief$`));
  await expect(page.getByRole("heading", { name: "Syntetisk V2-øktark", exact: true })).toBeVisible();
  await page.goto(`/portal/tren/${planSessionId}`);
  await expect(page).toHaveURL(new RegExp(`/portal/live/${planSessionId}/brief$`));
  await expect(page.getByRole("heading", { name: "Syntetisk planøkt", exact: true })).toBeVisible();
  expect((await db.query('SELECT status FROM training_plan_sessions WHERE id=$1', [planSessionId])).rows[0].status).toBe("PLANNED");
});

test("annen spiller ser verken Workbench- eller V2-øktark", async ({ page, context }) => {
  await login(page, context, "P03");
  for (const path of [`/portal/tren/wb/${wbId}`, `/portal/gjennomfore/${v2Id}`]) {
    await page.goto(path);
    await expect(page.getByText(/Syntetisk (øktark med to fokus|V2-øktark|coach-notat)/)).toHaveCount(0);
    await expect(page.getByText(/Fant ikke økt/)).toBeVisible();
  }
});
