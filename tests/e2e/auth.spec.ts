/**
 * Smoke: innloggings-flyt (auth).
 *
 * Komplementerer `e2e/auth-redirect.spec.ts` ved å sjekke konkrete
 * UI-elementer på login-flyten — tittel, heading og glemt-passord-link.
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

test.describe("Auth — login-flyt", () => {
  test("forside laster", async ({ page }) => {
    await gotoAndWait(page, "/");
    await expect(page).toHaveTitle(/AK Golf/);
  });

  test("login-side rendrer", async ({ page }) => {
    await gotoAndWait(page, "/auth/login");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("glemt-passord-link finnes", async ({ page }) => {
    await gotoAndWait(page, "/auth/login");
    const link = page.locator(
      'a[href*="glemt"], a[href*="forgot"], a:has-text("Glemt")',
    );
    await expect(link.first()).toBeVisible({ timeout: 5000 });
  });
});
