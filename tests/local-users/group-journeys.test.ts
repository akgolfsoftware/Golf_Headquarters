/** Faktiske serverhandlinger og SQL. Kun innlogget forespørselsidentitet og Next-cache er testgrenser. */
import assert from "node:assert/strict";
import { before, after, mock, test } from "node:test";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import pg from "pg";
import type { UserRole } from "../../src/generated/prisma/client";

const suffix = randomUUID();
const prefix = `local-group-${suffix}`;
const groupId = `${prefix}-group`;
const otherGroupId = `${prefix}-other-group`;
const day = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
const identity = new AsyncLocalStorage<{ id: string; role: UserRole }>();
const invalidated = new Set<string>();
const roles = { coach: "COACH", other: "COACH", memberCoach: "COACH", assistant: "COACH", admin: "ADMIN",
  p1: "PLAYER", p2: "PLAYER", ended: "PLAYER", deleted: "PLAYER", late: "PLAYER", outsider: "PLAYER" } as const;
type Actor = keyof typeof roles;
const id = (key: Actor) => `${prefix}-${key}`;
function as<T>(key: Actor, fn: () => Promise<T>): Promise<T> { return identity.run({ id: id(key), role: roles[key] }, fn); }
function data<T>(value: { ok: true; data: T } | { ok: false; error: string }): T {
  if (!value.ok) assert.fail(value.error);
  return value.data;
}

mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async (opts?: { allow?: string[] }) => {
  const viewer = identity.getStore();
  if (!viewer || (opts?.allow && !opts.allow.includes(viewer.role))) throw Error("request rejected");
  return viewer;
} } });
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => identity.getStore() ?? null } });
mock.module("@/lib/auth/action-guards", { namedExports: { requireCoachActionUser: async () => {
  const viewer = identity.getStore();
  if (!viewer || !["COACH", "ADMIN"].includes(viewer.role)) throw Error("request rejected");
  return viewer;
} } });
mock.module("next/cache", { namedExports: { revalidatePath: (path: string) => invalidated.add(path) } });

let db: typeof import("../../src/lib/prisma").prisma;
let group: typeof import("../../src/lib/workbench/group-session-actions");
let wb: typeof import("../../src/lib/workbench/wb-actions");
type Content = { groupId: string; requestId: string; date: string; startMinute: number; durationMinutes: number;
  title: string; pyramid: "SLAG"; drills: { title: string; durationMinutes: number; akFormel: { pyramid: "SLAG"; area: "TEE"; label: string } }[] };
async function create(title = "Syntetisk gruppeøkt") {
  const input: Content = { groupId, requestId: randomUUID(), date: day, startMinute: 1,
    durationMinutes: 30, title, pyramid: "SLAG", drills: [{ title: "Syntetisk presisjonsøvelse", durationMinutes: 15,
      akFormel: { pyramid: "SLAG", area: "TEE", label: "Syntetisk" } }] };
  const source = data(await as("coach", () => group.saveGroupWorkbenchSession(input)));
  return { source, input };
}
async function publish(sourceId: string) { return data(await as("coach", () => group.publishGroupWorkbenchSessions({ groupId, sessionIds: [sourceId] }))); }
async function copies(sourceId: string) { return db.workbenchSession.findMany({ where: { sourceGroupSessionId: sourceId }, include: { drills: true }, orderBy: { playerId: "asc" } }); }
async function copy(sourceId: string, actor: Actor) { return db.workbenchSession.findFirstOrThrow({ where: { sourceGroupSessionId: sourceId, playerId: id(actor) }, include: { drills: true } }); }

