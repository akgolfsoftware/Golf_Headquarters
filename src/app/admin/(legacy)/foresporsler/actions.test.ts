/**
 * R-I: admin/(legacy)/foresporsler/actions.ts. Filen har sitt eget
 * dokumenterte IDOR-vern (`assertKanBesvare`): en COACH kan kun besvare
 * forespørsler rettet til seg selv ELLER i den åpne køen (coachId = null),
 * mens en forespørsel adressert til en ANNEN coach skal avvises — selv om
 * aktøren er COACH. ADMIN kan besvare alle. Testen dekker begge lag:
 * rollegrensen (PLAYER/uinnlogget) og selve IDOR-vernet.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

const requests: Record<string, { id: string; coachId: string | null; status: string }> = {
  "req-egen": { id: "req-egen", coachId: "coach-a", status: "PENDING" },
  "req-annen-coach": { id: "req-annen-coach", coachId: "coach-b", status: "PENDING" },
  "req-apen": { id: "req-apen", coachId: null, status: "PENDING" },
};

let updates: Array<{ id: string; data: unknown }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  updates = [];
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
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  sessionRequest: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const r = requests[where.id];
      return r ? { coachId: r.coachId } : null;
    },
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      updates.push({ id: where.id, data });
      return { id: where.id };
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("avslaaForespørsel avviser PLAYER uten å endre status", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { avslaaForespørsel } = await actions();
  await assert.rejects(() => avslaaForespørsel("req-egen"));
  assert.equal(updates.length, 0);
});

test("avslaaForespørsel avviser uinnlogget uten å endre status", async () => {
  bruker = null;
  const { avslaaForespørsel } = await actions();
  await assert.rejects(() => avslaaForespørsel("req-egen"));
  assert.equal(updates.length, 0);
});

test("avslaaForespørsel avviser COACH på en forespørsel adressert til en annen coach (IDOR)", async () => {
  const { avslaaForespørsel } = await actions();
  await assert.rejects(() => avslaaForespørsel("req-annen-coach"), /forbidden/);
  assert.equal(updates.length, 0);
});

test("avslaaForespørsel avslår egen forespørsel for COACH", async () => {
  const { avslaaForespørsel } = await actions();
  await avslaaForespørsel("req-egen");
  assert.equal(updates.length, 1);
  assert.equal((updates[0]?.data as { status: string }).status, "DECLINED");
});

test("avslaaForespørsel avslår åpen forespørsel (coachId=null) for COACH", async () => {
  const { avslaaForespørsel } = await actions();
  await avslaaForespørsel("req-apen");
  assert.equal(updates.length, 1);
});

test("avslaaForespørsel lar ADMIN avslå en forespørsel adressert til en annen coach", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { avslaaForespørsel } = await actions();
  await avslaaForespørsel("req-annen-coach");
  assert.equal(updates.length, 1);
});

test("markerSomPlanlagt avviser PLAYER uten å endre status", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { markerSomPlanlagt } = await actions();
  await assert.rejects(() => markerSomPlanlagt("req-egen"));
  assert.equal(updates.length, 0);
});

test("markerSomPlanlagt avviser uinnlogget uten å endre status", async () => {
  bruker = null;
  const { markerSomPlanlagt } = await actions();
  await assert.rejects(() => markerSomPlanlagt("req-egen"));
  assert.equal(updates.length, 0);
});

test("markerSomPlanlagt avviser COACH på en forespørsel adressert til en annen coach (IDOR)", async () => {
  const { markerSomPlanlagt } = await actions();
  await assert.rejects(() => markerSomPlanlagt("req-annen-coach"), /forbidden/);
  assert.equal(updates.length, 0);
});

test("markerSomPlanlagt setter APPROVED for egen forespørsel", async () => {
  const { markerSomPlanlagt } = await actions();
  await markerSomPlanlagt("req-egen");
  assert.equal((updates[0]?.data as { status: string }).status, "APPROVED");
});

test("avslaaForespørsel avviser ukjent forespørsel-id", async () => {
  const { avslaaForespørsel } = await actions();
  await assert.rejects(() => avslaaForespørsel("finnes-ikke"), /not_found/);
  assert.equal(updates.length, 0);
});
