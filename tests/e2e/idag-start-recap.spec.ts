/**
 * I dag → Start (live) → recap → I dag.
 *
 * Krever spiller-innlogging (E2E_TEST_USER_* eller SCREENTEST_PASSWORD).
 * Uten credentials: skip — ikke rød CI. Enhetstester i session-hrefs /
 * idag-visning er den obligatoriske href-gaten.
 */

import { test, expect } from "./_test";
import { playerCredentials, loginAsPlayer, dismissCookieBanner } from "./_auth-helpers";

const creds = playerCredentials();

test.describe("I dag start og recap", () => {
  test.skip(!creds, "krever spiller-innlogging (E2E_TEST_USER_* eller SCREENTEST_PASSWORD)");

  test("Start på I dag går til live, ikke tren/wb", async ({ page }) => {
    await loginAsPlayer(page);
    await page.goto("/portal");
    await dismissCookieBanner(page);
    await expect(page.getByRole("region", { name: "Dagens økter", exact: true })).toBeVisible();
    const start = page.getByRole("region", { name: "Dagens økter", exact: true }).getByRole("link", { name: /^(Start|Fortsett)$/ }).first();
    await expect(start).toBeVisible();
    const href = await start.getAttribute("href");
    expect(href).toMatch(/\/portal\/live\//);
    expect(href).not.toMatch(/\/portal\/(tren|gjennomfore)\//);
    await start.click();
    await expect(page).toHaveURL(/\/portal\/live\//);
    // SLAG starter med en knapp; TEK/SPILL bruker en lenke til sin øktsflate.
    await expect(page.getByRole("button", { name: "Start økta", exact: true })
      .or(page.getByRole("link", { name: "Start økta", exact: true }))).toBeVisible();
  });
});
