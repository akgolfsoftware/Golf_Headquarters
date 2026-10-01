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

import { creditJourney } from "../local-users/credit-journey";
import { test, expect } from "./_test";
import { loginAsPlayer } from "./_auth-helpers";

const TEST_USER_EMAIL = process.env.E2E_TEST_USER_EMAIL ?? "";
const TEST_USER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD ?? "";

test.describe("Credit booking", () => {
  test.skip(
    !TEST_USER_EMAIL || !TEST_USER_PASSWORD,
    "E2E_TEST_USER_EMAIL/PASSWORD ikke satt — krever seedet test-spiller med Pro-abonnement"
  );

  test("Spiller med coachingpakke ser saldo og tjenester", async ({ page }) => {
    // Login
    await loginAsPlayer(page);

    // Naviger til ny booking
    await page.goto("/portal/booking/ny");
    await expect(page).toHaveURL(/\/portal\/booking\/ny/);

    // Sjekk at credits vises (4 credits forventet for Pro)
    await expect(page.getByText("4 av 4 timer igjen denne måneden. Velg tjeneste og tid på ett sted.", { exact: true })).toBeVisible();
    await expect(page.locator('a[href^="/portal/booking/ny?service="]').first()).toBeVisible();

    // NB: Selve credit-bookingen krever ledige slots + valgt service.
    // Vi verifiserer kun at credit-balansen vises korrekt. Full flyt
    // (book -> verify credits gikk fra 4->3 -> avbestill -> back to 4)
    // krever koordinert DB-state og kjøres som integrasjonstest med
    // egen test-DB.
  });

  test("Full credit-flyt: book + avbestill, credits back to 4", async ({ page }) => {
    test.skip(process.env.LOCAL_E2E !== "1", "Krever isolert lokal database");
    await creditJourney(page);
  });
});
