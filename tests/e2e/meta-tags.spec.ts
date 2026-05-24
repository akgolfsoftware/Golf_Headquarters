/**
 * Smoke 6: Meta-tags i <head> er korrekt satt.
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

test.describe("Meta-tags", () => {
  test("har theme-color meta", async ({ page }) => {
    await gotoAndWait(page, "/");
    const themeColor = await page
      .locator('meta[name="theme-color"]')
      .first()
      .getAttribute("content");
    expect(themeColor).toBeTruthy();
  });

  test("har apple-touch-icon link", async ({ page }) => {
    await gotoAndWait(page, "/");
    const icon = await page
      .locator('link[rel="apple-touch-icon"]')
      .first()
      .getAttribute("href");
    expect(icon).toBeTruthy();
  });

  test("har manifest link", async ({ page }) => {
    await gotoAndWait(page, "/");
    const manifest = await page
      .locator('link[rel="manifest"]')
      .first()
      .getAttribute("href");
    expect(manifest).toBeTruthy();
  });
});
