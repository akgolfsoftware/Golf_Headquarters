/**
 * R-I: admin/(legacy)/plans/actions.ts. Filens egen dokumentasjon sier det
 * rett ut: `deletePlan` hadde tidligere INGEN eierskapssjekk — enhver coach
 * kunne slette en hvilken som helst spillers treningsplan ved å bytte
 * planId. `planIScope()` er fellesporten (`coachScopedPlayerWhere`) som nå
 * dekker alle fire handlinger. Testen verifiserer nettopp dette: en COACH
 * uten tilgang til spilleren som eier planen skal avvises for ALLE fire
 * handlinger, mens ADMIN (som ser alle coachede spillere) slipper gjennom.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Alle spillere i coaching-sporet (synlig for ADMIN). */
const alleCoachedeSpillere = new Set(["spiller-a", "spiller-b"]);
/** Delmengden coach-a faktisk eier. */
let coachensSpillere = new Set(["spiller-a"]);

function harEierskap(spillerId: string): boolean {
  if (!bruker) return false;
  if (!alleCoachedeSpillere.has(spillerId)) return false;
  if (bruker.role === "ADMIN") return true;
  return coachensSpillere.has(spillerId);
}

const plans: Record<string, { id: string; userId: string; name: string; startDate: Date; endDate: Date | null; isActive: boolean; createdById: string }> = {
  "plan-a": {
    id: "plan-a", userId: "spiller-a", name: "Plan A", startDate: new Date("2026-09-01"),
    endDate: null, isActive: true, createdById: "coach-a",
  },
  "plan-b": {
    id: "plan-b", userId: "spiller-b", name: "Plan B", startDate: new Date("2026-09-01"),
    endDate: null, isActive: false, createdById: "coach-b",
  },
};

let planUpdates: Array<{ id: string; data: unknown }> = [];
let planCreates: unknown[] = [];
let planDeletes: string[] = [];
let redirectKall: string[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachensSpillere = new Set(["spiller-a"]);
  planUpdates = [];
  planCreates = [];
  planDeletes = [];
  redirectKall = [];
  plans["plan-a"].isActive = true;
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
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (!bruker) throw new Error("unauthenticated");
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/auth/coached", {
  // Selve where-fragmentet trenger ikke gjenskapes byte-for-byte — mocket
  // prisma under bruker harEierskap() direkte for å avgjøre treff, akkurat
  // som den ekte spørringen ville filtrert bort et ikke-eid planId.
  namedExports: {
    coachScopedPlayerWhere: (coach: { id: string; role: string }) => ({ __coach: coach.id }),
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  trainingPlan: {
    findFirst: async ({ where }: { where: { id: string } }) => {
      const plan = plans[where.id];
      if (!plan || !harEierskap(plan.userId)) return null;
      return { id: plan.id, userId: plan.userId };
    },
    findUnique: async ({ where, include }: { where: { id: string }; include?: unknown }) => {
      const plan = plans[where.id];
      if (!plan) return null;
      return include ? { ...plan, sessions: [] } : { ...plan };
    },
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      planUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
    create: async ({ data }: { data: { userId: string; name: string } }) => {
      planCreates.push(data);
      return { id: "plan-ny", userId: data.userId, name: data.name };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      planDeletes.push(where.id);
      return { id: where.id };
    },
  },
  user: {
    findFirst: async ({ where }: { where: { AND: [unknown, { id: string }] } }) => {
      const spillerId = where.AND[1].id;
      return harEierskap(spillerId) ? { id: spillerId } : null;
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("togglePlanActive avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { togglePlanActive } = await actions();
  await assert.rejects(() => togglePlanActive("plan-a"));
  assert.equal(planUpdates.length, 0);
});

test("togglePlanActive avviser uinnlogget", async () => {
  bruker = null;
  const { togglePlanActive } = await actions();
  await assert.rejects(() => togglePlanActive("plan-a"));
  assert.equal(planUpdates.length, 0);
});

test("togglePlanActive avviser COACH uten eierskap til spilleren som eier planen (IDOR)", async () => {
  const { togglePlanActive } = await actions();
  await assert.rejects(() => togglePlanActive("plan-b"), /not-found/);
  assert.equal(planUpdates.length, 0);
});

test("togglePlanActive veksler status for COACH med eierskap", async () => {
  const { togglePlanActive } = await actions();
  await togglePlanActive("plan-a");
  assert.equal(planUpdates.length, 1);
  assert.equal((planUpdates[0]?.data as { isActive: boolean }).isActive, false);
});

test("togglePlanActive lar ADMIN veksle plan for en spiller ADMIN ikke selv coacher", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { togglePlanActive } = await actions();
  await togglePlanActive("plan-b");
  assert.equal(planUpdates.length, 1);
});

test("dupliserPlan avviser PLAYER uten å opprette kopi", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { dupliserPlan } = await actions();
  await assert.rejects(() => dupliserPlan("plan-a"));
  assert.equal(planCreates.length, 0);
});

test("dupliserPlan returnerer null for COACH uten eierskap til spilleren (IDOR)", async () => {
  const { dupliserPlan } = await actions();
  const id = await dupliserPlan("plan-b");
  assert.equal(id, null);
  assert.equal(planCreates.length, 0);
});

test("dupliserPlan oppretter kopi for COACH med eierskap", async () => {
  const { dupliserPlan } = await actions();
  const id = await dupliserPlan("plan-a");
  assert.equal(id, "plan-ny");
  assert.equal(planCreates.length, 1);
  assert.equal((planCreates[0] as { name: string }).name, "Plan A (kopi)");
});

test("createPlan avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { createPlan } = await actions();
  await assert.rejects(() =>
    createPlan({ userId: "spiller-a", name: "Ny plan", startDate: "2026-09-20" }),
  );
  assert.equal(planCreates.length, 0);
});

