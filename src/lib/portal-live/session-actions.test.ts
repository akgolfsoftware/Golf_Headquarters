import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import { readSessionExecution } from "@/lib/workbench/wb-session-life";
import type { Prisma } from "@/generated/prisma/client";

let kind: "plan" | "workbench" | "v2" = "plan";
let viewer = { id: "player", role: "PLAYER" };
let coachAccess = false;
let status = "ACTIVE";
let snapshot: Prisma.JsonValue = {};
let updatedAt = new Date(0);
let writes = 0;
let failPlanLog = false;
let planLog: Record<string, unknown> | null = null;
let categoryLog: Record<string, unknown> | null = null;
let missingVideo = false;
let awaitingConsent = false;
let storageReads = 0;
let videoWrites = 0;
let savedVideo: Record<string, unknown> | null = null;
const progress = [{ drillId: "d1", reps: 12, elapsedSec: 30, status: "done" as const, kommentar: "Syntetisk kommentar" }];
const full = [{ drillId: "d1", repsTotal: 12, repsWithoutBall: 3, repsLowSpeed: 4, repsAutomatic: 0, repsHit: 5, status: "done" as const, actualDurationSec: 30, notes: "Syntetisk kommentar" }];
function planLogTotal() { return planLog?.totalReps; }
function row() { return { id: "s", status, updatedAt, liveSnapshot: structuredClone(snapshot), completedSummary: structuredClone(snapshot), plan: { userId: "player", name: "Plan" },
  playerId: "player", studentId: "player", hostId: null, coachId: "coach", participants: [], drills: [{ id: "d1" }], drillLogs: [],
  hiddenByPlayer: false, isTemplate: false, needsPlayerApproval: false, approvalStatus: "ACCEPTED", sourceGroupSessionId: null, localOverride: false, groupId: null }; }
