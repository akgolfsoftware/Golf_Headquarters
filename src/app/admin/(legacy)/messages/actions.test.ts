/**
 * R-I: admin/(legacy)/messages/actions.ts. To ulike eierskapsmekanismer:
 * `sendMelding` sjekker `tråd.coachId !== me.id && me.role !== "ADMIN"`
 * inne i transaksjonen (en COACH som ikke eier tråden avvist, ADMIN
 * unntatt); `sendMeldingTilSpiller` bruker `assertCoachTilgangTilSpiller`
 * (samme mønster som resten av R-I). Begge fanger guard-feil og returnerer
 * `{ok:false}` i stedet for å kaste. `$transaction` mockes til å kjøre
 * callbacken direkte — retry-logikken ved 40001/40P01 er ikke denne
 * testens ansvar.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

const trader: Record<string, { id: string; coachId: string; messages: unknown[] }> = {
  "traad-a": { id: "traad-a", coachId: "coach-a", messages: [] },
  "traad-b": { id: "traad-b", coachId: "coach-b", messages: [] },
};
const spillere: Record<string, { id: string; deletedAt: Date | null }> = {
  "spiller-a": { id: "spiller-a", deletedAt: null },
  "spiller-slettet": { id: "spiller-slettet", deletedAt: new Date() },
};
/** Spillere coach-a faktisk har tilgang til (mocket eierskap). */
let coachensSpillere = new Set(["spiller-a"]);
const direkteTraader: Record<string, { id: string; userId: string; coachId: string; messages: unknown[] }> = {};

let coachingSessionUpdates: Array<{ id: string; data: unknown }> = [];
let coachingSessionCreates: unknown[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachensSpillere = new Set(["spiller-a"]);
  trader["traad-a"].messages = [];
  trader["traad-b"].messages = [];
  for (const k of Object.keys(direkteTraader)) delete direkteTraader[k];
  coachingSessionUpdates = [];
  coachingSessionCreates = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (!bruker) throw new Error("unauthenticated");
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") throw new Error("forbidden");
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
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  user: {
    findFirst: async ({ where }: { where: { id: string; deletedAt: null } }) => {
      const s = spillere[where.id];
      return s && s.deletedAt === null ? { id: s.id } : null;
    },
  },
  coachingSession: {
    findUnique: async ({ where }: { where: { id: string } }) => trader[where.id] ?? null,
    findFirst: async ({ where }: { where: { userId: string; coachId: string; kind: string } }) => {
      const traad = Object.values(direkteTraader).find(
        (t) => t.userId === where.userId && t.coachId === where.coachId,
      );
      return traad ? { id: traad.id, messages: traad.messages } : null;
    },
    update: async ({ where, data }: { where: { id: string }; data: { messages: unknown[] } }) => {
      coachingSessionUpdates.push({ id: where.id, data });
      if (trader[where.id]) trader[where.id].messages = data.messages;
      if (direkteTraader[where.id]) direkteTraader[where.id].messages = data.messages;
      return { id: where.id };
    },
    create: async ({ data }: { data: { userId: string; coachId: string; messages: unknown[] } }) => {
      coachingSessionCreates.push(data);
      const id = `traad-ny-${coachingSessionCreates.length}`;
      direkteTraader[id] = { id, userId: data.userId, coachId: data.coachId, messages: data.messages };
      return { id };
    },
  },
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(prismaMock),
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("sendMelding avviser PLAYER med ok:false, ingen skriving", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { sendMelding } = await actions();
  const svar = await sendMelding("traad-a", "Hei");
  assert.equal(svar.ok, false);
  assert.equal(coachingSessionUpdates.length, 0);
});

test("sendMelding avviser uinnlogget med ok:false, ingen skriving", async () => {
  bruker = null;
  const { sendMelding } = await actions();
  const svar = await sendMelding("traad-a", "Hei");
  assert.equal(svar.ok, false);
  assert.equal(coachingSessionUpdates.length, 0);
});

test("sendMelding avviser tom melding", async () => {
  const { sendMelding } = await actions();
  const svar = await sendMelding("traad-a", "");
  assert.equal(svar.ok, false);
  assert.equal(coachingSessionUpdates.length, 0);
});

