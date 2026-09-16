/**
 * R-I: admin/tester/foreslatte/actions.ts. Coach-godkjenning av custom-
 * tester er gated på `Capability.MANAGE_TESTS` (i COACH-defaulten) — testen
 * bekrefter at en COACH med capabiliteten eksplisitt REVOKEt avvises
 * (kastes ufanget). Dekker forretningsreglene: kun custom-tester kan
 * godkjennes/avvises, en allerede godkjent test kan ikke godkjennes på
 * nytt, og `avvisForslag` sin viktigste regel — en test med LOGGEDE
 * RESULTATER slettes ALDRI, den settes PRIVATE i stedet.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Simulerer effektiv MANAGE_TESTS-tilgang (default true for COACH). */
let coachHarManageTests = true;

const tester: Record<string, { id: string; name: string; isCustom: boolean; isCoachApproved: boolean; createdById: string }> = {
  "test-a": { id: "test-a", name: "Egen putt-test", isCustom: true, isCoachApproved: false, createdById: "spiller-a" },
  "test-godkjent": { id: "test-godkjent", name: "Godkjent test", isCustom: true, isCoachApproved: true, createdById: "spiller-a" },
  "test-canon": { id: "test-canon", name: "CANON-test", isCustom: false, isCoachApproved: false, createdById: "spiller-a" },
  "test-egen-coach": { id: "test-egen-coach", name: "Coachens egen", isCustom: true, isCoachApproved: false, createdById: "coach-a" },
};
let antallResultater = 0;

