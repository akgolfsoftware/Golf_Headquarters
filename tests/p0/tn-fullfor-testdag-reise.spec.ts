/**
 * Ekte lokal testdag/trenerføring-reise mot den NYE, isolerte teststacken
 * (Auth 54521, appdatabase tn_fullfor_app_20260914 på 54522, app 3012) —
 * kjøres via scripts/tn-fullfor-lokal-reise.mjs. Ekte innlogging (hver test
 * logger inn selv — Playwright gir en FERSK `page` per test selv i serial-
 * modus), ekte server-actions, ekte Postgres, og direkte, skrivebeskyttede
 * SQL-kontroller (rå `pg.Client`, IKKE Prisma) i DENNE spec-filen for å
 * bevise faktisk lagret rad-tilstand (ikke bare at en side laster).
 * Selve appen/server-actions bruker fortsatt ekte Prisma som normalt —
 * dette er KUN spec-filens egne leseoppslag. `pg` brukes fordi Playwrights
 * innebygde TS-transform (CJS) ikke laster den Prisma-genererte klientens
 * rene ESM-`export`-syntax direkte («exports is not defined in ES module
 * scope») — se docs/design-audit for detaljer. Rører aldri 3011-reserven
 * (49-slag-resultatet).
 */
import { expect, test, type Page } from "@playwright/test";
import pg from "pg";

function krev(navn: string): string {
  const verdi = process.env[navn]?.trim();
  if (!verdi) throw new Error(`${navn} mangler. Kjør scripts/tn-fullfor-lokal-reise.mjs.`);
  return verdi;
}

const coachEpost = krev("TN_FULLFOR_COACH_EMAIL");
const coachPassord = krev("TN_FULLFOR_COACH_PASSWORD");
const assistentEpost = krev("TN_FULLFOR_ASSISTENT_EMAIL");
const assistentPassord = krev("TN_FULLFOR_ASSISTENT_PASSWORD");
const utenforEpost = krev("TN_FULLFOR_UTENFOR_EMAIL");
const utenforPassord = krev("TN_FULLFOR_UTENFOR_PASSWORD");
const spillerAId = krev("TN_FULLFOR_SPILLER_A_ID");
const spillerBId = krev("TN_FULLFOR_SPILLER_B_ID");
const spillerAEpost = krev("TN_FULLFOR_SPILLER_A_EMAIL");
const spillerAPassord = krev("TN_FULLFOR_SPILLER_A_PASSWORD");

const dbUrl = krev("DATABASE_URL");
{
  const u = new URL(dbUrl);
  if (u.hostname !== "127.0.0.1" || u.port !== "54522" || u.pathname.replace(/^\//, "") !== "tn_fullfor_app_20260914") {
    throw new Error("Spec-filens DB-guard: kun 127.0.0.1:54522/tn_fullfor_app_20260914 er tillatt for direkte Prisma-oppslag her.");
  }
}
const db = new pg.Client({ connectionString: dbUrl });
let dbTilkoblet = false;
async function q<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  if (!dbTilkoblet) { await db.connect(); dbTilkoblet = true; }
  return (await db.query(sql, params)).rows;
}

async function lukkCookie(page: Page) {
  const btn = page.getByRole("button", { name: "Kun nødvendige", exact: true });
  try {
    await btn.waitFor({ state: "visible", timeout: 6_000 });
    await btn.click();
  } catch { /* banner finnes ikke */ }
}

async function loggInn(page: Page, epost: string, passord: string) {
  await page.goto("/auth/login");
  await lukkCookie(page);
  await page.locator('input[type="email"]').fill(epost);
  await page.locator('input[type="password"]').fill(passord);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL((u) => {
    const p = new URL(u).pathname;
    return p.startsWith("/team-norway") || p.startsWith("/portal") || p.startsWith("/admin");
  }, { timeout: 60_000 });
  await lukkCookie(page);
}

async function fyllForsteNForsok(page: Page, antall: number, verdi: number) {
  for (let i = 1; i <= antall; i++) {
    const felt = page.locator("fieldset fieldset").filter({ hasText: `Forsøk ${i} ·` });
    await felt.locator("input").fill(String(verdi));
  }
}

