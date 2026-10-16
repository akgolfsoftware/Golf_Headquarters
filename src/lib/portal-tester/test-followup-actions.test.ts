import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let tilgang = true;
let resultatFinnes = true;
let status = "DRAFT";
let environment: string | null = "RANGE";
let fasilitetLengde = 3;
let writes = 0;

const bank = [{
  id: "godkjent-putt", type: "DRILL", navn: "kort-putt", beskrivelse: "Putt fra to meter.",
  status: "GODKJENT", minKategori: "K", maxKategori: "A",
  environment: ["RANGE"], fasilitetKrav: ["PUTTING_GREEN_KORT"],
  akFormel: { pyramidArea: "SLAG", omraade: "PUTT_5_10" },
  facilityRequirements: { longestShotM: 2, longestShotKind: "PUTT_ROLL" },
}];

mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => ({ id: "coach-1", role: "COACH" }) },
});
mock.module("@/lib/auth/coached", {
  namedExports: { coachScopedPlayerWhere: () => ({ role: "PLAYER" }) },
});
mock.module("@/lib/masterbrain/drill-bank", {
  namedExports: { hentGodkjenteOvelsesbankElementer: () => bank },
});
mock.module("@/lib/workbench/wb-actions", {
  namedExports: { addDrill: async () => { writes += 1; return { ok: true, data: {} }; } },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: { findFirst: async () => tilgang ? {
        id: "player-1",
        playerFacilities: [{ capabilities: ["PUTTING_GREEN_KORT"], maksPuttLengdeM: fasilitetLengde, rangeLengdeM: null }],
      } : null },
      testResult: { findFirst: async () => resultatFinnes ? {
        id: "result-1", testId: "custom-test", score: 10, details: null,
        test: { id: "custom-test", omraade: "PUTT_5_10" },
      } : null },
      workbenchSession: { findFirst: async () => ({
        id: "session-1", date: new Date("2099-01-01T00:00:00Z"), startMinute: 600,
        status, blockType: "OEKT", environment, drills: [],
      }) },
    },
  },
});

let leggTilOvelseFraTest: typeof import("./test-followup-actions").leggTilOvelseFraTest;
before(async () => {
  ({ leggTilOvelseFraTest } = await import("./test-followup-actions"));
});
beforeEach(() => {
  tilgang = true;
  resultatFinnes = true;
  status = "DRAFT";
  environment = "RANGE";
  fasilitetLengde = 3;
  writes = 0;
});

function form(): FormData {
  const f = new FormData();
  f.set("playerId", "player-1");
  f.set("resultId", "result-1");
  f.set("ovelseId", "godkjent-putt");
  f.set("sessionId", "session-1");
  f.set("durationMinutes", "15");
  return f;
}

test("coach må ha tilgang til spilleren før data eller økt endres", async () => {
  tilgang = false;
  const result = await leggTilOvelseFraTest(form());
  assert.equal(result.ok, false);
  assert.equal(writes, 0);
});

test("manglende testresultat eller avsluttet økt stopper planendring", async () => {
  resultatFinnes = false;
  assert.equal((await leggTilOvelseFraTest(form())).ok, false);
  resultatFinnes = true;
  status = "PUBLISHED";
  assert.equal((await leggTilOvelseFraTest(form())).ok, false);
  assert.equal(writes, 0);
});

test("manglende fasilitetslengde stopper planendring", async () => {
  fasilitetLengde = 1;
  assert.equal((await leggTilOvelseFraTest(form())).ok, false);
  assert.equal(writes, 0);
});

test("økt uten kjent treningssted stopper planendring", async () => {
  environment = null;
  assert.equal((await leggTilOvelseFraTest(form())).ok, false);
  assert.equal(writes, 0);
});

test("gyldig coachvalg legger godkjent øvelse i fremtidig utkast", async () => {
  const result = await leggTilOvelseFraTest(form());
  assert.deepEqual(result, { ok: true });
  assert.equal(writes, 1);
});
