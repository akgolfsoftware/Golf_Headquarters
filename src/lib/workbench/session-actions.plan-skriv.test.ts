import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let me = { id: "coach", role: "COACH" as string };
let stall = true;
let planEier = "spiller";
let writes = 0;
let v2Kall = 0;
const okt = {
  id: "okt-1",
  scheduledAt: new Date("2026-06-22T09:00:00.000Z"),
  title: "Driver",
  durationMin: 60,
  pyramidArea: "TEK" as const,
  miljo: "M2" as const,
  location: null as string | null,
  maalsetning: null as string | null,
};

const sessionApi = {
  findUnique: async ({ where }: { where: { id: string } }) =>
    where.id === okt.id
      ? { ...okt, plan: { userId: planEier, id: "plan-1" }, status: "PLANNED" }
      : null,
  update: async ({ data }: { data: { title?: string; scheduledAt?: Date } }) => {
    writes += 1;
    if (data.title != null) okt.title = data.title;
    if (data.scheduledAt) okt.scheduledAt = data.scheduledAt;
    return { ...okt };
  },
  create: async ({ data }: { data: { title: string; scheduledAt: Date } }) => {
    writes += 1;
    return {
      id: "ny-okt",
      title: data.title,
      scheduledAt: data.scheduledAt,
      durationMin: 45,
      pyramidArea: "TEK",
    };
  },
  delete: async () => {
    writes += 1;
  },
};

mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => me },
});
mock.module("@/lib/auth/coached", {
  namedExports: {
    harCoachTilgangTilSpiller: async () => stall,
    erCoachetSpiller: async () => stall,
  },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/workbench/v2-sync", {
  namedExports: {
    upsertV2ForPlanSession: async () => {
      v2Kall += 1;
    },
    deleteV2ForPlanSession: async () => undefined,
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      trainingPlan: {
        findFirst: async () => ({ id: "plan-1" }),
        create: async () => ({ id: "plan-1" }),
      },
      trainingPlanSession: sessionApi,
      $transaction: async (fn: (tx: { trainingPlanSession: typeof sessionApi }) => Promise<unknown>) =>
        fn({ trainingPlanSession: sessionApi }),
    },
  },
});

let actions: typeof import("./session-actions");

before(async () => {
  actions = await import("./session-actions");
});

beforeEach(() => {
  me = { id: "coach", role: "COACH" };
  stall = true;
  planEier = "spiller";
  writes = 0;
  v2Kall = 0;
  okt.title = "Driver";
  okt.scheduledAt = new Date("2026-06-22T09:00:00.000Z");
});

test("coach med stalltilgang kan opprette, flytte og redigere", async () => {
  const ny = await actions.coachAddWorkbenchSession("spiller", {
    dayIndex: 1,
    title: "Coach-økt",
    durMin: 45,
    area: "TEK",
    hour: 8,
    minute: 0,
  });
  assert.equal(ny.ok, true);
  assert.equal((await actions.coachMoveWorkbenchSession("spiller", "okt-1", 4)).ok, true);
  assert.equal((await actions.coachUpdateWorkbenchSession("spiller", "okt-1", { title: "Endret" })).ok, true);
  assert.equal(okt.title, "Endret");
  assert.ok(writes >= 3);
  assert.ok(v2Kall >= 1);
});

test("coach uten stalltilgang avvises uten skriving", async () => {
  stall = false;
  assert.equal(
    (await actions.coachAddWorkbenchSession("spiller", {
      dayIndex: 1,
      title: "Ulovlig",
      durMin: 45,
      area: "TEK",
      hour: 8,
      minute: 0,
    })).ok,
    false,
  );
  assert.equal((await actions.coachMoveWorkbenchSession("spiller", "okt-1", 2)).ok, false);
  assert.equal((await actions.coachUpdateWorkbenchSession("spiller", "okt-1", { title: "Ulovlig" })).ok, false);
  assert.equal(writes, 0);
  assert.equal(okt.title, "Driver");
});

test("coach kan ikke flytte økt som tilhører en annen spiller", async () => {
  planEier = "annen";
  assert.equal((await actions.coachMoveWorkbenchSession("spiller", "okt-1", 2)).ok, false);
  assert.equal(writes, 0);
});