test.describe.configure({ mode: "serial" });
let testDagUrl = "";
let spillerADeltakerUrl = "";

test.afterAll(async () => {
  if (dbTilkoblet) await db.end();
});

test("Coach: oppretter testdag med eksplisitt protokoll og to eksakt navngitte spillere", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loggInn(page, coachEpost, coachPassord);
  await page.goto("/team-norway/fellestesting");
  await page.getByLabel("Navn på testdagen").fill("tn-fullfor E2E testdag");
  await page.getByLabel("Tidspunkt").fill("2026-09-14T14:00");
  await page.getByRole("combobox").selectOption({ label: "Putt 1–3 m" });
  await page.getByRole("checkbox", { name: "TN Fullfør Spiller A", exact: true }).check();
  await page.getByRole("checkbox", { name: "TN Fullfør Spiller B", exact: true }).check();
  await page.getByRole("button", { name: "Start testdag", exact: true }).click();
  await page.waitForURL((u) => new URL(u).search.startsWith("?dag="), { timeout: 20_000 });
  testDagUrl = page.url();
  await expect(page.getByText("TN Fullfør Spiller A", { exact: true })).toBeVisible();
  await expect(page.getByText("TN Fullfør Spiller B", { exact: true })).toBeVisible();
  await page.screenshot({ path: "/private/tmp/ak-hq-tn-fullfor-20260914/01-ko-1440.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  // Vent på faktisk spillerinnhold — ikke bare at siden har svart — så
  // skjermbildet ikke fanger last-skjelettet i stedet for den ekte køen.
  await expect(page.getByText("TN Fullfør Spiller A", { exact: true })).toBeVisible();
  await expect(page.getByText("TN Fullfør Spiller B", { exact: true })).toBeVisible();
  await page.screenshot({ path: "/private/tmp/ak-hq-tn-fullfor-20260914/02-ko-390.png", fullPage: true });
});

test("Utenforstående avvises på testdagens EGEN URL og på fellestesting — ikke bare TN-oversikt", async ({ page }) => {
  await loggInn(page, utenforEpost, utenforPassord);
  await page.goto("/team-norway/fellestesting");
  await expect(page.getByRole("heading", { name: "Denne siden finnes ikke" })).toBeVisible();
  await page.goto(testDagUrl);
  await expect(page.getByRole("heading", { name: "Denne siden finnes ikke" })).toBeVisible();
});

test("Coach: lagrer utkast for spiller A, gjenåpner, og verdien har overlevd", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loggInn(page, coachEpost, coachPassord);
  await page.goto(testDagUrl);
  const radA = page.locator(`[data-spiller-id="${spillerAId}"]`);
  await radA.getByRole("button", { name: "Før test", exact: true }).click();
  await expect(page.getByRole("heading", { name: "TN Fullfør Spiller A" })).toBeVisible();
  spillerADeltakerUrl = page.url();
  const antallForsok = await page.locator("fieldset fieldset legend").count();
  expect(antallForsok).toBe(25);
  await fyllForsteNForsok(page, 5, 2);
  await page.getByRole("button", { name: "Lagre utkast / pause", exact: true }).click();
  await expect(page.getByText("Utkastet er lagret.", { exact: true })).toBeVisible({ timeout: 15_000 });

  // Gjenåpning: last siden på nytt (samme deltaker-URL) og kontroller at
  // verdien fortsatt står — dette er ekte serverlagret utkast, ikke bare
  // klient-state som ville overlevd et reload uansett.
  await page.reload();
  const forsteInput = page.locator("fieldset fieldset").filter({ hasText: "Forsøk 1 ·" }).locator("input");
  await expect(forsteInput).toHaveValue("2");
});

test("Spiller A ser sin egen pågående trenerførte økt som read-only i egenføringen — ikke en redigerbar scorecard", async ({ page }) => {
  await loggInn(page, spillerAEpost, spillerAPassord);
  await page.goto("/portal/tren/tester/team-norway");
  await expect(page.getByText("Styres av trener (testdag)", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: /Styres av trener \(testdag\)/ })).toHaveCount(0);
});

