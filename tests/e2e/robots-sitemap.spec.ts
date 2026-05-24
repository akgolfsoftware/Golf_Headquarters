/**
 * Smoke 19: robots.txt + sitemap.xml er tilgjengelig hvis de finnes.
 */

import { test, expect } from "@playwright/test";

test.describe("Robots og sitemap", () => {
  test("/robots.txt returnerer 200 eller 404", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect([200, 404]).toContain(res.status());

    if (res.status() === 200) {
      const text = await res.text();
      expect(text.length).toBeGreaterThan(0);
    }
  });

  test("/sitemap.xml returnerer 200 eller 404", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect([200, 404]).toContain(res.status());

    if (res.status() === 200) {
      const text = await res.text();
      expect(text).toContain("<");
    }
  });
});
