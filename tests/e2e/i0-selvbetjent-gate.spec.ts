/**
 * E2E: I0 — tilgangsskillet selvbetjent/coachet (lib/auth/coached.ts).
 *
 * En selvbetjent (PLATFORM_ONLY) spiller har ingen coach-relasjon og skal
 * være usynlig i hele AgencyOS — også ved direkte URL-gjetting av en coach.
 * `coachScopedPlayerWhere()` skal gi notFound() på spiller-360, analyse og
 * coach-Workbench, og spilleren skal ikke dukke opp i stall-lista.
 *
 * Krever den seedede testspilleren fra scripts/seed-platform-only-player.ts
 * (kjør den først: npx tsx scripts/seed-platform-only-player.ts) og
 * coach-innlogging (coachtest@akgolf.test / SCREENTEST_PASSWORD i .env.local,
 * seedet av scripts/seed-screentest-coach.ts). Uten begge: testen hoppes over.
 */

import { readFileSync } from "node:fs";
import { test, expect } from "./_test";
import { coachCredentials, loginAsCoach } from "./_auth-helpers";

const coach = coachCredentials();

// Skrevet av scripts/seed-platform-only-player.ts — unngår å importere den
// genererte Prisma-klienten direkte i en Playwright-spec (transformen klarer
// ikke parse den filen).
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

test.describe("I0 — selvbetjent spiller usynlig i AgencyOS", () => {
  let selvbetjentId: string | null = null;

  test.beforeAll(() => {
    selvbetjentId = finnSelvbetjentSpillerId();
  });

  test("coach kan ikke åpne selvbetjent spiller via direkte URL (spiller-360/analyse/workbench)", async ({
    page,
  }) => {
    test.skip(
      !coach,
      "Krever SCREENTEST_PASSWORD i .env.local (seedet coach: coachtest@akgolf.test)",
    );
    test.skip(
      !selvbetjentId,
      "Krever seedet selvbetjent testspiller — kjør: npx tsx scripts/seed-platform-only-player.ts",
    );

    // Logg inn som coach.
    await loginAsCoach(page);

    const gatedeRuter = [
      `/admin/spillere/${selvbetjentId}`,
      `/admin/spillere/${selvbetjentId}/analyse`,
      `/admin/spillere/${selvbetjentId}/workbench`,
    ];

    for (const rute of gatedeRuter) {
      const respons = await page.goto(rute);
      // Next streams not-found pages with HTTP 200 after headers were sent.
      expect([200, 404]).toContain(respons?.status());
      await expect(page.getByText("Denne siden finnes ikke", { exact: true })).toBeVisible();
      await expect(page.getByText("Testspiller 02", { exact: true })).toHaveCount(0);
      await expect(
        page.getByText("Denne siden finnes ikke"),
        `${rute} skal vise AgencyOS' 404-side, ikke spillerdata`,
      ).toBeVisible();
    }
  });

  test("selvbetjent spiller vises ikke i stall-lista", async ({ page }) => {
    test.skip(!coach, "Krever SCREENTEST_PASSWORD i .env.local");
    test.skip(!selvbetjentId, "Krever seedet selvbetjent testspiller");

    await loginAsCoach(page);

    await page.goto("/admin/spillere");
    await expect(page.locator('a[href^="/admin/spillere/"]:not([href$="/ny"])').first()).toBeVisible();
    await expect(page.locator(`a[href*="${selvbetjentId}"]`)).toHaveCount(0);
  });
});
