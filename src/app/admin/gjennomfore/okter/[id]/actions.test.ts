/**
 * R-I: admin/gjennomfore/okter/[id]/actions.ts. Begge handlinger krever
 * ekte per-coach eierskap (`harCoachTilgangTilSpiller`) — en COACH uten
 * tilgang til spilleren som eier bookingen avvises med `ok:false`, IKKE et
 * unntak (feilhåndteringen er try/catch inni handlingen). Rollegrensen
 * (`requirePortalUser`) ligger derimot UTENFOR try/catch og kaster. Testen
 * dekker også `startOkt` sin idempotens-/entydig-treff-logikk: allerede
 * koblet → gjenbruk, nøyaktig én ledig PLANNED-økt → koble den, 0 eller
 * FLERE kandidater → aldri gjett, fall tilbake til en frisk økt.
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

const bookings: Record<string, {
  id: string; userId: string | null; startAt: Date; endAt: Date; status: string;
  trainingSessionV2Id: string | null; userName: string;
}> = {
  "booking-a": {
    id: "booking-a", userId: "spiller-a", startAt: new Date("2026-09-20T10:00:00Z"),
    endAt: new Date("2026-09-20T11:00:00Z"), status: "CONFIRMED",
    trainingSessionV2Id: null, userName: "Ola Nordmann",
  },
  "booking-koblet": {
    id: "booking-koblet", userId: "spiller-a", startAt: new Date("2026-09-20T10:00:00Z"),
    endAt: new Date("2026-09-20T11:00:00Z"), status: "CONFIRMED",
    trainingSessionV2Id: "session-eksisterende", userName: "Ola Nordmann",
  },
  "booking-kansellert": {
    id: "booking-kansellert", userId: "spiller-a", startAt: new Date("2026-09-20T10:00:00Z"),
    endAt: new Date("2026-09-20T11:00:00Z"), status: "CANCELLED",
    trainingSessionV2Id: null, userName: "Ola Nordmann",
  },
};

/** PLANNED-kandidater i tidsvinduet for spiller-a, styrt per test. */
let planlagteKandidater: string[] = [];
/** Hvilke av kandidatene som allerede er koblet til en (annen) booking. */
let allerdeKoblede = new Set<string>();

