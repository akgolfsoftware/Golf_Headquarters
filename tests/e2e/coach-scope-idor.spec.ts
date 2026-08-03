/**
 * E2E: coach-scope / IDOR — utvidelse av i0-selvbetjent-gate.
 *
 * 1) Coach får 404 på fremgang/plan for selvbetjent (PLATFORM_ONLY)
 * 2) Uautentisert /api/admin/reports og /api/admin/search → 401/403
 * 3) Uautentisert /api/ai-plan/generate → 403
 *
 * Krever samme seed som i0 (coachtest + selvbetjent fixture) der det trengs.
 */

import "../../scripts/_env";
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

const COACH_EMAIL = "coachtest@akgolf.test";
const COACH_PASSWORD = process.env.SCREENTEST_PASSWORD ?? "";
const FIXTURE_PATH = "tmp/e2e-fixtures.json";

function finnSelvbetjentSpillerId(): string | null {
  try {
    const raw = readFileSync(FIXTURE_PATH, "utf-8");
    const data = JSON.parse(raw) as { selvbetjentSpillerId?: string };
    return data.selvbetjentSpillerId ?? null;
  } catch {
    return null;
  }
}

test.describe("Coach-scope IDOR — sider og API", () => {
  test("uautentisert admin-API er stengt", async ({ request }) => {
    const reports = await request.get("/api/admin/reports/spillere");
    expect([401, 403]).toContain(reports.status());

    const search = await request.get("/api/admin/search?q=test");
    expect([401, 403]).toContain(search.status());

    const ai = await request.post("/api/ai-plan/generate", {
      data: { userId: "x", brukerPrompt: "lag en plan for uke" },
    });
    expect([401, 403]).toContain(ai.status());
  });

  test("coach: selvbetjent spiller 404 på fremgang og plan", async ({ page }) => {
    const selvbetjentId = finnSelvbetjentSpillerId();
    test.skip(!COACH_PASSWORD, "Krever SCREENTEST_PASSWORD");
    test.skip(!selvbetjentId, "Krever seed: npx tsx scripts/seed-platform-only-player.ts");

    await page.goto("/auth/login");
    await page.locator('input[type="email"]').fill(COACH_EMAIL);
    await page.locator('input[type="password"]').fill(COACH_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/admin/, { timeout: 15_000 });

    for (const rute of [
      `/admin/spillere/${selvbetjentId}/fremgang`,
      `/admin/spillere/${selvbetjentId}/plan`,
    ]) {
      const respons = await page.goto(rute);
      expect(respons?.status(), `${rute} skal være 404`).toBe(404);
    }
  });
});
