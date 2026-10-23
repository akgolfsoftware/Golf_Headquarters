/**
 * TrackMan-import for Team Norway-trener (§TRACKMAN I TEAM NORWAY-TESTENE punkt 3 og 7, Anders 22.10.2026):
 * treneren kan importere for en spiller som har delt, og avvises for en som ikke har delt. Import uten TEK eller
 * SLAG avvises. Prisma, auth og delingssjekken er mocket — ingen ekte database.
 */
import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

const TRENER = { id: "trener-a", name: "Eva Lie", role: "COACH" };
const DELT = "spiller-delt";
const IKKE_DELT = "spiller-ikke-delt";

let opprettet: Record<string, unknown> | null = null;
let planLest = false;

mock.module("@/lib/auth/requireConsentingUser", { namedExports: { requireConsentingUser: async () => TRENER } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/agents/triggers", { namedExports: { triggerTrackManAgent: async () => {} } });
mock.module("@/lib/teknisk-plan/update-tm-goals", { namedExports: { updateTmGoalsFromSessionAggregate: async () => 0 } });
mock.module("@/lib/teknisk-plan/match-shot", {
  namedExports: {
    loadMatchPlan: async () => { planLest = true; return null; },
    matchShotAgainstPlan: () => ({ taskId: null, matchSource: null, matchConfidence: null }),
  },
});
mock.module("@/lib/trackman/parse-photo", { namedExports: { parseTrackManPhoto: async () => [] } });
mock.module("@/lib/domain/tn-trener-skriv", { namedExports: { tnTrenerKanSkriveFor: async (_b: unknown, id: string) => id === DELT } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      // Ingen AK-coach-relasjon: bare Team Norway-delingen kan slippe treneren inn.
      user: { findFirst: async () => null },
      trackManSession: {
        findFirst: async () => null,
        create: async ({ data }: { data: Record<string, unknown> }) => { opprettet = data; return { id: "tm-okt-1" }; },
      },
      trackManShot: { createMany: async () => ({ count: 1 }) },
    },
  },
});

const slag = { club: "Driver", clubSpeedMps: 50, ballSpeedMps: 72, smashFactor: 1.44, carryMeters: 230, totalMeters: 250, launchAngleDeg: 12, spinRateRpm: 2600, sideMeters: 4, notes: null };
const input = (onBehalfOfUserId: string, akse?: "TEK" | "SLAG") => ({
  format: "photo" as const, content: "", photoShots: [slag], recordedAt: "2026-10-22", environment: "SIMULATOR_INDOOR" as const, onBehalfOfUserId, akse, forceImport: true,
});

beforeEach(() => { opprettet = null; planLest = false; });

test("trener importerer for en spiller som har delt, med akse, uten å røre den tekniske planen", async () => {
  const { importTrackMan } = await import("./actions");
  const r = await importTrackMan(input(DELT, "SLAG"));
  assert.deepEqual(r.sessionIds, ["tm-okt-1"]);
  assert.equal(opprettet?.userId, DELT);
  assert.equal(opprettet?.akse, "SLAG");
  assert.equal(planLest, false);
});

test("trener avvises for en spiller som ikke har delt", async () => {
  const { importTrackMan } = await import("./actions");
  await assert.rejects(() => importTrackMan(input(IKKE_DELT, "TEK")), /Spiller ikke funnet/);
  assert.equal(opprettet, null);
});

test("import uten TEK eller SLAG avvises", async () => {
  const { importTrackMan } = await import("./actions");
  await assert.rejects(() => importTrackMan(input(DELT)), /TEK eller SLAG/);
  assert.equal(opprettet, null);
});
