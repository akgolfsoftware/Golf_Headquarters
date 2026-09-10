import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let viewer = { id: "stranger", role: "PLAYER" };
let coachAccess = false;
let participants = [{ userId: "invited-player", status: "ACCEPTED" }];
mock.module("@/lib/auth/requireConsentingUser", { namedExports: { requireConsentingUser: async () => viewer } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => coachAccess } });
mock.module("@/lib/agents/triggers", { namedExports: { triggerLiveSessionAgent: async () => {} } });
mock.module("@/lib/workbench/v2-sync", { namedExports: { GENERERT_FRA: "test" } });
mock.module("@/lib/teknisk-plan/apply-reps", { namedExports: { applyPositionTaskReps: async () => {} } });
mock.module("next/navigation", { namedExports: { redirect: () => { throw new Error("redirect"); } } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  trainingSessionV2: { findUnique: async () => ({
    id: "s", studentId: "player", coachId: "assigned-coach", hostId: null,
    participants, drills: [], title: "Testøkt", status: "PLANNED", completedSummary: {},
    startTime: new Date(0), endTime: new Date(60000), createdAt: new Date(0), publishedAt: new Date(0),
  }) },
  user: { findUnique: async () => null },
  drillLogV2: { findMany: async () => [] },
} } });
let load: typeof import("@/app/portal/(fullscreen)/live/[sessionId]/actions").loadLiveSession;
before(async () => { load = (await import("@/app/portal/(fullscreen)/live/[sessionId]/actions")).loadLiveSession; });
beforeEach(() => { viewer = { id: "stranger", role: "PLAYER" }; coachAccess = false; participants = [{ userId: "invited-player", status: "ACCEPTED" }]; });
test("en annens aksepterte invitasjon gir ikke tilgang", async () => {
  assert.deepEqual(await load("s"), { ok: false, reason: "forbidden" });
});
test("coach uten tilknytning avvises selv om økten har deltakere", async () => {
  viewer.role = "COACH";
  assert.deepEqual(await load("s"), { ok: false, reason: "forbidden" });
});
test("bare akseptert eller møtt deltaker får innsyn", async () => {
  viewer.id = "invited-player";
  assert.equal((await load("s")).ok, true);
  participants[0].status = "DECLINED";
  assert.equal((await load("s")).ok, false);
});
test("eier og coach med bekreftet tilgang får innsyn", async () => {
  viewer.id = "player";
  assert.equal((await load("s")).ok, true);
  viewer = { id: "coached", role: "COACH" }; coachAccess = true;
  assert.equal((await load("s")).ok, true);
});
