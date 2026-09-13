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
let sporNummer = 0;
const aktiveSpor = new WeakSet<Page>();

async function lagreSpor(page: Page) {
  if (!aktiveSpor.has(page)) return;
  await page.context().tracing.stop({ path: test.info().outputPath(`reise-${sporNummer++}.zip`) });
  aktiveSpor.delete(page);
}

function stiMatcher(sti: string) {
  return (url: URL) => url.pathname === sti && url.search === "";
}

async function aapnePlan(page: Page) {
  await expect(page).toHaveURL(stiMatcher("/portal"));
  await page.getByRole("link", { name: "Plan", exact: true }).first().click();
  await expect(page).toHaveURL(stiMatcher("/portal/planlegge"));
  await expect(page.getByRole("heading", { name: "Plan", exact: true })).toBeVisible();
}

async function velgPlanOkt(page: Page, tittel: string, oktId: string, modell: "wb" | "v2" | "plan", ferdig = false) {
  // Den synlige kalenderknappen velger økta; lenken i detaljfeltet eier navigasjonen.
  const knapp = page.getByRole("button", { name: new RegExp(`^${tittel},`) });
  await expect(knapp).toBeVisible();
  await knapp.click();
  const detaljer = page.getByRole("complementary", { name: "Detaljer om valgt avtale" });
  await expect(detaljer.getByRole("heading", { name: tittel, exact: true })).toBeVisible();
  const lenke = detaljer.getByRole("link", { name: ferdig ? "Se oppsummering" : "Start økt", exact: true });
  const suffix = ferdig ? "/summary" : modell === "v2" ? "" : "/brief";
  await expect(lenke).toHaveAttribute("href", `/portal/live/${oktId}${suffix}`);
  await lenke.click();
  await expect(page).toHaveURL(stiMatcher(`/portal/live/${oktId}/${ferdig ? "summary" : "brief"}`));
}

async function gjenåpneFraPlan(page: Page, tittel: string, oktId: string, modell: "v2" | "plan") {
  await page.locator('[data-od-id="etter-kvitt-plan"]').click();
  await expect(page).toHaveURL(stiMatcher("/portal/planlegge"));
  await velgPlanOkt(page, tittel, oktId, modell, true);
}

async function expectRepetisjoner(page: Page, antall: number) {
  const rad = page.locator("dl > div").filter({ has: page.getByText("Repetisjoner", { exact: true }) });
  await expect(rad.locator("dd")).toHaveText(String(antall));
}

async function expectSlag(page: Page, antall: number) {
  const kort = page.locator(".ph06-card").filter({ has: page.getByText("Slag registrert", { exact: true }) });
  await expect(kort.locator(".ph06-number")).toHaveText(String(antall));
}

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
  // Ta opp selve reisen, aldri utfylling av passord eller innloggingsforespørselen.
  await page.context().tracing.start({ screenshots: true, snapshots: true, sources: false });
  aktiveSpor.add(page);
}

