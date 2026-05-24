/**
 * Smoke 11: /turneringer-side rendrer (DataGolf-integrasjon).
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

test.describe("Marketing — turneringer", () => {
  test("/turneringer rendrer 200", async ({ page }) => {
    const res = await gotoAndWait(page, "/turneringer");
    const status = res?.status() ?? 0;
    expect(status === 200 || (status >= 300 && status < 400)).toBeTruthy();
  });

  test("/turneringer inneholder turnerings-relatert innhold", async ({
    page,
  }) => {
    const res = await gotoAndWait(page, "/turneringer");
    if (res?.status() !== 200) {
      test.skip();
      return;
    }
    const main = page.locator("body");
    await expect(main).toContainText(
      /turnering|leaderboard|score|runde|spiller/i,
    );
  });
});