test("Coach: avbryter utkastet for spiller A — nytt forsøk starter blankt (revision 0), ikke det gamle utkastet", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loggInn(page, coachEpost, coachPassord);
  await page.goto(spillerADeltakerUrl);
  await expect(page.locator("fieldset fieldset").filter({ hasText: "Forsøk 1 ·" }).locator("input")).toHaveValue("2");
  await page.getByRole("button", { name: "Avslutt ufullstendig", exact: true }).click();
  await expect(page.getByText("Avsluttet ufullstendig. Nytt forsøk starter tomt.", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("fieldset fieldset").filter({ hasText: "Forsøk 1 ·" }).locator("input")).toHaveValue("");

  // Ekte gjenåpning fra kø-siden (ikke bare klient-state) — samme resultat.
  await page.goto(testDagUrl);
  const radA = page.locator(`[data-spiller-id="${spillerAId}"]`);
  await radA.getByRole("button", { name: "Før test", exact: true }).click();
  await expect(page.locator("fieldset fieldset").filter({ hasText: "Forsøk 1 ·" }).locator("input")).toHaveValue("");
});

test("Coach: fullfører spiller A — «Før og neste» går til spiller B med garantert blanke felt", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loggInn(page, coachEpost, coachPassord);
  await page.goto(spillerADeltakerUrl);
  await fyllForsteNForsok(page, 25, 2);
  await page.getByRole("button", { name: "Før og neste", exact: true }).click();
  await expect(page.getByRole("heading", { name: "TN Fullfør Spiller B" })).toBeVisible({ timeout: 15_000 });
  const antallForsokB = await page.locator("fieldset fieldset legend").count();
  expect(antallForsokB).toBe(25);
  for (let i = 1; i <= antallForsokB; i++) {
    const felt = page.locator("fieldset fieldset").filter({ hasText: `Forsøk ${i} ·` }).locator("input");
    await expect(felt).toHaveValue("");
  }
  await fyllForsteNForsok(page, 25, 3);
  await page.getByRole("button", { name: "Fullfør siste test", exact: true }).click();
  await page.waitForURL((u) => new URL(u).search.startsWith("?dag="), { timeout: 15_000 });
});

