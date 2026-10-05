import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePlayerName } from "@/lib/scrapers/player-resolve";

test("name normalization only identifies formatting variants", () => {
  assert.equal(normalizePlayerName("Øyvind Rohjan"), normalizePlayerName("oyvind rohjan"));
  assert.equal(normalizePlayerName("Ola Nordmann (am)"), normalizePlayerName("Ola Nordmann"));
  assert.notEqual(normalizePlayerName("Herman Wibe Sekne"), normalizePlayerName("Herman Sekne"));
});

test("a unique name candidate is counted but never linked automatically", async () => {
  const { linkPublicPlayersByExactName } = await import("./link-public-players");
  const userUpdates: unknown[] = [];
  const mockPrisma = {
    user: {
      findMany: async () => [{ id: "synthetic-user", name: "Ola Nordmann" }],
      update: async (args: unknown) => userUpdates.push(args),
    },
    publicPlayer: {
      findMany: async () => [{ id: "synthetic-public", name: "Ola Nordmann", linkedUser: null }],
    },
  };
  const result = await linkPublicPlayersByExactName(
    mockPrisma as unknown as Parameters<typeof linkPublicPlayersByExactName>[0],
  );
  assert.equal(result.scannedUsers, 1);
  assert.equal(result.linked, 0);
  assert.equal(result.skippedUnverifiedIdentity, 1);
  assert.deepEqual(userUpdates, []);
});

test("ambiguous names remain separate and are reported without linking", async () => {
  const { linkPublicPlayersByExactName } = await import("./link-public-players");
  const userUpdates: unknown[] = [];
  const mockPrisma = {
    user: {
      findMany: async () => [{ id: "synthetic-user", name: "Ola Nordmann" }],
      update: async (args: unknown) => userUpdates.push(args),
    },
    publicPlayer: {
      findMany: async () => [
        { id: "synthetic-public-1", name: "Ola Nordmann", linkedUser: null },
        { id: "synthetic-public-2", name: "Ola Nordmann (am)", linkedUser: null },
      ],
    },
  };
  const result = await linkPublicPlayersByExactName(
    mockPrisma as unknown as Parameters<typeof linkPublicPlayersByExactName>[0],
  );
  assert.equal(result.linked, 0);
  assert.equal(result.skippedAmbiguous, 1);
  assert.deepEqual(userUpdates, []);
});

test("an unlinked account cannot mirror another player's matching-name results", async () => {
  const { linkAndSyncUserTournamentResults } = await import("./link-public-players");
  const mockPrisma = {
    user: { findUnique: async () => ({ id: "synthetic-user", publicPlayerId: null }) },
    publicPlayer: { findMany: async () => { throw new Error("Name matching cannot verify identity"); } },
    publicPlayerEntry: { findMany: async () => { throw new Error("No profile results should be read"); } },
  };
  const result = await linkAndSyncUserTournamentResults(
    mockPrisma as unknown as Parameters<typeof linkAndSyncUserTournamentResults>[0],
    "synthetic-user",
  );
  assert.deepEqual(result, { linked: false, mirrored: 0, needsVerifiedLink: true });
});

test("an existing PublicPlayer link continues to mirror results", async () => {
  const { linkAndSyncUserTournamentResults } = await import("./link-public-players");
  const mockUser = { id: "synthetic-user", publicPlayerId: "public-player-1" };
  const mockEntries = [
    { tournamentId: "t-1", position: 1, scoreToPar: -12, totalScore: 276, status: "FINISHED" },
    { tournamentId: "t-2", position: 3, scoreToPar: -8, totalScore: 280, status: "FINISHED" },
  ];
  const mirroredTournaments: string[] = [];
  const mockPrisma = {
    user: {
      findUnique: async () => mockUser,
      findFirst: async () => ({ id: "synthetic-user" }),
      update: async () => { throw new Error("Existing link should not change"); },
    },
    publicPlayerEntry: { findMany: async () => mockEntries },
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
  const result = await linkAndSyncUserTournamentResults(
    mockPrisma as unknown as Parameters<typeof linkAndSyncUserTournamentResults>[0],
    "synthetic-user",
  );
  assert.equal(result.linked, true);
  assert.equal(result.publicPlayerId, "public-player-1");
  assert.equal(result.mirrored, 2);
  assert.deepEqual(mirroredTournaments, ["t-1", "t-2"]);
});
