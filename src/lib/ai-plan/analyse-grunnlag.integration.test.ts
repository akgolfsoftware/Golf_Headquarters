import test from "node:test";
import assert from "node:assert/strict";

test("planevaluering bruker Workbench, ukjent tid og ingen felles template-skriving", async t => {
  let exists = false;
  let endDate: Date | null = new Date("2026-06-28T00:00:00Z");
  const writes: Record<string, unknown>[] = [];
  const events: string[] = [];
  const tx = {
    $queryRaw: async () => { events.push("lock"); return [{ id: "plan" }]; },
    planEffectiveness: {
      findFirst: async () => { events.push("read"); return exists ? { id: "effect" } : null; },
      create: async ({ data }: { data: Record<string, unknown> }) => { events.push("create"); writes.push(data); exists = true; return { id: "effect", ...data }; },
      update: async ({ data }: { data: Record<string, unknown> }) => { events.push("update"); writes.push(data); return { id: "effect", ...data }; },
    },
  };
  t.mock.module("@/lib/prisma", { namedExports: { prisma: {
    trainingPlan: { findUnique: async () => ({ id: "plan", userId: "syntetisk", startDate: new Date("2026-06-01"), endDate, aiGenerationId: null }) },
    workbenchSession: { findMany: async () => [{ id: "okt", date: new Date("2026-06-10"), startMinute: 600, durationMinutes: 90,
      actualMinutes: null, status: "COMPLETED", pyramid: "SLAG" }] },
    round: { findMany: async () => [] },
    $transaction: async (f: (db: typeof tx) => unknown) => f(tx),
  } } });
  const { computeEffectiveness } = await import("./effectiveness");
  await computeEffectiveness("plan");
  assert.equal(writes[0].completionRate, 1);
  assert.equal(writes[0].totalTimeMinutes, null);
  assert.equal(writes[0].sgTotalDelta, null);
  assert.equal(writes[0].hcpDelta, null);
  assert.deepEqual(events, ["lock", "read", "create"]);
  await computeEffectiveness("plan");
  assert.deepEqual(events.slice(3), ["lock", "read", "update"]);
  endDate = null;
  assert.equal(await computeEffectiveness("plan"), null);
  assert.equal(writes.length, 2);
});
