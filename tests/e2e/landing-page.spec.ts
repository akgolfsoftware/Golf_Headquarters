/**
 * Smoke 2: Landing-side viser AK Golf-merkevare og kjernemarkedsføring.
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

test.describe("Landing-side", () => {
  test("har AK Golf-tittel", async ({ page }) => {
    await gotoAndWait(page, "/");
    await expect(page).toHaveTitle(/AK Golf/i);
  });

  test("viser merkevare-elementer", async ({ page }) => {
    await gotoAndWait(page, "/");
    // Minst én av disse skal være synlig på hero-seksjonen
    const heroText = page.locator("main");
    await expect(heroText).toContainText(/AK Golf|coaching|spiller|golf/i);
  });

  test("har minst én link til booking eller priser", async ({ page }) => {
    await gotoAndWait(page, "/");
    const links = page.locator(
      'a[href*="/booking"], a[href*="/priser"], a[href*="/coaching"]',
    );
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});
