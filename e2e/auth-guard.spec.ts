/**
 * E2E: Auth-guards — PLAYER-rolle blokkeres fra /admin.
 *
 * Tester at en innlogget spiller (rolle PLAYER) som forsøker å åpne /admin/*
 * blir redirected til /portal eller /auth/login.
 *
 * Uten test-spiller-credentials i env: faller tilbake til å verifisere at
 * /admin krever auth (redirect til /auth/login), som dekkes av auth-redirect.spec
 * men gjentas her for å dokumentere intensjonen.
 */

import { test, expect } from "@playwright/test";

const TEST_PLAYER_EMAIL = process.env.E2E_TEST_USER_EMAIL ?? "";
const TEST_PLAYER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD ?? "";

const ADMIN_ROUTES = [
  "/admin",
  "/admin/team",
  "/admin/bookings",
  "/admin/plans",
  "/admin/elever",
  "/admin/services",
];

test.describe("Auth guard — PLAYER på /admin", () => {
  test("Uautentisert /admin/* redirect til /auth/login", async ({ page }) => {
    for (const route of ADMIN_ROUTES) {
      await page.goto(route);
      await expect(page, `Route ${route} burde redirecte`).toHaveURL(/\/auth\/login/);
    }
  });

  test("Innlogget PLAYER på /admin/* redirect til /portal", async ({ page }) => {
    test.skip(
      !TEST_PLAYER_EMAIL || !TEST_PLAYER_PASSWORD,
      "Krever seedet PLAYER-bruker (E2E_TEST_USER_EMAIL/PASSWORD)"
    );

    // Login som PLAYER
    await page.goto("/auth/login");
    await page.locator('input[type="email"]').fill(TEST_PLAYER_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_PLAYER_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/portal/, { timeout: 15_000 });

    // Prøv å åpne admin
    for (const route of ADMIN_ROUTES) {
      await page.goto(route);
      await expect(page, `PLAYER skal redirectes vekk fra ${route}`).toHaveURL(
        /\/(portal|auth\/login)/
      );
    }
  });
});
