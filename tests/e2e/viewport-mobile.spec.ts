/**
 * Smoke 9: Viewport-meta er korrekt satt for mobil.
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

test.describe("Viewport meta", () => {
  test("har viewport-meta med width=device-width", async ({ page }) => {
    await gotoAndWait(page, "/");
    const viewport = await page
      .locator('meta[name="viewport"]')
      .first()
      .getAttribute("content");
    expect(viewport).toContain("width=device-width");
  });

  test("viewport eksisterer på /auth/login", async ({ page }) => {
    await gotoAndWait(page, "/auth/login");
    const viewport = await page
      .locator('meta[name="viewport"]')
      .first()
      .getAttribute("content");
    expect(viewport).toBeTruthy();
  });
});
