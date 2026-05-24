/**
 * Smoke: markedssider — CTA-er og hovedsider returnerer 200.
 *
 * Komplementerer `e2e/marketing.spec.ts` ved å sjekke booking-CTA
 * på forsiden og at /turneringer + /priser ikke kaster 500.
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

test.describe("Marketing — CTA og hovedsider", () => {
  test("forside har CTA til booking", async ({ page }) => {
    await gotoAndWait(page, "/");
    const ctas = page.locator(
      'a:has-text("Book"), a:has-text("Booking"), a[href*="booking"]',
    );
    await expect(ctas.first()).toBeVisible();
  });

  test("turneringer-side laster", async ({ page }) => {
    const response = await gotoAndWait(page, "/turneringer");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("priser-side returnerer ikke 5xx", async ({ page }) => {
    const response = await gotoAndWait(page, "/priser");
    expect(response?.status()).toBeLessThan(500);
  });
});
