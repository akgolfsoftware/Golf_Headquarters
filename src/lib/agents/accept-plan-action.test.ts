import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let status = "PENDING";
let failExec = false;
let executeKall = 0;
const runs: Array<{ status: string; error?: string; output?: { actionId?: string; utfall?: string } }> = [];

mock.module("@/lib/agents/plan-action-executor", {
  namedExports: {
    executePlanAction: async () => {
      executeKall += 1;
      if (failExec) throw new Error("postgresql://secret@db/internal_table kari@example.test");
      return { applied: true, summary: "Økt lagt til", sessionsAdded: 1, sessionsRemoved: 0, sessionsModified: 0 };
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      planAction: {
        findUnique: async () =>
          status === "missing"
            ? null
            : {
                id: "pa-1",
                userId: "spiller",
                coachId: "tildelt-coach",
                actionType: "SESSION_ADD",
                status,
                suggestion: {},
              },
        update: async ({ data }: { data: { status: string } }) => {
          status = data.status;
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

let acceptAndApplyPlanAction: typeof import("./accept-plan-action").acceptAndApplyPlanAction;

before(async () => {
  ({ acceptAndApplyPlanAction } = await import("./accept-plan-action"));
});

beforeEach(() => {
  status = "PENDING";
  failExec = false;
  executeKall = 0;
  runs.length = 0;
});

test("godkjenning kjører forslaget og logger spor med actionId", async () => {
  const resultat = await acceptAndApplyPlanAction("pa-1", undefined, "tildelt-coach");
  assert.equal(resultat.status, "ACCEPTED");
  assert.equal(resultat.applied, true);
  assert.equal(status, "ACCEPTED");
  assert.equal(executeKall, 1);
  assert.equal(runs[0]?.status, "OK");
  assert.equal(runs[0]?.output?.actionId, "pa-1");
  assert.equal(runs[0]?.output?.utfall, "ACCEPTED");
});

test("kjøringsfeil lar forslaget stå pending og logger renset spor", async () => {
  failExec = true;
  await assert.rejects(() => acceptAndApplyPlanAction("pa-1"), /execution-failed/);
  assert.equal(status, "PENDING");
  assert.equal(executeKall, 1);
  assert.equal(runs[0]?.status, "ERROR");
  assert.equal(runs[0]?.output?.actionId, "pa-1");
  assert.equal(runs[0]?.output?.utfall, "ERROR");
  assert.equal(runs[0]?.error?.includes("kari@"), false);
  assert.equal(runs[0]?.error?.includes("postgresql://"), false);
});

test("allerede behandlet forslag kjøres ikke på nytt", async () => {
  status = "ACCEPTED";
  const resultat = await acceptAndApplyPlanAction("pa-1");
  assert.equal(resultat.status, "ACCEPTED");
  assert.equal(resultat.applied, false);
  assert.equal(executeKall, 0);
  assert.equal(runs.length, 0);
});
