/**
 * Innlogget Team Norway-demoprøve mot isolert HQ-Supabase.
 *
 * Dette er en prøve av faktisk kode og databinding — ekte innlogging via
 * /auth/login (samme skjema som produksjon), ekte server-actions og ekte
 * rader i den isolerte databasen. Ingen route-intercept, ingen mocket auth.
 *
 * Reise: coachinnlogging → /team-norway → spillerliste → protokoll →
 * COACHEN TILDELER SELV testen til spilleren via den eksisterende
 * /admin/tester/tildel/[spillerId]-skjermen (ikke seedet direkte) →
 * spillerinnlogging/gjennomføring i PlayerHQ → lagring med et deterministisk
 * beregnet resultat → coachens historikk viser SAMME eksakte resultat, også
 * etter gjenåpning. En egen, uavhengig prøve bekrefter at en utenforstående
 * avvises på /team-norway.
 *
 * Kjøres med scripts/tn-demo-lokal-reise.mjs — ikke frittstående, den
 * krever de env-variablene og den appen runneren setter opp.
 */
import { expect, test, type Page } from "@playwright/test";
import { tnProtocol } from "../../src/lib/portal-tester/tn-catalog";
import { tnFormat } from "../../src/lib/portal-tester/tn-scoring";

function krev(navn: string): string {
  const verdi = process.env[navn]?.trim();
  if (!verdi) throw new Error(`${navn} mangler. Kjør scripts/tn-demo-lokal-reise.mjs mot HQ-stacken.`);
  return verdi;
}

const coachEpost = krev("TN_DEMO_COACH_EMAIL");
const coachPassord = krev("TN_DEMO_COACH_PASSWORD");
const spillerEpost = krev("TN_DEMO_PLAYER_EMAIL");
const spillerPassord = krev("TN_DEMO_PLAYER_PASSWORD");
const utenforEpost = krev("TN_DEMO_OUTSIDER_EMAIL");
const utenforPassord = krev("TN_DEMO_OUTSIDER_PASSWORD");
const spillerId = krev("TN_DEMO_PLAYER_ID");
const protokollId = krev("TN_DEMO_PROTOCOL_ID");
const protokollNavn = krev("TN_DEMO_PROTOCOL_NAME");
const protokoll = tnProtocol(protokollId);
if (!protokoll) throw new Error(`Protokoll ${protokollId} finnes ikke i katalogen — seed og spec er ute av synk`);

// Deterministisk syntetisk input — samme tall brukes til utfylling OG til
// å beregne forventet score i denne spec-filen, uavhengig av produktkoden.
// putt-1-3m har ett tallfelt ("strokes") per forsøk; primærmetrikken er
// summen av alle forsøk ("Totalt antall slag").
const strokesPerForsok = protokoll.rows.map((_, i) => (i % 3) + 1);
const forventetScore = strokesPerForsok.reduce((a, b) => a + b, 0);
const forventetTekst = tnFormat({ value: forventetScore, unit: "slag" });

