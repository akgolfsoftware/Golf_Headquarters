/**
 * Smoke 14: Beskyttede ruter redirecter til /auth/login uten auth.
 */

import { test, expect } from "@playwright/test";

test.describe("Auth-redirects", () => {
  test("/admin uten auth redirecter til /auth/login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("/portal uten auth redirecter til /auth/login", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
