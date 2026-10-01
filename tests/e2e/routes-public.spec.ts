/**
 * Smoke 15: /auth/login viser login-form (e-post + passord).
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

test.describe("Offentlige ruter", () => {
  test("/auth/login viser e-post + passord-felt", async ({ page }) => {
    await gotoAndWait(page, "/auth/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("/auth/signup rendrer", async ({ page }) => {
    const res = await gotoAndWait(page, "/auth/signup");
    expect(res?.status()).toBe(200);
  });

  test("/auth/forgot-password rendrer", async ({ page }) => {
    const res = await gotoAndWait(page, "/auth/forgot-password");
    expect(res?.status()).toBe(200);
  });

  test("Vilkår + personvern returnerer 200 (ikke 404)", async ({ page }) => {
    const vilkar = await page.goto("/vilkar");
    expect(vilkar?.status()).toBe(200);
    await expect(page.locator("main")).toContainText(/vilkår|Bruker|tjeneste/i);

    const personvern = await page.goto("/personvern");
    expect(personvern?.status()).toBe(200);
    await expect(page.locator("main")).toContainText(/personvern|behandling/i);
  });
});
