/**
 * E2E: de NYE tilgangsflatene (16.08) avviser uinnloggede.
 *
 * Dekker rutene fra integrasjonen som ingen spec traff fra før — først og
 * fremst `/innsyn` (T8, ekstern lesetilgang), som er den eneste flaten i
 * appen der en bruker UTENFOR klubben ser data om andres barn. At den
 * redirecter uinnlogget er minstekravet, og det er billig å verifisere.
 *
 * Disse testene krever verken innlogging eller DB-state, så de kjører også
 * i CI der `E2E_TEST_USER_*` ikke finnes. Alt som krever en innlogget
 * GUEST med capability + samtykkerader står i docs/testing.md
 * §Manuell verifisering av tilgangsflytene 16.08 — bevisst manuelt, ikke
 * som en spec som skipper stille og ser ut som dekning.
 *
 * Guard-arbeidsdelingen (src/proxy.ts): proxyen stopper KUN uautentiserte.
 * Selve capability-sjekken bor i `src/app/innsyn/layout.tsx`. Denne fila
 * tester derfor proxy-laget; capability-laget dekkes av
 * `src/lib/__tests__/tilgang/admin-capability-kontrakt.test.ts`.
 */

import { test, expect } from "@playwright/test";

/** Nye flater fra 16.08 som alle skal kreve innlogging. */
const NYE_GATEDE_RUTER = [
  // T8 — ekstern lesetilgang (ekstern leser ser delte data om spillere).
  "/innsyn",
  // T8 — per-spiller-visningen. Egen IDOR-sjekk i page.tsx i tillegg.
  "/innsyn/vilkarlig-spiller-id",
  // A3/T2 — oppgraderingsveien for låst profil.
  "/portal/oppgrader",
  // A1/A2 — abonnement v2.
  "/portal/meg/abonnement",
  // G5/G6 — gruppeflater og per-trener-tilgang.
  "/admin/grupper",
  "/admin/settings/tilgang",
  "/admin/tester/foreslatte",
] as const;

test.describe("Nye tilgangsflater krever innlogging", () => {
  for (const rute of NYE_GATEDE_RUTER) {
    test(`uinnlogget ${rute} → /auth/login`, async ({ page }) => {
      await page.goto(rute);
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  }

  test("/innsyn tar vare på hvor brukeren skulle (next-parameter)", async ({ page }) => {
    // proxy.ts setter ?next=<path> så innloggingen kan sende brukeren
    // tilbake. Uten den lander en ekstern leser på /admin eller /portal
    // etter innlogging — flater vedkommende ikke har tilgang til.
    await page.goto("/innsyn");
    await expect(page).toHaveURL(/[?&]next=%2Finnsyn/);
  });

  test("/innsyn lekker ikke spillerdata i responsen før innlogging", async ({ page }) => {
    // Selve poenget med flaten er andres (ofte mindreåriges) data. En
    // redirect som likevel rakk å rendre innholdet ville vært verdiløs.
    const svar = await page.goto("/innsyn");
    expect(svar, "ingen respons fra /innsyn").not.toBeNull();
    const kropp = await page.content();
    expect(kropp).not.toContain("Testresultater");
    expect(kropp).not.toContain("Delt med deg");
  });
});
