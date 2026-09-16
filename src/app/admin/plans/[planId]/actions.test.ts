/**
 * R-I: admin/plans/[planId]/actions.ts. Rolle alene er ikke nok — hver
 * mutasjon skal avvise en coach uten stalltilgang til spilleren planen/
 * økten tilhører, og ingen skriving skal skje når den avvises.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker = { id: "coach-a", role: "COACH" as Rolle, name: "Coach A" };
let tillatte = new Set<string>(["spiller-a"]);

const plans: Record<string, { id: string; userId: string; name: string; status: string; startDate: Date; endDate: Date | null; sessions: unknown[] }> = {};
const sessions: Record<string, { id: string; planId: string; title: string; status: string; scheduledAt: Date; plan: { userId: string }; log: { id: string } | null }> = {};
const effectiveness: Record<string, { id: string; userId: string; planId: string }> = {};
const users: Record<string, { id: string; role: string; name: string; tier?: string }> = {
  "spiller-a": { id: "spiller-a", role: "PLAYER", name: "Spiller A" },
  "spiller-fremmed": { id: "spiller-fremmed", role: "PLAYER", name: "Spiller Fremmed" },
};

let planWrites: Array<{ id: string; data: unknown }> = [];
let planDeletes: string[] = [];
let planCreates: unknown[] = [];
let sessionWrites: Array<{ id: string; data: unknown }> = [];
let sessionDeletes: string[] = [];
let sessionCreates: unknown[] = [];
let effWrites: Array<{ id: string; data: unknown }> = [];
let logWrites: Array<{ id: string; data: unknown }> = [];
let auditWrites: Array<{ action: string; target: string }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  tillatte = new Set(["spiller-a"]);
  for (const k of Object.keys(plans)) delete plans[k];
  for (const k of Object.keys(sessions)) delete sessions[k];
  for (const k of Object.keys(effectiveness)) delete effectiveness[k];
  Object.assign(plans, {
    "plan-a": {
      id: "plan-a",
      userId: "spiller-a",
      name: "Plan A",
      status: "ACTIVE",
      startDate: new Date("2026-01-01"),
      endDate: null,
      sessions: [],
    },
    "plan-fremmed": {
      id: "plan-fremmed",
      userId: "spiller-fremmed",
      name: "Plan Fremmed",
      status: "ACTIVE",
      startDate: new Date("2026-01-01"),
      endDate: null,
      sessions: [],
    },
  });
  Object.assign(sessions, {
    "okt-a": {
      id: "okt-a",
      planId: "plan-a",
      title: "Økt A",
      status: "PLANNED",
      scheduledAt: new Date("2026-01-05"),
      plan: { userId: "spiller-a" },
      log: null,
    },
    "okt-fremmed": {
      id: "okt-fremmed",
      planId: "plan-fremmed",
      title: "Økt Fremmed",
      status: "PLANNED",
      scheduledAt: new Date("2026-01-05"),
      plan: { userId: "spiller-fremmed" },
      log: null,
    },
    "okt-fremmed-fullfort": {
      id: "okt-fremmed-fullfort",
      planId: "plan-fremmed",
      title: "Økt Fremmed fullført",
      status: "COMPLETED",
      scheduledAt: new Date("2026-01-05"),
      plan: { userId: "spiller-fremmed" },
      log: { id: "log-fremmed" },
    },
  });
  Object.assign(effectiveness, {
    "eff-fremmed": { id: "eff-fremmed", userId: "spiller-fremmed", planId: "plan-fremmed" },
  });
  planWrites = [];
  planDeletes = [];
  planCreates = [];
  sessionWrites = [];
  sessionDeletes = [];
  sessionCreates = [];
  effWrites = [];
  logWrites = [];
  auditWrites = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
    requireAdminActionUser: async () => {
      if (bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUser: async () => bruker },
});
mock.module("@/lib/auth/coached", {
  namedExports: {
    assertCoachTilgangTilSpiller: async (_viewer: unknown, playerId: string) => {
      if (!tillatte.has(playerId)) {
        throw new Error("Du har ikke tilgang til denne spilleren.");
      }
    },
    harCoachTilgangTilSpiller: async (_viewer: unknown, playerId: string) => tillatte.has(playerId),
    coachScopedPlayerWhere: () => ({ __scoped: true }),
  },
});
mock.module("@/lib/notifications", {
  namedExports: {
    notify: async () => undefined,
    notifyMany: async () => undefined,
  },
});
mock.module("@/lib/ai-plan/effectiveness", {
  namedExports: { computeEffectiveness: async () => undefined },
});
mock.module("@/lib/workbench/v2-sync", {
  namedExports: {
    GENERERT_FRA: "PLAN_SESSION",
    syncV2FromPlanSessionId: async () => undefined,
    deleteV2ForPlanSession: async () => undefined,
  },
});
mock.module("@/lib/error-tracking", {
  namedExports: { logError: async () => undefined },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      trainingPlan: {
        findUnique: async ({ where }: { where: { id: string } }) => plans[where.id] ?? null,
        update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
          planWrites.push({ id: where.id, data });
          return { id: where.id };
        },
        updateMany: async () => ({ count: 0 }),
        delete: async ({ where }: { where: { id: string } }) => {
          planDeletes.push(where.id);
          return { id: where.id };
        },
        create: async ({ data }: { data: { userId: string } }) => {
          planCreates.push(data);
          return { id: "ny-plan" };
        },
      },
      trainingPlanSession: {
        findUnique: async ({ where }: { where: { id: string } }) => sessions[where.id] ?? null,
        findMany: async () => [],
        update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
          sessionWrites.push({ id: where.id, data });
          return { id: where.id };
        },
        delete: async ({ where }: { where: { id: string } }) => {
          sessionDeletes.push(where.id);
          return { id: where.id };
        },
        create: async ({ data }: { data: unknown }) => {
          sessionCreates.push(data);
          return { id: "ny-okt" };
        },
      },
      trainingSessionV2: {
        updateMany: async () => ({ count: 0 }),
        deleteMany: async () => ({ count: 0 }),
      },
      planEffectiveness: {
        findUnique: async ({ where }: { where: { id: string } }) => effectiveness[where.id] ?? null,
        update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
          effWrites.push({ id: where.id, data });
          return { id: where.id };
        },
      },
      trainingPlanSessionLog: {
        update: async ({ where, data }: { where: { sessionId: string }; data: unknown }) => {
          logWrites.push({ id: where.sessionId, data });
          return { id: where.sessionId };
        },
      },
      user: {
        findUnique: async ({ where }: { where: { id: string } }) => users[where.id] ?? null,
        findMany: async ({ where }: { where: { AND: [{ id: { in: string[] } }, unknown] } }) =>
          where.AND[0].id.in.filter((id) => tillatte.has(id)).map((id) => users[id]),
      },
      auditLog: {
        create: async ({ data }: { data: { action: string; target: string } }) => {
          auditWrites.push({ action: data.action, target: data.target });
        },
      },
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("flyttOkt avviser fremmed spillers økt uten å flytte den", async () => {
  const { flyttOkt } = await actions();
  await assert.rejects(() => flyttOkt("okt-fremmed", new Date("2026-02-01")), /ikke tilgang/);
  assert.equal(sessionWrites.length, 0);
});

test("sendTilSpiller avviser fremmed plan uten statusendring", async () => {
  const { sendTilSpiller } = await actions();
  await assert.rejects(() => sendTilSpiller("plan-fremmed"), /ikke tilgang/);
  assert.equal(planWrites.length, 0);
});

test("godkjennPlan avviser fremmed plan uten aktivering", async () => {
  const { godkjennPlan } = await actions();
  await assert.rejects(() => godkjennPlan("plan-fremmed"), /ikke tilgang/);
  assert.equal(planWrites.length, 0);
});

test("markerSomNyttUtkast avviser fremmed plan uten statusendring", async () => {
  const { markerSomNyttUtkast } = await actions();
  await assert.rejects(() => markerSomNyttUtkast("plan-fremmed"), /ikke tilgang/);
  assert.equal(planWrites.length, 0);
});

test("pausePlan avviser fremmed plan uten pausering", async () => {
  const { pausePlan } = await actions();
  await assert.rejects(() => pausePlan("plan-fremmed"), /ikke tilgang/);
  assert.equal(planWrites.length, 0);
});

test("resumePlan avviser fremmed plan uten gjenopptak", async () => {
  const { resumePlan } = await actions();
  await assert.rejects(() => resumePlan("plan-fremmed"), /ikke tilgang/);
  assert.equal(planWrites.length, 0);
});

test("endPlan avviser fremmed plan uten arkivering", async () => {
  const { endPlan } = await actions();
  await assert.rejects(() => endPlan("plan-fremmed"), /ikke tilgang/);
  assert.equal(planWrites.length, 0);
});

test("markPlanCompleted avviser fremmed plan med en ærlig feilmelding, ingen skriving", async () => {
  const { markPlanCompleted } = await actions();
  const svar = await markPlanCompleted("plan-fremmed");
  assert.equal(svar.ok, false);
  assert.equal(planWrites.length, 0);
});

test("rateEffectiveness avviser fremmed effektivitetsrad uten skriving", async () => {
  const { rateEffectiveness } = await actions();
  const svar = await rateEffectiveness({ effectivenessId: "eff-fremmed", selfRating: 4 });
  assert.equal(svar.ok, false);
  assert.equal(effWrites.length, 0);
});

test("cancelSession avviser fremmed økt uten kansellering", async () => {
  const { cancelSession } = await actions();
  await assert.rejects(() => cancelSession("okt-fremmed"), /ikke tilgang/);
  assert.equal(sessionWrites.length, 0);
});

test("arkiverPlan avviser fremmed plan uten arkivering", async () => {
  const { arkiverPlan } = await actions();
  await assert.rejects(() => arkiverPlan("plan-fremmed"), /ikke tilgang/);
  assert.equal(planWrites.length, 0);
});

test("slettPlan er ADMIN-only — coach avvises uten sletting", async () => {
  const { slettPlan } = await actions();
  await assert.rejects(() => slettPlan("plan-a"), /forbidden/);
  assert.equal(planDeletes.length, 0);
});

test("oppdaterOkt avviser fremmed økt uten oppdatering", async () => {
  const { oppdaterOkt } = await actions();
  await assert.rejects(
    () =>
      oppdaterOkt("okt-fremmed", {
        title: "Ny tittel",
        scheduledAt: new Date(),
        durationMin: 60,
        pyramidArea: "TEK",
      }),
    /ikke tilgang/,
  );
  assert.equal(sessionWrites.length, 0);
});

test("sendOktFeedback avviser fremmed fullført økt med ærlig feil, ingen skriving", async () => {
  const { sendOktFeedback } = await actions();
  const svar = await sendOktFeedback("okt-fremmed-fullfort", "Bra jobbet!");
  assert.equal(svar.ok, false);
  assert.equal(logWrites.length, 0);
});

test("slettOkt avviser fremmed økt uten sletting", async () => {
  const { slettOkt } = await actions();
  await assert.rejects(() => slettOkt("okt-fremmed"), /ikke tilgang/);
  assert.equal(sessionDeletes.length, 0);
});

test("kopierPlan avviser fremmed kildeplan uten kopiering", async () => {
  const { kopierPlan } = await actions();
  await assert.rejects(() => kopierPlan("plan-fremmed", "spiller-a"), /ikke tilgang/);
  assert.equal(planCreates.length, 0);
});

test("kopierPlan avviser fremmed mottaker selv med tilgang til kildeplanen", async () => {
  const { kopierPlan } = await actions();
  await assert.rejects(() => kopierPlan("plan-a", "spiller-fremmed"), /ikke tilgang/);
  assert.equal(planCreates.length, 0);
});

test("leggTilOkt avviser fremmed plan uten å opprette økt", async () => {
  const { leggTilOkt } = await actions();
  await assert.rejects(
    () =>
      leggTilOkt({
        planId: "plan-fremmed",
        scheduledAt: new Date().toISOString(),
        durationMin: 60,
        title: "Ny økt",
        pyramidArea: "TEK",
        drills: [],
      }),
    /ikke tilgang/,
  );
  assert.equal(sessionCreates.length, 0);
});

test("lagreSomMal avviser fremmed plan med ærlig feil, ingen mal lagret", async () => {
  const { lagreSomMal } = await actions();
  const svar = await lagreSomMal("plan-fremmed", "Min mal");
  assert.equal(svar.ok, false);
});

test("assignPlanToPlayers avviser fremmed kildeplan uten tildeling", async () => {
  const { assignPlanToPlayers } = await actions();
  const svar = await assignPlanToPlayers({
    planId: "plan-fremmed",
    playerIds: ["spiller-a"],
    startDate: "2026-02-01",
  });
  assert.equal(svar.ok, false);
  assert.equal(planCreates.length, 0);
});

test("assignPlanToPlayers hopper over mottakere coachen ikke har tilgang til", async () => {
  const { assignPlanToPlayers } = await actions();
  const svar = await assignPlanToPlayers({
    planId: "plan-a",
    playerIds: ["spiller-a", "spiller-fremmed"],
    startDate: "2026-02-01",
  });
  assert.equal(svar.ok, true);
  if (svar.ok) {
    assert.equal(svar.assignedCount, 1);
    assert.equal(svar.skippedCount, 1);
  }
  assert.equal(planCreates.length, 1);
});

test("godkjennPlan lar tillatt coach aktivere egen spillers plan", async () => {
  const { godkjennPlan } = await actions();
  await godkjennPlan("plan-a");
  assert.equal(planWrites.length, 1);
  assert.equal(planWrites[0]?.id, "plan-a");
  assert.equal(auditWrites.at(-1)?.action, "plan.approve");
});
