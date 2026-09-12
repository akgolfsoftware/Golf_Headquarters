/**
 * Innlogget R-E-reise mot isolert HQ-Supabase.
 * Hopper ikke over manglende oppsett — da skal prøven feile stengt.
 */
import { expect, test, type Page } from "@playwright/test";

function krev(navn: string): string {
  const verdi = process.env[navn]?.trim();
  if (!verdi) {
    throw new Error(`${navn} mangler. Kjør scripts/p0-test-innlogget-reise.mjs mot HQ-stacken.`);
  }
  return verdi;
}

const spillerEpost = krev("P0_PLAYER_EMAIL");
const spillerPassord = krev("P0_PLAYER_PASSWORD");
const coachEpost = krev("P0_COACH_EMAIL");
const coachPassord = krev("P0_COACH_PASSWORD");
const fremmedEpost = krev("P0_FOREIGN_EMAIL");
const fremmedPassord = krev("P0_FOREIGN_PASSWORD");
const fremmedCoachEpost = krev("P0_FOREIGN_COACH_EMAIL");
const fremmedCoachPassord = krev("P0_FOREIGN_COACH_PASSWORD");
const wbId = krev("P0_WB_ID");
const v2Id = krev("P0_V2_ID");
const planId = krev("P0_PLAN_ID");
const wbTall = Number(krev("P0_WB_TALL"));
const v2Reps = Number(krev("P0_V2_REPS"));
const v2Treff = Number(krev("P0_V2_TREFF"));
const planTall = Number(krev("P0_PLAN_TALL"));

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
    await page.waitForURL((url) => {
      const path = new URL(url).pathname;
      return path.startsWith("/portal") || path.startsWith("/admin");
    }, { timeout: 90_000 });
  } catch (error) {
    const tekst = (await page.locator("#v2login-feil").innerText().catch(() => "")).trim();
    throw new Error(tekst || (error instanceof Error ? error.message : "Innlogging førte ikke videre"));
  }
  await lukkCookie(page);
}

