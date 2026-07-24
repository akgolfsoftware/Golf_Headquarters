/**
 * Lanserings-smoke for ★-kjernen (ferdigstillingsplan Fase A4).
 *
 * Uten E2E-credentials: verifiserer at auth-sider rendrer og at
 * beskyttede ★-ruter redirecter til /auth/login (ikke 500/404).
 * Med E2E_TEST_USER_EMAIL/PASSWORD: røyk-tester at spiller kan åpne
 * PlayerHQ-kjerneflatene etter innlogging.
 */

import { test, expect, type Page } from "@playwright/test";

const TEST_EMAIL = process.env.E2E_TEST_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.E2E_TEST_USER_PASSWORD ?? "";

const AUTH_PAGES = [
  { path: "/auth/login", expectText: /logg inn|e-post|passord/i },
  { path: "/auth/forgot-password", expectText: /glemt|tilbakestill|e-post/i },
] as const;

/** ★-kjerne som krever innlogging — uinnlogget skal lande på login. */
const GATED_STAR_ROUTES = [
  "/portal",
  "/portal/planlegge",
  "/portal/planlegge/workbench",
  "/portal/analysere",
  "/portal/meg",
  "/portal/gjennomfore",
  "/admin/agencyos",
  "/admin/spillere",
  "/admin/godkjenninger",
  "/admin/kalender",
  "/admin/bookinger",
] as const;

async function loginAsPlayer(page: Page) {
  await page.goto("/auth/login");
  await page.locator('input[type="email"]').fill(TEST_EMAIL);
  await page.locator('input[type="password"]').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(portal|auth\/etter-innlogging|forelder|admin)/, {
    timeout: 20_000,
  });
}

test.describe("Lanserings-smoke ★-kjerne", () => {
  for (const { path, expectText } of AUTH_PAGES) {
    test(`${path} rendrer`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.ok() ?? false, `${path} skal returnere 2xx`).toBeTruthy();
      await expect(page.locator("body")).toContainText(expectText);
    });
  }

  for (const route of GATED_STAR_ROUTES) {
    test(`uinnlogget ${route} → /auth/login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  }

  test("innlogget spiller åpner PlayerHQ-kjerne", async ({ page }) => {
    test.skip(
      !TEST_EMAIL || !TEST_PASSWORD,
      "Krever E2E_TEST_USER_EMAIL/PASSWORD",
    );

    await loginAsPlayer(page);

    const playerRoutes = [
      "/portal",
      "/portal/planlegge",
      "/portal/analysere",
      "/portal/meg",
      "/portal/gjennomfore",
    ] as const;

    for (const route of playerRoutes) {
      const res = await page.goto(route);
      const status = res?.status() ?? 0;
      expect(
        status === 200 || (status >= 300 && status < 400),
        `${route} skal laste (fikk ${status})`,
      ).toBeTruthy();
      await expect(page).not.toHaveURL(/\/auth\/login/);
      await expect(page.locator("body")).not.toContainText(/Application error|Internal Server Error/i);
    }
  });
});
