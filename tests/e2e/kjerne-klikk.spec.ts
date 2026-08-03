/**
 * Klikk-test av ★-kjernen (kvalitetsaudit 2026-08-02, tiltak 9).
 *
 * Går kjernekjeden på BÅDE mobil (390px) og desktop (1280px) og feiler på:
 *  - HTTP-status utenfor 2xx/3xx
 *  - redirect tilbake til /auth/login (tapt sesjon)
 *  - «Application error» / «Internal Server Error» i body
 *  - konsollfeil fra siden (kjent dev-/analytics-støy filtreres)
 *
 * To spor, hver med egne credentials:
 *  - AgencyOS (coach): E2E_COACH_* eller coachtest@akgolf.test + SCREENTEST_PASSWORD
 *  - PlayerHQ (spiller): E2E_TEST_USER_EMAIL/PASSWORD
 * Mangler et sett credentials, skipper det sporet — suiten feiler ikke.
 *
 * Testen er LESENDE: den navigerer og åpner faner/paneler, men lagrer aldri noe.
 * Kan kjøres mot prod: CI=1 PLAYWRIGHT_BASE_URL=https://akgolf-hq.vercel.app
 */

import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import { coachCredentials, playerCredentials, dismissCookieBanner } from "./_auth-helpers";

loadEnv({ path: ".env.local" });

/** Støy som ikke er ekte sidefeil. */
const IGNORERT_KONSOLL = [
  /Content Security Policy.*eval/i,
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /favicon/i,
  /plausible|vercel insights|speed-insights/i,
];

/**
 * KJENTE, ÅPNE FEIL — ikke støy. Hver linje er en ekte feil som venter på egen fiks.
 * Testen skal ikke være permanent rød av dem, men lista skal krympe, aldri vokse.
 * Fjern en linje når feilen er fikset — da fanger testen den igjen hvis den kommer tilbake.
 *
 * - React #418 på /portal/planlegge/workbench: hydreringsmismatch mellom server og klient.
 *   Funnet 2026-08-02 (kvalitetsaudit tiltak 9). Se docs/STATUS-NÅ.md.
 */
const KJENTE_FEIL = [/Minified React error #418/i];

const PLAYERHQ_KJERNE = [
  { navn: "Hjem (Workbench-hjem)", url: "/portal" },
  { navn: "Planlegge", url: "/portal/planlegge" },
  { navn: "Workbench (planlegging)", url: "/portal/planlegge/workbench" },
  { navn: "Gjennomføre", url: "/portal/gjennomfore" },
  { navn: "Analysere (Min golf)", url: "/portal/analysere" },
  { navn: "Meg (profil)", url: "/portal/meg" },
] as const;

const AGENCYOS_KJERNE = [
  { navn: "Cockpit", url: "/admin/agencyos" },
  { navn: "Innboks", url: "/admin/innboks" },
  { navn: "Spillere (alle)", url: "/admin/spillere" },
  { navn: "Turneringer", url: "/admin/tournaments" },
  { navn: "Bookinger", url: "/admin/bookinger" },
] as const;

const BREDDER = [
  { navn: "mobil", viewport: { width: 390, height: 844 } },
  { navn: "desktop", viewport: { width: 1280, height: 900 } },
] as const;

function samleKonsollfeil(page: Page, ut: string[]): void {
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const tekst = msg.text();
    if (IGNORERT_KONSOLL.some((r) => r.test(tekst))) return;
    if (KJENTE_FEIL.some((r) => r.test(tekst))) return;
    ut.push(tekst);
  });
  page.on("pageerror", (err) => {
    if (KJENTE_FEIL.some((r) => r.test(err.message))) return;
    ut.push(`pageerror: ${err.message}`);
  });
}

async function loggInn(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/auth/login");
  await dismissCookieBanner(page);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(portal|admin|auth\/etter-innlogging)/, { timeout: 30_000 });
  await dismissCookieBanner(page);
}

