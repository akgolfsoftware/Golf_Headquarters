import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import pg from "pg";
import { assertLocalUsersDatabase, assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";

const targets = assertLocalUsersTargets(process.env);
const users = parse(readFileSync(".codex/environments/brukere/.env.users"));
const prefix = `local-brief-${randomUUID()}`;
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
      VALUES ($1,$2,$3,DATE '2026-10-02',600,30,$4,'SLAG','PUBLISHED','COACH',NOW(),NOW(),'Syntetisk coach-notat')`, [id, users.LOCAL_P01_ID, users.LOCAL_COACH_A_ID, title]);
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
  await db.query('UPDATE workbench_sessions SET maalsetning=$1 WHERE id=$2', ["Syntetisk mål uten øvelser", skipId]);
  await db.query('UPDATE training_plan_sessions SET rationale=$1 WHERE id=$2', ["Syntetisk planbegrunnelse", planSessionId]);
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

test("Workbench-start bevarer dato og innhold ved nettfeil og starter samme økt", async ({ page, context }) => {
  test.setTimeout(150_000);
  await login(page, context);
  await page.goto(`/portal/live/${wbId}/brief`);
  await expect(page.getByRole("heading", { name: "Syntetisk øktark med to fokus", exact: true })).toBeVisible();
  await expect(page.getByText("Syntetisk første øvelse", { exact: true })).toBeVisible();
  await expect(page.getByText("fredag 2. oktober 2026", { exact: false })).toBeVisible();
  await context.setOffline(true);
  await page.getByRole("button", { name: "Start økt", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Økta kunne ikke åpnes" })).toBeVisible();
  expect((await workbench(wbId)).status).toBe("PUBLISHED");
  await expect(page.getByText("Syntetisk første øvelse", { exact: true })).toBeVisible();
  await context.setOffline(false);
  await page.getByRole("button", { name: "Start økt", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/portal/live/${wbId}/tapper$`));
  await expect.poll(async () => (await workbench(wbId)).status).toBe("IN_PROGRESS");
  await page.reload();
  expect((await workbench(wbId)).status).toBe("IN_PROGRESS");
});

test("tom Workbench-økt beholder mål og coach-notat og kan startes", async ({ page, context }) => {
  await login(page, context);
  await page.goto(`/portal/live/${skipId}/brief`);
  await expect(page.getByText("Ingen driller i økta", { exact: true })).toBeVisible();
  await expect(page.getByText("Syntetisk mål uten øvelser", { exact: true })).toBeVisible();
  await expect(page.getByText("Syntetisk coach-notat", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Start økt", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/portal/live/${skipId}/tapper$`));
  await expect.poll(async () => (await workbench(skipId)).status).toBe("IN_PROGRESS");
});

test("V2 starter fra samme innhold og har lagret status etter omlasting", async ({ page, context }) => {
  test.setTimeout(150_000);
  await login(page, context);
  await page.goto(`/portal/live/${v2Id}/brief`);
  await expect(page.getByRole("heading", { name: "Syntetisk V2-øktark", exact: true })).toBeVisible();
  await expect(page.getByText("Syntetisk V2-øvelse", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Start økt", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/portal/live/${v2Id}/active$`));
  await expect.poll(async () => (await db.query('SELECT status FROM training_sessions_v2 WHERE id=$1', [v2Id])).rows[0].status).toBe("IN_PROGRESS");
  await page.reload();
  await expect(page.getByText("Syntetisk V2-øvelse", { exact: true }).first()).toBeVisible();
  expect((await db.query('SELECT status FROM training_sessions_v2 WHERE id=$1', [v2Id])).rows[0].status).toBe("IN_PROGRESS");
});

test("planøkt uten øvelser beholder begrunnelse og starter riktig plan", async ({ page, context }) => {
  await login(page, context);
  await page.goto(`/portal/live/${planSessionId}/brief`);
  await expect(page.getByRole("heading", { name: "Syntetisk planøkt", exact: true })).toBeVisible();
  await expect(page.getByText("Syntetisk planbegrunnelse", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Start økt", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/portal/live/${planSessionId}/tapper$`));
  await expect.poll(async () => (await db.query('SELECT status FROM training_plan_sessions WHERE id=$1', [planSessionId])).rows[0].status).toBe("ACTIVE");
  await page.reload();
  expect((await db.query('SELECT status FROM training_plan_sessions WHERE id=$1', [planSessionId])).rows[0].status).toBe("ACTIVE");
});

test("fremmed spiller får ikke før-start-innhold fra noen av kildene", async ({ page, context }) => {
  await login(page, context, "P03");
  for (const id of [wbId, v2Id, planSessionId]) {
    await page.goto(`/portal/live/${id}/brief`);
    await expect(page).toHaveURL(/\/portal\/planlegge(?:\/workbench)?$/);
    await expect(page.getByText(/Syntetisk (første øvelse|V2-øktark|planbegrunnelse)/)).toHaveCount(0);
  }
});

test("tom økt som venter på godkjenning får ikke startknapp", async ({ page, context }) => {
  await db.query('UPDATE workbench_sessions SET status=$1,"needsPlayerApproval"=true WHERE id=$2', ["PUBLISHED", skipId]);
  await login(page, context);
  await page.goto(`/portal/live/${skipId}/brief`);
  await expect(page.getByRole("status").filter({ hasText: "Svar på forslaget" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start økt", exact: true })).toHaveCount(0);
  expect((await workbench(skipId)).status).toBe("PUBLISHED");
});
