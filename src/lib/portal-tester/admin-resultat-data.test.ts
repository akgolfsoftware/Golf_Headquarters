import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Query = { where?: { user?: unknown } };
const queries: Query[] = [];
const record = async (query: Query) => { queries.push(query); return []; };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  testSession: { findMany: record },
  testResult: { findMany: record, count: async (query: Query) => { queries.push(query); return 0; } },
} } });
const modules = Promise.all([import("./admin-resultat-data"), import("@/lib/auth/coached")]);

test("alle resultat-, økt- og antallspørringer bruker trenerens radtilgang", async () => {
  const [{ hentAdminTestData }, { coachScopedPlayerWhere }] = await modules;
  // Regression: a capability checked at the page used to leave all four reads unscoped.
  for (const viewer of [{ id: "coach-a", role: "COACH" }, { id: "coach-b", role: "COACH" }, { id: "admin", role: "ADMIN" }]) {
    queries.length = 0;
    const result = await hentAdminTestData(viewer, new Date("2026-10-02T12:00:00Z"));
    assert.equal(queries.length, 4);
    for (const query of queries) assert.deepEqual(query.where?.user, coachScopedPlayerWhere(viewer));
    assert.equal(result.antall30, 0);
    assert.deepEqual(result.resultater, []);
  }
  assert.notDeepEqual(coachScopedPlayerWhere({ id: "coach-a", role: "COACH" }), coachScopedPlayerWhere({ id: "coach-b", role: "COACH" }));
});

test("andre roller får ingen databaseoppslag selv med en feil tildelt capability", async () => {
  const [{ hentAdminTestData }] = await modules;
  queries.length = 0;
  for (const role of ["PLAYER", "PARENT", "EXTERNAL_READER"]) {
    await assert.rejects(() => hentAdminTestData({ id: "other", role }), /ikke tilgang/);
  }
  assert.equal(queries.length, 0);
});
