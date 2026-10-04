/**
 * Smoke 15: /auth/login viser login-form (e-post + passord).
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";
import { selectPasswordLogin } from "./_auth-helpers";

test.describe("Offentlige ruter", () => {
  test("/auth/login viser e-post + passord-felt", async ({ page }) => {
    await gotoAndWait(page, "/auth/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send magisk innloggingslenke", exact: true }),
    ).toBeVisible();
    await selectPasswordLogin(page);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Logg inn", exact: true })).toBeDisabled();
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
