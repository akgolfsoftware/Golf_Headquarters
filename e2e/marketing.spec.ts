/**
 * E2E smoke-test: marketing-sidene rendrer og navigasjon funker.
 *
 * Ingen DB-mutasjon. Sjekker bare at sider returnerer 200 og inneholder
 * forventet innhold.
 */

import { test, expect } from "@playwright/test";

test.describe("Marketing", () => {
  test("Forsiden rendrer med hero + CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AK Golf/);
    await expect(page.locator("main")).toContainText(/AK Golf|coaching|spiller/i);
  });

  test("Priser viser 300 kr Pro", async ({ page }) => {
    await page.goto("/priser");
    await expect(page.locator("main")).toContainText(/300\s*kr/i);
  });

  test("Booking-landing viser service-typer", async ({ page }) => {
    await page.goto("/booking");
    await expect(page.locator("main")).toContainText(/Pro-time|Trackman|Gruppe/i);
  });

  test("Vilkår + personvern returnerer 200 (ikke 404)", async ({ page }) => {
    const vilkar = await page.goto("/vilkar");
    expect(vilkar?.status()).toBe(200);
    await expect(page.locator("main")).toContainText(/vilkår|Bruker|tjeneste/i);

    const personvern = await page.goto("/personvern");
    expect(personvern?.status()).toBe(200);
    await expect(page.locator("main")).toContainText(/personvern|behandling/i);
  });

  test("sitemap.xml er gyldig XML", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/booking");
    expect(body).toContain("/vilkar");
  });

  test("robots.txt disallows portal og admin", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Disallow: /portal");
    expect(body).toContain("Disallow: /admin");
  });
});