async function lukkCookie(page: Page) {
  const btn = page.getByRole("button", { name: "Kun nødvendige", exact: true });
  try {
    await btn.waitFor({ state: "visible", timeout: 6_000 });
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
  await page.waitForURL((url) => {
    const path = new URL(url).pathname;
    return path.startsWith("/portal") || path.startsWith("/admin") || path.startsWith("/team-norway");
  }, { timeout: 90_000 });
  await lukkCookie(page);
}

async function loggUt(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function fyllUtOgFullfor(page: Page) {
  // Skjemaet har ÉN ytre <fieldset> (disabled/pending-toggle) som pakker inn
  // ALLE 25 forsøk-<fieldset>-ene — den ytre matcher derfor `hasText` på HVER
  // forsøkstekst (den inneholder alt). "fieldset fieldset" velger kun de
  // indre, konkrete forsøks-fieldsetene, ikke wrapperen.
  for (let i = 0; i < protokoll!.rows.length; i++) {
    const forsokNr = i + 1;
    const felt$ = page.locator("fieldset fieldset").filter({ hasText: `Forsøk ${forsokNr} ·` });
    await felt$.locator("input").fill(String(strokesPerForsok[i]));
  }
  await page.getByRole("button", { name: "Fullfør testen", exact: true }).click();
  await expect(page.getByText("Resultatet er lagret.", { exact: true })).toBeVisible({ timeout: 20_000 });
}

test.describe("Team Norway — innlogget demoreise (ekte kode, isolert database)", () => {
  test.describe.configure({ mode: "serial" });

  test("Coach: ekte gruppecoach ser oversikt og spillerliste (1440px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loggInn(page, coachEpost, coachPassord);

    await page.goto("/team-norway");
    await expect(page).toHaveURL(/\/team-norway$/);
    await expect(page.getByText("Din grupperolle: COACH")).toBeVisible();
    await page.screenshot({ path: test.info().outputPath("01-tn-oversikt-1440.png"), fullPage: true });

    await page.goto("/team-norway/spillere");
    await expect(page.getByRole("heading", { name: "Spillere", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "TN Demo Spiller", exact: true })).toBeVisible();
    // Før tildeling/gjennomføring: eksakt "0" i testkolonnen (4. celle) for spilleren.
    const radFor = await page.getByRole("row", { name: /TN Demo Spiller/ });
    await expect(radFor.getByRole("cell").nth(3)).toHaveText("0");
    await page.screenshot({ path: test.info().outputPath("02-tn-spillere-1440.png"), fullPage: true });
  });

  test("Coach: protokolldetalj viser protokollen, deretter EKTE tildeling via /admin/tester/tildel (390px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loggInn(page, coachEpost, coachPassord);

    await page.goto(`/team-norway/protokoller/${protokollId}`);
    await expect(page.getByRole("heading", { name: protokollNavn, exact: true })).toBeVisible();
    await page.screenshot({ path: test.info().outputPath("03-tn-protokoll-390.png"), fullPage: true });

    // Selve tildelingen skjer i AgencyOS, gjennom den eksisterende, ekte
    // "Tildel test"-skjermen — ikke seedet direkte i databasen.
    await page.goto(`/admin/tester/tildel/${spillerId}`);
    const dialog = page.getByRole("dialog", { name: "Tildel test" });
    await expect(dialog).toBeVisible();
    await dialog.getByPlaceholder("Søk test, disiplin, mål …").fill(protokollNavn);
    await dialog.getByText(protokollNavn, { exact: true }).click();
    await dialog.getByRole("button", { name: "Tildel test", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/tester$/, { timeout: 20_000 });
    await loggUt(page);
  });

  test("Spiller: ser den EKTE coach-tildelingen og fullfører den med beregnet resultat", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loggInn(page, spillerEpost, spillerPassord);

    await page.goto("/portal/tren/tester/team-norway");
    await expect(page.getByRole("heading", { name: "Tildelt av coach", exact: true })).toBeVisible();
    // Siden viser SAMME protokollnavn to steder: i "Tildelt av coach"-lista
    // (den relevante, ekte tildelingen) og igjen nederst i den generiske
    // "Testvarianter"-katalogen (alltid synlig, uavhengig av tildeling).
    // "Tildelt av coach" er den FØRSTE <ul> i dokumentet — skop eksplisitt
    // til den, ellers matcher lenken begge steder.
    const tildeltListe = page.locator("ul").first();
    const tildeling = tildeltListe.getByRole("link", { name: new RegExp(`^${protokollNavn} · ${protokoll!.rows.length} forsøk`) });
    await expect(tildeling).toBeVisible();
    await page.screenshot({ path: test.info().outputPath("04-spiller-tildelt-390.png") });
    await tildeling.click();

    await expect(page.getByRole("heading", { name: protokollNavn, exact: true })).toBeVisible();
    await fyllUtOgFullfor(page);

    // Eksakt beregnet resultat, ikke bare at "et" resultat vises.
    await expect(page.getByText(forventetTekst, { exact: false })).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: test.info().outputPath("05-spiller-fullfort-1440.png"), fullPage: true });

    // Gjenåpning: URL-en med `?test=` starter alltid en NY, tom økt (client-
    // siden lager en fersk sessionId når `session`-param mangler) — en reload
    // av DENNE fanen ville derfor feilaktig se ut som tapt data. Ekte
    // gjenåpning skjer via "Dine registreringer" på listesiden, som lenker
    // til `?session=<id>` for den fullførte økten.
    await page.goto("/portal/tren/tester/team-norway");
    const registrering = page.getByRole("link", { name: new RegExp(`^${protokollNavn} · ${protokoll!.rows.length} forsøk · Fullført`) });
    await expect(registrering).toBeVisible();
    await registrering.click();
    await expect(page.getByText("Fullført", { exact: true })).toBeVisible();
    await expect(page.getByText(forventetTekst, { exact: false })).toBeVisible();
    await loggUt(page);
  });

  test("Coach: ser EKSAKT samme resultat i historikken, også etter gjenåpning, og spillerlisten er oppdatert", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loggInn(page, coachEpost, coachPassord);

    await page.goto(`/admin/spillere/${spillerId}/tester`);
    await expect(page.getByRole("heading", { name: "Team Norway-resultater", exact: true })).toBeVisible();
    const historikkLinje = page.getByText(new RegExp(`^${protokollNavn} · ${protokoll!.rows.length} forsøk · ${escapeRegExp(forventetTekst)}`));
    await expect(historikkLinje).toBeVisible();
    await page.screenshot({ path: test.info().outputPath("06-coach-historikk-1440.png"), fullPage: true });

    // Gjenåpning fra coachens side.
    await page.reload();
    await expect(historikkLinje).toBeVisible();

    // Spillerlistens testtall er nå eksakt 1, ikke "et tall mellom 1 og 9".
    await page.goto("/team-norway/spillere");
    const rad = page.getByRole("row", { name: /TN Demo Spiller/ });
    await expect(rad.getByRole("cell").nth(3)).toHaveText("1");
    await loggUt(page);
  });
});

// Uavhengig av serial-gruppen over: en manglende tilgangskontroll her skal
// ALDRI kunne skjules bak en "skip" fra en tidligere feilet test.
test("Utenforstående (myndig spiller uten team-norway-medlemskap) avvises på /team-norway og /team-norway/spillere", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loggInn(page, utenforEpost, utenforPassord);

  await page.goto("/team-norway");
  await expect(page.getByRole("heading", { name: "Denne siden finnes ikke", exact: true })).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("07-utenforstaende-avvist-1440.png"), fullPage: true });

  await page.goto("/team-norway/spillere");
  await expect(page.getByRole("heading", { name: "Denne siden finnes ikke", exact: true })).toBeVisible();
  await loggUt(page);
});

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
