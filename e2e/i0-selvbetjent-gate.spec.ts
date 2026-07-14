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

import "../scripts/_env";
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

const COACH_EMAIL = "coachtest@akgolf.test";
const COACH_PASSWORD = process.env.SCREENTEST_PASSWORD ?? "";

// Skrevet av scripts/seed-platform-only-player.ts — unngår å importere den
// genererte Prisma-klienten direkte i en Playwright-spec (transformen klarer
// ikke parse den filen).
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

test.describe("I0 — selvbetjent spiller usynlig i AgencyOS", () => {
  let selvbetjentId: string | null = null;

  test.beforeAll(() => {
    selvbetjentId = finnSelvbetjentSpillerId();
  });

  test("coach kan ikke åpne selvbetjent spiller via direkte URL (spiller-360/analyse/workbench)", async ({
    page,
  }) => {
    test.skip(
      !COACH_PASSWORD,
      "Krever SCREENTEST_PASSWORD i .env.local (seedet coach: coachtest@akgolf.test)",
    );
    test.skip(
      !selvbetjentId,
      "Krever seedet selvbetjent testspiller — kjør: npx tsx scripts/seed-platform-only-player.ts",
    );

    // Logg inn som coach.
    await page.goto("/auth/login");
    await page.locator('input[type="email"]').fill(COACH_EMAIL);
    await page.locator('input[type="password"]').fill(COACH_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/admin/, { timeout: 15_000 });

    const gatedeRuter = [
      `/admin/spillere/${selvbetjentId}`,
      `/admin/spillere/${selvbetjentId}/analyse`,
      `/admin/spillere/${selvbetjentId}/workbench`,
    ];

    for (const rute of gatedeRuter) {
      const respons = await page.goto(rute);
      expect(respons?.status(), `${rute} skal svare 404`).toBe(404);
      await expect(
        page.getByText("Denne siden finnes ikke"),
        `${rute} skal vise AgencyOS' 404-side, ikke spillerdata`,
      ).toBeVisible();
    }
  });

  test("selvbetjent spiller vises ikke i stall-lista", async ({ page }) => {
    test.skip(!COACH_PASSWORD, "Krever SCREENTEST_PASSWORD i .env.local");
    test.skip(!selvbetjentId, "Krever seedet selvbetjent testspiller");

    await page.goto("/auth/login");
    await page.locator('input[type="email"]').fill(COACH_EMAIL);
    await page.locator('input[type="password"]').fill(COACH_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/admin/, { timeout: 15_000 });

    await page.goto("/admin/spillere");
    await expect(page.getByText("Selvbetjent Testspiller")).toHaveCount(0);
  });
});
