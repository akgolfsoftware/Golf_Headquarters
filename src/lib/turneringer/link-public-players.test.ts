import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePlayerName } from "@/lib/scrapers/player-resolve";

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

test("linkAndSyncUserTournamentResults: koble og speile mock test", async () => {
  const { linkAndSyncUserTournamentResults } = await import("./link-public-players");
  
  const mockUser = { id: "u-1", name: "Viktor Hovland", publicPlayerId: null };
  const mockPublic = [
    { id: "pp-1", name: "Viktor Hovland", linkedUser: null },
    { id: "pp-2", name: "Kristoffer Ventura", linkedUser: null },
  ];
  const mockEntries = [
    { tournamentId: "t-1", position: 1, scoreToPar: -12, totalScore: 276, status: "FINISHED" },
    { tournamentId: "t-2", position: 3, scoreToPar: -8, totalScore: 280, status: "FINISHED" },
  ];

  let updatedUserWithPpId: string | null = null;
  const mirroredTournaments: string[] = [];

  const mockPrisma = {
    user: {
      findUnique: async () => mockUser,
      findFirst: async () => mockUser,
      update: async ({ data }: { data: { publicPlayerId: string | null } }) => {
        updatedUserWithPpId = data.publicPlayerId;
        return { ...mockUser, publicPlayerId: data.publicPlayerId };
      },
    },
    publicPlayer: {
      findMany: async () => mockPublic,
    },
    publicPlayerEntry: {
      findMany: async () => mockEntries,
    },
    $transaction: async <T>(fn: (tx: unknown) => Promise<T>) => fn(mockPrisma),
    tournamentResult: {
      upsert: async ({ create }: { create: { tournamentId: string } }) => {
        mirroredTournaments.push(create.tournamentId);
        return {};
      },
    },
    tournamentEntry: {
      findFirst: async () => null,
      create: async () => ({}),
      update: async () => ({}),
    },
  };

  const res = await linkAndSyncUserTournamentResults(
    mockPrisma as unknown as Parameters<typeof linkAndSyncUserTournamentResults>[0],
    "u-1",
  );
  assert.equal(res.linked, true);
  assert.equal(res.publicPlayerId, "pp-1");
  assert.equal(updatedUserWithPpId, "pp-1");
  assert.equal(res.mirrored, 2);
  assert.deepEqual(mirroredTournaments, ["t-1", "t-2"]);
});
