import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let viewer = { id: "player", role: "PLAYER" };
let coachAccess = false;
let kind: "workbench" | "plan" | "v2" | "missing" = "workbench";
let hidden = false;
let status = "IN_PROGRESS";
let snapshot: unknown = null;
let reps = 0;
let participant = "DECLINED";
let detailReads = 0;
let ballCounts: Array<{ club: string; count: number }> | null = null;
const drill = { id: "d1", title: "Syntetisk øvelse", name: "Syntetisk øvelse", description: null, durationMinutes: 10, repAntall: 30, repSett: null, repReps: null,
  akFormel: { pyramid: "SLAG", area: "CHIP", label: "x" }, repType: "BALLER_SLATT", repetitions: null, pyramide: "SLAG", actualDurationSec: null,
  reps: null, sets: null, repsSets: "30", notes: null, pyramidArea: null, exercise: { name: "Syntetisk øvelse", durationMin: 10 } };
function wb() { return { id: "s", playerId: "player", title: "Syntetisk økt", status, pyramid: "SLAG", durationMinutes: 30, date: new Date("2026-10-12"), startMinute: 540,
  location: null, notes: null, maalsetning: null, rationale: null, liveSnapshot: snapshot, updatedAt: new Date(0), drills: [drill], drillLogs: [{ drillId: "d1", reps, kommentar: null }],
  hiddenByPlayer: hidden, isTemplate: false, needsPlayerApproval: false, sourceGroupSessionId: null, localOverride: false, groupId: null, actualMinutes: null }; }
function plan() { return { id: "s", title: "Syntetisk planøkt", status, plan: { userId: "player", name: "Plan" }, scheduledAt: new Date("2026-10-12T09:00Z"),
  durationMin: 30, pyramidArea: "SLAG", location: null, maalsetning: null, rationale: null, drills: [drill], liveSnapshot: snapshot, log: null }; }
function v2() { return { id: "s", title: "Syntetisk V2-økt", status, studentId: "player", coachId: "coach", hostId: null,
  participants: [{ userId: "invited", status: participant }], drills: [drill], startTime: new Date("2026-10-12T09:00Z"), endTime: new Date("2026-10-12T09:30Z"),
  location: null, maalsetning: null, notes: null, completedSummary: snapshot }; }
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("@/lib/auth/own-or-coached", { namedExports: { canAccessPlayer: async (user: { id: string; role: string }, playerId: string) => user.id === playerId || coachAccess && user.role === "COACH" } });
mock.module("@/lib/workbench/group-scope", { namedExports: { canReadOwnGroupCopy: () => true } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  workbenchSession: { findUnique: async () => kind === "workbench" ? wb() : null },
  trainingPlanSession: { findUnique: async () => kind === "plan" ? plan() : null },
  trainingSessionV2: { findUnique: async () => kind === "v2" ? v2() : null },
  playerSwingVideo: { groupBy: async () => { detailReads++; return []; } },
  drillLogV2: { findMany: async () => { detailReads++; return [{ drillId: "d1", repsTotal: reps, repsHit: 0, notes: null }]; } },
  sessionBallLog: { findMany: async () => { detailReads++; return ballCounts ?? [{ club: "7I", count: 0 }, { club: "PW", count: reps }]; } },
  user: { findUnique: async () => ({ name: "Syntetisk Spiller" }) },
} } });
let loaders: typeof import("./load-ph04-07");
before(async () => { loaders = await import("./load-ph04-07"); });
beforeEach(() => { viewer = { id: "player", role: "PLAYER" }; coachAccess = false; kind = "workbench"; hidden = false; status = "IN_PROGRESS"; snapshot = null; reps = 0; participant = "DECLINED"; detailReads = 0; ballCounts = null;
  drill.pyramide = "SLAG"; drill.akFormel.pyramid = "SLAG"; drill.akFormel.area = "CHIP"; });

