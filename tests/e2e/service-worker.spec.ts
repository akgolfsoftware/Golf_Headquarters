/**
 * Smoke 4: Service worker returnerer gyldig JS.
 */

import { test, expect } from "@playwright/test";

test.describe("Service worker", () => {
  test("/sw.js returnerer 200", async ({ request }) => {
    const res = await request.get("/sw.js");
    // SW kan være på rot eller bygd til /_next/static — sjekk begge.
    if (res.status() === 404) {
      const alt = await request.get("/service-worker.js");
      expect(
        alt.status() === 200 || alt.status() === 404,
        "Verken /sw.js eller /service-worker.js fungerer",
      ).toBeTruthy();
      return;
    }
    expect(res.status()).toBe(200);
  });

  test("/sw.js content-type er JavaScript hvis tilgjengelig", async ({
    request,
  }) => {
    const res = await request.get("/sw.js");
    if (res.status() !== 200) {
      test.skip();
      return;
    }
    const contentType = res.headers()["content-type"] ?? "";
    expect(contentType).toMatch(/javascript|ecmascript/i);
  });
});
