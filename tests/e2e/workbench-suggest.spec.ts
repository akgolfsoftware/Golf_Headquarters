/**
 * E2E: AI-ukeforslag i spillerens Workbench.
 *
 * Tester at «Foreslå uke» åpner ForslagArk med 3 varianter (konservativ/
 * standard/aggressiv), og at «Bruk forslag» legger øktene inn i uka.
 * Uten ANTHROPIC_API_KEY i miljøet skal arket vise ærlig
 * «Standardforslag (uten AI)»-tilstand — flyten er den samme.
 *
 * Krever seedet testbruker (PRO-tier). Skip-er uten credentials.
 */

import { test, expect } from "./_test";
import { loginAsPlayer, dismissCookieBanner } from "./_auth-helpers";

const TEST_USER_EMAIL = process.env.E2E_TEST_USER_EMAIL ?? "";
const TEST_USER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD ?? "";

test.describe("Workbench ukeforslag", () => {
  test.skip(
    !TEST_USER_EMAIL || !TEST_USER_PASSWORD,
    "E2E_TEST_USER_EMAIL/PASSWORD ikke satt — krever seedet test-spiller"
  );

  test("Foreslå uke viser 3 varianter og kan tas i bruk", async ({ page }) => {
    // Login
    await loginAsPlayer(page);

    await page.goto("/portal/planlegge/workbench");
    await expect(page).toHaveURL(/\/portal\/planlegge\/workbench/);

    await dismissCookieBanner(page);

    // Åpne forslag-arket
    await page.getByRole("button", { name: /foreslå uke/i }).click();
    await expect(page.getByText("Forslag til uka")).toBeVisible({ timeout: 30_000 });

    // 3 variantkort
    await expect(page.getByText("Konservativ")).toBeVisible();
    await expect(page.getByText("Standard", { exact: true })).toBeVisible();
    await expect(page.getByText("Aggressiv")).toBeVisible();

    // Bruk standard-varianten → arket lukkes og suksessmelding vises
    await page.getByRole("button", { name: /bruk forslag/i }).nth(1).click();
    await expect(page.getByText(/økter lagt inn i uka/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Forslag til uka")).toHaveCount(0);
  });
});