test("Hjelpetrener (ASSISTANT) ser den fortsatt AKTIVE testdagen, men uten noen skriveknapp", async ({ page }) => {
  await loggInn(page, assistentEpost, assistentPassord);
  await page.goto(testDagUrl);
  await expect(page.getByText("TN Fullfør Spiller A", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hopp over" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ikke møtt" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Avslutt testdag" })).toHaveCount(0);
});

test("Utenforstående avvises på selve scorecard-URL-en (ikke bare listen)", async ({ page }) => {
  await loggInn(page, utenforEpost, utenforPassord);
  await page.goto(spillerADeltakerUrl);
  await expect(page.getByRole("heading", { name: "Denne siden finnes ikke" })).toBeVisible();
});

test("Coach: avslutter testdagen etter at begge er ført", async ({ page }) => {
  await loggInn(page, coachEpost, coachPassord);
  await page.goto(testDagUrl);
  await page.getByRole("button", { name: "Avslutt testdag", exact: true }).click();
  await expect(page.getByText("Avsluttet", { exact: true })).toBeVisible({ timeout: 15_000 });
  await page.screenshot({ path: "/private/tmp/ak-hq-tn-fullfor-20260914/03-avsluttet-1440.png", fullPage: true });
});

test("EKTE DATABASE: begge resultatene er faktisk lagret med korrekt score, subjekt og recordedById=coach", async () => {
  // Avgrenset til DENNE testdagen (fra testDagUrl) — en bevart testdag fra
  // et tidligere, mislykket kjøreforsøk skal ikke gi falske treff/avvik her.
  const dagId = new URL(testDagUrl).searchParams.get("dag");
  if (!dagId) throw new Error("testDagUrl mangler ?dag=-parameteren.");
  const deltakere = await q<{ playerId: string; status: string; resultId: string | null }>(
    `select "playerId", status, "resultId" from test_day_participants where "testDayId" = $1 and "playerId" = any($2)`,
    [dagId, [spillerAId, spillerBId]],
  );
  expect(deltakere.length).toBe(2);
  expect(deltakere.every((d) => d.status === "DONE" && d.resultId)).toBe(true);

  const resultIder = deltakere.map((d) => d.resultId!);
  const resultater = await q<{ userId: string; score: number; recordedById: string | null }>(
    `select "userId", score, "recordedById" from test_results where id = any($1)`,
    [resultIder],
  );
  expect(resultater.length).toBe(2);
  const [coach] = await q<{ id: string }>(`select id from users where email = $1`, [coachEpost]);
  const resultatA = resultater.find((r) => r.userId === spillerAId);
  const resultatB = resultater.find((r) => r.userId === spillerBId);
  expect(resultatA?.score).toBe(50); // 25 forsøk × 2 slag
  expect(resultatB?.score).toBe(75); // 25 forsøk × 3 slag
  expect(resultatA?.recordedById).toBe(coach?.id);
  expect(resultatB?.recordedById).toBe(coach?.id);
});

test("Spiller A: ekte egen resultathistorikk viser det trenerførte resultatet, klikkbart og med korrekt tall", async ({ page }) => {
  // Bevarte resultater fra tidligere omkjøringer kan gi FLERE «Putt … ·
  // Fullført»-rader i historikken — velg den ekte lenken for DENNE
  // testdagens sesjon via sessionId, aldri en tekst-basert treff eller
  // .first() som kan plukke en annen kjørings rad.
  const dagId = new URL(testDagUrl).searchParams.get("dag");
  if (!dagId) throw new Error("testDagUrl mangler ?dag=-parameteren.");
  const [deltaker] = await q<{ sessionId: string | null }>(
    `select "sessionId" from test_day_participants where "testDayId" = $1 and "playerId" = $2`,
    [dagId, spillerAId],
  );
  if (!deltaker?.sessionId) throw new Error("Fant ingen sessionId for spiller A på denne testdagen.");
  const href = `?session=${deltaker.sessionId}`;

  await loggInn(page, spillerAEpost, spillerAPassord);
  await page.goto("/portal/tren/tester/team-norway");
  const rad = page.locator(`a[href="${href}"]`);
  await expect(rad).toBeVisible();
  await expect(rad).toHaveText(/Putt.*Fullført/);
  await rad.click();
  await expect(page.getByRole("heading", { name: "Resultat" })).toBeVisible();
  await expect(page.getByText(/50/)).toBeVisible();
});

test("EKTE SAMTIDIGHET: to samtidige fullføringsforsøk på SAMME deltaker gir nøyaktig ett resultat, og taperen ser en ekte kollisjonsfeil", async ({ browser }) => {
  // Antall TestResult/TestSession-rader for spiller A på NØYAKTIG denne
  // protokollen, målt før race-en, slik vi kan bevise et eksakt +1 etter —
  // ikke bare at ÉN bestemt resultId eksisterer (som ikke utelukker en
  // foreldreløs andre rad fra en tapt race).
  const testId = "tn-v3-putt-1-3m";
  const antallFor = async () => {
    const [[r], [s]] = await Promise.all([
      q<{ n: string }>(`select count(*) as n from test_results where "userId" = $1 and "testId" = $2`, [spillerAId, testId]),
      q<{ n: string }>(`select count(*) as n from test_sessions where "userId" = $1 and "testId" = $2`, [spillerAId, testId]),
    ]);
    return [Number(r.n), Number(s.n)] as const;
  };
  const [resultaterFor, sesjonerFor] = await antallFor();

  // Egen, fersk testdag for denne prøven — spiller A på nytt, én deltaker.
  const settOpp = await (async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await loggInn(page, coachEpost, coachPassord);
    await page.goto("/team-norway/fellestesting");
    await page.getByLabel("Navn på testdagen").fill("tn-fullfor samtidighetsprøve");
    await page.getByLabel("Tidspunkt").fill("2026-09-14T15:00");
    await page.getByRole("combobox").selectOption({ label: "Putt 1–3 m" });
    await page.getByRole("checkbox", { name: "TN Fullfør Spiller A", exact: true }).check();
    await page.getByRole("button", { name: "Start testdag", exact: true }).click();
    await page.waitForURL((u) => new URL(u).search.startsWith("?dag="), { timeout: 20_000 });
    const radA = page.locator(`[data-spiller-id="${spillerAId}"]`);
    await radA.getByRole("button", { name: "Før test", exact: true }).click();
    // Vent på FAKTISK ankomst på deltaker-scorecarden (URL-mønster + synlig
    // spilleroverskrift) før URL-en leses — ikke stol på at page.url()
    // allerede er oppdatert rett etter et klikk som utløser navigasjon.
    await page.waitForURL((u) => /\/team-norway\/fellestesting\/[^/?]+$/.test(new URL(u).pathname), { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "TN Fullfør Spiller A" })).toBeVisible();
    const deltakerUrl = page.url();
    await context.close();
    return deltakerUrl;
  })();

  const [ctx1, ctx2] = await Promise.all([browser.newContext(), browser.newContext()]);
  const [side1, side2] = await Promise.all([ctx1.newPage(), ctx2.newPage()]);
  await Promise.all([loggInn(side1, coachEpost, coachPassord), loggInn(side2, coachEpost, coachPassord)]);
  await Promise.all([side1.goto(settOpp), side2.goto(settOpp)]);
  await Promise.all([fyllForsteNForsok(side1, 25, 4), fyllForsteNForsok(side2, 25, 5)]);

  const knapp1 = side1.getByRole("button", { name: "Fullfør siste test", exact: true });
  const knapp2 = side2.getByRole("button", { name: "Fullfør siste test", exact: true });
  await Promise.all([knapp1.click(), knapp2.click()]);

  // Vent på FAKTISK tilstand på hver side — enten navigasjon bort fra
  // deltaker-URL-en (vant) eller en synlig feilmelding (tapte) — aldri en
  // fast timeout som gjetter hvor lang tid serialiseringsretry-en tar.
  const ventPaUtfall = async (side: Page) =>
    Promise.race([
      side.waitForURL((u) => u.toString() !== settOpp, { timeout: 20_000 }).then(() => "navigerte" as const),
      // Scoret til scorecardens egen feilparagraf — Next sin route-announcer
      // (`#__next-route-announcer__`) har ALLTID role="alert" på hver side
      // (tom tekst), så et upresist getByRole("alert") gir «strict mode
      // violation: resolved to 2 elements» så snart begge finnes samtidig.
      side.locator('p[role="alert"]').waitFor({ state: "visible", timeout: 20_000 }).then(() => "feil" as const),
    ]);
  const [utfall1, utfall2] = await Promise.all([ventPaUtfall(side1), ventPaUtfall(side2)]);

  // Nøyaktig én av de to skal ha vunnet (navigert bort); den andre skal ha
  // fått en tydelig, lesbar kollisjonsfeil og IKKE ha navigert bort.
  const vinnere = [utfall1, utfall2].filter((u) => u === "navigerte").length;
  expect(vinnere).toBe(1);
  const [vinnerSide, taperSide] = utfall1 === "navigerte" ? [side1, side2] : [side2, side1];
  expect(vinnerSide.url()).not.toBe(settOpp);
  expect(taperSide.url()).toBe(settOpp);
  await expect(taperSide.locator('p[role="alert"]')).toHaveText(/allerede fullført|fullført samtidig/i);

  await ctx1.close();
  await ctx2.close();

  const deltakerId = settOpp.split("/").pop()!;
  const [deltaker] = await q<{ resultId: string | null; status: string }>(
    `select "resultId", status from test_day_participants where id = $1`,
    [deltakerId],
  );
  expect(deltaker?.status).toBe("DONE");
  const [antallRadRes] = await q<{ n: string }>(`select count(*) as n from test_results where id = $1`, [deltaker?.resultId ?? ""]);
  expect(Number(antallRadRes.n)).toBe(1);

  // Nøyaktig ett NYTT TestResult og én NY TestSession for spiller A totalt
  // på denne protokollen — ingen foreldreløs andre rad fra taperen.
  const [resultaterEtter, sesjonerEtter] = await antallFor();
  expect(resultaterEtter).toBe(resultaterFor + 1);
  expect(sesjonerEtter).toBe(sesjonerFor + 1);
});
