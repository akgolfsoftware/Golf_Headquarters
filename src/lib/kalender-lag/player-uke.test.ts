import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

test("ukevisningen fordeler skole, frister og turnering på egne datoer med én lesing per lag", async (t) => {
  let wbKall = 0;
  let bookingQuery: Prisma.BookingFindManyArgs | undefined;
  t.mock.module("@/lib/prisma", { namedExports: { prisma: {
    user: { findUnique: async () => ({ schoolYear: 1 }) },
    workbenchSession: { findMany: async () => { wbKall++; return []; } },
    tournamentEntry: { findMany: async () => [{ id: "turnering", manualDate: null, tournament: { name: "Testturnering", startDate: new Date("2026-03-28T09:00Z") } }] },
    testAssignment: { findMany: async () => [{ id: "test", dueDate: new Date("2026-03-27T09:00Z"), test: { name: "Testøvelse" } }] },
    schoolScheduleEntry: { findMany: async () => [{ id: "skole", title: "Prøve", date: new Date("2026-03-25T09:00Z") }] },
    booking: { findMany: async (args: Prisma.BookingFindManyArgs) => { bookingQuery = args; return []; } },
  } } });
  const { hentSpillerUkeITiden } = await import("./player-dag");
  const rows = await hentSpillerUkeITiden("syntetisk-spiller", "2026-03-23");
  assert.equal(wbKall, 0);
  assert.deepEqual(bookingQuery?.where?.startAt, { gte: new Date("2026-03-22T23:00Z"), lt: new Date("2026-03-29T22:00Z") });
  assert.deepEqual(rows.map((h) => [h.dato, h.startMin]), [["2026-03-25", null], ["2026-03-27", null], ["2026-03-28", null]]);
});
