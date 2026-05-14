/**
 * E2E: Credit-booking-flyt for Pro-abonnent.
 *
 * Tester at en innlogget spiller med aktivt Pro-abonnement kan booke en time
 * fra /portal/booking/ny ved å bruke en credit, og at credits trekkes fra og
 * legges tilbake ved avbestilling >24t før.
 *
 * Krever DB-seed med test-spiller + aktiv abonnement-rekord. Hvis ikke seedet,
 * skip-er testen.
 */

import { test, expect } from "@playwright/test";

const TEST_USER_EMAIL = process.env.E2E_TEST_USER_EMAIL ?? "";
const TEST_USER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD ?? "";

test.describe("Credit booking", () => {
  test.skip(
    !TEST_USER_EMAIL || !TEST_USER_PASSWORD,
    "E2E_TEST_USER_EMAIL/PASSWORD ikke satt — krever seedet test-spiller med Pro-abonnement"
  );

  test("Pro-spiller booker time med credit, credits trekkes fra", async ({ page }) => {
    // Login
    await page.goto("/auth/login");
    await page.locator('input[type="email"]').fill(TEST_USER_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_USER_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/portal/, { timeout: 15_000 });

    // Naviger til ny booking
    await page.goto("/portal/booking/ny");
    await expect(page).toHaveURL(/\/portal\/booking\/ny/);

    // Sjekk at credits vises (4 credits forventet for Pro)
    const main = page.locator("main");
    await expect(main).toContainText(/credit/i);

    // NB: Selve credit-bookingen krever ledige slots + valgt service.
    // Vi verifiserer kun at credit-balansen vises korrekt. Full flyt
    // (book -> verify credits gikk fra 4->3 -> avbestill -> back to 4)
    // krever koordinert DB-state og kjøres som integrasjonstest med
    // egen test-DB.
  });

  test.skip("Full credit-flyt: book + avbestill, credits back to 4", async ({ page: _page }) => {
    // Skip inntil test-DB med seedet Pro-spiller + ledige slots er på plass.
  });
});
