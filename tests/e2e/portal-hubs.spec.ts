import { test, expect } from "./_test";
import { playerCredentials, loginAsPlayer } from "./_auth-helpers";

test.describe("PlayerHQ hubs (krever auth)", () => {
  test.skip(!playerCredentials(), "krever spiller-innlogging");
  test("workbench rendrer", async ({ page }) => {
    await loginAsPlayer(page);
    await page.goto("/portal/planlegge/workbench");
    await expect(page).toHaveURL(/\/portal\/planlegge\/workbench/);
    await expect(page.getByRole("button", { name: "Ny økt", exact: true })).toBeVisible();
  });
});