before(async () => {
  const target = new URL(process.env.DATABASE_URL!);
  assert.equal(target.hostname, "127.0.0.1"); assert.equal(target.port, "55722");
  assert.equal(target.pathname, "/postgres");
  const client = new pg.Client({ connectionString: target.toString() }); await client.connect();
  const { rows } = await client.query("SELECT shobj_description(oid, 'pg_database') AS identity FROM pg_database WHERE datname=current_database()");
  assert.equal(rows[0].identity, "ak-hq-gruppe-20261001"); await client.end();
  db = (await import("../../src/lib/prisma")).prisma;
  for (const key of Object.keys(roles) as Actor[]) await db.user.create({ data: {
    id: id(key), authId: randomUUID(), email: `${key}-${suffix}@synthetic.test`, name: `Syntetisk ${key}`, role: roles[key],
    ...(key === "deleted" ? { deletedAt: new Date() } : {}),
  } });
  await db.group.create({ data: { id: groupId, name: "Syntetisk gruppe", coachId: id("coach"), managedByAkGolf: true } });
  await db.group.create({ data: { id: otherGroupId, name: "Syntetisk annen gruppe", coachId: id("other") } });
  for (const key of ["p1", "p2", "ended", "deleted", "late", "memberCoach", "assistant"] as Actor[]) {
    await db.groupMember.create({ data: { groupId, userId: id(key),
      role: key === "memberCoach" ? "COACH" : key === "assistant" ? "ASSISTANT" : "PLAYER",
      joinedAt: key === "late" ? new Date("2099-01-01") : new Date("2000-01-01"),
      endedAt: key === "ended" ? new Date() : null } });
  }
  group = await import("../../src/lib/workbench/group-session-actions");
  wb = await import("../../src/lib/workbench/wb-actions");
});

after(async () => {
  if (!db) return;
  const sessions = await db.workbenchSession.findMany({ where: { groupId: { in: [groupId, otherGroupId] } }, select: { id: true } });
  await db.sessionBallLog.deleteMany({ where: { planSessionId: { in: sessions.map(s => s.id) } } });
  await db.workbenchSession.deleteMany({ where: { groupId: { in: [groupId, otherGroupId] } } });
  await db.auditLog.deleteMany({ where: { actorId: { startsWith: prefix } } });
  await db.group.deleteMany({ where: { id: { in: [groupId, otherGroupId] } } });
  await db.user.deleteMany({ where: { id: { startsWith: prefix } } });
  await db.$disconnect();
});

test("gruppeoriginal lagres én gang ved nytt forsøk og er ikke en spillerøkt", async () => {
  const { source, input } = await create();
  const retry = data(await as("coach", () => group.saveGroupWorkbenchSession(input)));
  assert.equal(retry.id, source.id); assert.equal(retry.drills[0].id, source.drills[0].id);
  assert.equal(source.playerId, id("coach")); assert.equal(source.status, "DRAFT");
  assert.equal((await copies(source.id)).length, 0);
  assert.equal(data(await as("p1", () => wb.loadPlayerSession(source.id))), null);
});

test("fremmed coach, hjelpetrener og spiller får ikke lese eller publisere gruppegrunnlaget", async () => {
  const { source, input } = await create();
  for (const actor of ["other", "assistant"] as Actor[]) {
    assert.equal((await as(actor, () => group.loadGroupWorkbenchSessions(groupId))).ok, false);
    assert.equal((await as(actor, () => group.saveGroupWorkbenchSession(input))).ok, false);
    assert.equal((await as(actor, () => group.publishGroupWorkbenchSessions({ groupId, sessionIds: [source.id] }))).ok, false);
  }
  await assert.rejects(as("p1", () => group.publishGroupWorkbenchSessions({ groupId, sessionIds: [source.id] })), /request rejected/);
  assert.equal((await copies(source.id)).length, 0);
  assert.equal((await db.workbenchSession.findUniqueOrThrow({ where: { id: source.id } })).status, "DRAFT");
});

test("aktiv gruppetrener og admin har redigering; trukket rettighet avviser før skriving", async () => {
  const { source, input } = await create();
  assert.equal((await as("memberCoach", () => group.saveGroupWorkbenchSession({ ...input, title: "Endret av gruppetrener" }))).ok, true);
  assert.equal((await as("admin", () => group.loadGroupWorkbenchSessions(groupId))).ok, true);
  await db.userCapability.create({ data: { userId: id("memberCoach"), capability: "edit_group_plans", mode: "REVOKE" } });
  await assert.rejects(as("memberCoach", () => group.publishGroupWorkbenchSessions({ groupId, sessionIds: [source.id] })), /forbidden/);
  await db.userCapability.deleteMany({ where: { userId: id("memberCoach") } });
});

