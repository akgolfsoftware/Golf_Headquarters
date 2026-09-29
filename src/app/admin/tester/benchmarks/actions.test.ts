/**
 * R-I: admin/(legacy)/tester/benchmarks/actions.ts. Delt admin-ressurs
 * (DataGolf-fasiter) uten per-coach eierskap — vernet er rollegrensen
 * alene, for alle tre handlinger. `readSyncState`/`levelsAreMonotonic`
 * (rene funksjoner, zod-validering) importeres direkte — ikke mocket.
 * Testen dekker at godkjenning/avvisning er stille no-ops (ingen skriving,
 * ingen feil) når testen mangler pending-forslag eller når de foreslåtte
 * nivåene ikke er monotone (aldri skriv en ustabil nivåstige).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

const benchmarks = {
  unit: "meters",
  direction: "higher",
  source: "datagolf-v1",
  levels: [
    { id: "pga_avg", label: "PGA snitt", value: 280, confidence: "measured" },
    { id: "scratch", label: "Scratch", value: 230, confidence: "reference" },
  ],
};

const pendingMonoton = {
  proposedLevels: { pga_avg: 285, scratch: 235 },
  raw: { pga_avg: 285 },
  maxChangePct: 2,
  createdAt: "2026-09-15T00:00:00.000Z",
  reason: "Ukentlig synk",
};

const pendingIkkeMonoton = {
  proposedLevels: { pga_avg: 200, scratch: 235 },
  raw: { pga_avg: 200 },
  maxChangePct: 30,
  createdAt: "2026-09-15T00:00:00.000Z",
  reason: "Ukentlig synk",
};

const definisjoner: Record<string, { id: string; protocol: Record<string, unknown> }> = {
  "test-pending": { id: "test-pending", protocol: { benchmarks, benchmarks_pending: pendingMonoton } },
  "test-ikke-monoton": { id: "test-ikke-monoton", protocol: { benchmarks, benchmarks_pending: pendingIkkeMonoton } },
  "test-uten-pending": { id: "test-uten-pending", protocol: { benchmarks } },
};

let testDefinitionUpdates: Array<{ id: string; data: { protocol: Record<string, unknown> } }> = [];
let benchmarkSyncKall = 0;

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  testDefinitionUpdates = [];
  benchmarkSyncKall = 0;
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (options: { allow?: Rolle | Rolle[] }) => {
      if (!bruker) throw new Error("NEXT_REDIRECT");
      const tillatt = Array.isArray(options.allow) ? options.allow : options.allow ? [options.allow] : undefined;
      if (tillatt && !tillatt.includes(bruker.role)) throw new Error("NEXT_REDIRECT");
      return bruker;
    },
  },
});
mock.module("@/lib/admin/benchmark-sync", {
  namedExports: {
    runBenchmarkSync: async () => {
      benchmarkSyncKall += 1;
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  testDefinition: {
    findUnique: async ({ where }: { where: { id: string } }) => definisjoner[where.id] ?? null,
    update: async ({ where, data }: { where: { id: string }; data: { protocol: Record<string, unknown> } }) => {
      testDefinitionUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("approveBenchmarkPending avviser PLAYER uten å skrive", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { approveBenchmarkPending } = await actions();
  await assert.rejects(() => approveBenchmarkPending("test-pending"));
  assert.equal(testDefinitionUpdates.length, 0);
});

test("approveBenchmarkPending avviser uinnlogget uten å skrive", async () => {
  bruker = null;
  const { approveBenchmarkPending } = await actions();
  await assert.rejects(() => approveBenchmarkPending("test-pending"));
  assert.equal(testDefinitionUpdates.length, 0);
});

test("approveBenchmarkPending er en stille no-op når testen mangler pending-forslag", async () => {
  const { approveBenchmarkPending } = await actions();
  await approveBenchmarkPending("test-uten-pending");
  assert.equal(testDefinitionUpdates.length, 0);
});

test("approveBenchmarkPending skriver aldri en ikke-monoton nivåstige", async () => {
  const { approveBenchmarkPending } = await actions();
  await approveBenchmarkPending("test-ikke-monoton");
  assert.equal(testDefinitionUpdates.length, 0);
});

test("approveBenchmarkPending godkjenner og re-kalibrerer for COACH", async () => {
  const { approveBenchmarkPending } = await actions();
  await approveBenchmarkPending("test-pending");
  assert.equal(testDefinitionUpdates.length, 1);
  const protokoll = testDefinitionUpdates[0]?.data.protocol as Record<string, unknown>;
  assert.equal(protokoll.benchmarks_pending, null);
  const nyeBenchmarks = protokoll.benchmarks as { levels: Array<{ id: string; value: number }> };
  assert.equal(nyeBenchmarks.levels.find((l) => l.id === "pga_avg")?.value, 285);
});

test("rejectBenchmarkPending avviser PLAYER uten å skrive", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { rejectBenchmarkPending } = await actions();
  await assert.rejects(() => rejectBenchmarkPending("test-pending"));
  assert.equal(testDefinitionUpdates.length, 0);
});

test("rejectBenchmarkPending avviser uinnlogget uten å skrive", async () => {
  bruker = null;
  const { rejectBenchmarkPending } = await actions();
  await assert.rejects(() => rejectBenchmarkPending("test-pending"));
  assert.equal(testDefinitionUpdates.length, 0);
});

test("rejectBenchmarkPending er en stille no-op når testen mangler pending-forslag", async () => {
  const { rejectBenchmarkPending } = await actions();
  await rejectBenchmarkPending("test-uten-pending");
  assert.equal(testDefinitionUpdates.length, 0);
});

test("rejectBenchmarkPending beholder dagens nivåer, men re-kalibrerer baseline mot nye råverdier", async () => {
  const { rejectBenchmarkPending } = await actions();
  await rejectBenchmarkPending("test-pending");
  assert.equal(testDefinitionUpdates.length, 1);
  const protokoll = testDefinitionUpdates[0]?.data.protocol as Record<string, unknown>;
  assert.equal(protokoll.benchmarks_pending, null);
  assert.ok(!("benchmarks" in protokoll) || protokoll.benchmarks === undefined || (protokoll.benchmarks as { levels: unknown[] }).levels === benchmarks.levels);
  const sync = protokoll.benchmarks_sync as { baselineLevels: Record<string, number> };
  assert.equal(sync.baselineLevels.pga_avg, 280); // dagens nivå, ikke det foreslåtte
});

test("runBenchmarkSyncNow avviser PLAYER uten å kjøre synk", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { runBenchmarkSyncNow } = await actions();
  await assert.rejects(() => runBenchmarkSyncNow());
  assert.equal(benchmarkSyncKall, 0);
});

test("runBenchmarkSyncNow avviser uinnlogget uten å kjøre synk", async () => {
  bruker = null;
  const { runBenchmarkSyncNow } = await actions();
  await assert.rejects(() => runBenchmarkSyncNow());
  assert.equal(benchmarkSyncKall, 0);
});

test("runBenchmarkSyncNow kjører synk for COACH", async () => {
  const { runBenchmarkSyncNow } = await actions();
  await runBenchmarkSyncNow();
  assert.equal(benchmarkSyncKall, 1);
});
