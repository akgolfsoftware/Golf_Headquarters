/**
 * Smoke 1: Alle 10 hovedruter returnerer 200 eller 307 (auth-redirect).
 *
 * Verifiserer at ingen kritiske ruter er ødelagt (500/404 på alt).
 */

import { test, expect } from "@playwright/test";
import { gotoAndWait } from "./_helpers";

const ROUTES = [
  "/",
  "/booking",
  "/coacher",
  "/coaching",
  "/priser",
  "/om-oss",
  "/kontakt",
  "/portal",
  "/admin",
  "/auth/login",
] as const;

test.describe("Hovedruter rendrer", () => {
  for (const route of ROUTES) {
    test(`${route} returnerer 200 eller redirect`, async ({ page }) => {
      const res = await gotoAndWait(page, route);
      const status = res?.status() ?? 0;
      // Godta 200, 3xx (redirect), eller 304 (cached)
      const ok = status === 200 || (status >= 300 && status < 400);
      expect(
        ok,
        `Forventet 2xx/3xx på ${route}, fikk ${status}`,
      ).toBeTruthy();
    });
  }
});
