/**
 * Flytting i AG-05 (Anders 29.09.2026):
 * - En booking flyttes ikke av coachen: coach foreslår, og startAt/endAt står
 *   urørt til spilleren godtar. Da flyttes den, og EP-02 går ut.
 * - En økt flyttes direkte; «Angre» trekker det uleste varselet tilbake.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";
let coach: { id: string; role: Rolle; name: string } | null = null;
let spiller: { id: string; role: Rolle } = { id: "spiller-a", role: "PLAYER" };
let booking: Record<string, unknown>;
let bookingUpdates: Array<{ where: unknown; data: Record<string, unknown> }> = [];
let flyttEposter: unknown[] = [];
let ep02: unknown[] = [];
let slettedeVarsler: unknown[] = [];
let varsler: Array<{ userId: string; title: string; groupKey?: string }> = [];
let moveKall: unknown[] = [];

const START = new Date(2031, 5, 10, 17, 0);
const SLUTT = new Date(2031, 5, 10, 18, 0);

function nullstill() {
  coach = { id: "coach-a", role: "COACH", name: "Coach A" };
  spiller = { id: "spiller-a", role: "PLAYER" };
  booking = {
    id: "b1",
    userId: "spiller-a",
    status: "CONFIRMED",
    updatedAt: new Date("2026-01-01"),
    startAt: START,
    endAt: SLUTT,
    coachId: "coach-a",
    facilityId: null,
    serviceTypeId: "svc",
    proposedStartAt: null,
    proposedEndAt: null,
    proposedById: null,
    serviceType: { name: "Privattime" },
  };
  bookingUpdates = [];
  flyttEposter = [];
  ep02 = [];
  slettedeVarsler = [];
  varsler = [];
  moveKall = [];
}
nullstill();

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (!coach) throw new Error("unauthenticated");
      if (coach.role !== "COACH" && coach.role !== "ADMIN") throw new Error("forbidden");
      return coach;
    },
  },
});
mock.module("@/lib/auth/requireConsentingUser", { namedExports: { requireConsentingUser: async () => spiller } });
mock.module("@/lib/forelder", { namedExports: { hentBarnHvisTilhoerer: async () => null } });
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/google-calendar-kilder", { namedExports: { pushBooking: async () => undefined } });
mock.module("@/lib/notifications", {
  namedExports: { notify: async (v: { userId: string; title: string; groupKey?: string }) => { varsler.push(v); } },
});
mock.module("@/lib/email/booking-emails", {
  namedExports: {
    sendBookingFlytteforslag: async (id: string) => { flyttEposter.push(id); },
    sendBookingRescheduled: async (...a: unknown[]) => { ep02.push(a); },
  },
});
mock.module("@/lib/booking/kollisjonsvern", {
  namedExports: { sjekkKollisjon: async () => ({ plassNr: 1 }), erKollisjonsfeil: () => false, kollisjonsmelding: () => "" },
});
mock.module("@/lib/workbench/wb-actions", {
  namedExports: {
    moveSession: async (input: { sessionId: string; newDate: string; newStartMinute: number }) => {
      moveKall.push(input);
      return { ok: true, data: { id: input.sessionId, playerId: "spiller-a", title: "Wedge", status: "PUBLISHED", date: input.newDate, startMinute: input.newStartMinute } };
    },
  },
});
const bookingApi = {
  findFirst: async () => booking,
  findUnique: async () => booking,
  updateMany: async (args: { where: unknown; data: Record<string, unknown> }) => {
    bookingUpdates.push(args);
    booking = { ...booking, ...args.data };
    return { count: 1 };
  },
};
const prismaMock: Record<string, unknown> = {
  booking: bookingApi,
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({ booking: bookingApi }),
  notification: {
    deleteMany: async (args: unknown) => { slettedeVarsler.push(args); return { count: 1 }; },
    count: async () => 0,
  },
};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });

test.beforeEach(nullstill);

test("forslag endrer ikke tiden — bare forslagsfeltene skrives", async () => {
  const { foreslaaNyBookingtid } = await import("./flytt-actions");
  const res = await foreslaaNyBookingtid({ bookingId: "b1", dato: "2031-06-12", tid: "09:30" });
  assert.deepEqual(res, { ok: true, varslet: true });
  assert.equal(bookingUpdates.length, 1);
  const data = bookingUpdates[0].data;
  assert.equal("startAt" in data, false);
  assert.equal("endAt" in data, false);
  assert.equal((data.proposedStartAt as Date).getTime(), new Date(Date.UTC(2031, 5, 12, 9, 30)).getTime());
  assert.equal((data.proposedEndAt as Date).getTime(), new Date(Date.UTC(2031, 5, 12, 10, 30)).getTime());
  assert.equal(data.proposedById, "coach-a");
  assert.equal((booking.startAt as Date).getTime(), START.getTime());
  assert.deepEqual(flyttEposter, ["b1"]);
});

test("gjestebooking uten spillerkonto kan ikke få forslag", async () => {
  booking = { ...booking, userId: null };
  const { foreslaaNyBookingtid } = await import("./flytt-actions");
  const res = await foreslaaNyBookingtid({ bookingId: "b1", dato: "2031-06-12", tid: "09:30" });
  assert.equal(res.ok, false);
  assert.equal(bookingUpdates.length, 0);
});

test("spilleren godtar: bookingen flyttes, forslaget nullstilles og EP-02 sendes", async () => {
  const { foreslaaNyBookingtid } = await import("./flytt-actions");
  await foreslaaNyBookingtid({ bookingId: "b1", dato: "2031-06-12", tid: "09:30" });
  const { godtaFlytteforslag } = await import("@/app/portal/booking/[bookingId]/actions");
  const res = await godtaFlytteforslag("b1");
  assert.deepEqual(res, { ok: true });
  assert.equal((booking.startAt as Date).getTime(), new Date(Date.UTC(2031, 5, 12, 9, 30)).getTime());
  assert.equal(booking.proposedStartAt, null);
  assert.equal(ep02.length, 1);
  assert.equal(((ep02[0] as unknown[])[1] as Date).getTime(), START.getTime(), "EP-02 får den gamle tiden");
});

test("spilleren avslår: tiden står og forslaget fjernes", async () => {
  const { foreslaaNyBookingtid } = await import("./flytt-actions");
  await foreslaaNyBookingtid({ bookingId: "b1", dato: "2031-06-12", tid: "09:30" });
  const { avslaaFlytteforslag } = await import("@/app/portal/booking/[bookingId]/actions");
  await avslaaFlytteforslag("b1");
  assert.equal((booking.startAt as Date).getTime(), START.getTime());
  assert.equal(booking.proposedStartAt, null);
  assert.equal(ep02.length, 0);
});

test("en annen spiller kan ikke godta forslaget", async () => {
  const { foreslaaNyBookingtid } = await import("./flytt-actions");
  await foreslaaNyBookingtid({ bookingId: "b1", dato: "2031-06-12", tid: "09:30" });
  spiller = { id: "spiller-b", role: "PLAYER" };
  const { godtaFlytteforslag } = await import("@/app/portal/booking/[bookingId]/actions");
  const res = await godtaFlytteforslag("b1");
  assert.equal(res.ok, false);
  assert.equal((booking.startAt as Date).getTime(), START.getTime());
});

test("økt flyttes direkte og spilleren varsles; angre trekker varselet tilbake", async () => {
  const { flyttOktIKalender, angreOktFlytting } = await import("./flytt-actions");
  const res = await flyttOktIKalender({ sessionId: "o1", dato: "2031-06-12", startMin: 600 });
  assert.deepEqual(res, { ok: true, varslet: true });
  assert.equal(varsler[0].groupKey, "kalender-flytt:o1");
  await angreOktFlytting({ sessionId: "o1", dato: "2031-06-10", startMin: 540 });
  assert.deepEqual(moveKall.at(-1), { sessionId: "o1", newDate: "2031-06-10", newStartMinute: 540 });
  assert.equal(slettedeVarsler.length, 1);
  assert.equal(varsler.length, 1, "ingen ny beskjed når det uleste varselet ble trukket tilbake");
});
