import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

const playerId = "syntetisk-spiller";
let viewer = { id: playerId, role: "PLAYER" };
let access = false;
let writes = 0;
const reads: { playerId: string; isoYear: number; weekNumber: number }[] = [];
let rows: Record<string, unknown>[] = [];
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("@/lib/auth/coached", { namedExports: {
  harCoachTilgangTilSpiller: async () => access,
  coachScopedPlayerWhere: () => ({ id: playerId }),
} });
mock.module("@/lib/admin/stallen-data", { namedExports: { loadStallen: async () => [] } });
mock.module("next/cache", { namedExports: { revalidatePath() {} } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  weekPlan: {
    findUnique: async ({ where }: { where: { playerId_isoYear_weekNumber: typeof reads[number] } }) => {
      const key = where.playerId_isoYear_weekNumber;
      reads.push(key);
      return rows.find(r => r.playerId === key.playerId && r.isoYear === key.isoYear && r.weekNumber === key.weekNumber) ?? null;
    },
    upsert: async () => { writes++; throw new Error("Lesing skal aldri skrive"); },
  },
  workbenchSession: { findMany: async () => [] },
  groupSchedule: { findMany: async () => [] },
  user: { findUnique: async () => ({ schoolYear: null }) },
  playerBusyBlock: { findMany: async () => [] },
  workbenchTournamentPlan: { findMany: async () => [] },
} } });
let actions: typeof import("./wb-actions");
before(async () => { actions = await import("./wb-actions"); });
beforeEach(() => {
  viewer = { id: playerId, role: "PLAYER" }; access = false;
  writes = 0; reads.length = 0; rows = [];
});
function load(weekStart = "2024-12-30") {
  return actions.loadWeek({ playerId, weekStart, mode: { kind: "AGENCY", subjectId: playerId, sources: ["OEKTER"] } });
}
function source(isoYear: number, weekNumber: number) {
  return { id: `syntetisk-plan-${isoYear}-${weekNumber}`, playerId, isoYear, weekNumber,
    seasonPlanId: "syntetisk-sesong", weekType: "UTVIKLING", notes: [],
    customNotes: "Privat innhold skal ikke følge kandidaten", planningDetails: { ugyldigLegacyInnhold: true } };
}

test("2024-12-30 viser separat original 2024/1-kandidat uten å bruke eller endre planen", async () => {
  rows = [source(2024, 1)];
  const before = structuredClone(rows);
  const res = await load(); assert.ok(res.ok);
  assert.equal(res.data.weekPlan, null);
  const candidate = res.data.legacyWeekPlanCandidate; assert.ok(candidate);
  assert.deepEqual(candidate, {
    id: "syntetisk-plan-2024-1", isoYear: 2024, weekNumber: 1, seasonPlanId: "syntetisk-sesong",
    warning: "Det er ikke avklart hvilken uke denne planen tilhører. Den eldre planen er bevart og brukes ikke i den viste uka. Gjennomgå den før du lager en ny plan.",
  });
  assert.deepEqual(reads, [{ playerId, isoYear: 2025, weekNumber: 1 }, { playerId, isoYear: 2024, weekNumber: 1 }]);
  assert.deepEqual(rows, before); assert.equal(writes, 0);
});

test("korrekt 2025/1 vinner og gammel kandidat leses aldri", async () => {
  rows = [source(2024, 1), { ...source(2025, 1), planningDetails: null }];
  const res = await load(); assert.ok(res.ok);
  assert.equal(res.data.weekPlan?.isoYear, 2025);
  assert.equal(res.data.legacyWeekPlanCandidate, undefined);
  assert.deepEqual(reads, [{ playerId, isoYear: 2025, weekNumber: 1 }]);
  assert.equal(writes, 0);
});

test("annen spiller og coach uten tilgang får verken plan eller kandidat", async () => {
  rows = [source(2024, 1)];
  for (const role of ["PLAYER", "COACH"]) {
    viewer = { id: "syntetisk-fremmed", role };
    assert.equal((await load()).ok, false);
    assert.equal(reads.length, 0); assert.equal(writes, 0);
  }
});

test("autorisert coach får samme skrivebeskyttede kandidat", async () => {
  viewer = { id: "syntetisk-coach", role: "COACH" }; access = true;
  rows = [{ ...source(2024, 1), seasonPlanId: null }];
  const res = await load(); assert.ok(res.ok);
  assert.equal(res.data.legacyWeekPlanCandidate?.seasonPlanId, null);
  assert.equal(res.data.weekPlan, null); assert.equal(writes, 0);
});

test("ugyldig kandidatmetadata gir trygt varsel uten å returnere innhold", async () => {
  rows = [{ ...source(2024, 1), id: 123 }];
  const res = await load(); assert.equal(res.ok, false);
  if (!res.ok) assert.match(res.error, /eldre ukeplan.*ugyldige metadata.*ikke endret/);
  assert.equal(writes, 0);
});

test("2021/53 omtolkes ikke uten kildesignal og originalen forblir urørt", async () => {
  rows = [source(2021, 53)]; const before = structuredClone(rows);
  const res = await load("2020-12-28"); assert.ok(res.ok);
  assert.equal(res.data.weekPlan, null); assert.equal(res.data.legacyWeekPlanCandidate, undefined);
  assert.deepEqual(reads, [{ playerId, isoYear: 2020, weekNumber: 53 }]);
  assert.deepEqual(rows, before); assert.equal(writes, 0);
});
