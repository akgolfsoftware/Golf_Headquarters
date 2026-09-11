import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

test("dagens booking vises med norsk klokke og riktig døgn under overgang til sommertid", async (t) => {
  let query: Prisma.BookingFindManyArgs | undefined;
  t.mock.module("@/lib/prisma", { namedExports: { prisma: {
    user: { findUnique: async () => ({ schoolYear: null }) },
    workbenchSession: { findMany: async () => [] },
    tournamentEntry: { findMany: async () => [] },
    testAssignment: { findMany: async () => [] },
    booking: { findMany: async (args: Prisma.BookingFindManyArgs) => {
      query = args;
      return [
        { id: "morgen", startAt: new Date("2026-03-29T06:00Z"), endAt: new Date("2026-03-29T06:50Z"), serviceType: { name: "Coaching" }, facility: null },
        { id: "kveld", startAt: new Date("2026-03-29T21:30Z"), endAt: new Date("2026-03-29T22:30Z"), serviceType: { name: "Simulator" }, facility: null },
      ];
    } },
  } } });
  const { hentSpillerDagITiden } = await import("./player-dag");
  const rows = await hentSpillerDagITiden("syntetisk-spiller", "2026-03-29");
  assert.deepEqual(query?.where?.startAt, { gte: new Date("2026-03-28T23:00Z"), lt: new Date("2026-03-29T22:00Z") });
  assert.equal(rows[0].startMin, 480);
  assert.equal(rows[0].sluttMin, 530);
  assert.equal(rows[1].startMin, 1410);
  assert.equal(rows[1].sluttMin, 1440);
});
