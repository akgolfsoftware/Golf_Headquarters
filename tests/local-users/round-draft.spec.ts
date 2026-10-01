import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import pg from "pg";
import { assertLocalUsersDatabase, assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";

const targets = assertLocalUsersTargets(process.env);
const users = parse(readFileSync(".codex/environments/brukere/.env.users"));
const db = new pg.Pool({ connectionString: targets.database.toString() });
const courseId = `local-round-draft-${randomUUID()}`;
const key = `akgolf.runde-logg.kladd.v2:${encodeURIComponent(users.LOCAL_P01_ID)}`;

test.beforeAll(async () => {
  await assertLocalUsersDatabase(db);
  await db.query('INSERT INTO course_definitions (id,name,par,"createdAt") VALUES ($1,$2,72,NOW())', [courseId, "Syntetisk utkastbane"]);
});
test.afterAll(async () => {
  try { await db.query('DELETE FROM course_definitions WHERE id=$1', [courseId]); }
  finally { await db.end(); }
});

test("runde: registrerte slag overlever omlasting, rettelse, angre og frakobling", async ({ page, context }) => {
  test.setTimeout(180_000);
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    return url.hostname === "127.0.0.1" && ["3061", "55621"].includes(url.port) ? route.continue() : route.abort();
  });
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Logg inn med passord", exact: true }).click();
  await page.locator('input[type="email"]').fill(users.LOCAL_P01_EMAIL);
  await page.locator('input[type="password"]').fill(users.LOCAL_P01_PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/portal$/);
  await page.getByRole("button", { name: "Kun nødvendige", exact: true }).click();
  await page.goto("/portal/runde/live");
  await page.getByLabel("Bane", { exact: true }).selectOption(courseId);
  await page.getByRole("button", { name: "Til hull 1", exact: true }).click();
  await page.getByRole("button", { name: "Slag for slag · detaljer for hullet", exact: true }).click();
  await page.getByRole("button", { name: "Driver", exact: true }).click();
  await page.getByRole("button", { name: "Straffeslag", exact: true }).click();
  await page.getByRole("button", { name: "Lagre slag", exact: true }).click();
  const draft = () => page.evaluate(k => JSON.parse(localStorage.getItem(k) ?? "null"), key);
  await expect.poll(async () => (await draft())?.precisionHull?.[0]?.length).toBe(1);
  expect((await draft()).precisionHull[0][0].pen).toBe(1);
  expect((await draft()).hullData[0].slag).toEqual([]);

  await page.reload();
  await page.getByRole("button", { name: "Fortsett", exact: true }).click();
  await expect(page.getByRole("button", { name: "Rett kølle slag 1" })).toHaveText("Driver");
  await page.getByRole("button", { name: "Rett avstand slag 1" }).click();
  await page.getByLabel("Avstand til hull (m)").fill("365");
  await page.getByRole("button", { name: "Lagre rettelse", exact: true }).click();
  await expect.poll(async () => (await draft()).precisionHull[0][0].dist).toBe(365);
  await page.getByRole("button", { name: "Angre siste slag", exact: true }).click();
  await expect.poll(async () => (await draft()).precisionHull[0].length).toBe(0);

  await page.getByRole("button", { name: "Driver", exact: true }).click();
  await page.getByRole("button", { name: "Lagre slag", exact: true }).click();
  await context.setOffline(true);
  await page.getByRole("button", { name: "Green", exact: true }).click();
  await page.getByLabel("Lengde (fot)").fill("12");
  await page.getByRole("button", { name: "Venstre → høyre", exact: true }).click();
  await page.getByRole("button", { name: "Svak", exact: true }).click();
  await page.getByRole("button", { name: "Bom", exact: true }).click();
  await page.getByRole("button", { name: "Kort", exact: true }).click();
  await page.getByRole("button", { name: "På linja", exact: true }).click();
  await page.getByRole("button", { name: "Lagre putt", exact: true }).click();
  await expect.poll(async () => (await draft()).precisionHull[0].length).toBe(2);
  await context.setOffline(false);
  await page.reload();
  await page.getByRole("button", { name: "Fortsett", exact: true }).click();
  await expect(page.getByRole("button", { name: "Rett avstand slag 2" })).toHaveText("12 fot");
  expect((await draft()).hullData[0].slag).toEqual([]);
  await page.getByRole("button", { name: "Tilbake til hurtigføringen", exact: true }).click();
  await page.getByRole("button", { name: "Neste hull →", exact: true }).click();
  await expect(page.getByRole("button", { name: "Rett avstand slag 2" })).toHaveText("12 fot");
  expect((await draft()).hullData[0].slag).toEqual([]);
  await page.getByRole("button", { name: "Avslutt runden", exact: true }).click();
  await expect(page.getByText("Fullfør pågående hull først", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Green", exact: true }).click();
  await page.getByLabel("Lengde (fot)").fill("2");
  await page.getByRole("button", { name: "Venstre → høyre", exact: true }).click();
  await page.getByRole("button", { name: "Svak", exact: true }).click();
  await page.getByRole("button", { name: "I hull", exact: true }).click();
  await page.getByRole("button", { name: "I hull · avslutt hullet", exact: true }).click();
  await expect.poll(async () => (await draft()).hullData[0].slag.length).toBe(3);
  expect((await draft()).precisionHull[0]).toBeUndefined();
  expect((await draft()).hullData[0].slag.at(-1).resultat).toEqual({ iHull: true });
  expect((await draft()).aktivtHullIdx).toBe(1);

  // Existing detailed editor stays available; the new display must not erase
  // wind, notes or other fields by rebuilding a completed hole from nothing.
  await page.getByRole("button", { name: "Tilbake til hurtigføringen", exact: true }).click();
  await page.getByRole("button", { name: /^Hull 1, 3 slag$/ }).click();
  await page.getByRole("button", { name: "Slag for slag · detaljer for hullet", exact: true }).click();
  expect((await draft()).hullData[0].slag.length).toBe(3);
  await expect(page.getByRole("button", { name: "Tilbake til hurtigføringen", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Tilbake til hurtigføringen", exact: true }).click();
  await page.getByRole("button", { name: "Hull 2, ikke spilt", exact: true }).click();
  await page.getByRole("button", { name: "Slag for slag · detaljer for hullet", exact: true }).click();
  await page.getByRole("button", { name: "Driver", exact: true }).click();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key.startsWith("akgolf.runde-logg")) throw new DOMException("Synthetic quota", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.getByRole("button", { name: "Lagre slag", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Slagene kunne ikke lagres" })).toBeVisible();
  expect((await draft()).hullData[0].slag.length).toBe(3);
});
