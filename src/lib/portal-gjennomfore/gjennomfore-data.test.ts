import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

test("dagens økt bruker valgt Oslo-dag og teller et plan/V2-speil bare én gang", async (t) => {
  let v2Where: Prisma.TrainingSessionV2WhereInput | undefined;
  let planWhere: Prisma.TrainingPlanSessionWhereInput | undefined;
  t.mock.module("@/lib/prisma", { namedExports: { prisma: {
    trainingSessionV2: { findMany: async (args: Prisma.TrainingSessionV2FindManyArgs) => {
      v2Where = args.where;
      return [{ id: "v2-mirror", generertFra: "WORKBENCH_PLAN", generertFraId: "plan-original", title: "Innspill", startTime: new Date("2026-03-29T07:00Z"), endTime: new Date("2026-03-29T08:00Z"), status: "PLANNED", practiceType: "BLOKK", miljo: "M1", completedSummary: null, drills: [], _count: { drills: 0 }, coachId: "syntetisk-coach" }];
    } },
    trainingPlanSession: { findMany: async (args: Prisma.TrainingPlanSessionFindManyArgs) => {
      // visibility leser bare ID-er. Den andre spørringen henter dagens innhold.
      if (!args.where?.scheduledAt) return [];
      planWhere = args.where;
      return [{ id: "plan-original", title: "Innspill", scheduledAt: new Date("2026-03-29T07:00Z"), durationMin: 60, status: "PLANNED", pyramidArea: "TEK", skillArea: null, environment: "RANGE", log: null, drills: [], _count: { drills: 0 } }];
    } },
    user: { findMany: async () => [{ id: "syntetisk-coach", name: "Test Coach" }] },
  } } });
  const { getGjennomforeData } = await import("./gjennomfore-data");
  const data = await getGjennomforeData("syntetisk-spiller", new Date("2026-03-29T06:40Z"));
  assert.equal(data.antall, 1);
  assert.equal(data.totalMin, 60);
  assert.equal(data.nesteOkt?.id, "v2-mirror");
  assert.equal(data.nesteOkt?.relTidTekst, "om 20 min");
  assert.equal(data.nesteOkt?.tid, "09:00");
  assert.deepEqual(v2Where?.startTime, { gte: new Date("2026-03-28T23:00Z"), lt: new Date("2026-03-29T22:00Z") });
  assert.deepEqual(v2Where?.status, { in: ["PLANNED", "IN_PROGRESS", "COMPLETED"] });
  assert.deepEqual(planWhere?.plan, { userId: "syntetisk-spiller", isActive: true, status: { in: ["ACCEPTED", "ACTIVE", "PAUSED"] } });
});
