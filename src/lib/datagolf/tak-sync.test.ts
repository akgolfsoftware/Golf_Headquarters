import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let empty = false;
let writes: Record<string, unknown>[] = [];
let deactivated = false;
mock.module("@/lib/prisma", { namedExports: { prisma: { datagolfTak: {
  upsert: async (args: Record<string, unknown>) => { writes.push(args); },
  updateMany: async () => { deactivated = true; },
} } } });
mock.module("@/lib/datagolf/client", { namedExports: {
  getSkillRatings: async () => empty ? [] : [{ dg_id: 70001, player_name: "A, Proff", sg_total: 1 }],
  getDgRankings: async () => ({ rankings: [] }),
  getApproachSkill: async () => ({ last_updated: "2026-09-01T00:00:00Z", data: empty ? [] : [{
    dg_id: 70001, "100_150_fw_proximity_per_shot": 20,
    "100_150_fw_shot_count": 120, "100_150_fw_gir_rate": 0.75,
  }] }),
} });
let sync: typeof import("./tak-sync").syncDatagolfTak;
before(async () => { sync = (await import("./tak-sync")).syncDatagolfTak; });
beforeEach(() => { empty = false; writes = []; deactivated = false; });
test("synken inkluderer proffer utenfor de opprinnelige seks og bytter bånd atomisk", async () => {
  const result = await sync();
  assert.equal(result.upserted, 1);
  const update = writes[0].update as { dgPlayerId: number; bands: { deleteMany: object; create: { band: string; lie: string; proximityMeters: number | null; shotCount: number | null }[] } };
  assert.equal(update.dgPlayerId, 70001);
  assert.deepEqual(update.bands.deleteMany, {});
  const band = update.bands.create.find(b => b.band === "innspill100" && b.lie === "fairway")!;
  assert.equal(band.proximityMeters, 6.096); assert.equal(band.shotCount, 120);
});
test("tomt API-svar overskriver eller deaktiverer ingen referanser", async () => {
  empty = true;
  await assert.rejects(() => sync(), /mangler spillere/);
  assert.equal(writes.length, 0); assert.equal(deactivated, false);
});