test("andre spiller-ID-er og gamle isCoach-parametre gir aldri innsyn", async () => {
  viewer = { id: "stranger", role: "PLAYER" };
  for (const model of ["workbench", "plan", "v2"] as const) {
    kind = model;
    await assert.rejects(loaders.loadPH04BriefData("s", "player", "FULL", true), /forbidden/);
    await assert.rejects(loaders.loadPH05ActiveData("s", "player"), /forbidden/);
    await assert.rejects(loaders.loadPH06TapperData("s", "player"), /forbidden/);
    await assert.rejects(loaders.loadPH07SummaryData("s", "player"), /forbidden/);
  }
  assert.equal(detailReads, 0);
});
test("en annen persons invitasjon er ikke tilgang; manglende og skjulte økter har ingen demo", async () => {
  kind = "v2"; participant = "ACCEPTED"; viewer.id = "stranger";
  await assert.rejects(loaders.loadPH05ActiveData("s"), /forbidden/);
  viewer.id = "invited"; assert.equal((await loaders.loadPH05ActiveData("s")).lagring, "v2");
  kind = "missing"; await assert.rejects(loaders.loadPH05ActiveData("s"), /not-found/);
  kind = "workbench"; viewer.id = "player"; hidden = true;
  await assert.rejects(loaders.loadPH05ActiveData("s"), /not-found/);
});
test("alle tre modeller viser ekte telling og fremdrift etter ny lasting", async () => {
  reps = 12; snapshot = { precisionLive: [{ drillId: "d1", reps: 12, elapsedSec: 75, status: "done" }] };
  for (const model of ["workbench", "plan", "v2"] as const) {
    kind = model;
    const data = await loaders.loadPH05ActiveData("s");
    assert.equal(data.lagring, model); assert.equal(data.eierUserId, "player");
    assert.equal(data.drills[0].repsCompleted, 12); assert.equal(data.drills[0].status, "done"); assert.equal(data.drills[0].elapsedSec, 75);
    assert.equal(data.drills.length, 1);
  }
});
test("null registrering er null, ukjent tid og dagsform forblir ukjent", async () => {
  status = "COMPLETED";
  const data = await loaders.loadPH07SummaryData("s");
  assert.equal(data.totalShots, 0); assert.equal(data.actualMinutes, null); assert.equal(data.completedDrillsCount, 0);
  assert.equal(data.dagsform, ""); assert(data.axes.every((a) => a.actualMin === null));
  assert.equal(data.drillRows[0].hitsText, "Ikke registrert");
  const tapper = await loaders.loadPH06TapperData("s");
  assert.deepEqual(tapper.countsByClub, { "7I": 0, PW: 0 }); assert.equal(tapper.trackmanShot, null);
});
test("privat refleksjon er synlig for spilleren og skjult for tilknyttet coach", async () => {
  kind = "v2"; snapshot = { playerReflection: { note: "Syntetisk privat tekst", shareWithCoach: false } };
  assert.equal((await loaders.loadPH07SummaryData("s")).note, "Syntetisk privat tekst");
  viewer = { id: "coach", role: "COACH" };
  assert.equal((await loaders.loadPH07SummaryData("s")).note, "");
  snapshot = { playerReflection: { note: "Syntetisk delt tekst", shareWithCoach: true } };
  assert.equal((await loaders.loadPH07SummaryData("s")).note, "Syntetisk delt tekst");
});
test("fysisk kondisjonsmåling gjenåpnes i minutter og sone, uten golfslag/treff", async () => {
  kind = "workbench"; status = "COMPLETED"; reps = 20; ballCounts = [];
  drill.akFormel.pyramid = "FYS"; drill.akFormel.area = "KONDISJON";
  snapshot = { precisionLive: [{ drillId: "d1", reps: 20, status: "done", kommentar: "Kondisjon: 20 min i sone 4" }] };
  const data = await loaders.loadPH07SummaryData("s");
  assert.equal(data.totalShots, 0); assert.equal(data.drillRows[0].quantityText, "20 min · S4"); assert.equal(data.drillRows[0].hitsText, "Ikke aktuelt");
});
test("tapperens ekte kølletelling gjenåpnes for alle modeller uten dobbelttelling av drilllogger", async () => {
  ballCounts = [{ club: "Dr", count: 3 }, { club: "PW", count: 12 }];
  for (const model of ["workbench", "plan", "v2"] as const) {
    kind = model; status = "COMPLETED"; reps = 0;
    assert.equal((await loaders.loadPH07SummaryData("s")).totalShots, 15);
    reps = 15; snapshot = { precisionLive: [{ drillId: "d1", reps: 15, status: "done" }] };
    assert.equal((await loaders.loadPH07SummaryData("s")).totalShots, 15);
    const reopened = await loaders.loadPH06TapperData("s");
    assert.deepEqual(reopened.countsByClub, { Dr: 3, PW: 12 }); assert.equal(reopened.currentShots, 15);
  }
});
