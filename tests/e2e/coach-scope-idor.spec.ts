/**
 * E2E: coach-scope / IDOR — utvidelse av i0-selvbetjent-gate.
 *
 * 1) Coach får 404 på fremgang/plan for selvbetjent (PLATFORM_ONLY)
 * 2) Uautentisert /api/admin/reports og /api/admin/search → 401/403
 * 3) Uautentisert /api/ai-plan/generate → 403
 *
 * Krever samme seed som i0 (coachtest + selvbetjent fixture) der det trengs.
 */

import { readFileSync } from "node:fs";
import { test, expect } from "./_test";
import { coachCredentials, loginAsCoach } from "./_auth-helpers";

const coach = coachCredentials();
const FIXTURE_PATH = "tmp/e2e-fixtures.json";

function finnSelvbetjentSpillerId(): string | null {
  if (process.env.E2E_UNCOACHED_PLAYER_ID) return process.env.E2E_UNCOACHED_PLAYER_ID;
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
    test.skip(!coach, "Krever SCREENTEST_PASSWORD");
    test.skip(!selvbetjentId, "Krever seed: npx tsx scripts/seed-platform-only-player.ts");

    await loginAsCoach(page);

    for (const rute of [
      `/admin/spillere/${selvbetjentId}/fremgang`,
      `/admin/spillere/${selvbetjentId}/plan`,
    ]) {
      const respons = await page.goto(rute);
      // Next streams not-found pages with HTTP 200 after headers were sent.
      expect([200, 404]).toContain(respons?.status());
      await expect(page.getByText("Denne siden finnes ikke", { exact: true })).toBeVisible();
      await expect(page.getByText("Testspiller 02", { exact: true })).toHaveCount(0);
    }
  });
});
