/**
 * P03 innlogget — ny, rediger og flytt fra Plan-skjermen.
 *
 * Serverreglene er prøvd fra før (PR #871): uvedkommende avvises uten skriving,
 * flytt treffer vist uke, feilet drill-skriving ruller tilbake tittelen. Det som
 * manglet var beviset på at en innlogget spiller faktisk NÅR de tre handlingene
 * gjennom skjermen, og at en flytting overlever en full sidelasting.
 *
 * Bruker en dedikert økt (`P0_FLYTT_WB_ID`) som ingen annen spec leser, slik at
 * flyttingen ikke forstyrrer spillerreise-innlogget.spec.ts sin forventning om at
 * `P0_WB_ID` ligger på dagens dato kl. 09:00.
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
const fremmedEpost = krev("P0_FOREIGN_EMAIL");
const fremmedPassord = krev("P0_FOREIGN_PASSWORD");
const redigerPlanId = krev("P0_REDIGER_PLAN_ID");
const FLYTT_TITTEL = "P0 Workbench flytt";
const REDIGER_TITTEL = "P0 Plan rediger";
// Spillerens planlegger viser V2-øktene. Denne tittelen er derfor den eneste
// som duger som positiv kontroll for at siden faktisk har eierens innhold.
const WORKBENCH_TITTEL = "P0 V2 Innspill";
const REDIRECT_TIMEOUT = 90_000;

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
      const sti = new URL(url).pathname;
      return sti.startsWith("/portal") || sti.startsWith("/admin");
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

async function aapnePlan(page: Page) {
  await page.goto("/portal/planlegge");
  await expect(page).toHaveURL((url) => url.pathname === "/portal/planlegge", { timeout: REDIRECT_TIMEOUT });
  await expect(page.getByRole("heading", { name: "Plan", exact: true })).toBeVisible({ timeout: REDIRECT_TIMEOUT });
}

/**
 * Velg økta i kalenderen; detaljpanelet er der handlingene bor.
 * Kalenderknappens navn bygges av øktas LAGREDE dato og klokkeslett
 * (`${tittel}, ${dato}, ${tid}`), så navnet er også beviset etter en flytting.
 */
async function velgOkt(page: Page, tittel: string) {
  const knapp = page.getByRole("button", { name: new RegExp(`^${tittel},`) }).first();
  await expect(knapp).toBeVisible({ timeout: REDIRECT_TIMEOUT });
  const navn = (await knapp.getAttribute("aria-label")) ?? "";
  await knapp.click();
  const detaljer = page.getByRole("complementary", { name: "Detaljer om valgt avtale" });
  await expect(detaljer.getByRole("heading", { name: tittel, exact: true })).toBeVisible();
  return { detaljer, navn };
}

