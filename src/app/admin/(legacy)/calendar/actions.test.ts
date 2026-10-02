/**
 * R-I: admin/(legacy)/calendar/actions.ts. Fire admin-mutasjoner uten
 * per-coach eierskap (rollegrensen er hele vernet — ingen scoping til
 * "egne" bookinger her, ulikt `(legacy)/bookinger/actions.ts`). Testen
 * dekker rollegrensen (PLAYER/uinnlogget avvist for alle fire) pluss
 * forretningsreglene i `opprettOktPaaTid` (manglende felt, ukjent spiller/
 * tjeneste/lokasjon, fasilitet fra annen lokasjon, kollisjon rethrows med
 * norsk melding) og status-guardene i `moveSession`/`cancelSession`
 * (ikke funnet / allerede kansellert gir `ok:false`, ikke unntak).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

const spillere: Record<string, { id: string; role: string }> = {
  "spiller-a": { id: "spiller-a", role: "PLAYER" },
  "coach-b": { id: "coach-b", role: "COACH" },
};
const serviceTypes: Record<string, { id: string; priceOre: number; coachUserId: string | null }> = {
  "svc-a": { id: "svc-a", priceOre: 100000, coachUserId: "coach-a" },
};
const locations: Record<string, { id: string }> = { "sted-a": { id: "sted-a" } };
const facilities: Record<string, { id: string; locationId: string; active: boolean }> = {
  "fasilitet-a": { id: "fasilitet-a", locationId: "sted-a", active: true },
  "fasilitet-inaktiv": { id: "fasilitet-inaktiv", locationId: "sted-a", active: false },
  "fasilitet-annet-sted": { id: "fasilitet-annet-sted", locationId: "annet-sted", active: true },
};
const bookings: Record<string, { id: string; startAt: Date; endAt: Date; status: string; coachId: string | null; facilityId: string | null; serviceTypeId: string; userId: string }> = {
  "booking-1": {
    id: "booking-1",
    startAt: new Date("2026-09-20T10:00:00Z"),
    endAt: new Date("2026-09-20T11:00:00Z"),
    status: "CONFIRMED",
    coachId: "coach-a",
    facilityId: null,
    serviceTypeId: "svc-a",
    userId: "spiller-a",
  },
  "booking-kansellert": {
    id: "booking-kansellert",
    startAt: new Date("2026-09-20T10:00:00Z"),
    endAt: new Date("2026-09-20T11:00:00Z"),
    status: "CANCELLED",
    coachId: "coach-a",
    facilityId: null,
    serviceTypeId: "svc-a",
    userId: "spiller-a",
  },
};

let simulerKollisjon = false;
let bookingCreates: unknown[] = [];
let bookingUpdates: Array<{ id: string; data: unknown }> = [];
let auditWrites: Array<{ action: string; target: string }> = [];
let pushBookingKall: string[] = [];
let varsleKall: string[] = [];
/** Spillerens coaching-pakke (Klipp i bookingveiviseren). */
let pakke: { id: string; status: string; currentPeriodEnd: Date | null; monthlyCredits: number; creditsRemaining: number } | null = null;
let klippTrekk: unknown[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  simulerKollisjon = false;
  bookingCreates = [];
  bookingUpdates = [];
  auditWrites = [];
  pushBookingKall = [];
  varsleKall = [];
  bookings["booking-1"].status = "CONFIRMED";
  pakke = null;
  klippTrekk = [];
}

class BookingKollisjonStub extends Error {}

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
mock.module("@/lib/booking/varsle-ny-booking", {
  namedExports: {
    varsleNyBooking: async (bookingId: string) => {
      varsleKall.push(bookingId);
    },
  },
});
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; target: string }) => {
      auditWrites.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  user: {
    findUnique: async ({ where }: { where: { id: string } }) => spillere[where.id] ?? null,
  },
  serviceType: {
    findUnique: async ({ where }: { where: { id: string } }) => serviceTypes[where.id] ?? null,
  },
  location: {
    findUnique: async ({ where }: { where: { id: string } }) => locations[where.id] ?? null,
  },
  facility: {
    findUnique: async ({ where }: { where: { id: string } }) => facilities[where.id] ?? null,
  },
  booking: {
    findUnique: async ({ where }: { where: { id: string } }) => bookings[where.id] ?? null,
    create: async ({ data }: { data: { id?: string } }) => {
      bookingCreates.push(data);
      return { id: "booking-ny" };
    },
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      bookingUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
  },
  subscription: {
    findUnique: async () => pakke,
    updateMany: async (args: unknown) => {
      klippTrekk.push(args);
      if (!pakke || pakke.creditsRemaining <= 0) return { count: 0 };
      pakke.creditsRemaining -= 1;
      return { count: 1 };
    },
  },
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(prismaMock),
});

async function actions() {
  return import("./actions");
}

