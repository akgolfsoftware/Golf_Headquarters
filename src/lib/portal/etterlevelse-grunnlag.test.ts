import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { GENERERT_FRA } from "@/lib/workbench/v2-drill-mirror";
import { osloInstant } from "@/lib/jarvis/dagen";

const NOW = new Date("2026-10-01T12:00:00Z");
type Query = { where: {
  plan: { userId: string; isActive?: boolean; status: { in: string[] } }; studentId: string;
  playerId: string; hiddenByPlayer: boolean; needsPlayerApproval: boolean; status: { in: string[] };
  startTime?: unknown; date: { gte: Date }; OR: { generertFraId?: { notIn?: string[] } }[];
}; select: Record<string, unknown> };
const calls: { model: string; args: Query }[] = [];
const start = new Date("2026-09-20T08:00:00Z");
const v2 = { id: "v2-mirror", generertFra: GENERERT_FRA, generertFraId: "legacy-mirrored", title: "Testøkt",
  startTime: start, endTime: new Date(start.getTime() + 30 * 60_000), status: "COMPLETED", practiceType: "BLOKK", drills: [] };
const legacy = (id: string) => ({ id, title: "Testøkt", scheduledAt: start, durationMin: 90, status: "PLANNED",
  pyramidArea: "TEK", location: null, miljo: null, maalsetning: null, drills: [] });
let wbDate = new Date("2026-09-21T00:00:00Z");
let wbMinute = 600;
const prisma = {
  trainingPlanSession: { findMany: async (args: Query) => {
    calls.push({ model: "plan", args });
    assert.equal(args.where.plan.userId, "player-test");
    if (args.where.plan.status.in.includes("DRAFT")) return [{ id: "draft-plan" }];
    assert.equal(args.where.plan.isActive, true);
    assert.deepEqual(args.where.plan.status.in, ["ACCEPTED", "ACTIVE", "PAUSED"]);
    return [legacy("legacy-mirrored"), legacy("legacy-independent"), legacy("legacy-moved-mirror")];
  } },
  trainingSessionV2: { findMany: async (args: Query) => {
    calls.push({ model: "v2", args });
    assert.equal(args.where.studentId, "player-test");
    if (args.select.generertFraId && !args.select.id) {
      // Speil utenfor dagens interval skal fortsatt fjerne originalen.
      assert.equal(args.where.startTime, undefined);
      return [{ generertFraId: "legacy-mirrored" }, { generertFraId: "legacy-moved-mirror" }];
    }
    assert.ok(args.where.OR.some((o) => o.generertFraId?.notIn?.includes("draft-plan")));
    return [v2];
  } },
  workbenchSession: { findMany: async (args: Query) => {
    calls.push({ model: "wb", args });
    assert.equal(args.where.playerId, "player-test");
    assert.equal(args.where.hiddenByPlayer, false);
    assert.equal(args.where.needsPlayerApproval, false);
    assert.deepEqual(args.where.status.in, ["PUBLISHED", "IN_PROGRESS", "COMPLETED"]);
    assert.deepEqual(args.where.OR, [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }]);
    return [{ id: "wb-published", title: "Testøkt", date: wbDate, startMinute: wbMinute,
      durationMinutes: 60, status: "COMPLETED", pyramid: "TEK", location: null, notes: null, drills: [] }];
  } },
};
mock.module("@/lib/prisma", { namedExports: { prisma } });

test("ekte felles leser holder synlighet og speildeduplisering for alle tre modeller", async () => {
  const { hentEtterlevelse } = await import("./etterlevelse-data");
  const e = await hentEtterlevelse("player-test", NOW);
  assert.equal(e.gjennomfortMinutter, 90);
  assert.equal(e.planlagtMinutter, 180);
  assert.equal(e.pct, 50);
  assert.equal(e.nevner, 3, "V2-speil teller én gang; flyttet speil gjenoppliver ikke gammel planøkt");
  const wb = calls.find(c => c.model === "wb")!;
  assert.equal(wb.args.where.date.gte.toISOString(), "2026-09-03T00:00:00.000Z");
});

test("Workbench bruker Oslo-veggklokke over sommertidsskift i fireukersvinduet", async () => {
  const { loadVisibleSessionRange } = await import("./visible-session-range");
  wbDate = new Date("2026-10-26T00:00:00Z"); wbMinute = 600;
  const result = await loadVisibleSessionRange("player-test", "2026-10-25T23:00:00Z", "2026-10-26T12:00:00Z");
  const wb = result.find(s => s.model === "wb")!;
  assert.equal(wb.startTime.toISOString(), "2026-10-26T09:00:00.000Z");
  assert.equal(wb.endTime.toISOString(), "2026-10-26T10:00:00.000Z");
  assert.equal(wb.startTime.getTime(), osloInstant(2026, 10, 26, 10, 0).getTime());
});
