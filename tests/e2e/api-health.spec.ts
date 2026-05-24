/**
 * Smoke 12: /api/health returnerer 200 + status-objekt.
 */

import { test, expect } from "@playwright/test";

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

test.describe("API health", () => {
  test("/api/health returnerer 200 + status ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);

    const body = (await res.json()) as HealthResponse;
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeTruthy();
    expect(typeof body.uptime).toBe("number");
  });
});
