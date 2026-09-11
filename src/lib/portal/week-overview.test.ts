import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";
import type { PlanWeekRow } from "./plan-week";
import { weekPlanProgress } from "./week-progress";
import { byggPlanUke } from "./plan-visning";
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";

const playerId = "syntetisk-spiller";
const planRow = (id: string, scheduledAt = "2026-03-29T07:00Z"): PlanWeekRow => ({
  id, title: "Mobilitet", scheduledAt: new Date(scheduledAt), durationMin: 30,
  status: "COMPLETED", pyramidArea: "FYS", location: null, miljo: null, maalsetning: null, drills: [],
});

test("ukelesing tar med eldre planøkter uten speil, med samme tilgang og Oslo-uke", async (t) => {
  let allowed = false;
  let legacy: PlanWeekRow[] = [];
  let mirrorIds: string[] = [];
  let failing = false;
  let includeModern = false;
  const planCalls: Prisma.TrainingPlanSessionFindManyArgs[] = [];
  const v2Calls: Prisma.TrainingSessionV2FindManyArgs[] = [];
  const wbCalls: Prisma.WorkbenchSessionFindManyArgs[] = [];
  const clear = () => { planCalls.length = 0; v2Calls.length = 0; wbCalls.length = 0; };
  t.mock.module("@/lib/auth/assert-own-or-coached", { namedExports: {
    assertCanViewPlayerData: async (id: string) => { assert.equal(id, playerId); if (!allowed) throw new Error("Ingen tilgang"); },
  } });
  t.mock.module("@/lib/prisma", { namedExports: { prisma: {
    trainingPlanSession: { findMany: async (args: Prisma.TrainingPlanSessionFindManyArgs) => {
      planCalls.push(args);
      if (!args.where?.scheduledAt) return [{ id: "skjult-utkast" }];
      if (failing) throw new Error("Lesing feilet");
      return legacy;
    } },
    trainingSessionV2: { findMany: async (args: Prisma.TrainingSessionV2FindManyArgs) => {
      v2Calls.push(args);
      if (!args.where?.startTime) return mirrorIds.map((generertFraId) => ({ generertFraId }));
      return includeModern ? [{ id: "speil", generertFra: "WORKBENCH_PLAN", generertFraId: "med-speil", title: "Innspill",
        startTime: new Date("2026-03-29T08:00Z"), endTime: new Date("2026-03-29T09:00Z"), status: "COMPLETED",
        avbruddAarsak: null, practiceType: "RANDOM", miljo: null, maalsetning: null, drills: [] }] : [];
    } },
    workbenchSession: { findMany: async (args: Prisma.WorkbenchSessionFindManyArgs) => {
      wbCalls.push(args);
      return includeModern ? [{ id: "wb", title: "Teknikk", date: new Date("2026-03-29"), startMinute: 510,
        durationMinutes: 20, status: "PUBLISHED", pyramid: "TEK", location: null, notes: null, drills: [] }] : [];
    } },
  } } });
  const { getWeekOverview, getWeekPlanProgress } = await import("@/app/portal/actions");
  const now = new Date("2026-03-29T20:00Z");

  await t.test("avvist spiller gir ingen databasekall", async () => {
    await assert.rejects(() => getWeekOverview(playerId, now), /Ingen tilgang/);
    assert.equal(planCalls.length + v2Calls.length + wbCalls.length, 0);
    allowed = true;
  });

  await t.test("tre modeller gir én sortert agenda og samme økt-/minuttelling", async () => {
    clear(); includeModern = true;
    legacy = [planRow("uten-speil"), planRow("med-speil")]; mirrorIds = ["med-speil"];
    const week = await getWeekOverview(playerId, now);
    assert.equal(week.length, 7); assert.equal(week[6].isToday, true);
    assert.deepEqual(week[6].sessions.map((s) => [s.id, s.model]), [["wb", "wb"], ["uten-speil", "plan"], ["speil", "v2"]]);
    const view = byggPlanUke(week, [], []);
    assert.equal(view.dager[6].blokker.length, 3);
    assert.equal(view.fremdrift.planlagt, 3); assert.equal(view.fremdrift.gjennomfort, 2);
    assert.equal(view.minutter.plannedMin, 110); assert.equal(view.minutter.completedMin, 90);
    assert.deepEqual(await getWeekPlanProgress(playerId, now), weekPlanProgress(week));
    const query = planCalls.find((q) => q.where?.scheduledAt)!;
    assert.deepEqual(query.where, {
      plan: { userId: playerId, isActive: true, status: { in: ["ACCEPTED", "ACTIVE", "PAUSED"] } },
      scheduledAt: { gte: new Date("2026-03-22T23:00Z"), lt: new Date("2026-03-29T22:00Z") },
      status: { not: "ABANDONED" },
    });
    assert.deepEqual(v2Calls[0].where?.OR, [{ generertFra: null }, { generertFra: { not: "WORKBENCH_PLAN" } }, { generertFraId: null }, { generertFraId: { notIn: ["skjult-utkast"] } }]);
    assert.equal(wbCalls[0].where?.hiddenByPlayer, false);
    assert.equal(wbCalls[0].where?.needsPlayerApproval, false);
  });

  await t.test("V2 flyttet ut av uken eller avlyst gjenoppliver aldri gammel planøkt", async () => {
    clear(); includeModern = false;
    legacy = [planRow("flyttet"), planRow("avlyst-speil"), planRow("uten-speil")];
    mirrorIds = ["flyttet", "avlyst-speil"];
    const week = await getWeekOverview(playerId, now);
    assert.deepEqual(week.flatMap((d) => d.sessions.map((s) => s.id)), ["uten-speil"]);
    assert.deepEqual(v2Calls[1].where, {
      studentId: playerId, generertFra: "WORKBENCH_PLAN", generertFraId: { in: ["flyttet", "avlyst-speil", "uten-speil"] },
    });
    assert.deepEqual(v2Calls[1].select, { generertFraId: true });
  });

  await t.test("tom legacyuke krever ikke ekstra speiloppslag", async () => {
    clear(); legacy = []; mirrorIds = [];
    const week = await getWeekOverview(playerId, now);
    assert.equal(week.flatMap((d) => d.sessions).length, 0);
    assert.equal(v2Calls.length, 1);
  });

  await t.test("sommertid, vintertid og årsskifte bruker Oslo-dato og halvåpent ukeintervall", async () => {
    for (const [reference, first, last, expectedDate] of [
      ["2026-03-29T21:59Z", "2026-03-22T23:00Z", "2026-03-29T22:00Z", "2026-03-29"],
      ["2026-10-25T22:59Z", "2026-10-18T22:00Z", "2026-10-25T23:00Z", "2026-10-25"],
      ["2027-01-03T22:59Z", "2026-12-27T23:00Z", "2027-01-03T23:00Z", "2027-01-03"],
    ]) {
      clear(); legacy = [planRow("siste-minutt", reference)];
      const week = await getWeekOverview(playerId, new Date(reference));
      assert.equal(OSLO_YMD_FMT.format(week[6].sessions[0].startTime), expectedDate);
      assert.equal(week[6].isToday, true);
      assert.deepEqual(planCalls.find((q) => q.where?.scheduledAt)?.where?.scheduledAt, { gte: new Date(first), lt: new Date(last) });
      assert.deepEqual(wbCalls[0].where?.date, { gte: new Date(OSLO_YMD_FMT.format(new Date(first))), lt: new Date(OSLO_YMD_FMT.format(new Date(last))) });
    }
  });

  await t.test("lesefeil skjules ikke som tom uke", async () => {
    failing = true;
    await assert.rejects(() => getWeekOverview(playerId, now), /Lesing feilet/);
  });
});
