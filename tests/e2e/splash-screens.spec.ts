/**
 * Smoke 18: Minst én apple-splash-skjerm returnerer 200.
 */

import { test, expect } from "@playwright/test";

const SPLASH_SCREENS = [
  "/splash/apple-splash-1170-2532.png",
  "/splash/apple-splash-1179-2556.png",
  "/splash/apple-splash-1290-2796.png",
  "/splash/apple-splash-1668-2388.png",
  "/splash/apple-splash-828-1792.png",
] as const;

test.describe("Apple splash screens", () => {
  test("minst én splash-screen er tilgjengelig", async ({ request }) => {
    const results = await Promise.all(
      SPLASH_SCREENS.map(async (path) => {
        const res = await request.get(path);
        return { path, status: res.status() };
      }),
    );

    const ok = results.filter((r) => r.status === 200);
    expect(
      ok.length,
      `Ingen splash-skjermer returnerer 200. Status: ${JSON.stringify(results)}`,
    ).toBeGreaterThan(0);
  });
});
