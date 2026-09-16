/**
 * R-I: admin/spillere/[id]/turnering-kobling/actions.ts. Alle fire
 * handlinger krever ekte per-coach eierskap (`assertCoachTilgangTilSpiller`)
 * oppå rollegrensen — en COACH uten tilgang til nettopp DENNE spilleren skal
 * avvises selv om hen er COACH. Testen dekker eierskapslaget for alle fire,
 * pluss forretningsreglene i `koblePublicPlayer` (turneringsspiller allerede
 * koblet til en ANNEN bruker avvises med klartekstmelding, ikke krasj).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Spillere coach-a faktisk har tilgang til (mocket eierskap). */
let coachensSpillere = new Set(["spiller-a"]);

const spillere: Record<string, { id: string; name: string; role: string; publicPlayerId: string | null }> = {
  "spiller-a": { id: "spiller-a", name: "Ola Nordmann", role: "PLAYER", publicPlayerId: null },
  "coach-b": { id: "coach-b", name: "Coach B", role: "COACH", publicPlayerId: null },
};
const publicPlayers: Record<string, {
  id: string;
  name: string;
  country: string;
  tier: string;
  birthYear: number | null;
  entriesCount: number;
  linkedUserId: string | null;
  linkedUserName: string | null;
}> = {
  "pp-ledig": {
    id: "pp-ledig", name: "Ola Nordmann", country: "NOR", tier: "JUNIOR",
    birthYear: 2010, entriesCount: 3, linkedUserId: null, linkedUserName: null,
  },
  "pp-opptatt": {
    id: "pp-opptatt", name: "Ola Nordmann II", country: "NOR", tier: "JUNIOR",
    birthYear: 2010, entriesCount: 1, linkedUserId: "coach-b", linkedUserName: "Coach B",
  },
};
const entries: Array<{ tournamentId: string; position: number | null; scoreToPar: number | null; totalScore: number | null; status: string; playerId: string }> = [
  { tournamentId: "t-1", position: 3, scoreToPar: -2, totalScore: 210, status: "OK", playerId: "pp-ledig" },
  { tournamentId: "t-2", position: null, scoreToPar: null, totalScore: null, status: "DNF", playerId: "pp-ledig" },
];

let userUpdates: Array<{ id: string; data: unknown }> = [];
let auditWrites: Array<{ action: string; metadata: unknown }> = [];
let mirrorKall: unknown[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachensSpillere = new Set(["spiller-a"]);
  userUpdates = [];
  auditWrites = [];
  mirrorKall = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (options: { allow?: Rolle | Rolle[] }) => {
      if (!bruker) throw new Error("NEXT_REDIRECT");
      const tillatt = Array.isArray(options.allow) ? options.allow : options.allow ? [options.allow] : undefined;
      if (tillatt && !tillatt.includes(bruker.role)) throw new Error("NEXT_REDIRECT");
      return bruker;
    },
  },
});
mock.module("@/lib/auth/coached", {
  namedExports: {
    assertCoachTilgangTilSpiller: async (_viewer: unknown, spillerId: string) => {
      if (!coachensSpillere.has(spillerId)) {
        throw new Error("Du har ikke tilgang til denne spilleren.");
      }
    },
  },
});
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; metadata: unknown }) => {
      auditWrites.push(input);
    },
  },
});
mock.module("@/lib/turneringer/materialize-entry", {
  namedExports: {
    mirrorTournamentResultForLinkedUser: async (_prisma: unknown, input: unknown) => {
      mirrorKall.push(input);
      return { mirrored: true };
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  user: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const s = spillere[where.id];
      return s ? { ...s } : null;
    },
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      userUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
  },
  publicPlayer: {
    findMany: async ({ where }: { where: { name: { contains: string } } }) =>
      Object.values(publicPlayers)
        .filter((p) => p.name.toLowerCase().includes(where.name.contains.toLowerCase()))
        .map((p) => ({
          id: p.id,
          name: p.name,
          country: p.country,
          tier: p.tier,
          birthYear: p.birthYear,
          _count: { entries: p.entriesCount },
          linkedUser: p.linkedUserId ? { id: p.linkedUserId, name: p.linkedUserName } : null,
        })),
    findUnique: async ({ where }: { where: { id: string } }) => {
      const p = publicPlayers[where.id];
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        linkedUser: p.linkedUserId ? { id: p.linkedUserId, name: p.linkedUserName } : null,
      };
    },
  },
  publicPlayerEntry: {
    findMany: async ({ where }: { where: { playerId: string } }) =>
      entries.filter((e) => e.playerId === where.playerId),
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("sokPublicPlayers avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { sokPublicPlayers } = await actions();
  await assert.rejects(() => sokPublicPlayers("spiller-a", "Ola"));
});

test("sokPublicPlayers avviser uinnlogget", async () => {
  bruker = null;
  const { sokPublicPlayers } = await actions();
  await assert.rejects(() => sokPublicPlayers("spiller-a", "Ola"));
});

test("sokPublicPlayers avviser COACH uten tilgang til spilleren", async () => {
  coachensSpillere = new Set();
  const { sokPublicPlayers } = await actions();
  await assert.rejects(() => sokPublicPlayers("spiller-a", "Ola"), /ikke tilgang/i);
});

test("sokPublicPlayers returnerer treff og markerer allerede-koblet til annen bruker", async () => {
  const { sokPublicPlayers } = await actions();
  const svar = await sokPublicPlayers("spiller-a", "Ola");
  assert.equal(svar.ok, true);
  if (svar.ok) {
    const opptatt = svar.treff.find((t) => t.id === "pp-opptatt");
    assert.equal(opptatt?.alreadyLinkedTo, "Coach B");
    const ledig = svar.treff.find((t) => t.id === "pp-ledig");
    assert.equal(ledig?.alreadyLinkedTo, null);
  }
});

test("foreslaPublicPlayers avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { foreslaPublicPlayers } = await actions();
  await assert.rejects(() => foreslaPublicPlayers("spiller-a"));
});

