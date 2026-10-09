/**
 * Live-økt lagrer det som skjer (krav 2, 09.10.2026) — mot en ekte, lokal
 * Postgres. Bare syntetiske demodata (Tobias Lindvik). Nekter å kjøre mot
 * noe annet enn en database på 127.0.0.1.
 *
 * Kjør (database satt opp med hovedversjonens tabeller + skriptet
 * scripts/add-workbench-drill-log-2026-10-09.ts):
 *   LIVE_OKT_TEST_DB=postgresql://postgres@127.0.0.1:<port>/<db> \
 *   DATABASE_URL=$LIVE_OKT_TEST_DB \
 *   npx tsx --conditions=react-server --experimental-test-module-mocks --test tests/live-okt-local/*.test.ts
 */
import assert from "node:assert/strict";
import { after, before, beforeEach, mock, test } from "node:test";

type Viewer = { id: string; role: string; tier: string; requiresGuardianConsent: boolean; guardianConsentGivenAt: Date | null };
const P = "liveokt-test-20261009";
const SPILLER = `${P}-tobias`;
const COACH = `${P}-coach`;
const FREMMED = `${P}-fremmed`;
let viewer: Viewer = { id: SPILLER, role: "PLAYER", tier: "FULL", requiresGuardianConsent: false, guardianConsentGivenAt: null };
let coachTilgang = false;

mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => coachTilgang } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });

let db: typeof import("../../src/lib/prisma").prisma;
let live: typeof import("../../src/lib/portal-live/wb-live-actions");

const PUTT_FORMEL = {
  pyramid: "SLAG", area: "PUTT_10_25", motorikk: "LAV_HAST", belastning: "TRENINGSOMRADE", label: "Putt 10–25 fot",
  detaljer: { sted: { hoved: "UTENDORS_TRENINGSOMRAADE", delvalg: "Puttinggreen" } },
};

async function nyOkt(navn: string, status = "IN_PROGRESS", positionTaskId: string | null = null) {
  const id = `${P}-${navn}`;
  await db.workbenchSession.deleteMany({ where: { id } });
  await db.playerSwingVideo.deleteMany({ where: { liveSessionId: id } });
  await db.workbenchSession.create({
    data: {
      id, playerId: SPILLER, coachId: COACH, createdBy: COACH, date: new Date("2026-10-09T00:00:00Z"), startMinute: 600,
      durationMinutes: 60, title: "Putting · syntetisk", pyramid: "SLAG", status,
      drills: {
        create: [
          { id: `${id}-d1`, title: "Putt 10–25 fot", durationMinutes: 20, sortOrder: 0, akFormel: PUTT_FORMEL, repAntall: 30, positionTaskId },
          { id: `${id}-d2`, title: "Uten formel", durationMinutes: 10, sortOrder: 1, akFormel: { ugyldig: true } },
        ],
      },
    },
  });
  return id;
}

async function rydd() {
  await db.workbenchSession.deleteMany({ where: { id: { startsWith: P } } });
  await db.playerSwingVideo.deleteMany({ where: { userId: SPILLER } });
  await db.technicalPlan.deleteMany({ where: { userId: SPILLER } });
  await db.user.deleteMany({ where: { id: { in: [SPILLER, COACH, FREMMED] } } });
}

before(async () => {
  const url = new URL(process.env.DATABASE_URL ?? "");
  assert.equal(process.env.DATABASE_URL, process.env.LIVE_OKT_TEST_DB, "DATABASE_URL må være testdatabasen");
  assert.equal(url.hostname, "127.0.0.1", "Testene kjører bare mot en lokal database");
  db = (await import("../../src/lib/prisma")).prisma;
  live = await import("../../src/lib/portal-live/wb-live-actions");
  await rydd();
  for (const [id, navn] of [[SPILLER, "Tobias Lindvik"], [COACH, "Syntetisk coach"], [FREMMED, "Syntetisk fremmed"]]) {
    await db.user.create({ data: { id, authId: `auth-${id}`, email: `${id}@akgolf.test`, name: navn } });
  }
});
beforeEach(() => {
  viewer = { id: SPILLER, role: "PLAYER", tier: "FULL", requiresGuardianConsent: false, guardianConsentGivenAt: null };
  coachTilgang = false;
});
after(async () => {
  await rydd();
  await db.$disconnect();
});

test("reps lagres per øvelse med område, sted og avstand fra øvelsen", async () => {
  const id = await nyOkt("reps");
  assert.deepEqual(await live.lagreWbOvelse(id, { drillId: `${id}-d1`, reps: 12 }), { ok: true });
  const rad = await db.workbenchDrillLog.findUniqueOrThrow({ where: { sessionId_drillId: { sessionId: id, drillId: `${id}-d1` } } });
  assert.equal(rad.reps, 12);
  assert.equal(rad.playerId, SPILLER);
  assert.equal(rad.loggedById, SPILLER);
  assert.equal(rad.drillTittel, "Putt 10–25 fot");
  assert.equal(rad.motorikk, "LAV_HAST");
  assert.equal(rad.omraade, "PUTT_10_25");
  assert.equal(rad.sted, "Utendørs treningsområde · Puttinggreen");
  assert.equal(rad.avstand, "10–25 fot");
});

