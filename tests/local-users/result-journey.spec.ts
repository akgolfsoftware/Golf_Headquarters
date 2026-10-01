import { test, expect } from "@playwright/test";
import { randomBytes, randomUUID } from "node:crypto";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { assertLocalUsersDatabase, assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";

const targets = assertLocalUsersTargets(process.env);
const db = new pg.Pool({ connectionString: targets.database.toString() });
const auth = createClient(targets.api.origin, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
const ownerId = `synthetic-result-browser-${randomUUID()}`;
const email = `${ownerId}@akgolf.test`;
const password = randomBytes(24).toString("base64url");
let authId: string | undefined;
let sessionId: string;
let taskId: string;
let drillId: string;

test.beforeAll(async () => {
  const pool = new pg.Pool({ connectionString: targets.database.toString() });
  try { await assertLocalUsersDatabase(pool); } finally { await pool.end(); }
  const created = await auth.auth.admin.createUser({ email, password, email_confirm: true,
    user_metadata: { role: "PLAYER", tier: "PRO", firstName: "Syntetisk", lastName: "Resultatspiller" } });
  if (created.error || !created.data.user) throw new Error("Synthetic local Auth setup failed");
  authId = created.data.user.id;
  const fixture = JSON.parse(execFileSync(process.execPath, ["--import", "tsx", "tests/local-users/result-browser-fixture.ts"], {
    input: JSON.stringify({ ownerId, authId, email }), encoding: "utf8", stdio: ["pipe", "pipe", "pipe"],
  }));
  ({ sessionId, taskId, drillId } = fixture);
});

test.afterAll(async () => {
  try {
    await db.query('DELETE FROM training_sessions_v2 WHERE "studentId" = $1', [ownerId]);
    await db.query('DELETE FROM technical_plans WHERE "userId" = $1', [ownerId]);
    await db.query('DELETE FROM users WHERE id = $1', [ownerId]);
    if (authId) await auth.auth.admin.deleteUser(authId);
  } finally { await db.end(); }
});

test("innlogging → måling → fullføring → reload beholder golf og fysisk dose", async ({ page, context }) => {
  test.setTimeout(180000);
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" && ["3061", "55621"].includes(url.port)) await route.continue();
    else await route.abort();
  });
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Logg inn med passord", exact: true }).click();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await page.locator('input[type="email"]').fill(email);
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await page.locator('input[type="password"]').fill(password);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/portal$/);
  await page.getByRole("button", { name: "Kun nødvendige", exact: true }).click();
  await page.goto(`/portal/live/${sessionId}/active`);
  for (let i = 0; i < 3; i++) await page.locator('[data-od-id="live-tap-rep"]').filter({ visible: true }).click();
  await page.locator('[data-od-id="live-tap-treff"]').filter({ visible: true }).click();
  await expect.poll(async () => (await db.query('SELECT "repsTotal" FROM drill_logs_v2 WHERE "drillId" = $1 AND "loggedBy" = $2', [drillId, ownerId])).rows[0]?.repsTotal).toBe(4);
  await page.reload();
  await page.getByRole("button", { name: "Avslutt", exact: true }).click();
  await page.getByRole("button", { name: "Avslutt og logg økta", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/portal/live/${sessionId}/summary$`));
  await page.getByText("Plan mot gjennomført", { exact: true }).click();
  await expect(page.getByText("4 av 30 repetisjoner · 1 treff", { exact: true })).toBeVisible();
  await expect(page.getByText("90 kg × 6 (RIR 2)", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByText("Plan mot gjennomført", { exact: true }).click();
  await expect(page.getByText("4 av 30 repetisjoner · 1 treff", { exact: true })).toBeVisible();
  const stored = (await db.query('SELECT status, "completedSummary" FROM training_sessions_v2 WHERE id = $1', [sessionId])).rows[0];
  expect(stored.status).toBe("COMPLETED");
  const summary = stored.completedSummary as { liveSummary: { totalReps: number }; drillResults: { drillId: string }[] };
  expect(summary.liveSummary.totalReps).toBe(4);
  expect(summary.drillResults.some(r => r.drillId === drillId)).toBe(true);
  expect((await db.query('SELECT "repsGjortFull" FROM position_tasks WHERE id = $1', [taskId])).rows[0].repsGjortFull).toBe(4);
});
