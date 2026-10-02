import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePlayerName } from "@/lib/scrapers/player-resolve";
import {
  backfillTournamentResultsForLinkedUsers,
  linkAndSyncUserTournamentResults,
  linkPublicPlayersByExactName,
} from "./link-public-players";

/**
 * Eksakt-match-reglene for auto-link (uten DB):
 * - samme normalizePlayerName → kandidat
 * - >1 PublicPlayer med samme norm → hopp (tvetydig)
 */
test("normalizePlayerName: formateringsvarianter blir like", () => {
  assert.equal(
    normalizePlayerName("Øyvind Rohjan"),
    normalizePlayerName("oyvind rohjan"),
  );
  assert.equal(
    normalizePlayerName("Ola Nordmann (am)"),
    normalizePlayerName("Ola Nordmann"),
  );
});

test("normalizePlayerName: middelsnavn er ulike (skal IKKE auto-merges)", () => {
  assert.notEqual(
    normalizePlayerName("Herman Wibe Sekne"),
    normalizePlayerName("Herman Sekne"),
  );
});

test("link-kandidat-seleksjon: 0 / 1 / mange", () => {
  function pickCandidates(
    userName: string,
    players: string[],
  ): "none" | "one" | "ambiguous" {
    const k = normalizePlayerName(userName);
    const hits = players.filter((p) => normalizePlayerName(p) === k);
    if (hits.length === 0) return "none";
    if (hits.length === 1) return "one";
    return "ambiguous";
  }

  assert.equal(pickCandidates("Ola Nordmann", ["Kari Nordmann"]), "none");
  assert.equal(pickCandidates("Ola Nordmann", ["Ola Nordmann (am)"]), "one");
  assert.equal(
    pickCandidates("Ola Nordmann", ["Ola Nordmann", "Ola Nordmann (pro)"]),
    // normalize stripper (pro) → begge matcher → ambiguous
    "ambiguous",
  );
});

function fixture(publicPlayerId: string | null) {
  const user = { id: "u-1", name: "Ola Nordmann", publicPlayerId };
  const source = { tournamentId: "t-1", position: 2, scoreToPar: -4, totalScore: 284, status: "FINISHED" };
  const results = new Map<string, { tournamentId: string; userId: string; score: number | null; position: number | null }>();
  const entries = new Map<string, { id: string; userId: string; tournamentId: string; entryStatus: string }>();
  let userWrites = 0;
  let nameReads = 0;
  const db = {
    user: {
      findUnique: async () => user,
      findMany: async () => [user],
      findFirst: async ({ where }: { where: { publicPlayerId: string; deletedAt: null; anonymisertAt: null } }) => {
        assert.equal(where.deletedAt, null);
        assert.equal(where.anonymisertAt, null);
        return user.publicPlayerId === where.publicPlayerId ? user : null;
      },
      update: async () => { userWrites++; throw new Error("Kontobinding skal ikke skrives"); },
    },
    publicPlayer: {
      findMany: async () => { nameReads++; return [{ id: "pp-1", name: user.name, linkedUser: null }]; },
    },
    publicPlayerEntry: {
      findMany: async () => [source],
    },
    $transaction: async <T>(fn: (tx: unknown) => Promise<T>) => fn(db),
    tournamentResult: {
      upsert: async ({ where, create, update }: {
        where: { tournamentId_userId: { tournamentId: string; userId: string } };
        create: { tournamentId: string; userId: string; score: number | null; position: number | null };
        update: { score: number | null; position: number | null };
      }) => {
        const key = `${where.tournamentId_userId.tournamentId}:${where.tournamentId_userId.userId}`;
        const old = results.get(key);
        results.set(key, old ? { ...old, ...update } : create);
        return results.get(key);
      },
    },
    tournamentEntry: {
      findFirst: async ({ where }: { where: { userId: string; tournamentId: string } }) =>
        entries.get(`${where.tournamentId}:${where.userId}`) ?? null,
      create: async ({ data }: { data: { userId: string; tournamentId: string; entryStatus: string } }) => {
        const entry = { id: "entry-1", ...data };
        entries.set(`${data.tournamentId}:${data.userId}`, entry);
        return entry;
      },
      update: async ({ where, data }: { where: { id: string }; data: { entryStatus: string } }) => {
        const entry = [...entries.values()].find(e => e.id === where.id);
        assert.ok(entry);
        Object.assign(entry, data);
        return entry;
      },
    },
  };
  return { db: db as unknown as Parameters<typeof linkAndSyncUserTournamentResults>[0], source, results, entries,
    counts: () => ({ userWrites, nameReads }) };
}

test("bulk-navnekobling skriver aldri binding og rapporterer manglende verifikasjon", async () => {
  const f = fixture(null);
  const result = await linkPublicPlayersByExactName(f.db);
  assert.equal(result.scannedUsers, 1);
  assert.equal(result.linked, 0);
  assert.equal(result.skippedUnverified, 1);
  assert.deepEqual(f.counts(), { userWrites: 0, nameReads: 0 });
});

test("ett entydig navn er ikke bevis for en ny konto→turneringsbinding", async () => {
  const f = fixture(null);
  const result = await linkAndSyncUserTournamentResults(f.db, "u-1");
  assert.deepEqual(result, { linked: false, mirrored: 0 });
  assert.deepEqual(f.counts(), { userWrites: 0, nameReads: 0 });
  assert.equal(f.results.size, 0);
  assert.equal(f.entries.size, 0);
});

test("eksisterende binding speiler oppdatert bruttoresultat på samme innslag uten duplikat", async () => {
  const f = fixture("pp-1");
  assert.deepEqual(await linkAndSyncUserTournamentResults(f.db, "u-1"), { linked: true, publicPlayerId: "pp-1", mirrored: 1 });
  f.source.totalScore = 280; f.source.scoreToPar = -8; f.source.position = 1;
  await linkAndSyncUserTournamentResults(f.db, "u-1");
  assert.equal(f.results.size, 1);
  assert.equal(f.entries.size, 1);
  assert.equal(f.results.get("t-1:u-1")?.score, 280);
  assert.equal(f.results.get("t-1:u-1")?.position, 1);
  assert.equal(f.entries.get("t-1:u-1")?.entryStatus, "COMPLETED");
  assert.deepEqual(f.counts(), { userWrites: 0, nameReads: 0 });
});

test("backfill bevarer eksisterende binding og tåler gjentakelse og resultatoppdatering", async () => {
  const f = fixture("pp-1");
  assert.deepEqual(await backfillTournamentResultsForLinkedUsers(f.db), { users: 1, mirrored: 1 });
  f.source.totalScore = 282;
  await backfillTournamentResultsForLinkedUsers(f.db);
  assert.equal(f.results.size, 1);
  assert.equal(f.entries.size, 1);
  assert.equal(f.results.get("t-1:u-1")?.score, 282);
  assert.deepEqual(f.counts(), { userWrites: 0, nameReads: 0 });
});
