import { test } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@/generated/prisma/client";
import { processLeaderboardForTournament, syncGolfBoxLeaderboards } from "./golfbox-sync";
import { tomResolveCache } from "@/lib/scrapers/player-resolve";
import { lesTurneringsresultat } from "@/lib/domain/turneringsresultat";

const round = (number: number, score: number, completed = true) => ({ Number: number, ScoringMethod: 0, IsCompleted: completed,
  Holes: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [`H${i + 1}`, { Number: i + 1 }])),
  ResultSum: { ActualText: String(score), ToParText: String(score - 72) } });
function response() { return { CompetitionData: { Classes: [{ Id: 1, Name: "Brutto", ClassType: "PlayerClass" }] }, Classes: {
  C1: { Name: "Brutto", Leaderboard: { RoundNames: ["R1", "R2"], Entries: { p: { FirstName: "Test", LastName: "Spiller", Nationality: "NO", BirthYear: 2005,
    Position: { Actual: 2, Calculated: "T2" }, ScoringToPar: { ToParText: "+2" }, Rounds: { R2: round(2, 74), R1: round(1, 72) } } } } } } }; }
const tournament = { id: "event-a", name: "Syntetisk cup", tour: "junior-no", sourceId: "1", status: "COMPLETED" };

test("GolfBox → atomisk lagring → egen historikk beholder brutto og kildeverdier", async t => {
  tomResolveCache();
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify(response())));
  let stored: Record<string, unknown> | null = null;
  const persistedRounds: { roundNumber: number; score: number; toPar: number }[] = [];
  let mirroredScore: number | null = null;
  let transactions = 0;
  const prisma = {
    publicPlayer: { findMany: async () => [{ id: "public-a", name: "Test Spiller", birthYear: 2005, country: "NO", slug: "test-spiller" }] },
    tournament: { update: async () => ({}) }, leaderboardSnapshot: { upsert: async () => ({}) },
    $transaction: async (fn: (tx: object) => Promise<unknown>) => {
      transactions++;
      return fn({
        publicPlayerEntry: { upsert: async ({ create }: { create: Record<string, unknown> }) => { stored = create; return { id: "entry-a" }; } },
        publicPlayerRound: { deleteMany: async () => ({}), upsert: async ({ create }: { create: typeof persistedRounds[number] }) => { persistedRounds.push(create); } },
        user: { findFirst: async ({ where }: { where: { publicPlayerId: string; deletedAt: null; anonymisertAt: null } }) => {
          assert.equal(where.publicPlayerId, "public-a"); assert.equal(where.deletedAt, null); assert.equal(where.anonymisertAt, null); return { id: "user-a" };
        } },
        tournamentResult: { upsert: async ({ create }: { create: { score: number; userId: string } }) => { assert.equal(create.userId, "user-a"); mirroredScore = create.score; } },
        tournamentEntry: { findFirst: async () => ({ id: "my-entry" }), update: async () => ({}) },
      });
    },
  } as unknown as PrismaClient;
  const result = await processLeaderboardForTournament(prisma, tournament, new Date("2026-09-10T12:00:00Z"));
  assert.equal(result.entries, 1); assert.equal(transactions, 1);
  assert.equal(mirroredScore, 146); // +2 skal aldri havne i bruttofeltet.
  assert.deepEqual(persistedRounds.map(r => [r.roundNumber, r.score, r.toPar]), [[1, 72, 0], [2, 74, 2]]);
  const own = lesTurneringsresultat({ ...(stored as unknown as Record<string, unknown>), roundDetails: [] } as unknown as Parameters<typeof lesTurneringsresultat>[0]);
  assert.equal(own.brutto, 146); assert.equal(own.plasseringTekst, "T2"); assert.equal(own.fullstendig, true);
});

test("tom kilde beholder gamle runder og registrerer et ufullstendig forsøk", async t => {
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({})));
  let payload: unknown;
  const prisma = { leaderboardSnapshot: { upsert: async ({ create }: { create: { payload: unknown } }) => { payload = create.payload; } } } as unknown as PrismaClient;
  const result = await processLeaderboardForTournament(prisma, tournament, new Date());
  assert.equal(result.entries, 0); assert.equal(result.incomplete, true);
  assert.deepEqual(payload, { version: 2, complete: false, empty: true });
});

test("feil på første turnering stopper ikke neste, og forsøkene får en oppdateringsdato", async t => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; if (calls === 1) throw new Error("syntetisk kildefeil"); return new Response(JSON.stringify({})); });
  const attempted: string[] = [];
  const prisma = { tournament: { findMany: async () => [tournament, { ...tournament, id: "event-b", sourceId: "2" }] },
    leaderboardSnapshot: { upsert: async ({ where }: { where: { tournamentId: string } }) => { attempted.push(where.tournamentId); } },
  } as unknown as PrismaClient;
  const result = await syncGolfBoxLeaderboards(prisma);
  assert.equal(calls, 2); assert.deepEqual(attempted, ["event-a", "event-b"]);
  assert.deepEqual(result.failedTournaments, attempted);
});
