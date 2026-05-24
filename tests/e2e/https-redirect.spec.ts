/**
 * Smoke 20: HTTPS-headers / sikkerhets-headers er korrekt satt.
 *
 * Lokalt (http://localhost:3000) finnes ikke HSTS. Mot prod (Vercel) skal
 * Strict-Transport-Security være satt. Testen skipper hvis vi kjører lokalt.
 */

import { test, expect } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const isProd = baseURL.startsWith("https://");

test.describe("HTTPS + security headers", () => {
  test("HSTS-header er satt på produksjon", async ({ request }) => {
    test.skip(!isProd, "HSTS testes kun mot HTTPS-deploy");

    const res = await request.get("/");
    const hsts = res.headers()["strict-transport-security"];
    expect(hsts, "HSTS-header mangler").toBeTruthy();
    expect(hsts).toMatch(/max-age=\d+/);
  });

  test("X-Content-Type-Options nosniff er satt", async ({ request }) => {
    const res = await request.get("/");
    const xcto = res.headers()["x-content-type-options"];
    if (!isProd) {
      test.skip();
      return;
    }
    expect(xcto).toBe("nosniff");
  });
});
