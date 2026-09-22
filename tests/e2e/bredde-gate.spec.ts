/**
 * Bredde-gate (PP-F4 i PIXEL-PERFECT-PLAN-COMPLETE.md): ingen horisontal
 * scroll på iPhone-bredde (390px) over nøkkelrutene.
 *
 * Fanger «innboks-bomben»-klassen (.claude/rules/gotchas.md): grid-kolonner
 * uten min-width:0 som vokser forbi viewporten, first-paint-grids som tegner
 * desktop-kolonner før hydrering, og alt annet som gir sidescroll på mobil.
 *
 * Målingen er `document.documentElement.scrollWidth <= window.innerWidth + 1`
 * (1px subpiksel-toleranse) etter at siden har lastet og layouten har satt seg.
 *
 * To autentiserte spor (samme credentials-modell som kjerne-klikk.spec.ts):
 *  - PlayerHQ (spiller): E2E_TEST_USER_EMAIL/PASSWORD
 *  - AgencyOS (coach): E2E_COACH_* eller coachtest@akgolf.test + SCREENTEST_PASSWORD
 * Mangler credentials, skipper sporet — de offentlige rutene måles alltid.
 *
 * Testen er LESENDE og kan kjøres mot prod:
 *   CI=1 PLAYWRIGHT_BASE_URL=https://akgolf-hq.vercel.app
 */

import { test, expect, type Page } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import { coachCredentials, playerCredentials, dismissCookieBanner } from "./_auth-helpers";

loadEnv({ path: ".env.local" });

const MOBIL = { width: 390, height: 844 };

/**
 * KJENTE, ÅPNE OVERFLYT — ikke støy. Én linje per rute som venter på egen
 * fiks. Lista skal krympe, aldri vokse; fjern linjen når ruten er fikset.
 */
const KJENT_OVERFLYT: string[] = [];

const OFFENTLIG = [
  { navn: "Forside (marketing)", url: "/" },
  { navn: "Innlogging", url: "/auth/login" },
] as const;

const PLAYERHQ = [
  { navn: "Hjem (Workbench-hjem)", url: "/portal" },
  { navn: "Planlegge", url: "/portal/planlegge" },
  { navn: "Workbench (planlegging)", url: "/portal/planlegge/workbench" },
  { navn: "Gjennomføre", url: "/portal/gjennomfore" },
  { navn: "Analysere (Min golf)", url: "/portal/analysere" },
  { navn: "Meg (profil)", url: "/portal/meg" },
] as const;

const AGENCYOS = [
  { navn: "Cockpit", url: "/admin/agencyos" },
  { navn: "Innboks", url: "/admin/innboks" },
  { navn: "Spillere (alle)", url: "/admin/spillere" },
  { navn: "Turneringer", url: "/admin/tournaments" },
  { navn: "Bookinger", url: "/admin/bookinger" },
] as const;

/**
 * Team Norway. Ruter uten egen parameter — de som krever gruppe-id eller
 * spiller-id måles gjennom oversiktens lenker, ikke med gjettede id-er.
 * Alle går gjennom samme TnShell etter 22.09.2026, så en overflyt her er
 * enten i skallet eller i skjermens eget innhold.
 */
const TEAM_NORWAY = [
  { navn: "TN Oversikt", url: "/team-norway" },
  { navn: "TN Fellestesting", url: "/team-norway/fellestesting" },
  { navn: "TN Samlingspunkt", url: "/team-norway/samlinger" },
  { navn: "TN Collegegruppen", url: "/team-norway/college" },
  { navn: "TN Månedsplan", url: "/team-norway/manedsplan" },
  { navn: "TN Spillerutvikling", url: "/team-norway/spillere" },
  { navn: "TN Uttaksliste", url: "/team-norway/uttak" },
  { navn: "TN Rangliste", url: "/team-norway/rangliste" },
  { navn: "TN Skoleoversikt", url: "/team-norway/skoler" },
  { navn: "TN Testprotokoller", url: "/team-norway/protokoller" },
  { navn: "TN Turneringer", url: "/team-norway/turneringer" },
  { navn: "TN Referansenivåer", url: "/team-norway/referansenivaer" },
  { navn: "TN Trenere og tilgang", url: "/team-norway/tilgang" },
  { navn: "TN Inviter spiller", url: "/team-norway/inviter" },
  { navn: "TN Trenerkatalog", url: "/team-norway/apparatet" },
] as const;

async function loggInn(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/auth/login");
  await dismissCookieBanner(page);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(portal|admin|auth\/etter-innlogging)/, { timeout: 30_000 });
  await dismissCookieBanner(page);
}

async function målBredde(
  page: Page,
  skjermer: readonly { navn: string; url: string }[],
): Promise<void> {
  for (const skjerm of skjermer) {
    if (KJENT_OVERFLYT.includes(skjerm.url)) continue;
    await page.goto(skjerm.url, { waitUntil: "load" });
    // La layouten sette seg (fonter, hydrering) før måling — to rAF-runder.
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    const { scrollW, innerW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    }));
    expect(
      scrollW,
      `${skjerm.navn} (${skjerm.url}) har horisontal overflyt: scrollWidth ${scrollW} > innerWidth ${innerW}`,
    ).toBeLessThanOrEqual(innerW + 1);
  }
}

test.describe("Bredde-gate 390px — offentlige ruter", () => {
  test.use({ viewport: MOBIL });

  test("offentlige ruter har ingen horisontal scroll", async ({ page }) => {
    await page.goto("/");
    await dismissCookieBanner(page);
    await målBredde(page, OFFENTLIG);
  });
});

test.describe("Bredde-gate 390px — PlayerHQ", () => {
  test.use({ viewport: MOBIL });

  test("spiller-kjernen har ingen horisontal scroll", async ({ page }) => {
    const creds = playerCredentials();
    test.skip(!creds, "Krever E2E_TEST_USER_EMAIL/PASSWORD");
    await loggInn(page, creds!.email, creds!.password);
    await målBredde(page, PLAYERHQ);
  });
});

test.describe("Bredde-gate 390px — AgencyOS", () => {
  test.use({ viewport: MOBIL });

  test("coach-kjernen har ingen horisontal scroll", async ({ page }) => {
    const creds = coachCredentials();
    test.skip(!creds, "Krever E2E_COACH_* eller SCREENTEST_PASSWORD");
    await loggInn(page, creds!.email, creds!.password);
    await målBredde(page, AGENCYOS);
  });
});

test.describe("Bredde-gate 390px — Team Norway", () => {
  test.use({ viewport: MOBIL });

  test("Team Norway-flaten har ingen horisontal scroll", async ({ page }) => {
    const creds = coachCredentials();
    test.skip(!creds, "Krever E2E_COACH_* eller SCREENTEST_PASSWORD");
    await loggInn(page, creds!.email, creds!.password);
    await målBredde(page, TEAM_NORWAY);
  });
});
