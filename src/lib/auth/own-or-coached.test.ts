/**
 * R-E/R1-R3 (2026-09-11): `canAccessPlayer` er den DELTE eierskaps-primitiven
 * bak alle tre øktmodellenes live-/gjennomføringstilgang — TrainingSessionV2
 * (`live/[sessionId]/actions.ts` sin `loadLiveSession`), WorkbenchSession og
 * eldre TrainingPlanSession (begge via `tapper/actions.ts` sin
 * `ownerId = plan?.plan.userId ?? wb?.playerId` + samme `canAccessPlayer`-kall).
 * Én riktig/gal test her er derfor representativ for alle tre reisene sin
 * "avvis uvedkommende spiller/coach"-kontroll, uavhengig av hvilken
 * øktmodell URL-en peker på.
 *
 * Fullt logget inn ende-til-ende Playwright for R1-R3 er IKKE kjørt i denne
 * økten — se kontrollrapporten (docs/beslutningsgrunnlag/) for hvorfor.
 * Denne testen er et selvstendig, reelt bevis på selve tilgangsregelen i
 * koden, ikke en erstatning for den e2e-reisen.
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";

mock.module("@/lib/auth/coached", {
  namedExports: {
    harCoachTilgangTilSpiller: async (viewer: { id: string }, playerId: string) =>
      viewer.id === "coach-a" && playerId === "spiller-1",
  },
});

test("spilleren selv får alltid tilgang til egen økt", async () => {
  const { canAccessPlayer } = await import("./own-or-coached");
  assert.equal(await canAccessPlayer({ id: "spiller-1", role: "PLAYER" }, "spiller-1"), true);
});

test("coach MED reell coach-relasjon får tilgang", async () => {
  const { canAccessPlayer } = await import("./own-or-coached");
  assert.equal(await canAccessPlayer({ id: "coach-a", role: "COACH" }, "spiller-1"), true);
});

test("coach UTEN coach-relasjon til akkurat denne spilleren avvises (IDOR)", async () => {
  const { canAccessPlayer } = await import("./own-or-coached");
  assert.equal(await canAccessPlayer({ id: "coach-b", role: "COACH" }, "spiller-1"), false);
});

test("en ANNEN spiller (feil rolle for coach-veien) avvises fra å se en annens økt", async () => {
  const { canAccessPlayer } = await import("./own-or-coached");
  assert.equal(await canAccessPlayer({ id: "spiller-2", role: "PLAYER" }, "spiller-1"), false);
});

test("ADMIN med reell coach-relasjon (samme harCoachTilgangTilSpiller-kontrakt) får tilgang", async () => {
  const { canAccessPlayer } = await import("./own-or-coached");
  assert.equal(await canAccessPlayer({ id: "coach-a", role: "ADMIN" }, "spiller-1"), true);
});

test("tom/manglende playerId avvises defensivt, uansett viewer", async () => {
  const { canAccessPlayer } = await import("./own-or-coached");
  assert.equal(await canAccessPlayer({ id: "spiller-1", role: "PLAYER" }, ""), false);
});
