/**
 * Smoke: innloggings-flyt (auth).
 *
 * Komplementerer `e2e/auth-redirect.spec.ts` ved å sjekke konkrete
 * UI-elementer på login-flyten — tittel, heading og glemt-passord-link.
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";
import { selectPasswordLogin } from "./_auth-helpers";

test.describe("Auth — login-flyt", () => {
  test("forside laster", async ({ page }) => {
    await gotoAndWait(page, "/");
    await expect(page).toHaveTitle(/AK Golf/);
  });

  test("login-side rendrer", async ({ page }) => {
    await gotoAndWait(page, "/auth/login");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  for (const width of [390, 1440]) {
    test.describe(`${width} px`, () => {
      test.use({ viewport: { width, height: 900 } });

      test("glemt-passord-link finnes og åpner gjenoppretting", async ({ page }) => {
        await gotoAndWait(page, "/auth/login");
        await selectPasswordLogin(page);
        const link = page.getByRole("link", { name: "Glemt passord?", exact: true });
        await expect(link).toHaveAttribute("href", "/auth/forgot-password");
        await link.click();
        await expect(page).toHaveURL(/\/auth\/forgot-password$/);
        await expect(page.getByRole("heading", { name: "Glemt passordet?", exact: true })).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Send tilbakestillingslenke", exact: true }),
        ).toBeVisible();
        await page.getByRole("link", { name: "Tilbake til innlogging", exact: true }).click();
        await expect(page).toHaveURL(/\/auth\/login$/);
        await expect(
          page.getByRole("button", { name: "Send magisk innloggingslenke", exact: true }),
        ).toBeVisible();
      });

      test("bytte mellom passord og magisk lenke beholder e-post", async ({ page }) => {
        await gotoAndWait(page, "/auth/login");
        await selectPasswordLogin(page);
        const email = page.locator('input[type="email"]');
        await email.fill("innlogging-test@example.test");
        await expect(page.getByRole("button", { name: "Logg inn", exact: true })).toBeDisabled();
        await page.locator('input[type="password"]').fill("kun-lokal-testverdi");
        await expect(page.getByRole("button", { name: "Logg inn", exact: true })).toBeEnabled();
        await page.getByRole("button", { name: "Magisk lenke", exact: true }).click();
        await expect(email).toHaveValue("innlogging-test@example.test");
        await expect(page.locator('input[type="password"]')).toHaveCount(0);
        await expect(
          page.getByRole("button", { name: "Send magisk innloggingslenke", exact: true }),
        ).toBeEnabled();
        await selectPasswordLogin(page);
        await expect(email).toHaveValue("innlogging-test@example.test");
      });
    });
  }
});