let testUpdates: Array<{ id: string; data: Record<string, unknown> }> = [];
let testDeletes: string[] = [];
let auditWrites: Array<{ action: string; metadata: Record<string, unknown> }> = [];
let notifyKall: Array<{ userId: string; body: string }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachHarManageTests = true;
  antallResultater = 0;
  testUpdates = [];
  testDeletes = [];
  auditWrites = [];
  notifyKall = [];
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
mock.module("@/lib/auth/effective-capabilities", {
  namedExports: {
    assertCapability: async (user: { role: Rolle }) => {
      if (user.role === "ADMIN") return;
      if (!coachHarManageTests) throw new Error("forbidden");
    },
  },
});
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; metadata: Record<string, unknown> }) => {
      auditWrites.push(input);
    },
  },
});
mock.module("@/lib/notifications", {
  namedExports: {
    notify: async (input: { userId: string; body: string }) => {
      notifyKall.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  testDefinition: {
    findUnique: async ({ where }: { where: { id: string } }) => tester[where.id] ?? null,
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
      testUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      testDeletes.push(where.id);
      return { id: where.id };
    },
  },
  testResult: {
    count: async () => antallResultater,
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("godkjennForslag avviser PLAYER uten å godkjenne", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { godkjennForslag } = await actions();
  await assert.rejects(() => godkjennForslag({ id: "test-a" }));
  assert.equal(testUpdates.length, 0);
});

test("godkjennForslag avviser uinnlogget uten å godkjenne", async () => {
  bruker = null;
  const { godkjennForslag } = await actions();
  await assert.rejects(() => godkjennForslag({ id: "test-a" }));
  assert.equal(testUpdates.length, 0);
});

test("godkjennForslag avviser COACH uten MANAGE_TESTS-tilgang", async () => {
  coachHarManageTests = false;
  const { godkjennForslag } = await actions();
  await assert.rejects(() => godkjennForslag({ id: "test-a" }), /forbidden/);
  assert.equal(testUpdates.length, 0);
});

test("godkjennForslag avviser ukjent test", async () => {
  const { godkjennForslag } = await actions();
  await assert.rejects(() => godkjennForslag({ id: "finnes-ikke" }), /finnes ikke/);
});

test("godkjennForslag avviser en test som ikke er custom (CANON)", async () => {
  const { godkjennForslag } = await actions();
  await assert.rejects(() => godkjennForslag({ id: "test-canon" }), /kun godkjenne custom-tester/);
  assert.equal(testUpdates.length, 0);
});

test("godkjennForslag avviser en allerede godkjent test", async () => {
  const { godkjennForslag } = await actions();
  await assert.rejects(() => godkjennForslag({ id: "test-godkjent" }), /allerede godkjent/);
  assert.equal(testUpdates.length, 0);
});

test("godkjennForslag godkjenner og varsler skaperen for COACH", async () => {
  const { godkjennForslag } = await actions();
  const svar = await godkjennForslag({ id: "test-a" });
  assert.equal(svar.ok, true);
  assert.equal(testUpdates.length, 1);
  assert.equal((testUpdates[0]?.data as { isCoachApproved: boolean }).isCoachApproved, true);
  assert.equal(auditWrites.at(-1)?.action, "test.coach_approved");
  assert.deepEqual(notifyKall.map((n) => n.userId), ["spiller-a"]);
});

test("godkjennForslag varsler ikke når coachen godkjenner sin egen test", async () => {
  const { godkjennForslag } = await actions();
  await godkjennForslag({ id: "test-egen-coach" });
  assert.equal(notifyKall.length, 0);
});

test("avvisForslag avviser PLAYER uten å avvise", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { avvisForslag } = await actions();
  await assert.rejects(() => avvisForslag({ id: "test-a" }));
  assert.equal(testDeletes.length, 0);
});

test("avvisForslag avviser uinnlogget uten å avvise", async () => {
  bruker = null;
  const { avvisForslag } = await actions();
  await assert.rejects(() => avvisForslag({ id: "test-a" }));
  assert.equal(testDeletes.length, 0);
});

test("avvisForslag avviser COACH uten MANAGE_TESTS-tilgang", async () => {
  coachHarManageTests = false;
  const { avvisForslag } = await actions();
  await assert.rejects(() => avvisForslag({ id: "test-a" }), /forbidden/);
  assert.equal(testDeletes.length, 0);
});

test("avvisForslag avviser ukjent test", async () => {
  const { avvisForslag } = await actions();
  await assert.rejects(() => avvisForslag({ id: "finnes-ikke" }), /finnes ikke/);
});

test("avvisForslag avviser en test som ikke er custom", async () => {
  const { avvisForslag } = await actions();
  await assert.rejects(() => avvisForslag({ id: "test-canon" }), /kun avvise custom-tester/);
  assert.equal(testDeletes.length, 0);
});

test("avvisForslag sletter testen når ingen resultater er logget", async () => {
  antallResultater = 0;
  const { avvisForslag } = await actions();
  const svar = await avvisForslag({ id: "test-a" });
  assert.equal(svar.ok, true);
  assert.deepEqual(testDeletes, ["test-a"]);
  assert.equal(testUpdates.length, 0);
  assert.equal(auditWrites.at(-1)?.metadata.hadResults, false);
});

test("avvisForslag setter PRIVATE i stedet for å slette når resultater finnes", async () => {
  antallResultater = 3;
  const { avvisForslag } = await actions();
  const svar = await avvisForslag({ id: "test-a" });
  assert.equal(svar.ok, true);
  assert.equal(testDeletes.length, 0);
  assert.equal(testUpdates.length, 1);
  const data = testUpdates[0]?.data as { visibility: string; isCoachApproved: boolean };
  assert.equal(data.visibility, "PRIVATE");
  assert.equal(data.isCoachApproved, false);
  assert.equal(auditWrites.at(-1)?.metadata.hadResults, true);
});

test("avvisForslag varsler skaperen med riktig melding avhengig av resultater", async () => {
  antallResultater = 2;
  const { avvisForslag } = await actions();
  await avvisForslag({ id: "test-a" });
  assert.equal(notifyKall.length, 1);
  assert.match(notifyKall[0]?.body ?? "", /fortsatt din/);
});

test("avvisForslag varsler ikke når coachen avviser sin egen test", async () => {
  const { avvisForslag } = await actions();
  await avvisForslag({ id: "test-egen-coach" });
  assert.equal(notifyKall.length, 0);
});