let sessionCreates: unknown[] = [];
let bookingUpdates: Array<{ id: string; data: unknown }> = [];
let bookingCancelUpdates: Array<{ where: unknown }> = [];
let notifyKall: Array<{ userId: string }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachensSpillere = new Set(["spiller-a"]);
  planlagteKandidater = [];
  allerdeKoblede = new Set();
  sessionCreates = [];
  bookingUpdates = [];
  bookingCancelUpdates = [];
  notifyKall = [];
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
    harCoachTilgangTilSpiller: async (_viewer: unknown, spillerId: string) => coachensSpillere.has(spillerId),
  },
});
mock.module("@/lib/notifications", {
  namedExports: {
    notify: async (input: { userId: string }) => {
      notifyKall.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  booking: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const b = bookings[where.id];
      if (!b) return null;
      return {
        userId: b.userId, startAt: b.startAt, endAt: b.endAt,
        trainingSessionV2Id: b.trainingSessionV2Id, user: { name: b.userName },
      };
    },
    findMany: async ({ where }: { where: { trainingSessionV2Id: { in: string[] } } }) =>
      where.trainingSessionV2Id.in
        .filter((id) => allerdeKoblede.has(id))
        .map((id) => ({ trainingSessionV2Id: id })),
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      bookingUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
    updateMany: async ({ where }: { where: { id: string; status: { in: string[] } } }) => {
      const b = bookings[where.id];
      if (!b || !where.status.in.includes(b.status)) return { count: 0 };
      bookingCancelUpdates.push({ where });
      return { count: 1 };
    },
  },
  trainingSessionV2: {
    findMany: async () => planlagteKandidater.map((id) => ({ id })),
    create: async ({ data }: { data: unknown }) => {
      sessionCreates.push(data);
      return { id: "session-ny" };
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("startOkt avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { startOkt } = await actions();
  await assert.rejects(() => startOkt("booking-a"));
  assert.equal(sessionCreates.length, 0);
});

test("startOkt avviser uinnlogget", async () => {
  bruker = null;
  const { startOkt } = await actions();
  await assert.rejects(() => startOkt("booking-a"));
  assert.equal(sessionCreates.length, 0);
});

test("startOkt avviser tom booking-id med ok:false", async () => {
  const { startOkt } = await actions();
  const svar = await startOkt("");
  assert.equal(svar.ok, false);
});

test("startOkt avviser ukjent booking med ok:false", async () => {
  const { startOkt } = await actions();
  const svar = await startOkt("finnes-ikke");
  assert.equal(svar.ok, false);
  assert.equal(svar.error, "Fant ikke økten.");
});

test("startOkt avviser COACH uten tilgang til spilleren med ok:false", async () => {
  coachensSpillere = new Set();
  const { startOkt } = await actions();
  const svar = await startOkt("booking-a");
  assert.equal(svar.ok, false);
  assert.match(svar.error ?? "", /ikke tilgang/i);
  assert.equal(sessionCreates.length, 0);
});

test("startOkt gjenbruker allerede koblet live-økt (idempotent)", async () => {
  const { startOkt } = await actions();
  const svar = await startOkt("booking-koblet");
  assert.equal(svar.ok, true);
  assert.equal(svar.sessionId, "session-eksisterende");
  assert.equal(sessionCreates.length, 0);
  assert.equal(bookingUpdates.length, 0);
});

test("startOkt kobler til entydig ledig PLANNED-økt", async () => {
  planlagteKandidater = ["session-planlagt-1"];
  const { startOkt } = await actions();
  const svar = await startOkt("booking-a");
  assert.equal(svar.ok, true);
  assert.equal(svar.sessionId, "session-planlagt-1");
  assert.equal(sessionCreates.length, 0);
  assert.equal(bookingUpdates[0]?.id, "booking-a");
});

test("startOkt oppretter frisk økt når ingen PLANNED-kandidater finnes", async () => {
  planlagteKandidater = [];
  const { startOkt } = await actions();
  const svar = await startOkt("booking-a");
  assert.equal(svar.ok, true);
  assert.equal(sessionCreates.length, 1);
  assert.equal((sessionCreates[0] as { miljo: string }).miljo, "M0");
});

test("startOkt gjetter ALDRI ved flere kandidater — faller tilbake til frisk økt", async () => {
  planlagteKandidater = ["session-planlagt-1", "session-planlagt-2"];
  const { startOkt } = await actions();
  const svar = await startOkt("booking-a");
  assert.equal(svar.ok, true);
  assert.equal(svar.sessionId, "session-ny");
  assert.equal(sessionCreates.length, 1);
});

test("startOkt hopper over kandidat som allerede er koblet til en annen booking", async () => {
  planlagteKandidater = ["session-alt-koblet"];
  allerdeKoblede = new Set(["session-alt-koblet"]);
  const { startOkt } = await actions();
  const svar = await startOkt("booking-a");
  assert.equal(svar.ok, true);
  assert.equal(svar.sessionId, "session-ny"); // faller til fallback, ikke den opptatte
  assert.equal(sessionCreates.length, 1);
});

test("kansellerBooking avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { kansellerBooking } = await actions();
  await assert.rejects(() => kansellerBooking("booking-a"));
  assert.equal(bookingCancelUpdates.length, 0);
});

test("kansellerBooking avviser uinnlogget", async () => {
  bruker = null;
  const { kansellerBooking } = await actions();
  await assert.rejects(() => kansellerBooking("booking-a"));
  assert.equal(bookingCancelUpdates.length, 0);
});

test("kansellerBooking avviser tom id med ok:false", async () => {
  const { kansellerBooking } = await actions();
  const svar = await kansellerBooking("");
  assert.equal(svar.ok, false);
});

test("kansellerBooking avviser ukjent booking med ok:false", async () => {
  const { kansellerBooking } = await actions();
  const svar = await kansellerBooking("finnes-ikke");
  assert.equal(svar.ok, false);
});

test("kansellerBooking avviser COACH uten tilgang til spilleren med ok:false", async () => {
  coachensSpillere = new Set();
  const { kansellerBooking } = await actions();
  const svar = await kansellerBooking("booking-a");
  assert.equal(svar.ok, false);
  assert.match(svar.error ?? "", /ikke tilgang/i);
  assert.equal(bookingCancelUpdates.length, 0);
});

test("kansellerBooking avviser en allerede kansellert booking", async () => {
  const { kansellerBooking } = await actions();
  const svar = await kansellerBooking("booking-kansellert");
  assert.equal(svar.ok, false);
  assert.match(svar.error ?? "", /allerede avlyst/i);
});

test("kansellerBooking avlyser og varsler spilleren for COACH med tilgang", async () => {
  const { kansellerBooking } = await actions();
  const svar = await kansellerBooking("booking-a");
  assert.equal(svar.ok, true);
  assert.equal(bookingCancelUpdates.length, 1);
  assert.deepEqual(notifyKall.map((n) => n.userId), ["spiller-a"]);
});
