/**
 * E2E: Runde-føring — første spec for føringsflyten (AP0.3 i
 * docs/plan-baneguide-sg-app-2026-08-16.md).
 *
 * Uten spiller-credentials i env dekkes kun auth-guarden (kjørbart i
 * prod-røyktesten uten secrets); med E2E_TEST_USER_* verifiseres at begge
 * føringsflatene faktisk laster med sine kjerneelementer. Full
 * føring-til-SG-flyt (fylle skjema, lagre, se SG) kommer med Føring 2.0
 * (AP1) når kart-modusen bygges — denne spec-en er ankeret den utvides fra.
 */

import { test, expect } from "@playwright/test";

const TEST_PLAYER_EMAIL = process.env.E2E_TEST_USER_EMAIL ?? "";
const TEST_PLAYER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD ?? "";

const FORINGSRUTER = ["/portal/runde/live", "/portal/runde/logg"];

test.describe("Runde-føring", () => {
  test("Uautentisert runde-føring redirecter til /auth/login", async ({ page }) => {
    for (const rute of FORINGSRUTER) {
      await page.goto(rute);
      await expect(page, `${rute} burde kreve innlogging`).toHaveURL(/\/auth\/login/);
    }
  });

  test("Innlogget spiller får etterregistreringen med skjema", async ({ page }) => {
    test.skip(
      !TEST_PLAYER_EMAIL || !TEST_PLAYER_PASSWORD,
      "Krever seedet PLAYER-bruker (E2E_TEST_USER_EMAIL/PASSWORD)",
    );

    await page.goto("/auth/login");
    await page.locator('input[type="email"]').fill(TEST_PLAYER_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_PLAYER_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/portal/, { timeout: 15_000 });

    // Etterregistrering: dato-felt + banevelger er skjermens kjerne.
    await page.goto("/portal/runde/logg");
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
    await expect(page.locator("select").first()).toBeVisible();
  });

  test("Innlogget spiller får live-føringen", async ({ page }) => {
    test.skip(
      !TEST_PLAYER_EMAIL || !TEST_PLAYER_PASSWORD,
      "Krever seedet PLAYER-bruker (E2E_TEST_USER_EMAIL/PASSWORD)",
    );

    await page.goto("/auth/login");
    await page.locator('input[type="email"]').fill(TEST_PLAYER_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_PLAYER_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/portal/, { timeout: 15_000 });

    await page.goto("/portal/runde/live");
    await expect(page).toHaveURL(/\/portal\/runde\/live/);
    // Skjermen skal rendre innhold (oppsett-steg eller pågående runde) —
    // aldri en tom side eller feilside.
    await expect(page.locator("main, body").first()).toContainText(/runde/i, {
      timeout: 10_000,
    });
  });
});
