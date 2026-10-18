import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";
import { readSessionExecution } from "@/lib/workbench/wb-session-life";

let viewer = { id: "player", role: "PLAYER" };
let state = { status: "IN_PROGRESS", updatedAt: new Date(0), liveSnapshot: {} as Prisma.JsonValue, reps: 0 };
let reject = false;
let failLog = false;
let writes = 0;
function row() { return { id: "s", playerId: "player", ...state, isTemplate: false, hiddenByPlayer: false, needsPlayerApproval: false, approvalStatus: reject ? "REJECTED" : "ACCEPTED",
  groupId: null, sourceGroupSessionId: null, drills: [{ id: "d1", title: "Syntetisk øvelse", akFormel: { pyramid: "TEK", area: "TEK_POSISJON", label: "x" }, positionTaskId: null }] }; }
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("@/lib/auth/own-or-coached", { namedExports: { canAccessPlayer: async (user: { id: string }, id: string) => user.id === id } });
mock.module("@/lib/teknisk-plan/apply-reps", { namedExports: { rekalkulerMaalMatrise: async () => {} } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  workbenchSession: { findUnique: async () => row() },
  $transaction: async (run: (tx: unknown) => Promise<void>) => {
    const copy = structuredClone(state);
    await run({
      workbenchSession: { updateMany: async ({ where, data }: { where: { status: string; updatedAt: Date }; data: { status?: string; updatedAt?: Date; liveSnapshot?: Prisma.JsonValue } }) => {
        if (where.status !== copy.status || where.updatedAt.getTime() !== copy.updatedAt.getTime()) return { count: 0 };
        writes++; copy.status = data.status ?? copy.status; copy.updatedAt = data.updatedAt ?? new Date(copy.updatedAt.getTime() + 1); copy.liveSnapshot = data.liveSnapshot ?? copy.liveSnapshot; return { count: 1 };
      } },
      workbenchDrillLog: { upsert: async ({ create }: { create: { reps: number } }) => { if (failLog) throw new Error("Synthetic log failure"); copy.reps = create.reps; } },
    });
    state = copy;
  },
} } });
let actions: typeof import("./wb-live-actions");
before(async () => { actions = await import("./wb-live-actions"); });
beforeEach(() => { viewer = { id: "player", role: "PLAYER" }; state = { status: "IN_PROGRESS", updatedAt: new Date(0), liveSnapshot: { startedAtISO: "2026-10-12T09:00:00.000Z", totalSec: 12, unknown: "Bevares" }, reps: 0 }; reject = false; failLog = false; writes = 0; });

test("Workbench-fullføring låser status og sluttlogg i samme transaksjon", async () => {
  assert.equal((await actions.fullforWbLiveOkt("s", [{ drillId: "d1", reps: 12 }])).ok, true);
  assert.equal(state.status, "COMPLETED"); assert.equal(state.reps, 12);
  assert.equal(readSessionExecution(state.liveSnapshot)?.phase, "COMPLETED");
  assert.equal((state.liveSnapshot as { unknown: string }).unknown, "Bevares");
  const saved = structuredClone(state); const beforeRetry = writes;
  assert.equal((await actions.fullforWbLiveOkt("s", [{ drillId: "d1", reps: 1 }])).ok, true);
  assert.deepEqual(state, saved); assert.equal(writes, beforeRetry);
  assert.equal((await actions.lagreWbOvelse("s", { drillId: "d1", reps: 1 })).ok, false);
});
test("feil i sluttloggen ruller status tilbake; ingen vellykket fullføring", async () => {
  failLog = true;
  assert.equal((await actions.fullforWbLiveOkt("s", [{ drillId: "d1", reps: 12 }])).ok, false);
  assert.equal(state.status, "IN_PROGRESS"); assert.equal(state.reps, 0);
});
test("avvist forslag, utenforstående og fremmed øvelse får ingen lagret telling", async () => {
  reject = true; assert.equal((await actions.lagreWbOvelse("s", { drillId: "d1", reps: 1 })).ok, false); assert.equal(writes, 0);
  reject = false; viewer.id = "stranger";
  assert.equal((await actions.fullforWbLiveOkt("s", [{ drillId: "d1", reps: 1 }])).ok, false); assert.equal(writes, 0);
  viewer.id = "player";
  assert.equal((await actions.fullforWbLiveOkt("s", [{ drillId: "other-session", reps: 1 }])).ok, false); assert.equal(state.status, "IN_PROGRESS"); assert.equal(state.reps, 0);
});