async function update({ where, data }: { where: { status: string; updatedAt: Date }; data: { status?: string; liveSnapshot?: Prisma.JsonValue; completedSummary?: Prisma.JsonValue } }) {
  if (where.status !== status || where.updatedAt.getTime() !== updatedAt.getTime()) return { count: 0 };
  writes++; status = data.status ?? status; snapshot = data.liveSnapshot ?? data.completedSummary ?? snapshot; updatedAt = new Date(updatedAt.getTime() + 1); return { count: 1 };
}
const db = {
  trainingSessionV2: { findUnique: async () => kind === "v2" ? row() : null, updateMany: update },
  trainingPlanSession: { findUnique: async () => kind === "plan" ? row() : null, updateMany: update },
  workbenchSession: { findUnique: async () => kind === "workbench" ? row() : null, updateMany: update },
  drillLogV2: { findFirst: async () => ({ repsWithoutBall: 3, repsLowSpeed: 4, repsAutomatic: 0, repsHit: 5, notes: "Eldre detalj" }) },
  trainingPlanSessionLog: { upsert: async ({ create }: { create: Record<string, unknown> }) => { if (failPlanLog) throw new Error("Synthetic log failure"); planLog = create; } },
  playerSwingVideo: { findFirst: async () => savedVideo ? { id: "saved-video" } : null, create: async ({ data }: { data: Record<string, unknown> }) => { videoWrites++; savedVideo = data; } },
};
mock.module("@/lib/prisma", { namedExports: { prisma: { ...db, $transaction: async (run: (tx: typeof db) => Promise<void>) => {
  const saved = { status, snapshot: structuredClone(snapshot), updatedAt, writes, planLog };
  try { return await run(db); } catch (error) { ({ status, snapshot, updatedAt, writes, planLog } = saved); throw error; }
} } } });
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("@/lib/auth/own-or-coached", { namedExports: { canAccessPlayer: async (user: { id: string; role: string }, id: string) => user.id === id || coachAccess && user.role === "COACH" } });
mock.module("@/lib/workbench/group-scope", { namedExports: { canReadOwnGroupCopy: () => true } });
mock.module("@/lib/auth/minor", { namedExports: { isAwaitingGuardianConsent: () => awaitingConsent } });
mock.module("@/lib/supabase/admin", { namedExports: { supabaseAdmin: () => ({ storage: { from: () => ({ info: async (path: string) => {
  storageReads++; return missingVideo ? { data: null, error: { message: "Not found" } } : { data: { name: path, contentType: "video/mp4", size: 100 }, error: null };
} }) } }) } });
mock.module("@/lib/storage/supabase-storage", { namedExports: { getSignedUrl: async (_bucket: string, path: string) => `https://storage.example.test/${path}?server-signature` } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/workbench/wb-actions", { namedExports: { startSession: async () => { status = "IN_PROGRESS"; return { ok: true }; } } });
mock.module("@/lib/workbench/wb-session-life-actions", { namedExports: { mutateSessionExecution: async () => ({ ok: true }) } });
mock.module("./wb-live-actions", { namedExports: { lagreWbOvelse: async () => ({ ok: true }), lagreWbOvelseVideo: async () => ({ ok: true }), fullforWbLiveOkt: async () => { status = "COMPLETED"; return { ok: true, href: "/portal/live/s/summary" }; } } });
mock.module("@/app/portal/(fullscreen)/live/[sessionId]/actions", { namedExports: {
  startSession: async () => { status = "IN_PROGRESS"; return { state: "active" }; },
  logDrillReps: async (input: Record<string, unknown>) => { categoryLog = input; return { ok: true }; },
  completeSession: async () => { status = "COMPLETED"; return { href: "/portal/live/s/summary" }; },
} });
let actions: typeof import("./session-actions");
before(async () => { actions = await import("./session-actions"); });
beforeEach(() => { kind = "plan"; viewer = { id: "player", role: "PLAYER" }; coachAccess = false; status = "ACTIVE"; snapshot = { other: "Bevares" }; updatedAt = new Date(0); writes = 0; failPlanLog = false; planLog = null; categoryLog = null; missingVideo = false; awaitingConsent = false; storageReads = 0; videoWrites = 0; savedVideo = null; });

test("servervalgt modell avviser fremmed spiller og uvedkommende coach før lagring", async () => {
  for (const model of ["plan", "workbench", "v2"] as const) {
    kind = model; status = model === "plan" ? "ACTIVE" : "IN_PROGRESS";
    for (const role of ["PLAYER", "COACH"]) {
      viewer = { id: "stranger", role };
      assert.equal((await actions.lagreLiveOvelse("s", progress[0])).ok, false);
      assert.equal((await actions.fullforLiveOkt("s", progress)).ok, false);
    }
  }
  assert.equal(writes, 0); assert.equal(categoryLog, null);
});
test("planlogging bruker absolutt telling; retry, nullretting og kommentar bevares", async () => {
  assert.equal((await actions.lagreLiveOvelse("s", progress[0])).ok, true);
  assert.equal((await actions.lagreLiveOvelse("s", progress[0])).ok, true);
  assert.equal((snapshot as { precisionLive: { reps: number }[] }).precisionLive[0].reps, 12);
  await actions.lagreLiveOvelse("s", { drillId: "d1", reps: 0 });
  const saved = (snapshot as { precisionLive: { reps: number; kommentar: string }[] }).precisionLive[0];
  assert.equal(saved.reps, 0); assert.equal(saved.kommentar, "Syntetisk kommentar");
  assert.equal((snapshot as { other: string }).other, "Bevares");
});
test("fremmed øvelse og ugyldig total avvises uten å skrive", async () => {
  assert.equal((await actions.lagreLiveOvelse("s", { drillId: "other-session", reps: 1 })).ok, false);
  assert.equal((await actions.lagreLiveOvelse("s", { drillId: "d1", reps: -1 })).ok, false);
  assert.equal((await actions.fullforLiveOkt("s", [...progress, ...progress])).ok, false);
  assert.equal(writes, 0);
});
test("planens sluttstatus og logg fryses samlet; retry endrer ikke sluttresultatet", async () => {
  assert.equal((await actions.fullforLiveOkt("s", progress, 30)).ok, true);
  assert.equal(status, "COMPLETED"); assert.equal(planLogTotal(), 12);
  const beforeRetry = structuredClone(snapshot); const writesBefore = writes;
  assert.equal((await actions.fullforLiveOkt("s", [{ drillId: "d1", reps: 1 }], 1)).ok, true);
  assert.deepEqual(snapshot, beforeRetry); assert.equal(writes, writesBefore);
  assert.equal((await actions.lagreLiveOvelse("s", { drillId: "d1", reps: 2 })).ok, false);
});
test("feil i planlogg gir ingen bekreftet fullføring; riktig retry gjenbruker telling", async () => {
  failPlanLog = true;
  assert.equal((await actions.fullforLiveOkt("s", progress)).ok, false); assert.equal(status, "ACTIVE"); assert.equal(planLog, null);
  failPlanLog = false; assert.equal((await actions.fullforLiveOkt("s", progress)).ok, true); assert.equal(planLogTotal(), 12);
});
test("pause og fortsett beholder resultater og kjører riktig planstatus", async () => {
  status = "PLANNED";
  assert.deepEqual(await actions.startLiveOkt("s"), { ok: true, href: "/portal/live/s/active" });
  assert.equal(status, "ACTIVE"); assert.equal(readSessionExecution(snapshot)?.phase, "ACTIVE");
  assert.equal((await actions.pauseLiveOkt("s")).ok, true); assert.equal(status, "PAUSED");
  assert.equal(readSessionExecution(snapshot)?.runningSinceISO, null);
  assert.equal((await actions.pauseLiveOkt("s")).ok, true);
  assert.equal((await actions.resumeLiveOkt("s")).ok, true); assert.equal(status, "ACTIVE"); assert.equal(readSessionExecution(snapshot)?.phase, "ACTIVE");
});
test("pause uten nett synker aktiv tid uten å telle ventetiden som trening", async () => {
  status = "PLANNED";
  await actions.startLiveOkt("s");
  assert.equal((await actions.lagreLiveDrillSnapshot("s", full, 30, true)).ok, true);
  assert.equal(status, "PAUSED");
  assert.equal(readSessionExecution(snapshot)?.phase, "PAUSED");
  assert.equal(readSessionExecution(snapshot)?.accumulatedSec, 30);
  assert.equal((await actions.lagreLiveDrillSnapshot("s", full, 30, true)).ok, true);
  assert.equal(readSessionExecution(snapshot)?.accumulatedSec, 30);
});
test("V2 offline-detaljlogger mister ingen av de opprinnelige rep-kategoriene", async () => {
  kind = "v2"; status = "IN_PROGRESS";
  assert.equal((await actions.lagreLiveDrillSnapshot("s", full, 30)).ok, true);
  assert.equal(categoryLog?.repsWithoutBall, 3); assert.equal(categoryLog?.repsLowSpeed, 4); assert.equal(categoryLog?.repsHit, 5); assert.equal(categoryLog?.repsAutomatic, 0);
});
test("enkel Live-telling overskriver ikke motorik og treff med uregistrerte nuller", async () => {
  kind = "v2"; status = "IN_PROGRESS";
  const simple = full.map((row) => ({ ...row, repsTotal: 15, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 0, repsHit: 0, quantityOnly: true }));
  assert.equal((await actions.lagreLiveDrillSnapshot("s", simple, 30)).ok, true);
  assert.equal(categoryLog?.repsTotal, 15);
  assert.equal(categoryLog?.repsWithoutBall, 3);
  assert.equal(categoryLog?.repsLowSpeed, 4);
  assert.equal(categoryLog?.repsHit, 5);
});
test("privat refleksjon skrives ikke til eldre delingsfelt; feil og uferdig status bekreftes ikke", async () => {
  kind = "v2"; status = "COMPLETED"; snapshot = { dineOrd: { tekst: "Gammelt delt svar" }, other: "Bevares" };
  assert.equal((await actions.lagreLiveOppsummering("s", { note: "Privat", shareWithCoach: false })).ok, true);
  assert.equal((snapshot as Record<string, unknown>).dineOrd, undefined);
  assert.equal((snapshot as { playerReflection: { note: string } }).playerReflection.note, "Privat");
  assert.equal((await actions.lagreLiveOppsummering("s", { note: "Delt", shareWithCoach: true })).ok, true);
  assert.equal((snapshot as { dineOrd: { tekst: string } }).dineOrd.tekst, "Delt");
  status = "IN_PROGRESS"; assert.equal((await actions.lagreLiveOppsummering("s", { note: "Uferdig", shareWithCoach: true })).ok, false);
});
test("video krever samtykke, riktig øvelse og eiersti før lagringen leses", async () => {
  const input = { drillId: "d1", storagePath: "player/synthetic.mp4" };
  awaitingConsent = true; assert.equal((await actions.lagreLiveOvelseVideo("s", input)).ok, false);
  awaitingConsent = false;
  for (const storagePath of ["stranger/synthetic.mp4", "player/../other.mp4", "player/%2e%2e/other.mp4"]) assert.equal((await actions.lagreLiveOvelseVideo("s", { ...input, storagePath })).ok, false);
  assert.equal((await actions.lagreLiveOvelseVideo("s", { ...input, drillId: "other-session" })).ok, false);
  assert.equal(storageReads, 0); assert.equal(videoWrites, 0);
});
test("en ikke-opplastet fil bekreftes ikke; faktisk fil får serverens URL og tåler retry", async () => {
  const input = { drillId: "d1", storagePath: "player/synthetic.mp4", videoUrl: "https://untrusted.example.test/anything.mp4" };
  missingVideo = true; assert.equal((await actions.lagreLiveOvelseVideo("s", input)).ok, false); assert.equal(videoWrites, 0);
  missingVideo = false; assert.equal((await actions.lagreLiveOvelseVideo("s", input)).ok, true);
  assert.equal(savedVideo?.videoUrl, "https://storage.example.test/player/synthetic.mp4?server-signature");
  assert.equal(savedVideo?.liveSessionKind, "plan-session");
  assert.equal((await actions.lagreLiveOvelseVideo("s", input)).ok, true); assert.equal(videoWrites, 1);
});