test("foreslaPublicPlayers avviser COACH uten tilgang til spilleren", async () => {
  coachensSpillere = new Set();
  const { foreslaPublicPlayers } = await actions();
  await assert.rejects(() => foreslaPublicPlayers("spiller-a"), /ikke tilgang/i);
});

test("foreslaPublicPlayers avviser ukjent spiller med ok:false", async () => {
  coachensSpillere.add("finnes-ikke"); // eierskap ok her — testen gjelder "spiller ikke funnet"-grenen
  const { foreslaPublicPlayers } = await actions();
  const svar = await foreslaPublicPlayers("finnes-ikke");
  assert.equal(svar.ok, false);
});

test("koblePublicPlayer avviser PLAYER uten å koble", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { koblePublicPlayer } = await actions();
  await assert.rejects(() => koblePublicPlayer("spiller-a", "pp-ledig"));
  assert.equal(userUpdates.length, 0);
});

test("koblePublicPlayer avviser uinnlogget uten å koble", async () => {
  bruker = null;
  const { koblePublicPlayer } = await actions();
  await assert.rejects(() => koblePublicPlayer("spiller-a", "pp-ledig"));
  assert.equal(userUpdates.length, 0);
});

test("koblePublicPlayer avviser COACH uten tilgang til spilleren", async () => {
  coachensSpillere = new Set();
  const { koblePublicPlayer } = await actions();
  await assert.rejects(() => koblePublicPlayer("spiller-a", "pp-ledig"), /ikke tilgang/i);
  assert.equal(userUpdates.length, 0);
});

test("koblePublicPlayer avviser publicPlayer allerede koblet til annen bruker", async () => {
  const { koblePublicPlayer } = await actions();
  const svar = await koblePublicPlayer("spiller-a", "pp-opptatt");
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /Allerede koblet til Coach B/);
  assert.equal(userUpdates.length, 0);
});

test("koblePublicPlayer avviser ukjent publicPlayerId", async () => {
  const { koblePublicPlayer } = await actions();
  const svar = await koblePublicPlayer("spiller-a", "finnes-ikke");
  assert.equal(svar.ok, false);
});

test("koblePublicPlayer kobler og speiler eksisterende resultater med data for COACH", async () => {
  const { koblePublicPlayer } = await actions();
  const svar = await koblePublicPlayer("spiller-a", "pp-ledig");
  assert.equal(svar.ok, true);
  if (svar.ok) assert.equal(svar.mirrored, 1); // kun t-1 har data, t-2 er tomt DNF-hopp
  assert.equal(userUpdates.length, 1);
  assert.equal((userUpdates[0]?.data as { publicPlayerId: string }).publicPlayerId, "pp-ledig");
  assert.equal(auditWrites.at(-1)?.action, "PUBLIC_PLAYER_LINKED");
  assert.equal(mirrorKall.length, 1);
});

test("fjernPublicPlayerKobling avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { fjernPublicPlayerKobling } = await actions();
  await assert.rejects(() => fjernPublicPlayerKobling("spiller-a"));
  assert.equal(userUpdates.length, 0);
});

test("fjernPublicPlayerKobling avviser uinnlogget", async () => {
  bruker = null;
  const { fjernPublicPlayerKobling } = await actions();
  await assert.rejects(() => fjernPublicPlayerKobling("spiller-a"));
  assert.equal(userUpdates.length, 0);
});

test("fjernPublicPlayerKobling avviser COACH uten tilgang til spilleren", async () => {
  coachensSpillere = new Set();
  const { fjernPublicPlayerKobling } = await actions();
  await assert.rejects(() => fjernPublicPlayerKobling("spiller-a"), /ikke tilgang/i);
  assert.equal(userUpdates.length, 0);
});

test("fjernPublicPlayerKobling nullstiller kobling for COACH med tilgang", async () => {
  const { fjernPublicPlayerKobling } = await actions();
  const svar = await fjernPublicPlayerKobling("spiller-a");
  assert.equal(svar.ok, true);
  assert.equal((userUpdates[0]?.data as { publicPlayerId: null }).publicPlayerId, null);
  assert.equal(auditWrites.at(-1)?.action, "PUBLIC_PLAYER_UNLINKED");
});