const gyldigInput = {
  spillerId: "spiller-a",
  serviceTypeId: "svc-a",
  locationId: "sted-a",
  startAt: "2026-09-25T10:00:00Z",
  varighetMin: 60,
};

test.beforeEach(() => {
  nullstill();
});

test("opprettOktPaaTid avviser PLAYER uten å opprette booking", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { opprettOktPaaTid } = await actions();
  await assert.rejects(() => opprettOktPaaTid(gyldigInput));
  assert.equal(bookingCreates.length, 0);
});

test("opprettOktPaaTid avviser uinnlogget uten å opprette booking", async () => {
  bruker = null;
  const { opprettOktPaaTid } = await actions();
  await assert.rejects(() => opprettOktPaaTid(gyldigInput));
  assert.equal(bookingCreates.length, 0);
});

test("opprettOktPaaTid oppretter booking for COACH og varsler/audit-logger", async () => {
  const { opprettOktPaaTid } = await actions();
  const svar = await opprettOktPaaTid(gyldigInput);
  assert.equal(svar.ok, true);
  assert.equal(bookingCreates.length, 1);
  assert.deepEqual(pushBookingKall, ["booking-ny"]);
  assert.deepEqual(varsleKall, ["booking-ny"]);
  assert.equal(auditWrites.at(-1)?.action, "booking.created");
});

test("opprettOktPaaTid avviser en bruker som ikke er PLAYER (rollen på target-brukeren)", async () => {
  const { opprettOktPaaTid } = await actions();
  await assert.rejects(() => opprettOktPaaTid({ ...gyldigInput, spillerId: "coach-b" }), /ikke en spiller/i);
  assert.equal(bookingCreates.length, 0);
});

test("opprettOktPaaTid avviser ukjent tjeneste", async () => {
  const { opprettOktPaaTid } = await actions();
  await assert.rejects(
    () => opprettOktPaaTid({ ...gyldigInput, serviceTypeId: "finnes-ikke" }),
    /Tjeneste finnes ikke/,
  );
});

test("opprettOktPaaTid avviser fasilitet fra annen lokasjon", async () => {
  const { opprettOktPaaTid } = await actions();
  await assert.rejects(
    () => opprettOktPaaTid({ ...gyldigInput, facilityId: "fasilitet-annet-sted" }),
    /ikke til valgt lokasjon/,
  );
  assert.equal(bookingCreates.length, 0);
});

test("opprettOktPaaTid avviser inaktiv fasilitet", async () => {
  const { opprettOktPaaTid } = await actions();
  await assert.rejects(
    () => opprettOktPaaTid({ ...gyldigInput, facilityId: "fasilitet-inaktiv" }),
    /inaktiv/,
  );
});

test("opprettOktPaaTid kaster norsk kollisjonsmelding ved dobbeltbooking", async () => {
  simulerKollisjon = true;
  const { opprettOktPaaTid } = await actions();
  await assert.rejects(() => opprettOktPaaTid(gyldigInput), /allerede booket/);
  assert.equal(bookingCreates.length, 0);
});

test("createSessionFromCalendar avviser PLAYER (delegerer til opprettOktPaaTid)", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { createSessionFromCalendar } = await actions();
  await assert.rejects(() => createSessionFromCalendar(gyldigInput));
  assert.equal(bookingCreates.length, 0);
});

test("moveSession avviser PLAYER uten å flytte booking", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { moveSession } = await actions();
  await assert.rejects(() => moveSession("booking-1", "2026-09-21T10:00:00Z"));
  assert.equal(bookingUpdates.length, 0);
});

test("moveSession avviser uinnlogget uten å flytte booking", async () => {
  bruker = null;
  const { moveSession } = await actions();
  await assert.rejects(() => moveSession("booking-1", "2026-09-21T10:00:00Z"));
  assert.equal(bookingUpdates.length, 0);
});

test("moveSession returnerer ok:false for ukjent booking", async () => {
  const { moveSession } = await actions();
  const svar = await moveSession("finnes-ikke", "2026-09-21T10:00:00Z");
  assert.equal(svar.ok, false);
});

test("moveSession returnerer ok:false for allerede kansellert booking", async () => {
  const { moveSession } = await actions();
  const svar = await moveSession("booking-kansellert", "2026-09-21T10:00:00Z");
  assert.equal(svar.ok, false);
});

test("moveSession returnerer ok:false ved kollisjon på nytt tidspunkt", async () => {
  simulerKollisjon = true;
  const { moveSession } = await actions();
  const svar = await moveSession("booking-1", "2026-09-21T10:00:00Z");
  assert.equal(svar.ok, false);
  assert.equal(bookingUpdates.length, 0);
});

