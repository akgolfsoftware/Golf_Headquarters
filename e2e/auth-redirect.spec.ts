/**
 * E2E: Auth-redirect oppfører seg riktig.
 *
 * Sjekker at /portal og /admin redirecter til login når uautentisert.
 */

import { test, expect } from "@playwright/test";

test.describe("Auth redirect", () => {
  test("/portal uten login redirecter til /auth/login", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("/admin uten login redirecter til /auth/login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("/auth/login viser e-post + passord-felt", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("/auth/signup laster", async ({ page }) => {
    const res = await page.goto("/auth/signup");
    expect(res?.status()).toBe(200);
  });
});
