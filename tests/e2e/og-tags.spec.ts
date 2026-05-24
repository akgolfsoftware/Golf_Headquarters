/**
 * Smoke 10: Open Graph + tittel meta-tags på offentlige sider.
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

test.describe("Open Graph tags", () => {
  test("forsiden har <title>", async ({ page }) => {
    await gotoAndWait(page, "/");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("forsiden har description-meta", async ({ page }) => {
    await gotoAndWait(page, "/");
    const description = await page
      .locator('meta[name="description"]')
      .first()
      .getAttribute("content");
    // Hvis ikke description finnes, sjekk minst at og:description gjør det
    if (!description) {
      const ogDescription = await page
        .locator('meta[property="og:description"]')
        .first()
        .getAttribute("content");
      expect(
        ogDescription,
        "Hverken description eller og:description finnes",
      ).toBeTruthy();
      return;
    }
    expect(description.length).toBeGreaterThan(0);
  });
});
