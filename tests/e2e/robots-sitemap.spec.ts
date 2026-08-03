/**
 * Smoke 19: robots.txt + sitemap.xml.
 *
 * Strenge assertions flyttet inn fra gamle e2e/marketing.spec.ts (2026-08-03):
 * begge filene SKAL finnes, sitemap skal være gyldig XML med kjerneruter,
 * og robots skal holde crawlere unna portal/admin.
 */

import { test, expect } from "@playwright/test";

test.describe("Robots og sitemap", () => {
  test("sitemap.xml er gyldig XML med kjerneruter", async ({ request }) => {
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