test("moveSession flytter booking for COACH", async () => {
  const { moveSession } = await actions();
  const svar = await moveSession("booking-1", "2026-09-21T10:00:00Z");
  assert.equal(svar.ok, true);
  assert.equal(bookingUpdates.length, 1);
  assert.equal(auditWrites.at(-1)?.action, "booking.moved");
});

test("cancelSession avviser PLAYER uten å kansellere", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { cancelSession } = await actions();
  await assert.rejects(() => cancelSession("booking-1"));
  assert.equal(bookingUpdates.length, 0);
});

test("cancelSession avviser uinnlogget uten å kansellere", async () => {
  bruker = null;
  const { cancelSession } = await actions();
  await assert.rejects(() => cancelSession("booking-1"));
  assert.equal(bookingUpdates.length, 0);
});

test("cancelSession returnerer ok:false for allerede kansellert booking", async () => {
  const { cancelSession } = await actions();
  const svar = await cancelSession("booking-kansellert");
  assert.equal(svar.ok, false);
  assert.equal(bookingUpdates.length, 0);
});

test("cancelSession kansellerer booking for COACH", async () => {
  const { cancelSession } = await actions();
  const svar = await cancelSession("booking-1");
  assert.equal(svar.ok, true);
  assert.equal((bookingUpdates[0]?.data as { status: string }).status, "CANCELLED");
  assert.equal(auditWrites.at(-1)?.action, "booking.cancelled");
});

// ─── Betalingsvalg i coachens bookingveiviser (Anders 29.09.2026) ───────────

test("Klipp trekker ett klipp og lagrer bookingen med pris 0, KLIPP og pakken", async () => {
  pakke = { id: "sub-1", status: "ACTIVE", currentPeriodEnd: null, monthlyCredits: 2, creditsRemaining: 2 };
  const { opprettOktPaaTid } = await actions();
  await opprettOktPaaTid({ ...gyldigInput, betaling: "KLIPP" });
  assert.equal(klippTrekk.length, 1);
  assert.equal(pakke.creditsRemaining, 1);
  const data = bookingCreates[0] as { priceOre: number; paymentMethod: string; subscriptionId: string };
  assert.equal(data.priceOre, 0);
  assert.equal(data.paymentMethod, "KLIPP");
  assert.equal(data.subscriptionId, "sub-1");
});

test("Klipp uten klipp igjen stopper før noe lagres", async () => {
  pakke = { id: "sub-1", status: "ACTIVE", currentPeriodEnd: null, monthlyCredits: 2, creditsRemaining: 0 };
  const { opprettOktPaaTid } = await actions();
  await assert.rejects(() => opprettOktPaaTid({ ...gyldigInput, betaling: "KLIPP" }), /klipp/);
  assert.equal(bookingCreates.length, 0);
});

test("Klipp uten coaching-pakke avvises", async () => {
  const { opprettOktPaaTid } = await actions();
  await assert.rejects(() => opprettOktPaaTid({ ...gyldigInput, betaling: "KLIPP" }), /coaching-pakke/);
  assert.equal(bookingCreates.length, 0);
});

test("Faktura beholder tjenestens pris og merkes FAKTURA", async () => {
  const { opprettOktPaaTid } = await actions();
  await opprettOktPaaTid({ ...gyldigInput, betaling: "FAKTURA" });
  const data = bookingCreates[0] as { priceOre: number; paymentMethod: string; subscriptionId?: string };
  assert.equal(data.priceOre, 100000);
  assert.equal(data.paymentMethod, "FAKTURA");
  assert.equal(data.subscriptionId, undefined);
  assert.equal(klippTrekk.length, 0);
});

test("Gratis gir pris 0 og GRATIS", async () => {
  const { opprettOktPaaTid } = await actions();
  await opprettOktPaaTid({ ...gyldigInput, betaling: "GRATIS" });
  const data = bookingCreates[0] as { priceOre: number; paymentMethod: string };
  assert.equal(data.priceOre, 0);
  assert.equal(data.paymentMethod, "GRATIS");
});

test("uten betalingsvalg er bookingen som før (ingen betalingsmåte)", async () => {
  const { opprettOktPaaTid } = await actions();
  await opprettOktPaaTid(gyldigInput);
  const data = bookingCreates[0] as { priceOre: number; paymentMethod?: string };
  assert.equal(data.priceOre, 100000);
  assert.equal(data.paymentMethod, undefined);
});


test("booking avviser normalisert ugyldig dato og ukjent betalingsmåte før lagring", async () => {
  const { opprettOktPaaTid } = await import("./actions");
  await assert.rejects(() => opprettOktPaaTid({ ...gyldigInput, startAt: "2098-02-31T09:00" }), /Ugyldig/);
  await assert.rejects(() => opprettOktPaaTid({ ...gyldigInput, betaling: "UKJENT" as "KLIPP" }), /betalingsmåte/);
  assert.equal(bookingCreates.length, 0); assert.equal(klippTrekk.length, 0);
});
