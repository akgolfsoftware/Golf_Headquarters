import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let statuses: string[] = [];
let writes = 0;
let failSecond = false;
let invalidations = 0;
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: "player", role: "PLAYER" }) } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => false } });
mock.module("@/lib/admin/stallen-data", { namedExports: { loadStallen: async () => [] } });
mock.module("next/cache", { namedExports: { revalidatePath: () => { invalidations++; } } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  $transaction: async (run: (tx: unknown) => Promise<unknown>) => {
    const copy = [...statuses];
    const row = (id: string) => ({ id, playerId: "player", coachId: "coach", status: copy[Number(id)],
      date: new Date(0), createdAt: new Date(0), updatedAt: new Date(0), drills: [], title: "Økt", pyramid: "TEK", blockType: "OEKT", origin: "PLAYER", startMinute: 540, durationMinutes: 30 });
    const result = await run({ workbenchSession: {
      findUnique: async ({ where }: { where: { id: string } }) => row(where.id),
      update: async ({ where, data }: { where: { id: string }; data: { status: string } }) => {
        writes++;
        if (failSecond && writes === 2) throw new Error("write failure");
        copy[Number(where.id)] = data.status; return row(where.id);
      },
    } });
    statuses = copy; return result;
  },
} } });
let publish: typeof import("./wb-actions").publishSessions;
before(async () => { publish = (await import("./wb-actions")).publishSessions; });
beforeEach(() => { statuses = ["DRAFT", "DRAFT"]; writes = 0; invalidations = 0; failSecond = false; });
test("sen ugyldig økt gir null skrivekall", async () => {
  statuses[1] = "CANCELLED";
  assert.equal((await publish(["0", "1"])).ok, false);
  assert.equal(writes, 0); assert.equal(invalidations, 0);
});
test("feil i andre skriving ruller begge økter tilbake", async () => {
  failSecond = true;
  assert.equal((await publish(["0", "1"])).ok, false);
  assert.deepEqual(statuses, ["DRAFT", "DRAFT"]); assert.equal(invalidations, 0);
});
test("gjennomført økt i utvalget stopper publisering uten å endre historikken", async () => {
  statuses[1] = "COMPLETED";
  assert.equal((await publish(["0", "1"])).ok, false);
  assert.deepEqual(statuses, ["DRAFT", "COMPLETED"]);
  assert.equal(writes, 0); assert.equal(invalidations, 0);
});
test("gyldig utvalg publiseres én gang per id", async () => {
  assert.equal((await publish(["0", "1", "0"])).ok, true);
  assert.deepEqual(statuses, ["PUBLISHED", "PUBLISHED"]); assert.equal(writes, 2);
  assert.ok(invalidations > 0);
});
