import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import pg from "pg";
import { assertLocalUsersDatabase, assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";

const targets = assertLocalUsersTargets(process.env);
const users = parse(readFileSync(".codex/environments/brukere/.env.users"));
const db = new pg.Pool({ connectionString: targets.database.toString() });
const ownIds: string[] = [];
test.use({ actionTimeout: 30_000 });

async function storedStatus(id: string) {
  return (await db.query<{ status: string }>('SELECT status FROM workbench_sessions WHERE id = $1', [id])).rows[0]?.status;
}

async function localNetwork(context: BrowserContext) {
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" && ["3061", "55621"].includes(url.port)) await route.continue();
    else await route.abort();
  });
}
async function login(page: Page, key: string) {
  const email = users[`LOCAL_${key}_EMAIL`];
  const password = users[`LOCAL_${key}_PASSWORD`];
  if (!email?.endsWith("@akgolf.test") || !password) throw new Error("Missing synthetic account");
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Logg inn med passord", exact: true }).click();
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(key.startsWith("COACH") ? /\/admin\/agencyos$/ : /\/portal$/);
  // Auth hides the banner; wait for its delayed mount on the first app page.
  const cookies = page.getByRole("button", { name: "Kun nødvendige", exact: true });
  await expect(cookies).toBeVisible();
  await cookies.click();
}

test.beforeAll(async () => {
  await assertLocalUsersDatabase(db);
});
test.afterAll(async () => {
  try {
    if (ownIds.length) {
      await db.query('DELETE FROM session_ball_logs WHERE "planSessionId" = ANY($1::text[])', [ownIds]);
      await db.query('DELETE FROM workbench_sessions WHERE id = ANY($1::text[])', [ownIds]);
    }
  } finally { await db.end(); }
});

test("trenerens publisering → spillerens I dag → Live → lagret oppsummering", async ({ page, context, browser }, info) => {
  test.setTimeout(180_000);
  await localNetwork(context);
  const title = `Syntetisk nettleserreise ${info.project.name} ${randomUUID().slice(0, 8)}`;
  const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  await login(page, "COACH_A");
  await page.goto(`/admin/workbench/${users.LOCAL_P01_ID}`);
  const cookieChoice = page.getByRole("button", { name: "Kun nødvendige", exact: true });
  if (await cookieChoice.isVisible()) await cookieChoice.click();
  await page.getByRole("button", { name: "Ny økt", exact: true }).click();
  const form = page.getByRole("dialog").filter({ has: page.getByRole("textbox", { name: "Tittel", exact: true }) });
  await form.getByRole("textbox", { name: "Tittel", exact: true }).fill(title);
  await form.locator('input[type="date"]').fill(date);
  await form.locator('input[type="time"]').fill("18:00");
  await form.locator("select").selectOption("30");
  await form.getByRole("radio", { name: "SLAG", exact: true }).click();
  await form.getByRole("button", { name: "Legg inn", exact: true }).click();
  let sessionId = "";
  await expect.poll(async () => {
    const row = (await db.query<{ id: string; status: string }>('SELECT id, status FROM workbench_sessions WHERE title = $1 AND "playerId" = $2', [title, users.LOCAL_P01_ID])).rows[0];
    if (row) {
      sessionId = row.id;
      if (!ownIds.includes(row.id)) ownIds.push(row.id);
    }
    return row?.status;
  }).toBe("DRAFT");

  const playerContext = await browser.newContext({ baseURL: targets.app.origin, viewport: page.viewportSize()!,
    isMobile: info.project.name === "mobil", hasTouch: info.project.name === "mobil", serviceWorkers: "block" });
  try {
    await localNetwork(playerContext);
    const player = await playerContext.newPage();
    await login(player, "P01");
    await expect(player.getByText(title, { exact: true })).toHaveCount(0);
    await page.reload();
    await expect(page.getByText(title, { exact: true }).filter({ visible: true }).first()).toBeVisible();
    await page.getByRole("button", { name: /^Publiser uke/ }).click();
    await page.getByRole("button", { name: /^Publiser valgte/ }).click();
    await expect.poll(() => storedStatus(sessionId)).toBe("PUBLISHED");
    await player.reload();
    await expect(player.getByText(title, { exact: true }).filter({ visible: true }).first()).toBeVisible();
    await player.goto(`/portal/live/${sessionId}/brief`);
    await expect(player.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await player.getByRole("button", { name: "Start økta", exact: true }).click();
    await expect(player).toHaveURL(new RegExp(`/portal/live/${sessionId}/tapper$`));
    await expect.poll(() => storedStatus(sessionId)).toBe("IN_PROGRESS");
    const counter = player.locator('[data-od-id="tapper-klubb-iron-7"]');
    for (let index = 0; index < 3; index++) await counter.click();
    await expect.poll(async () => Number((await db.query('SELECT SUM(count) AS total FROM session_ball_logs WHERE "planSessionId" = $1', [sessionId])).rows[0].total)).toBe(3);
    await player.reload();
    await expect(player.locator('[data-od-id="tapper-avslutt"]')).toBeVisible();
    await player.locator('[data-od-id="tapper-avslutt"]').click();
    await expect(player).toHaveURL(new RegExp(`/portal/live/${sessionId}/summary$`));
    const summary = player.getByRole("region", { name: "Øktens hovedresultat", exact: true });
    await expect(summary.getByRole("heading", { name: "Slag registrert", exact: true })).toBeVisible();
    await expect(summary.locator(".ph06-number")).toHaveText("3");
    await player.reload();
    await expect(summary.locator(".ph06-number")).toHaveText("3");
    const stored = (await db.query<{ club: string; count: number }>('SELECT club, count FROM session_ball_logs WHERE "planSessionId" = $1', [sessionId])).rows;
    expect(stored.length).toBe(new Set(stored.map(row => row.club)).size);
    expect(stored.filter(row => row.club === "iron-7")).toEqual([{ club: "iron-7", count: 3 }]);
    expect(stored.reduce((sum, row) => sum + row.count, 0)).toBe(3);
    expect(await storedStatus(sessionId)).toBe("COMPLETED");
    await page.reload();
    await expect(page.getByText(title, { exact: true }).filter({ visible: true }).first()).toBeVisible();
  } finally { await playerContext.close(); }
});
