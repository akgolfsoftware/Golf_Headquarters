/**
 * R-I: admin/agencyos/uka/actions.ts. To søsterhandlinger (flytt til DAG,
 * flytt til TID) uten per-coach eierskap — enhver COACH/ADMIN kan flytte
 * enhver booking (samme mønster som `(legacy)/calendar/actions.ts`).
 * Testen dekker rollegrensen, status-guarden (fullført/kansellert kan ikke
 * flyttes), kollisjonsvernet, og at ren dato («YYYY-MM-DD») tolkes som
 * LOKAL dag — ikke UTC-skiftet.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

const bookings: Record<string, { id: string; startAt: Date; endAt: Date; status: string; coachId: string | null; facilityId: string | null; serviceTypeId: string }> = {
  "booking-1": {
    id: "booking-1",
    startAt: new Date(2026, 8, 20, 10, 0), // lokal 20.09.2026 10:00
    endAt: new Date(2026, 8, 20, 11, 0),
    status: "CONFIRMED",
    coachId: "coach-a",
    facilityId: null,
    serviceTypeId: "svc-a",
  },
  "booking-fullfort": {
    id: "booking-fullfort",
    startAt: new Date(2026, 8, 20, 10, 0),
    endAt: new Date(2026, 8, 20, 11, 0),
    status: "COMPLETED",
    coachId: "coach-a",
    facilityId: null,
    serviceTypeId: "svc-a",
  },
};

let simulerKollisjon = false;
let bookingUpdates: Array<{ id: string; data: { startAt: Date; endAt: Date } }> = [];
let pushBookingKall: string[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  simulerKollisjon = false;
  bookingUpdates = [];
  pushBookingKall = [];
}

class BookingKollisjonStub extends Error {}

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
mock.module("@/lib/booking/kollisjonsvern", {
  namedExports: {
    sjekkKollisjon: async () => {
      if (simulerKollisjon) throw new BookingKollisjonStub("kollisjon");
      return { plassNr: 1 };
    },
    erKollisjonsfeil: (e: unknown) => e instanceof BookingKollisjonStub,
    kollisjonsmelding: () => "Tidspunktet er allerede booket.",
  },
});
mock.module("@/lib/google-calendar-kilder", {
  namedExports: {
    pushBooking: async (bookingId: string) => {
      pushBookingKall.push(bookingId);
    },
  },
});
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  booking: {
    findUnique: async ({ where }: { where: { id: string } }) => bookings[where.id] ?? null,
    update: async ({ where, data }: { where: { id: string }; data: { startAt: Date; endAt: Date } }) => {
      bookingUpdates.push({ id: where.id, data });
      return { id: where.id };
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

test("flyttBookingTilDag avviser PLAYER uten å flytte", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { flyttBookingTilDag } = await actions();
  await assert.rejects(() => flyttBookingTilDag("booking-1", "2026-09-21"));
  assert.equal(bookingUpdates.length, 0);
});

test("flyttBookingTilDag avviser uinnlogget uten å flytte", async () => {
  bruker = null;
  const { flyttBookingTilDag } = await actions();
  await assert.rejects(() => flyttBookingTilDag("booking-1", "2026-09-21"));
  assert.equal(bookingUpdates.length, 0);
});

test("flyttBookingTilDag avviser ugyldig dato-format", async () => {
  const { flyttBookingTilDag } = await actions();
  const svar = await flyttBookingTilDag("booking-1", "ikke-en-dato");
  assert.equal(svar.ok, false);
  assert.equal(bookingUpdates.length, 0);
});

test("flyttBookingTilDag avviser ukjent booking", async () => {
  const { flyttBookingTilDag } = await actions();
  const svar = await flyttBookingTilDag("finnes-ikke", "2026-09-21");
  assert.equal(svar.ok, false);
});

test("flyttBookingTilDag avviser fullført booking", async () => {
  const { flyttBookingTilDag } = await actions();
  const svar = await flyttBookingTilDag("booking-fullfort", "2026-09-21");
  assert.equal(svar.ok, false);
  assert.equal(bookingUpdates.length, 0);
});

test("flyttBookingTilDag avviser ved kollisjon", async () => {
  simulerKollisjon = true;
  const { flyttBookingTilDag } = await actions();
  const svar = await flyttBookingTilDag("booking-1", "2026-09-21");
  assert.equal(svar.ok, false);
  assert.equal(bookingUpdates.length, 0);
});

test("flyttBookingTilDag flytter til lokal dag (YYYY-MM-DD) uten UTC-skift", async () => {
  const { flyttBookingTilDag } = await actions();
  const svar = await flyttBookingTilDag("booking-1", "2026-09-21");
  assert.equal(svar.ok, true);
  const ny = bookingUpdates[0]?.data.startAt as Date;
  assert.equal(ny.getFullYear(), 2026);
  assert.equal(ny.getMonth(), 8); // september (0-indeksert)
  assert.equal(ny.getDate(), 21);
  assert.equal(ny.getHours(), 10); // klokkeslettet beholdt
  assert.deepEqual(pushBookingKall, ["booking-1"]);
});

test("flyttBookingTilTid avviser PLAYER uten å flytte", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { flyttBookingTilTid } = await actions();
  await assert.rejects(() => flyttBookingTilTid("booking-1", "14:00"));
  assert.equal(bookingUpdates.length, 0);
});

test("flyttBookingTilTid avviser uinnlogget uten å flytte", async () => {
  bruker = null;
  const { flyttBookingTilTid } = await actions();
  await assert.rejects(() => flyttBookingTilTid("booking-1", "14:00"));
  assert.equal(bookingUpdates.length, 0);
});

test("flyttBookingTilTid avviser ugyldig klokkeslettformat", async () => {
  const { flyttBookingTilTid } = await actions();
  const svar = await flyttBookingTilTid("booking-1", "25:99");
  assert.equal(svar.ok, false);
  assert.equal(bookingUpdates.length, 0);
});

test("flyttBookingTilTid avviser ukjent booking", async () => {
  const { flyttBookingTilTid } = await actions();
  const svar = await flyttBookingTilTid("finnes-ikke", "14:00");
  assert.equal(svar.ok, false);
});

test("flyttBookingTilTid avviser fullført booking", async () => {
  const { flyttBookingTilTid } = await actions();
  const svar = await flyttBookingTilTid("booking-fullfort", "14:00");
  assert.equal(svar.ok, false);
  assert.equal(bookingUpdates.length, 0);
});

test("flyttBookingTilTid avviser når klokkeslettet er uendret", async () => {
  const { flyttBookingTilTid } = await actions();
  const svar = await flyttBookingTilTid("booking-1", "10:00");
  assert.equal(svar.ok, false);
  assert.equal(bookingUpdates.length, 0);
});

test("flyttBookingTilTid avviser ved kollisjon", async () => {
  simulerKollisjon = true;
  const { flyttBookingTilTid } = await actions();
  const svar = await flyttBookingTilTid("booking-1", "14:00");
  assert.equal(svar.ok, false);
  assert.equal(bookingUpdates.length, 0);
});

test("flyttBookingTilTid flytter klokkeslett og beholder dagen", async () => {
  const { flyttBookingTilTid } = await actions();
  const svar = await flyttBookingTilTid("booking-1", "14:30");
  assert.equal(svar.ok, true);
  const ny = bookingUpdates[0]?.data.startAt as Date;
  assert.equal(ny.getDate(), 20); // uendret dag
  assert.equal(ny.getHours(), 14);
  assert.equal(ny.getMinutes(), 30);
  assert.deepEqual(pushBookingKall, ["booking-1"]);
});
