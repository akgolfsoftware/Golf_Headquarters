/**
 * Smoke 14: Beskyttede ruter redirecter til /auth/login uten auth.
 *
 * ★-kjernelisten flyttet inn fra gamle e2e/lansering-smoke-kjerne.spec.ts
 * (2026-08-03) — hver gated kjerne-rute skal lande på login, ikke 500/404.
 */

import { test, expect } from "@playwright/test";

/** ★-kjerne som krever innlogging — uinnlogget skal lande på login. */
const GATED_STAR_ROUTES = [
  "/portal",
  "/portal/planlegge",
  "/portal/planlegge/workbench",
  "/portal/analysere",
  "/portal/meg",
  "/portal/gjennomfore",
  "/admin",
  "/admin/agencyos",
  "/admin/spillere",
  "/admin/godkjenninger",
  "/admin/kalender",
  "/admin/bookinger",
] as const;

test.describe("Auth-redirects", () => {
  for (const route of GATED_STAR_ROUTES) {
    test(`uinnlogget ${route} → /auth/login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  }
});