test("publisering når bare aktive, ikke-slettede spillere innmeldt før øktstart", async () => {
  const { source } = await create(); await publish(source.id);
  const rows = await copies(source.id);
  assert.deepEqual(rows.map(r => r.playerId).sort(), [id("p1"), id("p2")].sort());
  assert.ok(rows.every(r => r.status === "PUBLISHED" && r.groupId === groupId && r.publishedBy === id("coach")));
  for (const row of rows) {
    const loaded = data(await as(row.playerId === id("p1") ? "p1" : "p2", () => wb.loadPlayerSession(row.id)));
    assert.equal(loaded?.id, row.id); assert.equal(loaded?.sourceGroupSessionId, source.id);
  }
  assert.ok(invalidated.has("/portal"));
});

test("nytt og samtidig publiseringsforsøk gir én kopi og samme øvelse-ID per spiller", async () => {
  const { source } = await create(); await publish(source.id);
  const before = await copies(source.id);
  const results = await Promise.all([1, 2].map(() => as("coach", () => group.publishGroupWorkbenchSessions({ groupId, sessionIds: [source.id, source.id] }))));
  assert.ok(results.some(r => r.ok)); await publish(source.id);
  const after = await copies(source.id);
  assert.deepEqual(after.map(r => r.id), before.map(r => r.id));
  assert.deepEqual(after.map(r => r.drills.map(d => d.id)), before.map(r => r.drills.map(d => d.id)));
});

test("blandet gruppeutvalg avvises atomisk uten å publisere den gyldige originalen", async () => {
  const own = await create();
  const other = data(await as("other", () => group.saveGroupWorkbenchSession({ ...own.input, groupId: otherGroupId, requestId: randomUUID() })));
  assert.equal((await as("coach", () => group.publishGroupWorkbenchSessions({ groupId, sessionIds: [own.source.id, other.id] }))).ok, false);
  assert.equal((await copies(own.source.id)).length, 0);
  assert.equal((await db.workbenchSession.findUniqueOrThrow({ where: { id: own.source.id } })).status, "DRAFT");
});

test("feil i lagret øvelsesinnhold ruller hele publiseringen tilbake", async () => {
  const { source } = await create();
  await db.workbenchDrill.update({ where: { id: source.drills[0].id }, data: { akFormel: { ugyldig: true } } });
  assert.equal((await as("coach", () => group.publishGroupWorkbenchSessions({ groupId, sessionIds: [source.id] }))).ok, false);
  assert.equal((await copies(source.id)).length, 0);
  assert.equal((await db.workbenchSession.findUniqueOrThrow({ where: { id: source.id } })).status, "DRAFT");
});

test("publiseringsstatus skiller lagret endring fra levert innhold, og originalen gjennomføres ikke", async () => {
  const { source, input } = await create(); await publish(source.id);
  const before = await copy(source.id, "p1");
  const retry = data(await as("coach", () => group.saveGroupWorkbenchSession(input)));
  assert.equal(retry.status, "PUBLISHED");
  assert.equal((await as("coach", () => wb.startSession(source.id))).ok, false);
  assert.equal((await as("coach", () => wb.completeSessionWithEffort({ sessionId: source.id, perceivedEffort: 5 }))).ok, false);
  const edited = data(await as("coach", () => group.saveGroupWorkbenchSession({ ...input, title: "Lagret endring" })));
  assert.equal(edited.status, "DRAFT");
  assert.deepEqual(await copy(source.id, "p1"), before);
  await publish(source.id);
  assert.equal((await copy(source.id, "p1")).title, "Lagret endring");
});

test("nytt planinnhold når lenket kopi; oppmøte skjult av spiller beholdes", async () => {
  const { source, input } = await create(); await publish(source.id);
  const player = await copy(source.id, "p1");
  await db.workbenchSession.update({ where: { id: player.id }, data: { hiddenByPlayer: true } });
  data(await as("coach", () => group.saveGroupWorkbenchSession({ ...input, title: "Ny gruppetittel", durationMinutes: 45 })));
  await publish(source.id);
  const updated = await copy(source.id, "p1");
  assert.equal(updated.title, "Ny gruppetittel"); assert.equal(updated.durationMinutes, 45);
  assert.equal(updated.hiddenByPlayer, true); assert.equal(updated.localOverride, false);
  assert.equal(updated.id, player.id); assert.equal(updated.drills[0].id, player.drills[0].id);
});

