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

  test("Priser-side er tilgjengelig hvis den finnes (skip ved 404)", async ({ page }) => {
    const res = await page.goto("/priser");
    test.skip(res?.status() === 404, "/priser eksisterer ikke ennå");
    await expect(page.locator("main")).toContainText(/pris|kr|pro/i);
  });

  test("Booking-landing returnerer 200", async ({ page }) => {
    const res = await page.goto("/booking");
    expect(res?.status()).toBe(200);
    // Booking kan være pauset eller live — godta begge.
    await expect(page.locator("main")).toContainText(
      /Pro-time|Trackman|Gruppe|book|pauset/i,
    );
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
