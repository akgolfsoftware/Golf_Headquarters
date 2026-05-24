/**
 * Smoke 13: Tilfeldig URL gir 404 + fallback-side.
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

test.describe("404 handling", () => {
  test("ukjent URL returnerer 404", async ({ page }) => {
    const res = await gotoAndWait(
      page,
      "/denne-siden-finnes-ikke-12345-xyz",
    );
    expect(res?.status()).toBe(404);
  });

  test("404-side viser fallback-innhold", async ({ page }) => {
    await gotoAndWait(page, "/finnes-ikke-abc-test");
    const body = page.locator("body");
    await expect(body).toContainText(/404|ikke funnet|not found|finnes ikke/i);
  });
});
