import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let viewer = { id: "player", role: "PLAYER" };
let coachAccess = false;
let state = { status: "IN_PROGRESS", count: 0 };
let writeCount = 0;
let failWrite = false;
let plan = false;
let v2 = false;
let planLogTotal: number | null = null;
let mirrorOwner: string | null = null;
let mirrorStatus: string | null = null;
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => coachAccess } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  $transaction: async (run: (tx: unknown) => Promise<void>) => {
    const copy = { ...state };
    const row = () => ({ id: "session", playerId: "player", plan: { userId: "player" }, status: copy.status, updatedAt: new Date(0), hiddenByPlayer: false, needsPlayerApproval: false });
    const update = async ({ data }: { data: { status: string } }) => { writeCount++; copy.status = data.status; };
    await run({
      trainingPlanSession: { findUnique: async ({ where }: { where: { id: string } }) => where.id === "plan-source" && mirrorOwner ? { ...row(), id: "plan-source", status: "ACTIVE", plan: { userId: mirrorOwner } } : plan ? row() : null,
        update: async (input: { where: { id: string }; data: { status: string } }) => { if (input.where.id === "plan-source") mirrorStatus = input.data.status; else await update(input); } },
      workbenchSession: { findUnique: async () => v2 ? null : row(), update },
      trainingSessionV2: { findUnique: async () => v2 ? { ...row(), studentId: "player", coachId: "coach", hostId: null, participants: [], completedSummary: {}, generertFra: mirrorOwner ? "WORKBENCH_PLAN" : null, generertFraId: "plan-source" } : null, update },
      trainingPlanSessionLog: { upsert: async ({ create }: { create: { totalReps: number } }) => { planLogTotal = create.totalReps; } },
      sessionBallLog: { upsert: async ({ create }: { create: { count: number } }) => {
        if (failWrite) throw new Error("write failure");
        writeCount++; copy.count = create.count;
      }, findMany: async () => [{ club: "iron-7", count: copy.count }] },
    });
    state = copy;
  },
} } });
let saveTapperCounts: typeof import("@/app/portal/(fullscreen)/live/[sessionId]/tapper/actions").saveTapperCounts;
let finishTapperSession: typeof saveTapperCounts;
before(async () => { ({ saveTapperCounts, finishTapperSession } = await import("@/app/portal/(fullscreen)/live/[sessionId]/tapper/actions")); });
beforeEach(() => { viewer = { id: "player", role: "PLAYER" }; coachAccess = false; state = { status: "IN_PROGRESS", count: 0 }; writeCount = 0; failWrite = false; plan = false; v2 = false; planLogTotal = null; mirrorOwner = null; mirrorStatus = null; });
const counts = [{ club: "iron-7", count: 12 }];
test("fremmed spiller og uvedkommende coach får ingen skriving", async () => {
  for (const role of ["PLAYER", "COACH", "ADMIN"]) {
    viewer = { id: "stranger", role };
    assert.equal((await saveTapperCounts("session", counts)).ok, false);
    assert.equal(writeCount, 0);
  }
});
test("tilknyttet coach kan lagre, spillerrolle kan ikke utnytte coach-oppslag", async () => {
  coachAccess = true; viewer = { id: "coach", role: "COACH" };
  assert.equal((await saveTapperCounts("session", counts)).ok, true);
  viewer = { id: "stranger", role: "PLAYER" };
  assert.equal((await saveTapperCounts("session", counts)).ok, false);
});
test("avslutning lagrer telling og status samlet; retry endrer ikke sluttresultatet", async () => {
  assert.equal((await finishTapperSession("session", counts)).ok, true);
  assert.deepEqual(state, { status: "COMPLETED", count: 12 });
  assert.equal((await finishTapperSession("session", [{ club: "iron-7", count: 1 }])).ok, true);
  assert.equal((await saveTapperCounts("session", [{ club: "iron-7", count: 1 }])).ok, false);
  assert.equal(state.count, 12);
});
test("V2-sluttelling støttes og en retry skriver ikke nye tall", async () => {
  v2 = true;
  assert.equal((await finishTapperSession("session", counts)).ok, true);
  assert.deepEqual(state, { status: "COMPLETED", count: 12 });
  assert.equal((await finishTapperSession("session", [{ club: "iron-7", count: 1 }])).ok, true);
  assert.equal(state.count, 12);
});
test("feil ved telling ruller fullført-status tilbake", async () => {
  failWrite = true;
  assert.equal((await finishTapperSession("session", counts)).ok, false);
  assert.deepEqual(state, { status: "IN_PROGRESS", count: 0 });
});
test("plan-økt kan avsluttes; utkast og dobbelt køllenavn avvises", async () => {
  plan = true; state.status = "ACTIVE";
  assert.equal((await finishTapperSession("session", counts)).ok, true);
  assert.equal(planLogTotal, 12);
  state.status = "DRAFT";
  assert.equal((await finishTapperSession("session", counts)).ok, false);
  state.status = "ACTIVE";
  assert.equal((await finishTapperSession("session", [...counts, ...counts])).ok, false);
});
test("V2-tapper fullfører sitt eget planspeil med samme tall; fremmed planspeil ruller tilbake", async () => {
  v2 = true; mirrorOwner = "player";
  assert.equal((await finishTapperSession("session", counts)).ok, true);
  assert.equal(mirrorStatus, "COMPLETED"); assert.equal(planLogTotal, 12);
  state = { status: "IN_PROGRESS", count: 0 }; mirrorOwner = "stranger"; mirrorStatus = null; planLogTotal = null;
  assert.equal((await finishTapperSession("session", counts)).ok, false);
  assert.deepEqual(state, { status: "IN_PROGRESS", count: 0 }); assert.equal(mirrorStatus, null); assert.equal(planLogTotal, null);
});
