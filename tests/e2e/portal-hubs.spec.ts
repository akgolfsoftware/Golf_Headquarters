/**
 * Smoke: PlayerHQ hubs.
 *
 * Disse krever auth — i CI hopper vi over uten `E2E_AUTH_TOKEN` siden vi
 * ikke har sesjons-cookies i pipelinen. Lokalt kan testen kjøres ved å sette
 * env-variabelen før `npx playwright test`.
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

test.describe("PlayerHQ hubs (krever auth)", () => {
  test.skip(!process.env.E2E_AUTH_TOKEN, "krever auth-token");

  test("workbench rendrer", async ({ page }) => {
    await gotoAndWait(page, "/portal");
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