test("createPlan avviser uinnlogget", async () => {
  bruker = null;
  const { createPlan } = await actions();
  await assert.rejects(() =>
    createPlan({ userId: "spiller-a", name: "Ny plan", startDate: "2026-09-20" }),
  );
  assert.equal(planCreates.length, 0);
});

test("createPlan avviser COACH som oppretter plan på en spiller hen ikke eier (IDOR)", async () => {
  const { createPlan } = await actions();
  await assert.rejects(
    () => createPlan({ userId: "spiller-b", name: "Ny plan", startDate: "2026-09-20" }),
    /not-found/,
  );
  assert.equal(planCreates.length, 0);
});

test("createPlan oppretter plan for COACH med eierskap til spilleren", async () => {
  const { createPlan } = await actions();
  const id = await createPlan({ userId: "spiller-a", name: "Ny plan", startDate: "2026-09-20" });
  assert.equal(id, "plan-ny");
  assert.equal(planCreates.length, 1);
});

test("deletePlan avviser PLAYER uten å slette", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { deletePlan } = await actions();
  await assert.rejects(() => deletePlan("plan-a"));
  assert.equal(planDeletes.length, 0);
});

test("deletePlan avviser uinnlogget uten å slette", async () => {
  bruker = null;
  const { deletePlan } = await actions();
  await assert.rejects(() => deletePlan("plan-a"));
  assert.equal(planDeletes.length, 0);
});

test("deletePlan avviser COACH uten eierskap til spilleren som eier planen (IDOR)", async () => {
  const { deletePlan } = await actions();
  await assert.rejects(() => deletePlan("plan-b"), /not-found/);
  assert.equal(planDeletes.length, 0);
  assert.equal(redirectKall.length, 0);
});

test("deletePlan sletter og redirecter for COACH med eierskap", async () => {
  const { deletePlan } = await actions();
  await assert.rejects(() => deletePlan("plan-a"), /NEXT_REDIRECT/);
  assert.deepEqual(planDeletes, ["plan-a"]);
  assert.deepEqual(redirectKall, ["/admin/plans"]);
});
