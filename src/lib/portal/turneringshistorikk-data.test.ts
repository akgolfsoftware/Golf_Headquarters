import { before, mock, test } from "node:test";
import assert from "node:assert/strict";

let publicPlayerId: string | null = "public-a";
let publicReads = 0;
const event = { id: "event-a", name: "Syntetisk cup", sourceOrigin: "GOLFBOX", tour: "junior-no", startDate: new Date("2026-09-01"), officialUrl: null };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findUnique: async ({ where }: { where: { id: string } }) => { assert.equal(where.id, "user-a"); return { publicPlayerId }; } },
  publicPlayerEntry: { findMany: async ({ where }: { where: { playerId: string; tournament: { mergedIntoId: null } } }) => {
    publicReads++; assert.equal(where.playerId, "public-a"); assert.equal(where.tournament.mergedIntoId, null);
    return [{ status: "FINISHED", position: 2, scoreToPar: 2, totalScore: null, rounds: {}, roundDetails: [], klasseNavn: "Brutto", tournament: event }];
  } },
  tournamentEntry: { findMany: async ({ where }: { where: { userId: string; withdrawnAt: null; OR: unknown[] } }) => {
    assert.equal(where.userId, "user-a"); assert.equal(where.withdrawnAt, null);
    assert.deepEqual(where.OR, [{ tournamentId: null }, { tournament: { mergedIntoId: null } }]);
    return [{ id: "linked-a", tournament: event, entryStatus: "COMPLETED", category: null },
      { id: "manual-b", tournament: null, manualName: "Egen cup", manualDate: new Date("2026-10-01"), entryStatus: "PLANNED", category: "Junior" }];
  } },
} } });
let load: typeof import("./turneringshistorikk-data").hentTurneringshistorikk;
before(async () => { load = (await import("./turneringshistorikk-data")).hentTurneringshistorikk; });

test("egne offentlige resultater og egne planer vises uten duplikat", async () => {
  publicPlayerId = "public-a";
  const h = await load("user-a");
  assert.equal(h.antall, 2); assert.equal(h.bestePlassering, 2);
  assert.equal(h.aar[0].turneringer.filter(t => t.turneringId === "event-a").length, 1);
  assert.equal(h.aar[0].turneringer.find(t => t.turneringId === "manual-b")?.status, "PLANNED");
});

test("ukoblet spiller får egne registreringer uten å lese andre offentlige profiler", async () => {
  publicPlayerId = null; publicReads = 0;
  const h = await load("user-a");
  assert.equal(publicReads, 0); assert.equal(h.antall, 2); assert.equal(h.bestePlassering, null);
});
