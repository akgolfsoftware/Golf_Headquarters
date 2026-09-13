/**
 * Innlogget R-E-reise for abonnement/tilgangsnivå (T2, feature-flags.ts).
 * Mot isolert HQ-Supabase. Hopper ikke over manglende oppsett — da skal
 * prøven feile stengt.
 */
import { expect, test, type Page } from "@playwright/test";

function krev(navn: string): string {
  const verdi = process.env[navn]?.trim();
  if (!verdi) {
    throw new Error(`${navn} mangler. Kjør scripts/p0-test-innlogget-reise.mjs mot HQ-stacken.`);
  }
  return verdi;
}

const fullEpost = krev("P0_PLAYER_EMAIL");
const fullPassord = krev("P0_PLAYER_PASSWORD");
const talentEpost = krev("P0_TALENT_EMAIL");
const talentPassord = krev("P0_TALENT_PASSWORD");

async function lukkCookie(page: Page) {
  const btn = page.getByRole("button", { name: "Kun nødvendige", exact: true });
  try {
    await btn.waitFor({ state: "visible", timeout: 8_000 });
    await btn.click();
    await btn.waitFor({ state: "hidden", timeout: 5_000 }).catch(() => undefined);
  } catch {
    // Banner finnes ikke.
  }
}

async function loggInn(page: Page, epost: string, passord: string) {
  await page.goto("/auth/login");
  await lukkCookie(page);
  await page.locator('input[type="email"]').fill(epost);
  await page.locator('input[type="password"]').fill(passord);
  await page.locator('form button[type="submit"]').click();
  try {
    await page.waitForURL((url) => new URL(url).pathname.startsWith("/portal"), { timeout: 90_000 });
  } catch (error) {
    const tekst = (await page.locator("#v2login-feil").innerText().catch(() => "")).trim();
    throw new Error(tekst || (error instanceof Error ? error.message : "Innlogging førte ikke videre"));
  }
  await lukkCookie(page);
}

test.describe("P0 innlogget abonnement/tilgangsnivå", () => {
  test.beforeEach(async ({ page }) => {
    await page.addLocatorHandler(
      page.getByRole("button", { name: "Kun nødvendige", exact: true }),
      async (btn) => {
        await btn.click().catch(() => undefined);
      },
    );
  });

  test("FULL-spiller når en FULL-låst side uten omvei", async ({ page }) => {
    await loggInn(page, fullEpost, fullPassord);
    await page.goto("/portal/planlegge");
    await expect(page).toHaveURL(/\/portal\/planlegge\/?$/);
    await expect(page.getByRole("heading", { name: "Plan", exact: true })).toBeVisible();
  });

  test("TALENT-profil ser talent-åpen side, men sendes til oppgrader fra en FULL-låst side", async ({ page }) => {
    await loggInn(page, talentEpost, talentPassord);

    // Åpen for TALENT: testbatteriet (talent-allowlist.ts).
    await page.goto("/portal/tren/tester");
    await expect(page).toHaveURL(/\/portal\/tren\/tester\/?$/);
    await expect(page.getByRole("heading", { name: "Tester", exact: true })).toBeVisible();

    // Låst for TALENT: Plan krever FULL og skal aldri vise innhold.
    await page.goto("/portal/planlegge");
    await expect(page).toHaveURL(/\/portal\/meg\/abonnement\/oppgrader\/flyt\/?$/);
    await expect(page.getByRole("heading", { name: "Plan", exact: true })).toHaveCount(0);
    await expect(page.getByText("Abonnement · Oppgrader", { exact: true })).toBeVisible();
  });
});
