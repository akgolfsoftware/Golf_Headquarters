/**
 * R-B: e-post skal ALDRI finnes i et tool-resultat, og navn skal alltid være
 * pseudonymisert — testet ved å serialisere HELE svaret (samme mønster som
 * `hent-wang-gruppe.test.ts`: et felt ingen tenkte på er nettopp der lekkasjer
 * skjer).
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";

const KARI = { id: "u-kari", name: "Kari Nordmann", email: "kari@example.no" };

mock.module("@/lib/auth/coached", {
  namedExports: {
    coachScopedPlayerWhere: () => ({}),
    harCoachTilgangTilSpiller: async () => true,
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      booking: {
        findMany: async () => [
          {
            id: "b-1",
            startAt: new Date(),
            endAt: new Date(),
            status: "CONFIRMED",
            notes: null,
            priceOre: 50000,
            user: { id: KARI.id, name: KARI.name, email: KARI.email },
            serviceType: { id: "s-1", name: "Performance 60", slug: "performance-60" },
            location: { id: "l-1", name: "Mulligan" },
            facility: null,
          },
        ],
      },
    },
  },
});

test("getUpcomingBookings: ingen e-post og intet ekte navn noe sted i svaret", async () => {
  const { buildReadTools } = await import("../read");
  const tools = buildReadTools({ id: "coach-a", role: "COACH" });
  const svar = await tools.getUpcomingBookings.execute!(
    { daysAhead: 7, limit: 50 },
    { toolCallId: "t1", messages: [] },
  );
  const serialisert = JSON.stringify(svar);
  assert.ok(!serialisert.includes(KARI.email), "e-post skal aldri være i tool-resultatet");
  assert.ok(!serialisert.includes(KARI.name), "ekte navn skal aldri være i tool-resultatet");
  assert.match(serialisert, /Spiller-[0-9a-f]{6}/);
});
