/**
 * R-I: admin/(legacy)/stats/overview/actions.ts. `sjekkDbHelse` er
 * ADMIN-only (ikke COACH) — read-only DB-ping. Testen bekrefter at COACH
 * avvises like mye som PLAYER/uinnlogget, og at en feilende spørring
 * fanges som `ok:false` med feilmelding, ikke krasjer.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "admin-a",
  role: "ADMIN",
  name: "Admin A",
};

let simulerDbFeil = false;
let queryRawKall = 0;
let userCount = 42;

function nullstill() {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  simulerDbFeil = false;
  queryRawKall = 0;
  userCount = 42;
}

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
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  $queryRaw: async () => {
    queryRawKall += 1;
    if (simulerDbFeil) throw new Error("Databasen svarer ikke");
    return [{ "?column?": 1 }];
  },
  user: {
    count: async () => userCount,
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("sjekkDbHelse avviser COACH (ADMIN-only)", async () => {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  const { sjekkDbHelse } = await actions();
  await assert.rejects(() => sjekkDbHelse());
  assert.equal(queryRawKall, 0);
});

test("sjekkDbHelse avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { sjekkDbHelse } = await actions();
  await assert.rejects(() => sjekkDbHelse());
  assert.equal(queryRawKall, 0);
});

test("sjekkDbHelse avviser uinnlogget", async () => {
  bruker = null;
  const { sjekkDbHelse } = await actions();
  await assert.rejects(() => sjekkDbHelse());
  assert.equal(queryRawKall, 0);
});

test("sjekkDbHelse returnerer ok:true med brukerantall for ADMIN", async () => {
  const { sjekkDbHelse } = await actions();
  const resultat = await sjekkDbHelse();
  assert.equal(resultat.ok, true);
  assert.equal(resultat.brukere, 42);
  assert.equal(typeof resultat.latencyMs, "number");
});

test("sjekkDbHelse fanger databasefeil som ok:false", async () => {
  simulerDbFeil = true;
  const { sjekkDbHelse } = await actions();
  const resultat = await sjekkDbHelse();
  assert.equal(resultat.ok, false);
  assert.equal(resultat.brukere, null);
  assert.equal(resultat.feil, "Databasen svarer ikke");
});