test("øvelse uten gyldig formel lagrer reps uten å gjette område, sted eller avstand", async () => {
  const id = await nyOkt("uten-formel");
  assert.equal((await live.lagreWbOvelse(id, { drillId: `${id}-d2`, reps: 4 })).ok, true);
  const rad = await db.workbenchDrillLog.findUniqueOrThrow({ where: { sessionId_drillId: { sessionId: id, drillId: `${id}-d2` } } });
  assert.equal(rad.reps, 4);
  assert.equal(rad.omraade, null);
  assert.equal(rad.sted, null);
  assert.equal(rad.avstand, null);
  assert.equal(rad.motorikk, null);
});

test("ny lagring skriver hele tallet: én rad, siste verdi", async () => {
  const id = await nyOkt("idempotent");
  for (const reps of [12, 12, 15]) await live.lagreWbOvelse(id, { drillId: `${id}-d1`, reps });
  const rader = await db.workbenchDrillLog.findMany({ where: { sessionId: id } });
  assert.equal(rader.length, 1);
  assert.equal(rader[0].reps, 15);
});

test("kommentar lagres, røres ikke av ren rep-lagring, og kan fjernes", async () => {
  const id = await nyOkt("kommentar");
  const where = { sessionId_drillId: { sessionId: id, drillId: `${id}-d1` } };
  await live.lagreWbOvelse(id, { drillId: `${id}-d1`, reps: 8, kommentar: "Mistet balansen på slutten" });
  assert.equal((await db.workbenchDrillLog.findUniqueOrThrow({ where })).kommentar, "Mistet balansen på slutten");
  await live.lagreWbOvelse(id, { drillId: `${id}-d1`, reps: 9 });
  const etterReps = await db.workbenchDrillLog.findUniqueOrThrow({ where });
  assert.equal(etterReps.kommentar, "Mistet balansen på slutten");
  assert.equal(etterReps.reps, 9);
  await live.lagreWbOvelse(id, { drillId: `${id}-d1`, reps: 9, kommentar: "  " });
  assert.equal((await db.workbenchDrillLog.findUniqueOrThrow({ where })).kommentar, null);
});

test("video kobles til riktig økt og øvelse, flere per øvelse", async () => {
  const id = await nyOkt("video");
  const video = (n: number) => ({ drillId: `${id}-d1`, videoUrl: `https://lagring.test/v${n}.mp4`, storagePath: `${SPILLER}/v${n}.mp4` });
  assert.deepEqual(await live.lagreWbOvelseVideo(id, video(1)), { ok: true });
  assert.deepEqual(await live.lagreWbOvelseVideo(id, video(2)), { ok: true });
  const rader = await db.playerSwingVideo.findMany({ where: { liveSessionId: id }, include: { analysis: true }, orderBy: { createdAt: "asc" } });
  assert.equal(rader.length, 2);
  for (const r of rader) {
    assert.equal(r.userId, SPILLER);
    assert.equal(r.liveSessionKind, "workbench");
    assert.equal(r.drillId, `${id}-d1`);
    assert.equal(r.consentVerified, true);
    assert.equal(r.analysis?.status, "PENDING");
  }
  assert.equal(rader[1].storagePath, `${SPILLER}/v2.mp4`);
});

test("video avvises for fremmed fil, fremmed øvelse og manglende foreldresamtykke", async () => {
  const id = await nyOkt("video-avvist");
  const gyldig = { drillId: `${id}-d1`, videoUrl: "https://lagring.test/v.mp4", storagePath: `${SPILLER}/v.mp4` };
  assert.equal((await live.lagreWbOvelseVideo(id, { ...gyldig, storagePath: `${FREMMED}/v.mp4` })).ok, false);
  assert.equal((await live.lagreWbOvelseVideo(id, { ...gyldig, storagePath: `${SPILLER}/../${FREMMED}/v.mp4` })).ok, false);
  assert.equal((await live.lagreWbOvelseVideo(id, { ...gyldig, drillId: "fremmed-drill" })).ok, false);
  viewer = { ...viewer, requiresGuardianConsent: true, guardianConsentGivenAt: null };
  assert.equal((await live.lagreWbOvelseVideo(id, gyldig)).ok, false);
  viewer = { ...viewer, id: FREMMED, requiresGuardianConsent: false };
  assert.equal((await live.lagreWbOvelseVideo(id, { ...gyldig, storagePath: `${FREMMED}/v.mp4` })).ok, false);
  assert.equal(await db.playerSwingVideo.count({ where: { liveSessionId: id } }), 0);
});

