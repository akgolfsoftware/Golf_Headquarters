import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";
import { GENERERT_FRA } from "@/lib/workbench/v2-drill-mirror";

type Port = typeof import("@/lib/deling/ak-profil-lesing").medAkProfiler;
const NOW = new Date("2026-10-24T12:00:00Z");
const start = new Date("2026-10-20T08:00:00Z");
const playerId = "synthetic-shared-player";
let shared = true;
let denied = false;
let fail: "sharing" | "sessions" | null = null;
let inTransaction = false;
let reads: string[] = [];
let expectedViewer = { id: "synthetic-coach", role: "COACH" };
const scope = () => ({ id: { in: shared ? [playerId] : [] }, role: "PLAYER", deletedAt: null });
function check(model: string) {
  assert.ok(inTransaction, `${model} må leses før delingslåsene slippes`);
  reads.push(model);
}
const legacy = (id: string) => ({ id, title: "Syntetisk økt", scheduledAt: start, durationMin: 90,
  status: "PLANNED", pyramidArea: "TEK", location: null, miljo: null, maalsetning: null, drills: [] });
const player = { id: playerId, name: "Syntetisk Spiller", hcp: 4, avatarUrl: null, homeClub: null,
  userStatus: "AKTIV", tier: "PRO", lastLoginAt: start, enrollmentsAsPlayer: [],
  sgInputs: [{ sgTotal: 2 }, { sgTotal: 1 }], rounds: [], sessionRequestsAsPlayer: [],
  subscriptions: [], _count: { payments: 0 }, tournamentEntries: [], trainingPlans: [] };
const tx = {
  user: { findMany: async (args: Prisma.UserFindManyArgs) => {
    check("players");
    assert.ok(Array.isArray(args.where?.AND));
    assert.deepEqual(args.where.AND[0], scope(), "deling må filtrere før søk, relasjoner og radgrense");
    assert.equal(args.take, 400);
    assert.ok(JSON.stringify(args.where.AND[1]).includes('"contains":"Syntetisk"'));
    return shared ? [player] : [];
  } },
  trainingPlanSession: { findMany: async (args: Prisma.TrainingPlanSessionFindManyArgs) => {
    check("plan");
    const plan = args.where?.plan as Prisma.TrainingPlanWhereInput;
    assert.equal(plan.userId, playerId);
    if (JSON.stringify(plan.status).includes("DRAFT")) return [{ id: "draft" }];
    assert.deepEqual(plan.status, { in: ["ACCEPTED", "ACTIVE", "PAUSED"] });
    assert.equal(plan.isActive, true);
    return [legacy("mirrored"), legacy("moved-mirror"), legacy("independent")];
  } },
  trainingSessionV2: { findMany: async (args: Prisma.TrainingSessionV2FindManyArgs) => {
    check("v2");
    assert.equal(args.where?.studentId, playerId);
    if (!args.select?.id) {
      assert.equal(args.where?.startTime, undefined, "flyttede speil skal også skjule originalen");
      return [{ generertFraId: "mirrored" }, { generertFraId: "moved-mirror" }];
    }
    assert.ok(JSON.stringify(args.where?.OR).includes('"notIn":["draft"]'));
    return [{ id: "v2", title: "Syntetisk økt", generertFra: GENERERT_FRA, generertFraId: "mirrored",
      startTime: start, endTime: new Date(start.getTime() + 30 * 60_000), status: "COMPLETED",
      practiceType: "BLOKK", drills: [] }];
  } },
  workbenchSession: { findMany: async (args: Prisma.WorkbenchSessionFindManyArgs) => {
    check("wb");
    if (fail === "sessions") throw Error("synthetic-session-failure");
    assert.equal(args.where?.playerId, playerId);
    assert.equal(args.where?.hiddenByPlayer, false);
    assert.equal(args.where?.needsPlayerApproval, false);
    assert.deepEqual(args.where?.OR, [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }]);
    return [{ id: "wb", title: "Syntetisk økt", date: new Date("2026-10-21T00:00:00Z"),
      startMinute: 600, durationMinutes: 60, status: "COMPLETED", pyramid: "TEK", location: null, notes: null, drills: [] }];
  } },
};
// All faktisk økt-/etterlevelseskode kjører. Den globale klienten er en felle:
// ingen underleser eller request-cache får gå utenom transaksjonen.
mock.module("@/lib/prisma", { namedExports: { prisma: new Proxy({}, {
  get() { throw Error("global database outside sharing transaction"); },
}) } });
mock.module("@/lib/deling/ak-profil-lesing", { namedExports: { medAkProfiler: async (viewer: Parameters<Port>[0], read: Parameters<Port>[1]) => {
  assert.deepEqual(viewer, expectedViewer);
  if (fail === "sharing") throw Error("synthetic-sharing-failure");
  if (denied) return null;
  inTransaction = true;
  try { return await read(tx as unknown as Prisma.TransactionClient, scope() as Prisma.UserWhereInput, []); }
  finally { inTransaction = false; }
} } });

for (const role of ["ADMIN", "COACH"]) {
  test(`Stallen holder alle øktkilder innenfor fersk deling for ${role}`, async t => {
    t.mock.timers.enable({ apis: ["Date"], now: NOW });
    const { loadStallen } = await import("./stallen-data");
    expectedViewer = { id: "synthetic-coach", role };
    shared = true; denied = false; fail = null; reads = [];
    const read = () => loadStallen(expectedViewer, { q: " Syntetisk " });
    const result = await read();
    assert.deepEqual(result.rows.map(p => p.id), [playerId]);
    assert.equal(result.rows[0].adhPct, 50, "90 gjennomførte av 180 minutter, uten doble speil");
    assert.equal(result.rows[0].sgDelta, 1);
    assert.deepEqual(reads.sort(), ["players", "plan", "plan", "v2", "v2", "wb"].sort());
    assert.equal(inTransaction, false);

    shared = false; reads = [];
    const withdrawn = await read();
    assert.equal(withdrawn.total, 0);
    assert.deepEqual(withdrawn.rows, []);
    assert.equal(withdrawn.hoursDelta, 0);
    assert.deepEqual(reads, ["players"], "ingen gamle id-er eller økter gjenbrukes etter trekk");
    shared = true; reads = [];
    assert.equal((await read()).rows[0].adhPct, 50, "nytt gyldig ja leser hele kjeden på nytt");
    assert.equal(reads.length, 6);

    denied = true; reads = [];
    assert.equal((await read()).counts.all, 0);
    assert.deepEqual(reads, []);
    denied = false; fail = "sharing";
    await assert.rejects(read(), /synthetic-sharing-failure/);
    assert.deepEqual(reads, []);
    fail = "sessions";
    await assert.rejects(read(), /synthetic-session-failure/);
    fail = null;
  });
}
