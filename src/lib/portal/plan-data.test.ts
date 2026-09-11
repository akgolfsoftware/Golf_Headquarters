import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

test("coachforslag krever tilgang og leses som publiserte, synlige økter i valgt kalenderuke", async (t) => {
  let tillatt = false;
  let query: Prisma.WorkbenchSessionFindManyArgs | undefined;
  t.mock.module("@/lib/auth/assert-own-or-coached", { namedExports: { assertCanViewPlayerData: async (id: string) => { assert.equal(id, "syntetisk-spiller"); if (!tillatt) throw new Error("Ingen tilgang"); } } });
  t.mock.module("@/lib/prisma", { namedExports: { prisma: {
    user: { findMany: async () => [{ id: "syntetisk-coach", name: "Test Coach" }] },
    workbenchSession: { findMany: async (args: Prisma.WorkbenchSessionFindManyArgs) => { query = args; return [{ id: "forslag", coachId: "syntetisk-coach", title: "Mobilitet", date: new Date("2026-03-29"), startMinute: 480, durationMinutes: 30, status: "PUBLISHED", pyramid: "FYS", location: null, notes: null, drills: [] }]; } },
  } } });
  const { hentPlanForslag } = await import("./plan-data");
  await assert.rejects(() => hentPlanForslag("syntetisk-spiller", "2026-03-23"), /Ingen tilgang/);
  assert.equal(Boolean(query), false);
  tillatt = true;
  const result = await hentPlanForslag("syntetisk-spiller", "2026-03-23");
  assert.deepEqual(query?.where, { playerId: "syntetisk-spiller", date: { gte: new Date("2026-03-23"), lt: new Date("2026-03-30") }, status: { in: ["PUBLISHED", "IN_PROGRESS", "COMPLETED"] }, hiddenByPlayer: false, needsPlayerApproval: true, OR: [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }] });
  assert.equal(result[0].coachName, "Test Coach");
  assert.equal(result[0].session.model, "wb");
  assert.equal(result[0].session.startTime.toISOString(), "2026-03-29T06:00:00.000Z");
});
