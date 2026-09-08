/**
 * I dag → Start (live) → recap → I dag.
 *
 * Krever spiller-innlogging (E2E_TEST_USER_* eller SCREENTEST_PASSWORD).
 * Uten credentials: skip — ikke rød CI. Enhetstester i session-hrefs /
 * idag-visning er den obligatoriske href-gaten.
 */

import { test, expect } from "@playwright/test";
import { playerCredentials, loginAsPlayer, dismissCookieBanner } from "./_auth-helpers";

const creds = playerCredentials();

test.describe("I dag start og recap", () => {
  test.skip(!creds, "krever spiller-innlogging (E2E_TEST_USER_* eller SCREENTEST_PASSWORD)");

  test("Start på I dag går til live, ikke tren/wb", async ({ page }) => {
    await loginAsPlayer(page);
    await page.goto("/portal");
    await dismissCookieBanner(page);
    await expect(page.getByRole("heading", { name: "I dag" })).toBeVisible();

    const start = page.getByRole("link", { name: "Start økt" });
    const recap = page.getByRole("link", { name: "Se recap" });
    const harStart = await start.isVisible().catch(() => false);
    const harRecap = await recap.isVisible().catch(() => false);

    test.skip(!harStart && !harRecap, "ingen startbar eller ferdig økt på I dag i testdata");

    if (harStart) {
      const href = await start.getAttribute("href");
      expect(href).toMatch(/\/portal\/live\//);
      expect(href).not.toMatch(/\/portal\/tren\/wb\//);
      expect(href).not.toMatch(/\/portal\/gjennomfore\//);
    }

    if (harRecap) {
      const href = await recap.getAttribute("href");
      expect(href).toMatch(/\/portal\/live\/.+\/summary/);
      await recap.click();
      await expect(page).toHaveURL(/\/portal\/live\/.+\/summary/);
      const tilbake = page.getByRole("link", { name: "Tilbake til I dag" });
      if (await tilbake.isVisible().catch(() => false)) {
        await tilbake.click();
      } else {
        await page.goto("/portal");
      }
      await expect(page).toHaveURL(/\/portal\/?$/);
      await expect(page.getByRole("heading", { name: "I dag" })).toBeVisible();
    }
  });
});