async function loggUt(page: Page) {
  await lagreSpor(page);
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function expectAvvist(page: Page, oktId: string, tittel: string, modell: "wb" | "v2" | "plan") {
  // Kun undersider som tilhører modellen. /active er V2, /tapper er WB/eldre.
  const workbench = "/portal/planlegge/workbench";
  const plan = "/portal/planlegge";
  const ruter = [
    { suffix: "", maal: workbench },
    { suffix: "/brief", maal: modell === "v2" ? plan : workbench },
    { suffix: modell === "v2" ? "/active" : "/tapper", maal: modell === "v2" ? plan : workbench },
    { suffix: "/summary", maal: modell === "wb" ? workbench : plan },
  ];
  for (const { suffix, maal } of ruter) {
    await test.step(`${modell}${suffix || "/"}: uvedkommende sendes til ${maal}`, async () => {
      const svar = await page.goto(`/portal/live/${oktId}${suffix}`);
      expect(svar?.status()).toBe(200);
      await expect(page).toHaveURL(stiMatcher(maal));
      await expect(page.getByRole("heading", { name: maal === plan ? "Plan" : "Workbench", exact: true }).first()).toBeVisible();
      await expect(page.getByText(tittel, { exact: true })).toHaveCount(0);
      await expect(page.locator('[data-od-id="playerhq-live-active"], [data-od-id="playerhq-live-summary"], [data-od-id="brief-start"], [data-od-id="tapper-avslutt"]')).toHaveCount(0);
    });
  }
}

async function ventPaSti(page: Page, sti: string, timeout = 90_000) {
  // En ødelagt navigasjon skal feile prøven. Ingen direkte goto som reparasjon.
  await expect(page).toHaveURL(stiMatcher(sti), { timeout });
}

async function startV2Live(page: Page, oktId: string) {
  await page.locator('[data-od-id="brief-start"]').click();
  await ventPaSti(page, `/portal/live/${oktId}/active`);
}

async function avsluttV2Live(page: Page) {
  const ferdig = page.getByRole("button", { name: "Marker øvelsen ferdig" });
  if (await ferdig.isVisible().catch(() => false)) await ferdig.click();
  const seOppsummering = page.getByRole("button", { name: "Avslutt og se oppsummering" });
  if (await seOppsummering.isVisible().catch(() => false)) {
    await seOppsummering.click();
  } else {
    await page.getByRole("button", { name: "Avslutt", exact: true }).click();
  }
  const bekreft = page.getByRole("button", { name: "Avslutt og logg økta" });
  await expect(bekreft).toBeVisible();
  await bekreft.click();
}

test.describe("P0 innlogget spillerreise", () => {
  test.afterEach(async ({ page }) => {
    await lagreSpor(page);
  });

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
    await expect(page.getByText("P0 Workbench").first()).toBeAttached();
    await aapnePlan(page);
    await velgPlanOkt(page, "P0 Workbench", wbId, "wb");
    await page.locator('[data-od-id="brief-start"]').click({ timeout: 20_000 });
    await ventPaSti(page, `/portal/live/${wbId}/tapper`);
    await expect(page.getByText("P0 Workbench").first()).toBeVisible();
    for (let i = 0; i < wbTall; i += 1) {
      await page.locator('[data-od-id="tapper-klubb-driver"]').click();
    }
    await page.locator('[data-od-id="tapper-avslutt"]').click();
    await ventPaSti(page, `/portal/live/${wbId}/summary`);
    await expect(page.getByRole("heading", { name: "P0 Workbench" })).toBeVisible();
    await expectSlag(page, wbTall);

    await page.locator('[data-od-id="etter-kvitt-idag"]').click();
    await expect(page).toHaveURL(/\/portal\/?$/);
    const recap = page.getByRole("link", { name: "Se recap" });
    await expect(recap).toBeVisible();
    await expect(recap).toHaveAttribute("href", `/portal/live/${wbId}/summary`);
    await recap.click();
    await ventPaSti(page, `/portal/live/${wbId}/summary`);
    await expectSlag(page, wbTall);
  });

  test("V2 PH-04 → PH-05 → PH-06 med samme repetisjoner etter gjenåpning", async ({ page }) => {
    await loggInn(page, spillerEpost, spillerPassord);
    await aapnePlan(page);
    await velgPlanOkt(page, "P0 V2 Innspill", v2Id, "v2");
    await expect(page).toHaveURL(new RegExp(`/portal/live/${v2Id}(/brief)?$`));
    await expect(page.getByText("P0 V2 Innspill").first()).toBeVisible();
    await startV2Live(page, v2Id);
    await expect(page.locator('[data-od-id="playerhq-live-active"]')).toHaveAttribute("data-phase", "active", {
      timeout: 60_000,
    });
    await expect(page.locator('[data-od-id="live-tap-rep"]')).toBeEnabled();
    for (let i = 0; i < v2Reps; i += 1) {
      await page.locator('[data-od-id="live-tap-rep"]').click();
    }
    for (let i = 0; i < v2Treff; i += 1) {
      await page.locator('[data-od-id="live-tap-treff"]').click();
    }
    const v2Totalt = v2Reps + v2Treff;
    await expect(page.locator("output").filter({ hasText: `${v2Totalt} reps · ${v2Treff} treff` })).toBeVisible();
    await avsluttV2Live(page);
    await ventPaSti(page, `/portal/live/${v2Id}/summary`);
    await expect(page.getByRole("heading", { name: "P0 V2 Innspill" })).toBeVisible();
    await expectRepetisjoner(page, v2Totalt);
    await expect(page.getByText(`${v2Treff} av ${v2Totalt}`, { exact: true })).toBeVisible();
    await gjenåpneFraPlan(page, "P0 V2 Innspill", v2Id, "v2");
    await expect(page.getByRole("heading", { name: "P0 V2 Innspill" })).toBeVisible();
    await expectRepetisjoner(page, v2Totalt);
    await expect(page.getByText(`${v2Treff} av ${v2Totalt}`, { exact: true })).toBeVisible();
  });

  test("eldre planøkt PH-04 → PH-05 → PH-06 med samme slag etter gjenåpning", async ({ page }) => {
    await loggInn(page, spillerEpost, spillerPassord);
    await aapnePlan(page);
    await velgPlanOkt(page, "P0 Eldre plan", planId, "plan");
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
    await expectSlag(page, planTall);
    await gjenåpneFraPlan(page, "P0 Eldre plan", planId, "plan");
    await expectSlag(page, planTall);
  });

  test("tillatt coach ser økta; uvedkommende avvises uten innhold", async ({ page }) => {
    test.setTimeout(360_000);
    await loggInn(page, coachEpost, coachPassord);
    await page.goto(`/portal/live/${wbId}/summary`);
    await expect(page.getByRole("heading", { name: "P0 Workbench" })).toBeVisible();
    await expectSlag(page, wbTall);

    await loggUt(page);
    await loggInn(page, fremmedEpost, fremmedPassord);
    await expectAvvist(page, wbId, "P0 Workbench", "wb");
    await expectAvvist(page, v2Id, "P0 V2 Innspill", "v2");
    await expectAvvist(page, planId, "P0 Eldre plan", "plan");

    await loggUt(page);
    await loggInn(page, fremmedCoachEpost, fremmedCoachPassord);
    await expectAvvist(page, wbId, "P0 Workbench", "wb");
    await expectAvvist(page, v2Id, "P0 V2 Innspill", "v2");
    await expectAvvist(page, planId, "P0 Eldre plan", "plan");
  });
});
