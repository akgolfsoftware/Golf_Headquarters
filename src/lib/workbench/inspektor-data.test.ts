import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let allowed = true;
let exists = true;
let reads = 0;
let authenticated = true;
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => {
    if (!authenticated) throw new Error("Unauthenticated");
    return { id: "player" };
  } },
});
mock.module("./wb-actions", {
  namedExports: { loadSession: async () => allowed
    ? { ok: true, data: exists ? { playerId: "player" } : null }
    : { ok: false, error: "Denied" } },
});
mock.module("@/lib/prisma", {
  namedExports: { prisma: { workbenchSession: { findUnique: async (query: { where: { id: string; playerId: string } }) => {
    reads++;
    assert.deepEqual(query.where, { id: "session", playerId: "player" });
    return { lFase: null, miljo: null, drills: [
      { title: "Egen øvelse uten bankkobling", durationMinutes: 12, repMinutter: null, repSett: 3, repReps: 5, repType: "SETT_REPS" },
      { title: "Sving uten ball", durationMinutes: 10, repMinutter: 7, repSett: null, repReps: null, repType: "SVINGER_UTEN_BALL" },
    ] };
  } } } },
});
let read: typeof import("./inspektor-data").hentOktInspektor;
before(async () => { read = (await import("./inspektor-data")).hentOktInspektor; });
beforeEach(() => { allowed = true; exists = true; reads = 0; authenticated = true; });

test("inspektør leser kanoniske øvelser og beholder navn og dose uten bankkobling", async () => {
  const result = await read("session");
  assert.equal(result.ok, true);
  assert.deepEqual(result.drills, [
    { navn: "Egen øvelse uten bankkobling", minutter: 12, sett: 3, reps: 5, nivaa: "vanlig" },
    { navn: "Sving uten ball", minutter: 7, sett: null, reps: null, nivaa: "uten" },
  ]);
});
test("inspektør respekterer avvist økttilgang før detaljene leses", async () => {
  allowed = false;
  assert.deepEqual(await read("session"), { ok: false });
  assert.equal(reads, 0);
});
test("inspektør returnerer ikke innhold for manglende økt", async () => {
  exists = false;
  assert.deepEqual(await read("session"), { ok: false });
  assert.equal(reads, 0);
});
test("inspektør krever innlogging", async () => {
  authenticated = false;
  await assert.rejects(read("session"), /Unauthenticated/);
  assert.equal(reads, 0);
});
