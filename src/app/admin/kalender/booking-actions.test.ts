/**
 * R-I: admin/kalender/booking-actions.ts. Hurtigbooking fra kalenderluka er
 * en delt COACH/ADMIN-ressurs (ingen per-coach eierskap på selve actionen —
 * tjenestelisten filtreres til coachens egne + felles, men bookIKalender kan
 * booke enhver spiller mot enhver tjeneste den ser). Vernet testet her er
 * rollegrensen: begge handlinger skal avvise PLAYER/uinnlogget uten å lese
 * eller skrive noe. `opprettOktPaaTid` (fra legacy calendar/actions) mockes
 * som ekstern avhengighet — selve kollisjonsvernet der er ikke denne filens
 * ansvar.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

let opprettOktKall: unknown[] = [];
let serviceTypeFindManyKall = 0;

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  opprettOktKall = [];
  serviceTypeFindManyKall = 0;
}

mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (!bruker) throw new Error("unauthenticated");
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/app/admin/(legacy)/calendar/actions", {
  namedExports: {
    opprettOktPaaTid: async (input: unknown) => {
      opprettOktKall.push(input);
      return { bookingId: "booking-ny" };
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", {
  namedExports: { prisma: prismaMock },
});
Object.assign(prismaMock, {
  serviceType: {
    findMany: async () => {
      serviceTypeFindManyKall += 1;
      return [{ id: "svc-a", name: "60 min", durationMin: 60, priceOre: 100000, maxDeltakere: 1 }];
    },
    findUnique: async ({ where }: { where: { id: string } }) =>
      where.id === "svc-a" ? { durationMin: 60 } : null,
  },
  location: {
    findMany: async () => [{ id: "sted-a", name: "Fredrikstad" }],
  },
  user: {
    findMany: async () => [{ id: "spiller-a", name: "Spiller A", email: "a@example.com" }],
  },
});

async function actions() {
  return import("./booking-actions");
}

test.beforeEach(() => {
  nullstill();
});

test("hentBookingValg avviser PLAYER uten å lese noe", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { hentBookingValg } = await actions();
  await assert.rejects(() => hentBookingValg());
  assert.equal(serviceTypeFindManyKall, 0);
});

test("hentBookingValg avviser uinnlogget uten å lese noe", async () => {
  bruker = null;
  const { hentBookingValg } = await actions();
  await assert.rejects(() => hentBookingValg());
  assert.equal(serviceTypeFindManyKall, 0);
});

test("hentBookingValg returnerer valg for COACH", async () => {
  const { hentBookingValg } = await actions();
  const valg = await hentBookingValg();
  assert.equal(valg.tjenester.length, 1);
  assert.equal(valg.steder.length, 1);
  assert.equal(valg.spillere.length, 1);
});

test("bookIKalender avviser PLAYER uten å opprette booking", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { bookIKalender } = await actions();
  await assert.rejects(() =>
    bookIKalender({
      spillerId: "spiller-a",
      serviceTypeId: "svc-a",
      locationId: "sted-a",
      start: "2026-09-20T10:00",
    }),
  );
  assert.equal(opprettOktKall.length, 0);
});

test("bookIKalender avviser uinnlogget uten å opprette booking", async () => {
  bruker = null;
  const { bookIKalender } = await actions();
  await assert.rejects(() =>
    bookIKalender({
      spillerId: "spiller-a",
      serviceTypeId: "svc-a",
      locationId: "sted-a",
      start: "2026-09-20T10:00",
    }),
  );
  assert.equal(opprettOktKall.length, 0);
});

test("bookIKalender oppretter booking for COACH", async () => {
  const { bookIKalender } = await actions();
  const svar = await bookIKalender({
    spillerId: "spiller-a",
    serviceTypeId: "svc-a",
    locationId: "sted-a",
    start: "2026-09-20T10:00",
  });
  assert.equal(svar.ok, true);
  if (svar.ok) assert.equal(svar.bookingId, "booking-ny");
  assert.equal(opprettOktKall.length, 1);
});

test("bookIKalender avviser ukjent tjeneste med ok:false, ingen booking", async () => {
  const { bookIKalender } = await actions();
  const svar = await bookIKalender({
    spillerId: "spiller-a",
    serviceTypeId: "finnes-ikke",
    locationId: "sted-a",
    start: "2026-09-20T10:00",
  });
  assert.equal(svar.ok, false);
  assert.equal(opprettOktKall.length, 0);
});

test("bookIKalender avviser ugyldig tidspunktformat med ok:false", async () => {
  const { bookIKalender } = await actions();
  const svar = await bookIKalender({
    spillerId: "spiller-a",
    serviceTypeId: "svc-a",
    locationId: "sted-a",
    start: "ikke-en-dato",
  });
  assert.equal(svar.ok, false);
  assert.equal(opprettOktKall.length, 0);
});
