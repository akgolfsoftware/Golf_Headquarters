/**
 * R-I: admin/spillere/[id]/plan/[planId]/plan-actions.ts. Coachen redigerer
 * en ANNEN brukers tekniske plan, så vernet er ekte per-coach eierskap
 * (`assertCoachTilgangTilSpiller`) oppå rollegrensen — ikke bare
 * COACH/ADMIN. Testen dekker begge lag: rolle (PLAYER/uinnlogget avvist) og
 * eierskap (COACH uten tilgang til nettopp denne spilleren avvist, selv om
 * hen er COACH).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Spillere coach-a faktisk har tilgang til (mocket eierskap). */
let coachensSpillere = new Set(["spiller-a"]);

const plans: Record<string, { id: string; userId: string; navn: string }> = {
  "plan-1": { id: "plan-1", userId: "spiller-a", navn: "Teknisk plan" },
};

let planUpdates: Array<{ id: string; data: unknown }> = [];
let planCreates: unknown[] = [];
let auditWrites: Array<{ planId: string; action: string }> = [];
let redirectKall: string[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachensSpillere = new Set(["spiller-a"]);
  planUpdates = [];
  planCreates = [];
  auditWrites = [];
  redirectKall = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (url: string) => {
      redirectKall.push(url);
      throw new Error("NEXT_REDIRECT");
    },
  },
});
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: {
    getCurrentUser: async () => bruker,
  },
});
mock.module("@/lib/auth/coached", {
  namedExports: {
    assertCoachTilgangTilSpiller: async (
      _viewer: unknown,
      playerId: string,
    ) => {
      if (!coachensSpillere.has(playerId)) {
        throw new Error("Du har ikke tilgang til denne spilleren.");
      }
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", {
  namedExports: { prisma: prismaMock },
});
Object.assign(prismaMock, {
  technicalPlan: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const p = plans[where.id];
      if (!p) return null;
      return { ...p, positions: [], clubTargets: [] };
    },
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      planUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
    create: async ({ data }: { data: { userId: string; navn: string } }) => {
      planCreates.push(data);
      return { id: "plan-kopi", userId: data.userId, navn: data.navn };
    },
  },
  technicalPlanAudit: {
    create: async ({ data }: { data: { planId: string; action: string } }) => {
      auditWrites.push({ planId: data.planId, action: data.action });
    },
  },
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(prismaMock),
});

async function planActions() {
  return import("./plan-actions");
}

test.beforeEach(() => {
  nullstill();
});

test("publiserTekniskPlan avviser PLAYER uten å oppdatere status", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { publiserTekniskPlan } = await planActions();
  await assert.rejects(() => publiserTekniskPlan("plan-1"));
  assert.equal(planUpdates.length, 0);
});

test("publiserTekniskPlan avviser uinnlogget uten å oppdatere status", async () => {
  bruker = null;
  const { publiserTekniskPlan } = await planActions();
  await assert.rejects(() => publiserTekniskPlan("plan-1"));
  assert.equal(planUpdates.length, 0);
});

test("publiserTekniskPlan avviser COACH uten tilgang til spilleren", async () => {
  coachensSpillere = new Set(); // coach-a har ikke lenger tilgang til spiller-a
  const { publiserTekniskPlan } = await planActions();
  await assert.rejects(() => publiserTekniskPlan("plan-1"), /ikke tilgang/i);
  assert.equal(planUpdates.length, 0);
});

test("publiserTekniskPlan setter ACTIVE for COACH med tilgang", async () => {
  const { publiserTekniskPlan } = await planActions();
  const svar = await publiserTekniskPlan("plan-1");
  assert.equal(svar.ok, true);
  assert.equal(planUpdates[0]?.id, "plan-1");
  assert.equal((planUpdates[0]?.data as { status: string }).status, "ACTIVE");
  assert.equal(auditWrites[0]?.action, "STATUS_CHANGE");
});

test("dupliserTekniskPlan avviser PLAYER uten å opprette kopi", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { dupliserTekniskPlan } = await planActions();
  await assert.rejects(() => dupliserTekniskPlan("plan-1"));
  assert.equal(planCreates.length, 0);
});

test("dupliserTekniskPlan avviser uinnlogget uten å opprette kopi", async () => {
  bruker = null;
  const { dupliserTekniskPlan } = await planActions();
  await assert.rejects(() => dupliserTekniskPlan("plan-1"));
  assert.equal(planCreates.length, 0);
});

test("dupliserTekniskPlan avviser COACH uten tilgang til spilleren", async () => {
  coachensSpillere = new Set();
  const { dupliserTekniskPlan } = await planActions();
  await assert.rejects(() => dupliserTekniskPlan("plan-1"), /ikke tilgang/i);
  assert.equal(planCreates.length, 0);
  assert.equal(redirectKall.length, 0);
});

test("dupliserTekniskPlan oppretter kopi og redirecter for COACH med tilgang", async () => {
  const { dupliserTekniskPlan } = await planActions();
  await assert.rejects(() => dupliserTekniskPlan("plan-1"), /NEXT_REDIRECT/);
  assert.equal(planCreates.length, 1);
  assert.equal((planCreates[0] as { navn: string }).navn, "Teknisk plan (kopi)");
  assert.equal(auditWrites.at(-1)?.action, "PLAN_DUPLICATE");
  assert.equal(redirectKall[0], "/admin/spillere/spiller-a/plan/plan-kopi");
});

test("publiserTekniskPlan avviser ukjent plan-id", async () => {
  const { publiserTekniskPlan } = await planActions();
  await assert.rejects(() => publiserTekniskPlan("finnes-ikke"));
  assert.equal(planUpdates.length, 0);
});