test("egen flytting løsriver permanent uten ny økt eller V2-duplikat", async () => {
  const { source, input } = await create(); await publish(source.id);
  const player = await copy(source.id, "p1");
  const { moveWbSession } = await import("../../src/lib/workbench/wb-session-write");
  assert.equal((await moveWbSession(db, { sessionId: player.id, playerId: id("p1"), dayIndex: 6 })).ok, true);
  const local = await copy(source.id, "p1"); assert.equal(local.localOverride, true);
  assert.equal(local.drills.find(d => d.id === player.drills[0].id)?.title, player.drills[0].title);
  data(await as("coach", () => group.saveGroupWorkbenchSession({ ...input, title: "Annen original" })));
  await publish(source.id);
  assert.equal((await copy(source.id, "p1")).title, player.title);
  assert.equal((await copy(source.id, "p1")).date.getTime(), local.date.getTime());
  assert.equal(await db.trainingSessionV2.count({ where: { generertFraId: player.id } }), 0);
  const beforeWithdrawal = await copy(source.id, "p1");
  data(await as("coach", () => group.withdrawGroupWorkbenchSessions({ groupId, sessionIds: [source.id] })));
  assert.deepEqual(await copy(source.id, "p1"), beforeWithdrawal);
});

test("endring av øvelser løsriver, og neste publisering bevarer spillerens egen liste", async () => {
  const { source } = await create(); await publish(source.id);
  const player = await copy(source.id, "p1");
  data(await as("p1", () => wb.addDrill({ sessionId: player.id, drill: { title: "Egen syntetisk øvelse", durationMinutes: 5,
    akFormel: { pyramid: "SLAG", area: "TEE", label: "Egen" } } })));
  const local = await copy(source.id, "p1"); assert.equal(local.localOverride, true);
  await publish(source.id);
  assert.deepEqual((await copy(source.id, "p1")).drills, local.drills);
});

test("gjennomføring beholder lenken, resultat og telling når statistikken med samme ID", async () => {
  const { source } = await create(); await publish(source.id);
  const player = await copy(source.id, "p1");
  data(await as("p1", () => wb.startSession(player.id)));
  const tapper = await import("../../src/app/portal/(fullscreen)/live/[sessionId]/tapper/actions");
  assert.equal((await as("p1", () => tapper.finishTapperSession(player.id, [
    { club: "synthetic-7i", count: 17, area: "FULL_SVING", repetitionType: "FULL_SPEED" },
  ]))).ok, true);
  const stored = await copy(source.id, "p1"); assert.equal(stored.status, "COMPLETED"); assert.equal(stored.localOverride, false);
  const { getTrainingStats } = await import("../../src/app/portal/analysere/actions");
  const stats = await as("p1", () => getTrainingStats(id("p1"), "all"));
  assert.equal(stats.recentSessions.find(s => s.id === player.id)?.reps, 17);
  await publish(source.id);
  assert.deepEqual(await copy(source.id, "p1"), stored);
});

test("spillere uten eierskap kan ikke lese, telle eller endre en annens gruppekopi", async () => {
  const { source } = await create(); await publish(source.id);
  const player = await copy(source.id, "p1");
  const tapper = await import("../../src/app/portal/(fullscreen)/live/[sessionId]/tapper/actions");
  for (const actor of ["p2", "outsider", "other"] as Actor[]) {
    if (actor === "other") await assert.rejects(as(actor, () => wb.loadPlayerSession(player.id)), /request rejected/);
    else assert.equal(data(await as(actor, () => wb.loadPlayerSession(player.id))), null);
    assert.equal((await as(actor, () => wb.moveSession({ sessionId: player.id, newDate: day, newStartMinute: 600 }))).ok, false);
    assert.equal((await as(actor, () => wb.completeSession(player.id))).ok, false);
    assert.equal((await as(actor, () => tapper.saveTapperCounts(player.id, [{ club: "synthetic", count: 99 }]))).ok, false);
  }
  assert.deepEqual(await copy(source.id, "p1"), player);
});

