import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let failCoach = false;
let coachId: string | null = "valgt-coach";
let serviceCoach: string | null = "gammel-coach";
const sent: { userId: string; body: string }[] = [];
mock.module("@/lib/prisma", { namedExports: { prisma: {
  booking: { findUnique: async () => ({ id: "booking", coachId, startAt: new Date(2026, 6, 15, 10, 30), priceOre: 10000,
    guestName: "Testspiller", plassNr: 1, user: null, serviceType: { name: "Testtime", coachUserId: serviceCoach, maxDeltakere: 1 }, location: { name: "Teststed" } }) },
  user: { findMany: async () => [{ id: "admin" }] },
} } });
mock.module("@/lib/notifications", { namedExports: { notify: async (input: { userId: string; body: string }) => {
  sent.push(input); if (failCoach && input.userId === "valgt-coach") throw new Error("syntetisk feil");
} } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => { throw new Error("syntetisk loggfeil"); } } });
let varsle: typeof import("./varsle-ny-booking").varsleNyBooking;
before(async () => { varsle = (await import("./varsle-ny-booking")).varsleNyBooking; });
beforeEach(() => { sent.length = 0; failCoach = false; coachId = "valgt-coach"; serviceCoach = "gammel-coach"; });
test("varsler lagret coach og administrator med bookingens veggklokke", async () => {
  await varsle("booking", "abonnement");
  assert.deepEqual(sent.map(n => n.userId), ["valgt-coach", "admin"]);
  assert.match(sent[0].body, /10[.:]30/);
});
test("én feilet mottaker eller feillogg hindrer ikke neste mottaker", async () => {
  failCoach = true;
  await varsle("booking", "abonnement");
  assert.deepEqual(sent.map(n => n.userId), ["valgt-coach", "admin"]);
});
test("eldre booking uten coach bruker tjenestecoach og unngår dobbeltvarsel", async () => {
  coachId = null; serviceCoach = "admin";
  await varsle("booking", "stripe");
  assert.deepEqual(sent.map(n => n.userId), ["admin"]);
});
