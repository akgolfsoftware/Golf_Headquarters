/**
 * Smoke 5: Offline-fallback-side rendrer.
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

test.describe("Offline fallback", () => {
  test("/offline rendrer", async ({ page }) => {
    const res = await gotoAndWait(page, "/offline");
    expect(res?.status()).toBe(200);
    // Skal vise noe tekst som indikerer offline-status
    const main = page.locator("body");
    await expect(main).toContainText(/offline|frakoblet|nett|tilkobling/i);
  });
});