test("tilbaketrekking og ny publisering skjuler og gjenbruker urørte kopier", async () => {
  const { source } = await create(); await publish(source.id);
  const before = await copies(source.id);
  data(await as("coach", () => group.withdrawGroupWorkbenchSessions({ groupId, sessionIds: [source.id] })));
  for (const row of before) assert.equal(data(await as(row.playerId === id("p1") ? "p1" : "p2", () => wb.loadPlayerSession(row.id))), null);
  await publish(source.id);
  assert.deepEqual((await copies(source.id)).map(r => r.id), before.map(r => r.id));
});

test("tilbaketrukket innhold lekker ikke gjennom generelle uke-, økt- og redigeringshandlinger", async () => {
  const { source } = await create(); await publish(source.id);
  const player = await copy(source.id, "p1");
  data(await as("coach", () => group.withdrawGroupWorkbenchSessions({ groupId, sessionIds: [source.id] })));
  assert.equal((await as("p1", () => wb.loadSession(player.id))).ok, false);
  assert.equal((await as("p1", () => wb.moveSession({ sessionId: player.id, newDate: day, newStartMinute: 600 }))).ok, false);
  const { mondayOf } = await import("../../src/lib/domain/workbench/operations");
  const week = data(await as("p1", () => wb.loadWeek({ playerId: id("p1"), weekStart: mondayOf(day),
    mode: { kind: "PLAYER", subjectId: id("p1"), sources: ["OEKTER"] } })));
  assert.ok(!week.days.flatMap(d => d.sessions).some(s => s.id === player.id));
  const { updateWbSession } = await import("../../src/lib/workbench/wb-session-write");
  assert.equal((await updateWbSession(db, { sessionId: player.id, playerId: id("p1"), patch: { title: "Omgått" } })).ok, false);
  assert.equal((await copy(source.id, "p1")).title, player.title);
});

test("tilbaketrekking bevarer pågående økt og gjennomført historikk", async () => {
  const { source } = await create(); await publish(source.id);
  const p1 = await copy(source.id, "p1"), p2 = await copy(source.id, "p2");
  data(await as("p1", () => wb.startSession(p1.id)));
  data(await as("p2", () => wb.completeSession(p2.id)));
  const before = await copies(source.id);
  data(await as("coach", () => group.withdrawGroupWorkbenchSessions({ groupId, sessionIds: [source.id] })));
  assert.deepEqual(await copies(source.id), before);
  assert.equal((await as("coach", () => wb.unpublishSession(p2.id))).ok, false);
  assert.deepEqual(await copy(source.id, "p2"), before.find(r => r.id === p2.id));
});

test("fravalg via sletting kommer ikke tilbake ved ny publisering", async () => {
  const { source } = await create(); await publish(source.id);
  const player = await copy(source.id, "p1");
  data(await as("p1", () => wb.deleteSession(player.id)));
  await publish(source.id);
  const kept = await copy(source.id, "p1");
  assert.equal(kept.id, player.id); assert.equal(kept.hiddenByPlayer, true); assert.equal(kept.localOverride, true);
  assert.equal(data(await as("p1", () => wb.loadPlayerSession(player.id))), null);
});

test("redigering fra lagret ID beholder originalen; foreldet oppdatering avvises", async () => {
  const { source, input } = await create();
  const content = { ...input, requestId: undefined };
  const updated = data(await as("coach", () => group.saveGroupWorkbenchSession({ ...content, sessionId: source.id,
    expectedUpdatedAt: source.updatedAt, title: "Oppdatert fra lagret økt" })));
  assert.equal(updated.id, source.id);
  assert.equal((await as("coach", () => group.saveGroupWorkbenchSession({ ...content, sessionId: source.id,
    expectedUpdatedAt: source.updatedAt, title: "Foreldet" }))).ok, false);
  assert.equal((await db.workbenchSession.findUniqueOrThrow({ where: { id: source.id } })).title, updated.title);
});