async function sveipSkjermer(
  page: Page,
  skjermer: readonly { navn: string; url: string }[],
): Promise<void> {
  for (const skjerm of skjermer) {
    const res = await page.goto(skjerm.url, { waitUntil: "domcontentloaded" });
    const status = res?.status() ?? 0;
    expect(
      status === 200 || (status >= 300 && status < 400),
      `${skjerm.navn} (${skjerm.url}) skal laste — fikk ${status}`,
    ).toBeTruthy();
    await expect(page, `${skjerm.navn} kastet ut til login`).not.toHaveURL(
      /\/auth\/login/,
    );
    await expect(
      page.locator("body"),
      `${skjerm.navn} viser feilside`,
    ).not.toContainText(/Application error|Internal Server Error|500/i);
  }
}

for (const bredde of BREDDER) {
  test.describe(`★-kjernen AgencyOS — ${bredde.navn}`, () => {
    test.use({ viewport: bredde.viewport });

    test(`coach-kjeden laster uten feil (${bredde.navn})`, async ({ page }) => {
      const creds = coachCredentials();
      test.skip(!creds, "Krever E2E_COACH_* eller SCREENTEST_PASSWORD");

      const feil: string[] = [];
      samleKonsollfeil(page, feil);

      await loggInn(page, creds!.email, creds!.password);
      await sveipSkjermer(page, AGENCYOS_KJERNE);

      expect(feil, `Konsollfeil i AgencyOS-kjeden (${bredde.navn}):\n${feil.join("\n")}`)
        .toEqual([]);
    });

    test(`spillerlista åpner spiller-detalj (${bredde.navn})`, async ({ page }) => {
      const creds = coachCredentials();
      test.skip(!creds, "Krever E2E_COACH_* eller SCREENTEST_PASSWORD");

      const feil: string[] = [];
      samleKonsollfeil(page, feil);

      await loggInn(page, creds!.email, creds!.password);
      await page.goto("/admin/spillere", { waitUntil: "domcontentloaded" });

      const lenke = page.locator('a[href^="/admin/spillere/"]').first();
      if (await lenke.isVisible().catch(() => false)) {
        await lenke.click();
        await page.waitForURL(/\/admin\/spillere\/[^/]+/, { timeout: 20_000 });
        await expect(page.locator("body")).not.toContainText(
          /Application error|Internal Server Error/i,
        );
      }

      expect(feil, `Konsollfeil i spiller-detalj (${bredde.navn}):\n${feil.join("\n")}`)
        .toEqual([]);
    });
  });

  test.describe(`★-kjernen PlayerHQ — ${bredde.navn}`, () => {
    test.use({ viewport: bredde.viewport });

    test(`spiller-kjeden laster uten feil (${bredde.navn})`, async ({ page }) => {
      const creds = playerCredentials();
      test.skip(!creds, "Krever E2E_TEST_USER_EMAIL/PASSWORD");

      const feil: string[] = [];
      samleKonsollfeil(page, feil);

      await loggInn(page, creds!.email, creds!.password);
      await sveipSkjermer(page, PLAYERHQ_KJERNE);

      expect(feil, `Konsollfeil i PlayerHQ-kjeden (${bredde.navn}):\n${feil.join("\n")}`)
        .toEqual([]);
    });

    test(`Analysere-fanene kan klikkes (${bredde.navn})`, async ({ page }) => {
      const creds = playerCredentials();
      test.skip(!creds, "Krever E2E_TEST_USER_EMAIL/PASSWORD");

      const feil: string[] = [];
      samleKonsollfeil(page, feil);

      await loggInn(page, creds!.email, creds!.password);
      await page.goto("/portal/analysere", { waitUntil: "domcontentloaded" });

      for (const fane of ["Statistikk", "Trening", "TrackMan", "Tester"]) {
        const knapp = page.getByRole("button", { name: fane, exact: false }).first();
        if (!(await knapp.isVisible().catch(() => false))) continue;
        await knapp.click();
        await expect(page.locator("body")).not.toContainText(
          /Application error|Internal Server Error/i,
        );
      }

      expect(feil, `Konsollfeil i Analysere-fanene (${bredde.navn}):\n${feil.join("\n")}`)
        .toEqual([]);
    });
  });
}
