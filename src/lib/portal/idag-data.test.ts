import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

test("I dag: Oslo-grenser, bare fullførte prikker og nærmeste kommende økt på tvers av modeller", async (t) => {
  const wbCalls: Prisma.WorkbenchSessionFindManyArgs[] = [];
  const v2Calls: Prisma.TrainingSessionV2FindManyArgs[] = [];
  let wbNeste = { id: "wb-next", date: new Date("2026-04-02"), title: "Fys", startMinute: 540, status: "PUBLISHED" };
  let v2Neste = { id: "v2-next", startTime: new Date("2026-04-01T06:00Z"), title: "Innspill", status: "PLANNED" };
  const hiddenCalls: Prisma.TrainingPlanSessionFindManyArgs[] = [];
  t.mock.module("@/lib/prisma", { namedExports: { prisma: {
    trainingPlanSession: { findMany: async (args: Prisma.TrainingPlanSessionFindManyArgs) => { hiddenCalls.push(args); return [{ id: "hidden-plan" }]; } },
    workbenchSession: {
      findMany: async (args: Prisma.WorkbenchSessionFindManyArgs) => { wbCalls.push(args); return [{ date: new Date("2026-03-01") }, { date: new Date("2026-03-29") }]; },
      findFirst: async (args: Prisma.WorkbenchSessionFindManyArgs) => { wbCalls.push(args); return wbNeste; },
    },
    trainingSessionV2: {
      findMany: async (args: Prisma.TrainingSessionV2FindManyArgs) => { v2Calls.push(args); return [{ startTime: new Date("2026-03-28T23:30Z") }]; },
      findFirst: async (args: Prisma.TrainingSessionV2FindManyArgs) => { v2Calls.push(args); return v2Neste; },
    },
  } } });
  const { hentIDagKalender } = await import("./idag-data");
  const data = await hentIDagKalender("syntetisk-spiller", new Date("2026-03-31T21:00Z"));
  assert.deepEqual(data.ferdigeDager, [1, 29]);
  assert.equal(data.neste?.tittel, "Innspill");
  assert.equal(data.neste?.datoIso, "2026-04-01");
  assert.equal(data.neste?.meta, "Onsdag · 08.00");
  assert.ok(data.neste?.href.includes("v2-next"));
  assert.deepEqual(v2Calls[0].where?.startTime, { gte: new Date("2026-02-28T23:00Z"), lt: new Date("2026-03-31T22:00Z") });
  assert.deepEqual(wbCalls[0].where?.date, { gte: new Date("2026-03-01"), lt: new Date("2026-04-01") });
  assert.equal(wbCalls[0].where?.status, "COMPLETED");
  assert.equal(v2Calls[0].where?.status, "COMPLETED");
  assert.equal(wbCalls[1].where?.status, "PUBLISHED");
  assert.equal(v2Calls[1].where?.status, "PLANNED");
  for (const call of wbCalls) {
    assert.equal(call.where?.hiddenByPlayer, false);
    assert.equal(call.where?.needsPlayerApproval, false);
    assert.deepEqual(call.where?.OR, [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }]);
  }
  assert.deepEqual(hiddenCalls[0].where, { plan: { userId: "syntetisk-spiller", status: { in: ["DRAFT", "REJECTED"] } } });
  assert.deepEqual(v2Calls[0].where?.OR, [{ generertFra: null }, { generertFra: { not: "WORKBENCH_PLAN" } }, { generertFraId: null }, { generertFraId: { notIn: ["hidden-plan"] } }]);

  wbCalls.length = 0; v2Calls.length = 0;
  wbNeste = { ...wbNeste, date: new Date("2027-01-01") };
  v2Neste = { ...v2Neste, startTime: new Date("2027-01-01T09:00Z") };
  const winter = await hentIDagKalender("syntetisk-spiller", new Date("2026-12-31T10:00Z"));
  assert.equal(winter.neste?.tittel, "Fys");
  assert.equal(winter.neste?.meta, "Fredag · 09.00 · programmert");
  assert.deepEqual(v2Calls[1].where?.startTime, { gte: new Date("2026-12-31T23:00Z") });
});
