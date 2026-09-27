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
    await page.getByRole("button", { name: "Logg inn med passord" }).click();
    await expect(page.getByRole("link", { name: "Glemt passord?" })).toHaveAttribute(
      "href",
      "/auth/forgot-password",
    );
  });
});
