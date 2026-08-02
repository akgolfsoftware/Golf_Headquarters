/**
 * Pilot-smoke: opptak + Før/Etter-tråd (AgencyOS).
 *
 * Uten credentials: sjekker at beskyttede ruter redirecter til login
 * (ingen 500/404).
 * Med coach-credentials (E2E_COACH_* eller SCREENTEST_PASSWORD): røyktest
 * av recording-UI, godkjenninger og Før-kort på spillerdashboard.
 *
 * Kjør: npm run test:e2e:pilot
 */

import { test, expect } from "@playwright/test";
import {
  dismissCookieBanner,
  hasCoachAuth,
  loginAsCoach,
} from "./_auth-helpers";

const PILOT_GATED = [
  "/admin/recording",
  "/admin/godkjenninger",
  "/admin/spillere",
] as const;

test.describe("Pilot-smoke — uinnlogget", () => {
  for (const route of PILOT_GATED) {
    test(`uinnlogget ${route} → /auth/login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  }
});

test.describe("Pilot-smoke — coach (krever E2E_COACH_*)", () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(
      !hasCoachAuth(),
      "Krever E2E_COACH_* eller SCREENTEST_PASSWORD i .env.local",
    );
  });

  test("recording-side: spiller-valg og start-flyt rendrer", async ({
    page,
  }) => {
    await loginAsCoach(page);

    const res = await page.goto("/admin/recording");
    await dismissCookieBanner(page);
    const status = res?.status() ?? 0;
    expect(
      status === 200 || (status >= 300 && status < 400),
      `/admin/recording lastet med ${status}`,
    ).toBeTruthy();
    await expect(page).not.toHaveURL(/\/auth\/login/);
    await expect(page.locator("body")).not.toContainText(
      /Application error|Internal Server Error/i,
    );

    // Stabil copy fra AdminRecordingV2 + RecordingControls
    await expect(page.locator("body")).toContainText(/Lytter|Opptak|spiller/i);
    await expect(page.getByText("Spiller", { exact: true }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator("select")).toBeVisible();
    await expect(page.locator("select")).toContainText(/Velg spiller/i);

    // Start-knapp finnes bare når valgt spiller har samtykke GITT.
    // Uten valg: enten knapp synlig (tom state) eller samtykke-panel etter valg.
    const body = page.locator("body");
    await expect(body).toContainText(
      /Start opptak|samtykke|Ingen spillere|Historikk/i,
    );
  });

  test("godkjenninger: side laster uten krasj", async ({ page }) => {
    await loginAsCoach(page);

    const res = await page.goto("/admin/godkjenninger");
    await dismissCookieBanner(page);
    const status = res?.status() ?? 0;
    expect(
      status === 200 || (status >= 300 && status < 400),
      `/admin/godkjenninger lastet med ${status}`,
    ).toBeTruthy();
    await expect(page).not.toHaveURL(/\/auth\/login/);
    await expect(page.locator("body")).not.toContainText(
      /Application error|Internal Server Error/i,
    );

    // Tom kø eller saker — begge er gyldig. «Løst · sjekkpunkt» bare når det finnes.
    await expect(page.locator("body")).toContainText(
      /Godkjenning|Køen er tom|saker venter|sak venter|sjekkpunkt|Løst/i,
    );
  });

  test("spillerdashboard: Før-kort (sjekkpunkt) vises eller tom-tekst", async ({
    page,
  }) => {
    await loginAsCoach(page);

    await page.goto("/admin/spillere");
    await dismissCookieBanner(page);
    await expect(page).not.toHaveURL(/\/auth\/login/);
    await expect(page.locator("body")).not.toContainText(
      /Application error|Internal Server Error/i,
    );

    // Første spillerprofil-lenke (ikke workbench / ny)
    const spillerLenke = page
      .locator(
        'a[href^="/admin/spillere/"]:not([href$="/ny"]):not([href*="workbench"])',
      )
      .first();

    const count = await spillerLenke.count();
    test.skip(count === 0, "Ingen spillere i stallen — kan ikke sjekke Før-kort");

    const href = await spillerLenke.getAttribute("href");
    // Naviger direkte — mer stabilt enn click under overlay/layout-shift
    await page.goto(href ?? "/admin/spillere");
    await dismissCookieBanner(page);

    await expect(page).toHaveURL(/\/admin\/spillere\/[^/]+/);
    await expect(page.locator("body")).not.toContainText(
      /Application error|Internal Server Error/i,
    );

    // SpillerDashboardV2: enten aktivt Før-kort eller ærlig tom-tilstand
    await expect(page.locator("body")).toContainText(
      /Før neste økt|Ingen godkjent sjekkpunkt|sjekkpunkt/i,
      { timeout: 15_000 },
    );
  });
});
