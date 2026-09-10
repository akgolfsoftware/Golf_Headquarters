import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
let lookups = 0;
mock.module("@/lib/auth/coached", { namedExports: { coachScopedPlayerWhere: (viewer: { id: string }) => ({ enrollmentsAsPlayer: { some: { coachId: viewer.id } } }) } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findFirst: async ({ where }: { where: { AND: unknown[] } }) => {
    lookups++;
    assert.deepEqual(where.AND, [{ enrollmentsAsPlayer: { some: { coachId: "coach" } } }, { id: "other-player" }]);
    return null;
  } },
  testDefinition: { findMany: async () => { throw new Error("Tester skal ikke leses uten tilgang"); } },
  testResult: { findMany: async () => { throw new Error("Resultater skal ikke leses uten tilgang"); } },
} } });
let load: typeof import("./spiller-tester-data").loadSpillerTesterData;
before(async () => { load = (await import("./spiller-tester-data")).loadSpillerTesterData; });
test("annen coachs spiller avvises før testdata leses", async () => {
  assert.equal(await load("other-player", { id: "coach", role: "COACH" }), null);
  assert.equal(lookups, 1);
});
test("spiller og forelder får ikke bruke coachens datalaster", async () => {
  const before = lookups;
  assert.equal(await load("other-player", { id: "coach", role: "PLAYER" }), null);
  assert.equal(await load("other-player", { id: "coach", role: "PARENT" }), null);
  assert.equal(lookups, before);
});