test("tidligere gruppeeier kan ikke omgå gruppetilgangen gjennom spillerhandlinger", async () => {
  const { source } = await create();
  await db.group.update({ where: { id: groupId }, data: { coachId: id("other") } });
  try {
    assert.equal((await as("coach", () => wb.loadSession(source.id))).ok, false);
    assert.equal((await as("coach", () => wb.moveSession({ sessionId: source.id, newDate: day, newStartMinute: 600 }))).ok, false);
  } finally { await db.group.update({ where: { id: groupId }, data: { coachId: id("coach") } }); }
});

test("gruppeoriginalen kan ikke endres eller slettes gjennom generelle spillerhandlinger", async () => {
  const { source } = await create(); await publish(source.id);
  const original = await db.workbenchSession.findUniqueOrThrow({ where: { id: source.id }, include: { drills: true } });
  assert.equal((await as("coach", () => wb.moveSession({ sessionId: source.id, newDate: day, newStartMinute: 600 }))).ok, false);
  assert.equal((await as("coach", () => wb.updateSeriesSession({ sessionId: source.id, patch: { title: "Feil vei" }, policy: "DENNE" }))).ok, false);
  assert.equal((await as("coach", () => wb.deleteSessionSeries({ sessionId: source.id, policy: "DENNE" }))).ok, false);
  assert.deepEqual(await db.workbenchSession.findUniqueOrThrow({ where: { id: source.id }, include: { drills: true } }), original);
});

test("seriesletting av en gruppekopi bevarer ID og fravalget ved neste publisering", async () => {
  const { source } = await create(); await publish(source.id);
  const player = await copy(source.id, "p1");
  data(await as("p1", () => wb.deleteSessionSeries({ sessionId: player.id, policy: "DENNE" })));
  await publish(source.id);
  const stored = await copy(source.id, "p1");
  assert.equal(stored.id, player.id); assert.equal(stored.hiddenByPlayer, true); assert.equal(stored.localOverride, true);
  assert.equal(data(await as("p1", () => wb.loadPlayerSession(player.id))), null);
});

test("årsplan og malutrulling avviser feil gruppe før lesing og skriving", async () => {
  const periods = await import("../../src/lib/workbench/gruppe-periode-actions");
  const templates = await import("../../src/lib/workbench/apply-template-actions");
  assert.equal((await as("other", () => periods.coachLagreGruppePeriode(groupId, {
    lPhase: "GRUNN", startDato: "2030-01-01", sluttDato: "2030-01-07",
  }))).ok, false);
  assert.equal((await as("other", () => periods.coachSlettGruppePeriode(groupId, "ukjent"))).ok, false);
  assert.equal((await as("other", () => periods.coachRullUtGruppeAarsplan(groupId))).ok, false);
  assert.equal((await as("other", () => templates.coachApplyTemplateToGroup(groupId, "ukjent"))).ok, false);
  assert.equal(await db.groupPeriodBlock.count({ where: { groupId } }), 0);
});

test("utmelding fjerner bare lenket planinnhold; egen tilpasning og historikk består", async () => {
  const untouched = await create(), local = await create(), history = await create();
  for (const entry of [untouched, local, history]) await publish(entry.source.id);
  const a = await copy(untouched.source.id, "p1"), b = await copy(local.source.id, "p1"), c = await copy(history.source.id, "p1");
  data(await as("p1", () => wb.moveSession({ sessionId: b.id, newDate: day, newStartMinute: 600 })));
  data(await as("p1", () => wb.completeSession(c.id)));
  const { fjernGruppemedlem } = await import("../../src/app/admin/grupper/[id]/actions");
  assert.equal((await as("coach", () => fjernGruppemedlem(groupId, id("p1")))).ok, true);
  assert.equal(await db.workbenchSession.findUnique({ where: { id: a.id } }), null);
  assert.equal((await db.workbenchSession.findUniqueOrThrow({ where: { id: b.id } })).localOverride, true);
  assert.equal((await db.workbenchSession.findUniqueOrThrow({ where: { id: c.id } })).status, "COMPLETED");
  await publish(untouched.source.id);
  assert.equal(await db.workbenchSession.findUnique({ where: { id: a.id } }), null);
});