test("fremmed spiller og coach uten tilgang får verken lagret reps eller fullført", async () => {
  const id = await nyOkt("tilgang");
  for (const v of [{ id: FREMMED, role: "PLAYER" }, { id: COACH, role: "COACH" }]) {
    viewer = { ...viewer, ...v };
    assert.equal((await live.lagreWbOvelse(id, { drillId: `${id}-d1`, reps: 5 })).ok, false);
    assert.equal((await live.fullforWbLiveOkt(id, [{ drillId: `${id}-d1`, reps: 5 }])).ok, false);
  }
  assert.equal(await db.workbenchDrillLog.count({ where: { sessionId: id } }), 0);
  assert.equal((await db.workbenchSession.findUniqueOrThrow({ where: { id } })).status, "IN_PROGRESS");
  viewer = { ...viewer, id: COACH, role: "COACH" };
  coachTilgang = true;
  assert.equal((await live.lagreWbOvelse(id, { drillId: `${id}-d1`, reps: 5 })).ok, true);
  assert.equal((await db.workbenchDrillLog.findFirstOrThrow({ where: { sessionId: id } })).loggedById, COACH);
});

test("økt som ikke er i gang tar ikke imot reps", async () => {
  const id = await nyOkt("ikke-i-gang", "PUBLISHED");
  assert.equal((await live.lagreWbOvelse(id, { drillId: `${id}-d1`, reps: 5 })).ok, false);
  assert.equal(await db.workbenchDrillLog.count({ where: { sessionId: id } }), 0);
});

test("fullført økt: sluttelling lagret, status fullført, reps i teknisk plan én gang", async () => {
  const plan = await db.technicalPlan.create({
    data: { userId: SPILLER, navn: "Syntetisk teknisk plan", startDato: new Date("2026-09-01T00:00:00Z"), opprettetAvId: COACH,
      positions: { create: { pNummer: "P6.0", navn: "Kølle parallell i nedsving", sortOrder: 0,
        tasks: { create: { sortOrder: 0, tittel: "Syntetisk oppgave", pyramide: "SLAG", omraade: "Putt 3-5m" } } } } },
    include: { positions: { include: { tasks: true } } },
  });
  const taskId = plan.positions[0].tasks[0].id;
  const id = await nyOkt("fullfor", "IN_PROGRESS", taskId);
  const logger = [{ drillId: `${id}-d1`, reps: 20, kommentar: "Bedre tempo" }, { drillId: `${id}-d2`, reps: 3 }];

  const res = await live.fullforWbLiveOkt(id, logger);
  assert.deepEqual(res, { ok: true, href: `/portal/live/${id}/summary` });
  assert.equal((await db.workbenchSession.findUniqueOrThrow({ where: { id } })).status, "COMPLETED");
  const rader = await db.workbenchDrillLog.findMany({ where: { sessionId: id }, orderBy: { drillId: "asc" } });
  assert.deepEqual(rader.map((r) => [r.reps, r.kommentar]), [[20, "Bedre tempo"], [3, null]]);

  const sjekkTask = async () => {
    const task = await db.positionTask.findUniqueOrThrow({ where: { id: taskId } });
    const tLogger = await db.positionTaskLog.findMany({ where: { taskId } });
    assert.equal(task.repsGjortLav, 20);
    assert.equal(task.repsGjortDry, 0);
    assert.equal(task.repsGjortFull, 0);
    assert.equal(tLogger.length, 1);
    assert.equal(tLogger[0].workbenchSessionId, id);
    assert.equal(tLogger[0].hastighet, "LAV");
    assert.equal(tLogger[0].belastning, "TRENINGSOMRAADE");
  };
  await sjekkTask();

  // Nytt forsøk etter fullføring: verken sluttelling eller teknisk plan endres.
  const igjen = await live.fullforWbLiveOkt(id, [{ drillId: `${id}-d1`, reps: 99 }]);
  assert.equal(igjen.ok, true);
  assert.equal((await db.workbenchDrillLog.findFirstOrThrow({ where: { sessionId: id, drillId: `${id}-d1` } })).reps, 20);
  await sjekkTask();
});

test("oppgave som tilhører en annen spiller får ingen reps", async () => {
  const plan = await db.technicalPlan.create({
    data: { userId: FREMMED, navn: "Fremmed plan", startDato: new Date("2026-09-01T00:00:00Z"), opprettetAvId: COACH,
      positions: { create: { pNummer: "P7.0", navn: "Treffpunktet", sortOrder: 0,
        tasks: { create: { sortOrder: 0, tittel: "Fremmed oppgave", pyramide: "SLAG", omraade: "Putt 3-5m" } } } } },
    include: { positions: { include: { tasks: true } } },
  });
  const taskId = plan.positions[0].tasks[0].id;
  const id = await nyOkt("fremmed-oppgave", "IN_PROGRESS", taskId);
  assert.equal((await live.fullforWbLiveOkt(id, [{ drillId: `${id}-d1`, reps: 10 }])).ok, true);
  assert.equal((await db.positionTask.findUniqueOrThrow({ where: { id: taskId } })).repsGjortLav, 0);
  assert.equal(await db.positionTaskLog.count({ where: { taskId } }), 0);
  await db.technicalPlan.delete({ where: { id: plan.id } });
});
