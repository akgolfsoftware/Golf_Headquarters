import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanName, firstLast, runDedupePlayerNames } from "./dedupe-player-names";
import { normalizePlayerName } from "@/lib/scrapers/player-resolve";

test("cleanName fjerner parentes-markører", () => {
  assert.equal(cleanName("Ola Nordmann (am)"), "Ola Nordmann");
  assert.equal(cleanName("  Kari  (a)  Berg  "), "Kari Berg");
});

test("firstLast: første + siste token", () => {
  assert.equal(firstLast("Herman Wibe Sekne"), "herman|sekne");
  assert.equal(firstLast("Ola Nordmann"), "ola|nordmann");
});

test("formaterings-merge-nøkkel er normalizePlayerName", () => {
  // Samme nøkkel er bare en kandidat; konto og kilde-ID må også kontrolleres.
  assert.equal(
    normalizePlayerName("Viktor Hovland (am)"),
    normalizePlayerName("Viktor Hovland"),
  );
  // Middelsnavn → ulik nøkkel → manuell review
  assert.notEqual(
    normalizePlayerName("Kristian K. Johansen"),
    normalizePlayerName("Kristian Johansen"),
  );
});

type Player = {
  id: string; name: string; slug: string; birthYear: number | null;
  dataGolfId: number | null; ngfId: string | null; wagrId: string | null;
  linkedUser: { id: string } | null; bio: null; photoUrl: null;
  instagramHandle: null; tier: string; _count: { entries: number };
};
function player(id: string, patch: Partial<Player> = {}): Player {
  return { id, name: "Ola Nordmann", slug: id, birthYear: null, dataGolfId: null,
    ngfId: null, wagrId: null, linkedUser: null, bio: null, photoUrl: null,
    instagramHandle: null, tier: "amateur", _count: { entries: 1 }, ...patch };
}

function dedupeFixture(players: Player[]) {
  const mutations: string[] = [];
  const transactions: string[] = [];
  const sourceEntries = new Map(players.map(p => [p.id, [{ id: `entry-${p.id}`, tournamentId: `event-${p.id}` }]]));
  const db = {
    publicPlayer: {
      findMany: async ({ where }: { where?: { name?: { contains: string }; id?: { notIn: string[] }; linkedUser?: null } }) =>
        where?.name ? players.filter(p => p.name.includes(where.name!.contains) && p.linkedUser === null && !where.id?.notIn.includes(p.id)) : players,
      update: async ({ where, data }: { where: { id: string }; data: Partial<Player> }) => {
        mutations.push(`player-update:${where.id}`);
        const target = players.find(p => p.id === where.id);
        assert.ok(target); Object.assign(target, data); return target;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        mutations.push(`player-delete:${where.id}`);
        players.splice(players.findIndex(p => p.id === where.id), 1);
      },
    },
    user: { update: async () => { mutations.push("user-update"); throw new Error("Kontobinding skal aldri endres"); } },
    publicPlayerEntry: {
      findMany: async ({ where }: { where: { playerId: string } }) => sourceEntries.get(where.playerId) ?? [],
      update: async ({ where }: { where: { id: string } }) => { mutations.push(`entry-update:${where.id}`); },
      delete: async ({ where }: { where: { id: string } }) => { mutations.push(`entry-delete:${where.id}`); },
    },
    $transaction: async <T>(fn: (tx: unknown) => Promise<T>, opts: { isolationLevel: string }) => {
      transactions.push(opts.isolationLevel); return fn(db);
    },
  };
  return { db: db as unknown as Parameters<typeof runDedupePlayerNames>[0], mutations, transactions, players };
}

test("navnededupe hopper over hele gruppen når én eller begge profiler har konto", async () => {
  for (const both of [false, true]) {
    const f = dedupeFixture([player("public-a", { name: "Ola Nordmann (am)", linkedUser: { id: "konto-a" } }),
      player("public-b", { name: "Ola Nordmann (pro)", linkedUser: both ? { id: "konto-b" } : null })]);
    const result = await runDedupePlayerNames(f.db, { apply: true });
    assert.equal(result.mergedGroups, 0);
    assert.equal(result.skippedLinkedGroups, 1);
    assert.deepEqual(result.skippedGroups, [{ playerIds: ["public-a", "public-b"], reason: "ACCOUNT_LINKED" }]);
    assert.deepEqual(result.skippedNames, []);
    assert.deepEqual(f.mutations, []);
    assert.equal(f.players.length, 2);
    assert.deepEqual(f.transactions, ["Serializable"]);
  }
});

test("motstridende NGF-, WAGR- eller DataGolf-ID sperrer flytting, sletting og navnerens", async () => {
  for (const field of ["ngfId", "wagrId", "dataGolfId"] as const) {
    const first = field === "dataGolfId" ? { dataGolfId: 1 } : { [field]: "source-a" };
    const second = field === "dataGolfId" ? { dataGolfId: 2 } : { [field]: "source-b" };
    const f = dedupeFixture([player("public-a", { name: "Ola Nordmann (am)", ...first }),
      player("public-b", { name: "Ola Nordmann (pro)", ...second })]);
    const result = await runDedupePlayerNames(f.db, { apply: true });
    assert.equal(result.skippedStableIdConflicts, 1);
    assert.equal(result.skippedGroups[0]?.reason, "SOURCE_ID_CONFLICT");
    assert.equal(result.mergedProfiles, 0);
    assert.deepEqual(f.mutations, []);
    assert.equal(f.players.length, 2);
  }
});

test("ulikt kjent fødselsår beholder det eksisterende konfliktvernet", async () => {
  const f = dedupeFixture([player("public-a", { birthYear: 1990 }), player("public-b", { birthYear: 1991 })]);
  const result = await runDedupePlayerNames(f.db, { apply: true });
  assert.equal(result.skippedGroups[0]?.reason, "BIRTH_YEAR_CONFLICT");
  assert.deepEqual(f.mutations, []);
});

test("dry-run rapporterer kontokonflikt uten transaksjon eller skriving", async () => {
  const f = dedupeFixture([player("public-a", { linkedUser: { id: "konto-a" } }), player("public-b")]);
  const result = await runDedupePlayerNames(f.db);
  assert.equal(result.apply, false);
  assert.equal(result.skippedConflict, 1);
  assert.deepEqual(f.mutations, []);
  assert.deepEqual(f.transactions, []);
});

test("ukoblede profiler uten kildekonflikt beholder merge og WAGR-ID", async () => {
  const f = dedupeFixture([player("public-a", { _count: { entries: 2 } }),
    player("public-b", { wagrId: "wagr-b" })]);
  const result = await runDedupePlayerNames(f.db, { apply: true });
  assert.equal(result.mergedGroups, 1);
  assert.equal(result.skippedConflict, 0);
  assert.equal(f.players.length, 1);
  assert.equal(f.players[0]?.wagrId, "wagr-b");
  assert.ok(f.mutations.includes("entry-update:entry-public-b"));
  assert.ok(f.mutations.includes("player-delete:public-b"));
  assert.ok(!f.mutations.includes("user-update"));
});
