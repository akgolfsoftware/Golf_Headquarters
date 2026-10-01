/**
 * E2E: Drop-in booking-flyt (gjest -> Stripe-checkout).
 *
 * Tester at en uautentisert gjest kan navigere til /booking, velge tjeneste,
 * velge tidspunkt og komme seg til checkout-steget. Vi stopper FØR Stripe
 * faktisk åpnes (eller verifiserer redirect mot checkout.stripe.com hvis
 * Stripe-test-nøkler er satt).
 *
 * Full Stripe Checkout kjøres separat med lokal test-DB og ekte Stripe-testmodus.
 * Den dedikerte riggen avviser produksjonsnøkler og feiler ved utelatte prøver.
 */

import { test, expect } from "./_test";

test.describe("Drop-in booking", () => {
  test("/booking viser tilgjengelig bookingvei", async ({ page }) => {
    await page.goto("/booking");
    await expect(page).toHaveTitle(/AK Golf|Booking/i);
    const eksternBooking = page.getByRole("link", { name: "Åpne bookingkalender" });
    if (await eksternBooking.count()) {
      await expect(eksternBooking).toHaveAttribute("href", /^https:\/\//);
    } else {
      await expect(page.locator("main")).toContainText(/Pro-time|Trackman|Coaching|Gruppe|book/i);
    }
  });

  test("Tjenestevalg åpner ledige tider", async ({ page }) => {
    await page.goto("/booking");
    const external = page.getByRole("link", { name: "Åpne bookingkalender" });
    if (await external.count()) {
      // A deliberately paused deployment exposes the external booking path.
      expect(process.env.LOCAL_E2E).not.toBe("1");
      await expect(external).toHaveAttribute("href", /^https:\/\//);
      return;
    }
    const service = page.getByRole("group", { name: "Velg tjeneste", exact: true }).getByRole("button").first();
    await expect(service).toBeVisible();
    await service.click();
    await expect(service).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: "Velg tid", exact: true })).toBeVisible();
    await expect(page.getByText("Henter ledige tider …", { exact: true })).toBeHidden();
    await expect(page.getByText(/Klarte ikke hente ledige tider/)).toHaveCount(0);
  });

  test("Booking-kvittering-side returnerer 200 eller 404 (ikke 500)", async ({ request }) => {
    // Bruker en åpenbart ikke-eksisterende booking-id; vi vil bare se at
    // ruta håndterer det grasiøst, ikke at den krasjer.
    const res = await request.get("/booking/kvittering/non-existent-booking-id");
    expect([200, 404]).toContain(res.status());
  });

  test("Full Stripe-checkout med test-kort 4242", async ({ page }) => {
    test.skip(process.env.LOCAL_STRIPE_E2E !== "1", "Requires the isolated Stripe test-mode runner");
    const { stripeJourney } = await import("../local-users/stripe-journey");
    await stripeJourney(page);
  });
});