test("sendMelding avviser ukjent tråd", async () => {
  const { sendMelding } = await actions();
  const svar = await sendMelding("finnes-ikke", "Hei");
  assert.equal(svar.ok, false);
  assert.equal(svar.error, "Tråd ikke funnet");
});

test("sendMelding avviser COACH som ikke eier tråden", async () => {
  const { sendMelding } = await actions();
  const svar = await sendMelding("traad-b", "Hei");
  assert.equal(svar.ok, false);
  assert.equal(svar.error, "Ikke tilgang til denne tråden");
  assert.equal(coachingSessionUpdates.length, 0);
});

test("sendMelding legger til melding for COACH som eier tråden", async () => {
  const { sendMelding } = await actions();
  const svar = await sendMelding("traad-a", "Hei der");
  assert.equal(svar.ok, true);
  assert.equal(coachingSessionUpdates.length, 1);
  const meldinger = (coachingSessionUpdates[0]?.data as { messages: Array<{ content: string }> }).messages;
  assert.equal(meldinger.at(-1)?.content, "Hei der");
});

test("sendMelding lar ADMIN skrive i en tråd hen ikke eier", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { sendMelding } = await actions();
  const svar = await sendMelding("traad-b", "Admin-svar");
  assert.equal(svar.ok, true);
  assert.equal(coachingSessionUpdates.length, 1);
});

test("sendMeldingTilSpiller avviser PLAYER med ok:false", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { sendMeldingTilSpiller } = await actions();
  const svar = await sendMeldingTilSpiller("spiller-a", "Hei");
  assert.equal(svar.ok, false);
  assert.equal(coachingSessionCreates.length, 0);
});

test("sendMeldingTilSpiller avviser uinnlogget med ok:false", async () => {
  bruker = null;
  const { sendMeldingTilSpiller } = await actions();
  const svar = await sendMeldingTilSpiller("spiller-a", "Hei");
  assert.equal(svar.ok, false);
  assert.equal(coachingSessionCreates.length, 0);
});

test("sendMeldingTilSpiller avviser tom melding", async () => {
  const { sendMeldingTilSpiller } = await actions();
  const svar = await sendMeldingTilSpiller("spiller-a", "");
  assert.equal(svar.ok, false);
});

test("sendMeldingTilSpiller avviser myk-slettet/ukjent spiller", async () => {
  const { sendMeldingTilSpiller } = await actions();
  const svar = await sendMeldingTilSpiller("spiller-slettet", "Hei");
  assert.equal(svar.ok, false);
  assert.equal(svar.error, "Spiller ikke funnet");
  assert.equal(coachingSessionCreates.length, 0);
});

test("sendMeldingTilSpiller avviser COACH uten tilgang til spilleren", async () => {
  coachensSpillere = new Set();
  const { sendMeldingTilSpiller } = await actions();
  const svar = await sendMeldingTilSpiller("spiller-a", "Hei");
  assert.equal(svar.ok, false);
  assert.match(svar.error ?? "", /ikke tilgang/i);
  assert.equal(coachingSessionCreates.length, 0);
});

test("sendMeldingTilSpiller oppretter ny DIRECT-tråd for COACH med tilgang", async () => {
  const { sendMeldingTilSpiller } = await actions();
  const svar = await sendMeldingTilSpiller("spiller-a", "Første melding");
  assert.equal(svar.ok, true);
  assert.equal(coachingSessionCreates.length, 1);
  assert.ok(svar.threadId);
});

test("sendMeldingTilSpiller gjenbruker eksisterende DIRECT-tråd", async () => {
  direkteTraader["traad-direkte-1"] = { id: "traad-direkte-1", userId: "spiller-a", coachId: "coach-a", messages: [] };
  const { sendMeldingTilSpiller } = await actions();
  const svar = await sendMeldingTilSpiller("spiller-a", "Andre melding");
  assert.equal(svar.ok, true);
  assert.equal(svar.threadId, "traad-direkte-1");
  assert.equal(coachingSessionCreates.length, 0);
  assert.equal(coachingSessionUpdates.length, 1);
});