test.describe("P03 innlogget — ny, rediger og flytt", () => {
  test("flytt økt fra Plan: ny dag og klokkeslett overlever full sidelasting", async ({ page }) => {
    test.setTimeout(240_000);
    await loggInn(page, spillerEpost, spillerPassord);
    await aapnePlan(page);
    const { detaljer, navn: navnFoer } = await velgOkt(page, FLYTT_TITTEL);
    // Seeden legger økta kl. 14.00 — utgangspunktet, så flyttingen er en ekte endring.
    expect(navnFoer).toContain("14.00");

    // Skjemaet fylles med øktas nåværende dato og tid; vi endrer begge.
    await detaljer.getByRole("button", { name: "Flytt økt", exact: true }).click();
    const datoFelt = detaljer.locator('input[type="date"]');
    const tidFelt = detaljer.locator('input[type="time"]');
    await expect(datoFelt).toBeVisible();

    const fraDato = await datoFelt.inputValue();
    // To dager fram: samme uke som seeden legger økta i, men en annen dag.
    const nyDato = new Date(`${fraDato}T00:00:00Z`);
    nyDato.setUTCDate(nyDato.getUTCDate() + 2);
    const nyDatoIso = nyDato.toISOString().slice(0, 10);
    expect(nyDatoIso).not.toBe(fraDato);

    await datoFelt.fill(nyDatoIso);
    await tidFelt.fill("16:30");
    await detaljer.getByRole("button", { name: "Lagre tidspunkt", exact: true }).click();

    // Appen bekrefter selv at flyttingen ble godtatt. Meldingen rendres både i
    // sidepanelet og i mobil-arket, derfor .first().
    await expect(page.getByText("Økten er flyttet.", { exact: true }).first())
      .toBeVisible({ timeout: 60_000 });

    // Beviset: en HELT ny sidelasting viser økta på den nye dagen og tiden.
    // Uten persistering ville den falt tilbake til seedens 14:00 på opprinnelig dag.
    await page.goto("/portal/planlegge?uke=0");
    await expect(page.getByRole("heading", { name: "Plan", exact: true })).toBeVisible({ timeout: REDIRECT_TIMEOUT });
    const { navn: navnEtter } = await velgOkt(page, FLYTT_TITTEL);
    expect(navnEtter).toContain("16.30");
    expect(navnEtter).not.toBe(navnFoer);
  });

  test("«Ny økt» fra Plan lenker til planleggeren med valgt dag som starttidspunkt", async ({ page }) => {
    await loggInn(page, spillerEpost, spillerPassord);
    await aapnePlan(page);

    await page.getByRole("link", { name: "Ny økt", exact: true }).first().click();

    await expect(page).toHaveURL((url) => {
      if (url.pathname !== "/portal/planlegge/workbench") return false;
      const start = url.searchParams.get("start");
      // Formatet er <ISO-dato>T09:00 — ikke en tom eller gjettet verdi.
      return /^\d{4}-\d{2}-\d{2}T09:00$/.test(start ?? "");
    }, { timeout: REDIRECT_TIMEOUT });
  });

  test("«Rediger økt» fra Plan lenker til planleggeren med nøyaktig den øktas id", async ({ page }) => {
    test.setTimeout(180_000);
    await loggInn(page, spillerEpost, spillerPassord);
    await aapnePlan(page);
    // «Rediger økt» finnes bare når økta har en planSessionId, og den settes
    // kun på plan-modellen. Workbench-økter får «Flytt økt» i stedet.
    const { detaljer } = await velgOkt(page, REDIGER_TITTEL);

    const rediger = detaljer.getByRole("link", { name: "Rediger økt", exact: true });
    await expect(rediger).toBeVisible();
    await rediger.click();

    await expect(page).toHaveURL((url) =>
      url.pathname === "/portal/planlegge/workbench" && url.searchParams.get("okt") === redigerPlanId,
    { timeout: REDIRECT_TIMEOUT });
  });

  test("planleggeren viser eierens økter, aldri en fremmed sine", async ({ page }) => {
    test.setTimeout(300_000);

    // Positiv kontroll FØRST. Uten den beviser den negative halvdelen ingenting:
    // en tom side ville «bestått» uansett hvem som var logget inn.
    // Merk: planleggeren viser V2-øktene, ikke Workbench-øktene og ikke
    // planøkta — målt 15.09 ved at kun «P0 V2 Innspill» rendres i uka.
    await loggInn(page, spillerEpost, spillerPassord);
    await page.goto("/portal/planlegge/workbench?uke=0");
    await expect(page).toHaveURL((url) => url.pathname === "/portal/planlegge/workbench", { timeout: REDIRECT_TIMEOUT });
    await expect(page.getByText(WORKBENCH_TITTEL).first()).toBeVisible({ timeout: REDIRECT_TIMEOUT });

    await loggUt(page);

    await loggInn(page, fremmedEpost, fremmedPassord);
    const svar = await page.goto("/portal/planlegge/workbench?uke=0");
    expect(svar?.status()).toBeLessThan(400);
    await expect(page).toHaveURL((url) => url.pathname === "/portal/planlegge/workbench", { timeout: REDIRECT_TIMEOUT });
    // Fremmed har sin egen planlegger, men spillerens økt skal aldri stå i den.
    await expect(page.getByText(WORKBENCH_TITTEL)).toHaveCount(0);
  });
});
