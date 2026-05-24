/**
 * Smoke 3: PWA manifest er gyldig.
 */

import { test, expect } from "@playwright/test";

interface Manifest {
  name?: string;
  short_name?: string;
  theme_color?: string;
  background_color?: string;
  icons?: Array<{ src: string; sizes: string; type: string }>;
}

test.describe("PWA manifest", () => {
  test("/manifest.webmanifest returnerer 200 + JSON", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.status()).toBe(200);

    const manifest = (await res.json()) as Manifest;
    expect(manifest.name).toBeTruthy();
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.icons).toBeTruthy();
    expect(manifest.icons?.length ?? 0).toBeGreaterThan(0);
  });

  test("manifest har 192 og 512 ikoner", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    const manifest = (await res.json()) as Manifest;

    const sizes = manifest.icons?.map((i) => i.sizes) ?? [];
    expect(sizes.some((s) => s.includes("192"))).toBeTruthy();
    expect(sizes.some((s) => s.includes("512"))).toBeTruthy();
  });
});