async function loggUt(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function expectAvvist(page: Page, oktId: string, tittel: string) {
  await page.goto(`/portal/live/${oktId}`);
  await expect(page).not.toHaveURL(new RegExp(`/portal/live/${oktId}(/brief|/tapper|/active|/summary)?$`));
  await expect(page.getByText(tittel, { exact: true })).toHaveCount(0);
}

async function ventPaSti(page: Page, sti: string) {
  const re = new RegExp(sti.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  await expect(page).toHaveURL(re);
}

test.describe.configure({ mode: "serial" });

test.describe("P0 innlogget spillerreise", () => {
  test.beforeEach(async ({ page }) => {
    await page.addLocatorHandler(
      page.getByRole("button", { name: "Kun nødvendige", exact: true }),
      async (btn) => {
        await btn.click().catch(() => undefined);
      },
    );
  });

  test("I dag → Plan → Workbench PH-04/05/06 med samme tall og gjenåpning", async ({ page }) => {
    await loggInn(page, spillerEpost, spillerPassord);
    await expect(page).toHaveURL(/\/portal(\/|$|\?)/);
    await lukkCookie(page);
    await expect(page.getByRole("link", { name: "Start økt" })).toBeVisible();
    await expect(page.getByText("P0 Workbench").first()).toBeAttached();
    await page.goto("/portal/planlegge");
    await expect(page.getByRole("heading", { name: "Plan" })).toBeVisible();
    await expect(page.getByText("P0 Workbench").first()).toBeAttached();
    await expect(page.getByText("P0 V2 Innspill").first()).toBeAttached();
    await expect(page.getByText("P0 Eldre plan").first()).toBeAttached();
    const start = page.getByRole("link", { name: "Start økt" });
    await expect(start).toBeVisible();
    await expect(start).toHaveAttribute("href", new RegExp(`/portal/live/${wbId}(/brief)?$`));
    await start.click();
    await expect(page).toHaveURL(new RegExp(`/portal/live/${wbId}(/brief)?$`), { timeout: 30_000 });
    await page.locator('[data-od-id="brief-start"]').click({ timeout: 20_000 });
    await ventPaSti(page, `/portal/live/${wbId}/tapper`);
    await expect(page.getByText("P0 Workbench").first()).toBeVisible();
    for (let i = 0; i < wbTall; i += 1) {
      await page.locator('[data-od-id="tapper-klubb-driver"]').click();
    }
    await page.locator('[data-od-id="tapper-avslutt"]').click();
    await ventPaSti(page, `/portal/live/${wbId}/summary`);
    await expect(page.getByRole("heading", { name: "P0 Workbench" })).toBeVisible();
    await expect(page.locator(".ph06-number")).toContainText(String(wbTall));

    await page.locator('[data-od-id="etter-kvitt-idag"]').click();
    await expect(page).toHaveURL(/\/portal\/?$/);
    const recap = page.getByRole("link", { name: "Se recap" });
    await expect(recap).toBeVisible();
    await expect(recap).toHaveAttribute("href", `/portal/live/${wbId}/summary`);
    await recap.click();
    await ventPaSti(page, `/portal/live/${wbId}/summary`);
    await expect(page.locator(".ph06-number")).toContainText(String(wbTall));
  });

  test("V2 PH-04 → PH-05 → PH-06 med samme repetisjoner etter gjenåpning", async ({ page }) => {
    await loggInn(page, spillerEpost, spillerPassord);
    await page.goto(`/portal/live/${v2Id}`);
    await expect(page).toHaveURL(new RegExp(`/portal/live/${v2Id}(/brief)?$`));
    await expect(page.getByText("P0 V2 Innspill").first()).toBeVisible();
    await page.locator('[data-od-id="brief-start"]').click();
    await ventPaSti(page, `/portal/live/${v2Id}/active`);
    await expect(page.locator('[data-od-id="playerhq-live-active"]')).toHaveAttribute("data-phase", "active", {
      timeout: 30_000,
    });
    for (let i = 0; i < v2Reps; i += 1) {
      await page.locator('[data-od-id="live-tap-rep"]').click();
    }
    for (let i = 0; i < v2Treff; i += 1) {
      await page.locator('[data-od-id="live-tap-treff"]').click();
    }
    const ferdig = page.getByRole("button", { name: "Marker øvelsen ferdig" });
    if (await ferdig.isVisible().catch(() => false)) await ferdig.click();
    await page.getByRole("button", { name: "Avslutt", exact: true }).click();
    await page.getByRole("button", { name: "Avslutt og logg økta" }).click();
    await ventPaSti(page, `/portal/live/${v2Id}/summary`);
    const v2Totalt = v2Reps + v2Treff;
    await expect(page.getByRole("heading", { name: "P0 V2 Innspill" })).toBeVisible();
    await expect(page.locator("dt", { hasText: "Repetisjoner" })).toBeVisible();
    await expect(page.locator("dd").filter({ hasText: String(v2Totalt) }).first()).toBeVisible();
    await expect(page.getByText(`${v2Treff} av ${v2Totalt}`)).toBeVisible();
    await page.goto(`/portal/live/${v2Id}/summary`);
    await expect(page.getByRole("heading", { name: "P0 V2 Innspill" })).toBeVisible();
    await expect(page.locator("dd").filter({ hasText: String(v2Totalt) }).first()).toBeVisible();
    await expect(page.getByText(`${v2Treff} av ${v2Totalt}`)).toBeVisible();
  });

  test("eldre planøkt PH-04 → PH-05 → PH-06 med samme slag etter gjenåpning", async ({ page }) => {
    await loggInn(page, spillerEpost, spillerPassord);
    await page.goto(`/portal/live/${planId}`);
    await expect(page).toHaveURL(new RegExp(`/portal/live/${planId}(/brief)?$`));
    await expect(page.getByText("P0 Eldre plan").first()).toBeVisible();
    await page.locator('[data-od-id="brief-start"]').click();
    await ventPaSti(page, `/portal/live/${planId}/tapper`);
    for (let i = 0; i < planTall; i += 1) {
      await page.locator('[data-od-id="tapper-klubb-iron-7"]').click();
    }
    await page.locator('[data-od-id="tapper-avslutt"]').click();
    await ventPaSti(page, `/portal/live/${planId}/summary`);
    await expect(page.getByRole("heading", { name: "P0 Eldre plan" })).toBeVisible();
    await expect(page.locator(".ph06-number")).toContainText(String(planTall));
    await page.goto(`/portal/live/${planId}/summary`);
    await expect(page.locator(".ph06-number")).toContainText(String(planTall));
  });

  test("tillatt coach ser økta; uvedkommende avvises uten innhold", async ({ page }) => {
    await loggInn(page, coachEpost, coachPassord);
    await page.goto(`/portal/live/${wbId}/summary`);
    await expect(page.getByRole("heading", { name: "P0 Workbench" })).toBeVisible();
    await expect(page.locator(".ph06-number")).toContainText(String(wbTall));

    await loggUt(page);
    await loggInn(page, fremmedEpost, fremmedPassord);
    await expectAvvist(page, wbId, "P0 Workbench");
    await expectAvvist(page, v2Id, "P0 V2 Innspill");
    await expectAvvist(page, planId, "P0 Eldre plan");

    await loggUt(page);
    await loggInn(page, fremmedCoachEpost, fremmedCoachPassord);
    await expectAvvist(page, wbId, "P0 Workbench");
    await expectAvvist(page, v2Id, "P0 V2 Innspill");
    await expectAvvist(page, planId, "P0 Eldre plan");
  });
});
