import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let viewer = { id: "tildelt-coach", role: "COACH" };
let harTilgang = true;
let status = "PENDING";
let executeKall = 0;
const runs: Array<{ output?: { utfall?: string; actionId?: string } }> = [];

mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => viewer },
});
mock.module("@/lib/auth/coached", {
  namedExports: { harCoachTilgangTilSpiller: async () => harTilgang },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/agents/plan-action-executor", {
  namedExports: {
    executePlanAction: async () => {
      executeKall += 1;
      return { applied: true, summary: "Økt lagt til", sessionsAdded: 1, sessionsRemoved: 0, sessionsModified: 0 };
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      planAction: {
        findUnique: async () => ({
          id: "pa-1",
          userId: "spiller",
          coachId: "tildelt-coach",
          actionType: "SESSION_ADD",
          status,
          suggestion: {},
        }),
        updateMany: async ({
          where,
          data,
        }: {
          where: { status?: string };
          data: { status: string };
        }) => {
          if (where.status && status !== where.status) return { count: 0 };
          status = data.status;
          return { count: 1 };
        },
      },
      agentRun: {
        create: async ({ data }: { data: (typeof runs)[number] }) => {
          runs.push(data);
        },
      },
    },
  },
});

let acceptPlanAction: typeof import("./actions").acceptPlanAction;
let rejectPlanAction: typeof import("./actions").rejectPlanAction;

before(async () => {
  ({ acceptPlanAction, rejectPlanAction } = await import("./actions"));
});

beforeEach(() => {
  viewer = { id: "tildelt-coach", role: "COACH" };
  harTilgang = true;
  status = "PENDING";
  executeKall = 0;
  runs.length = 0;
});

test("tildelt coach kan avvise uten kjøring, med spor på samme actionId", async () => {
  await rejectPlanAction("pa-1", "Ikke nå.");
  assert.equal(status, "REJECTED");
  assert.equal(executeKall, 0);
  assert.equal(runs[0]?.output?.actionId, "pa-1");
  assert.equal(runs[0]?.output?.utfall, "REJECTED");
});

test("uvedkommende coach kan verken godkjenne eller avvise", async () => {
  viewer = { id: "fremmed-coach", role: "COACH" };
  harTilgang = false;
  await assert.rejects(() => acceptPlanAction("pa-1"), /forbidden/);
  await assert.rejects(() => rejectPlanAction("pa-1"), /forbidden/);
  assert.equal(status, "PENDING");
  assert.equal(executeKall, 0);
  assert.equal(runs.length, 0);
});

test("allerede avvist forslag avvises ikke på nytt", async () => {
  status = "REJECTED";
  await rejectPlanAction("pa-1");
  assert.equal(executeKall, 0);
  assert.equal(runs.length, 0);
});

test("to samtidige avvisninger lager bare ett beslutningsspor", async () => {
  await Promise.all([
    rejectPlanAction("pa-1", "Første"),
    rejectPlanAction("pa-1", "Andre"),
  ]);

  assert.equal(status, "REJECTED");
  assert.equal(runs.length, 1);
});
