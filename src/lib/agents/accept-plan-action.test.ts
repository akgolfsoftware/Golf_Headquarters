import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let status = "PENDING";
let failExec = false;
let failExecEtterEffekt = false;
let failAcceptedWrite = false;
let failOkRunWrite = false;
let executeKall = 0;
let varigeEffekter = 0;
const runs: Array<{ status: string; error?: string; output?: { actionId?: string; utfall?: string } }> = [];

mock.module("@/lib/agents/plan-action-executor", {
  namedExports: {
    executePlanAction: async () => {
      executeKall += 1;
      assert.equal(status, "PROCESSING");
      if (failExecEtterEffekt) {
        varigeEffekter += 1;
        throw new Error("varsel feilet etter varig delhandling");
      }
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
        updateMany: async ({
          where,
          data,
        }: {
          where: { status?: string };
          data: { status: string };
        }) => {
          if (where.status && status !== where.status) return { count: 0 };
          if (data.status === "ACCEPTED" && failAcceptedWrite) {
            failAcceptedWrite = false;
            throw new Error("Syntetisk statuslagring feilet");
          }
          status = data.status;
          return { count: 1 };
        },
      },
      agentRun: {
        create: async ({ data }: { data: (typeof runs)[number] }) => {
          if (data.status === "OK" && failOkRunWrite) {
            throw new Error("Syntetisk sporlagring feilet");
          }
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
  failExecEtterEffekt = false;
  failAcceptedWrite = false;
  failOkRunWrite = false;
  executeKall = 0;
  varigeEffekter = 0;
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

test("kjøringsfeil låser forslaget for avstemming og logger renset spor", async () => {
  failExec = true;
  await assert.rejects(() => acceptAndApplyPlanAction("pa-1"), /execution-failed/);
  assert.equal(status, "PROCESSING");
  assert.equal(executeKall, 1);
  assert.equal(runs[0]?.status, "ERROR");
  assert.equal(runs[0]?.output?.actionId, "pa-1");
  assert.equal(runs[0]?.output?.utfall, "ERROR");
  assert.equal(runs[0]?.error?.includes("kari@"), false);
  assert.equal(runs[0]?.error?.includes("postgresql://"), false);
});

test("delvis utføring før kast kan ikke gjentas med blind retry", async () => {
  failExecEtterEffekt = true;

  await assert.rejects(
    () => acceptAndApplyPlanAction("pa-1"),
    /execution-failed/,
  );
  assert.equal(status, "PROCESSING");
  assert.equal(varigeEffekter, 1);

  const nyttForsok = await acceptAndApplyPlanAction("pa-1");
  assert.equal(nyttForsok.status, "UNCHANGED");
  assert.equal(varigeEffekter, 1);
  assert.equal(executeKall, 1);
});

test("allerede behandlet forslag kjøres ikke på nytt", async () => {
  status = "ACCEPTED";
  const resultat = await acceptAndApplyPlanAction("pa-1");
  assert.equal(resultat.status, "ACCEPTED");
  assert.equal(resultat.applied, false);
  assert.equal(executeKall, 0);
  assert.equal(runs.length, 0);
});

test("to samtidige godkjenninger kjører sideeffekten bare én gang", async () => {
  const [a, b] = await Promise.all([
    acceptAndApplyPlanAction("pa-1"),
    acceptAndApplyPlanAction("pa-1"),
  ]);

  assert.equal(executeKall, 1);
  assert.equal(status, "ACCEPTED");
  assert.deepEqual(
    [a.status, b.status].sort(),
    ["ACCEPTED", "UNCHANGED"],
  );
});

test("statusfeil etter ferdig executor åpner ikke for ny sideeffekt", async () => {
  failAcceptedWrite = true;

  await assert.rejects(
    () => acceptAndApplyPlanAction("pa-1"),
    /execution-failed/,
  );
  assert.equal(status, "PROCESSING");
  assert.equal(executeKall, 1);

  const nyttForsok = await acceptAndApplyPlanAction("pa-1");
  assert.equal(nyttForsok.status, "UNCHANGED");
  assert.equal(executeKall, 1);
});

test("sporfeil etter godkjenning endrer ikke resultat eller gjentar sideeffekt", async () => {
  failOkRunWrite = true;

  const resultat = await acceptAndApplyPlanAction("pa-1");
  assert.equal(resultat.status, "ACCEPTED");
  assert.equal(resultat.applied, true);
  assert.equal(status, "ACCEPTED");
  assert.equal(executeKall, 1);

  const nyttForsok = await acceptAndApplyPlanAction("pa-1");
  assert.equal(nyttForsok.status, "ACCEPTED");
  assert.equal(nyttForsok.applied, false);
  assert.equal(executeKall, 1);
});
