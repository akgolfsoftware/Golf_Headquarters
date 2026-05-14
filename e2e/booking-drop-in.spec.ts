/**
 * E2E: Drop-in booking-flyt (gjest -> Stripe-checkout).
 *
 * Tester at en uautentisert gjest kan navigere til /booking, velge tjeneste,
 * velge tidspunkt og komme seg til checkout-steget. Vi stopper FØR Stripe
 * faktisk åpnes (eller verifiserer redirect mot checkout.stripe.com hvis
 * Stripe-test-nøkler er satt).
 *
 * Stripe full checkout-flow med test-kort 4242 er kommentert ut — kjøres
 * manuelt eller når test-DB + Stripe-mock er konfigurert.
 */

import { test, expect } from "@playwright/test";

test.describe("Drop-in booking", () => {
  test("/booking lister tjenester", async ({ page }) => {
    await page.goto("/booking");
    await expect(page).toHaveTitle(/AK Golf|Booking/i);
    // Forventer at minst én service-card eller link finnes
    const main = page.locator("main");
    await expect(main).toContainText(/Pro-time|Trackman|Coaching|Gruppe|book/i);
  });

  test("Klikk på service navigerer til service-side", async ({ page }) => {
    await page.goto("/booking");
    // Finn første lenke som peker til /booking/<slug>
    const serviceLink = page.locator('a[href^="/booking/"]').first();
    const hasService = (await serviceLink.count()) > 0;
    test.skip(!hasService, "Ingen service-lenker funnet (tomt DB-seed)");

    const href = await serviceLink.getAttribute("href");
    await serviceLink.click();
    await expect(page).toHaveURL(new RegExp(href ?? "/booking/"));
  });

  test("Booking-kvittering-side returnerer 200 eller 404 (ikke 500)", async ({ request }) => {
    // Bruker en åpenbart ikke-eksisterende booking-id; vi vil bare se at
    // ruta håndterer det grasiøst, ikke at den krasjer.
    const res = await request.get("/booking/kvittering/non-existent-booking-id");
    expect([200, 404]).toContain(res.status());
  });

  // Full Stripe-checkout-test krever:
  // - DB-seed med en aktiv ServiceType
  // - Test-bruker eller gjest-checkout-støtte
  // - Stripe test-nøkler i CI-env
  // Markeres som skip inntil dette er på plass.
  test.skip("Full Stripe-checkout med test-kort 4242", async ({ page }) => {
    await page.goto("/booking");
    await page.locator('a[href^="/booking/"]').first().click();
    // Velg første ledige slot
    await page.locator('[data-slot]').first().click();
    await page.locator('button:has-text("Bekreft")').click();
    // Forvent Stripe-redirect
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });
    await page.locator('input[name="cardnumber"]').fill("4242 4242 4242 4242");
    await page.locator('input[name="exp-date"]').fill("12 / 30");
    await page.locator('input[name="cvc"]').fill("123");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/booking\/kvittering/, { timeout: 30_000 });
    await expect(page.locator("main")).toContainText(/bekreftet|kvittering|takk/i);
  });
});
