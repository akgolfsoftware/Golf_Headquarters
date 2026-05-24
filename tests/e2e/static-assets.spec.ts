/**
 * Smoke 16: Faviconer og apple-touch-icon eksisterer.
 */

import { test, expect } from "@playwright/test";

const STATIC_ASSETS = [
  "/favicon-32.png",
  "/favicon-16.png",
  "/apple-touch-icon.png",
] as const;

test.describe("Statiske assets", () => {
  for (const asset of STATIC_ASSETS) {
    test(`${asset} returnerer 200`, async ({ request }) => {
      const res = await request.get(asset);
      expect(res.status()).toBe(200);
    });
  }
});
