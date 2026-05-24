/**
 * Smoke 17: PWA icons (192, 512, maskable) returnerer 200.
 */

import { test, expect } from "@playwright/test";

const ICONS = [
  "/icon-192.png",
  "/icon-512.png",
  "/icon-192-maskable.png",
  "/icon-512-maskable.png",
] as const;

test.describe("PWA icons", () => {
  for (const icon of ICONS) {
    test(`${icon} returnerer 200 + image/png`, async ({ request }) => {
      const res = await request.get(icon);
      expect(res.status()).toBe(200);
      const contentType = res.headers()["content-type"] ?? "";
      expect(contentType).toContain("image/png");
    });
  }
});
