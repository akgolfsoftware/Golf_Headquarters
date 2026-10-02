import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";
import type { WeekViewModel } from "@/lib/domain/workbench/types";

type DbOkt = Prisma.WorkbenchSessionGetPayload<{ include: { drills: true } }>;
type Plan = { id: string; userId: string; year: number; name: string | null; startDate: Date; endDate: Date; updatedAt: Date;
  periodBlocks: { id: string; lPhase: "GRUNN"; startDate: Date; endDate: Date; focus: string | null;
    weeklyVolMin: number | null; weeklyVolMax: number | null; weeklySessionBudget: unknown }[] };
const dbDato = (d: string) => new Date(`${d}T00:00:00Z`);
const now = new Date("2026-10-02T10:00:00Z");
let viewer = { id: "coach", role: "COACH" };
let tilgang = true;
let authFeil = false;
let periodPlan: Plan | null = null;
let roster = [{ id: "eier", name: "Syntetisk spiller" }];
let okter: DbOkt[] = [];
let legacy: { id: string; owner: string; scheduledAt: Date; durationMin: number; pyramidArea: string; status: string; updatedAt: Date;
  log: { startedAt: Date; completedAt: Date } | null }[] = [];
let v2: { id: string; studentId: string; startTime: Date; endTime: Date; practiceType: string; status: string;
  generertFra: string | null; generertFraId: string | null; updatedAt: Date }[] = [];
let denyWeek = "";
let sourceFail = false;
let volumFeil = false;
let active = 0, peak = 0;
const lesinger: { kilde: string; where: unknown }[] = [];
const ukeKall: { playerId: string; weekStart: string; subjectId: string }[] = [];
const analyserunder = [{ id: "runde-egen", userId: "eier", playedAt: new Date("2026-10-01T12:00:00Z"), score: 74,
  sgSource: "syntetisk-kilde", sgTotal: 0, sgOtt: -1, sgApp: 1, sgArg: null, sgPutt: null, _count: { holeScores: 18 } },
{ id: "runde-annen", userId: "annen", playedAt: new Date("2026-10-01T12:00:00Z"), score: 68,
  sgSource: "syntetisk-kilde", sgTotal: 5, sgOtt: 2, sgApp: 1, sgArg: 1, sgPutt: 1, _count: { holeScores: 18 } }];

function okt(patch: Partial<DbOkt> = {}): DbOkt {
  return { id: "okt", playerId: "eier", coachId: "coach", date: dbDato("2026-10-01"), startMinute: 540,
    durationMinutes: 60, actualMinutes: 45, status: "COMPLETED", pyramid: "TEK", blockType: "OEKT", title: "Syntetisk økt",
    origin: "COACH", drills: [], isTemplate: false, hiddenByPlayer: false, needsPlayerApproval: false,
    localOverride: false, approvalStatus: null, sourceGroupSessionId: null, migrertFraTrainingPlanSessionId: null,
    createdAt: now, updatedAt: now, createdBy: "COACH", ...patch } as DbOkt;
}
function week(playerId: string, weekStart: string): WeekViewModel {
  return { weekStart, days: Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.parse(weekStart) + i * 86400000).toISOString().slice(0, 10),
    weekday: i + 1, sessions: [], lockedBlocks: [] })), mode: { kind: "AGENCY", subjectId: playerId, sources: [] },
    budget: { targetMinutes: 0, plannedMinutes: 0, byPyramid: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 } } };
}
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => {
  if (authFeil) throw new Error("Syntetisk samtykke-/innloggingsvakt"); return viewer;
} } });
mock.module("@/lib/auth/coached", { namedExports: { coachScopedPlayerWhere: () => ({ primaryCoachId: "coach", deletedAt: null }) } });
mock.module("@/lib/portal/visible-v2", { namedExports: { visibleV2Where: async (id: string) => ({ studentId: id }) } });
mock.module("@/lib/workbench/wb-actions", { namedExports: {
  loadWeek: async ({ playerId, weekStart, mode }: { playerId: string; weekStart: string; mode: { subjectId: string } }) => {
    ukeKall.push({ playerId, weekStart, subjectId: mode.subjectId }); active++; peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, 1)); active--;
    return playerId === denyWeek ? { ok: false, error: "Ingen tilgang" } : { ok: true, data: week(playerId, weekStart) };
  },
  loadSources: async () => sourceFail ? { ok: false, error: "Syntetisk feil" } : { ok: true, data: [] },
  loadStallFollowup: async ({ playerId, weekStart }: { playerId: string; weekStart: string }) => ({ ok: true,
    data: { sessions: [], pendingPlanActionIds: [], from: weekStart, to: weekStart, playerId } }),
  loadSession: async (id: string) => {
    const row = okter.find(r => r.id === id);
    if (row?.groupId && !row.sourceGroupSessionId && /^wb-group-[a-f0-9]{64}$/.test(row.id)) return { ok: false, error: "Bruk gruppeplanen" };
    const { mapSession } = await import("./wb-map");
    return { ok: true, data: row ? mapSession(row) : null };
  },
} });
mock.module("@/lib/workbench/maal-spor", { namedExports: { hentMaalSpor: async () => [] } });
mock.module("@/lib/workbench/fys-turnering-data", { namedExports: { loadFysTurneringWorkbenchData: async () => ({ physicalBlocks: [], tournamentPlans: [], openConflicts: [], available: false }) } });
type WbWhere = { id?: string; playerId: string; date?: { gte: Date; lt: Date }; hiddenByPlayer?: boolean;
  migrertFraTrainingPlanSessionId?: { in: string[] }; AND?: unknown[] };
const lagreLesing = (kilde: string, where: unknown) => { lesinger.push({ kilde, where }); };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: {
    findFirst: async ({ where }: { where: unknown }) => { lagreLesing("user", where); return tilgang ? { id: "eier", name: "Syntetisk spiller" } : null; },
    findMany: async ({ where }: { where: unknown }) => { lagreLesing("roster", where); return roster; },
  },
  group: { findMany: async ({ where }: { where: unknown }) => { lagreLesing("group", where); return []; } },
  seasonPlan: { findFirst: async ({ where }: { where: { userId: string; year: number } }) => {
    lagreLesing("season", where); return periodPlan?.userId === where.userId && periodPlan.year === where.year ? periodPlan : null;
  } },
  workbenchSession: {
    findMany: async ({ where }: { where: WbWhere }) => {
      lagreLesing("wb", where);
      if (volumFeil) throw new Error("Syntetisk databasefeil");
      return okter.filter(r => r.playerId === where.playerId && (!where.date || r.date >= where.date.gte && r.date < where.date.lt) &&
        (!where.migrertFraTrainingPlanSessionId || where.migrertFraTrainingPlanSessionId.in.includes(r.migrertFraTrainingPlanSessionId ?? "")) &&
        (where.hiddenByPlayer !== false || !r.hiddenByPlayer) && (!where.AND || !r.sourceGroupSessionId || r.localOverride || r.status !== "DRAFT"));
    },
    findFirst: async ({ where }: { where: WbWhere }) => { lagreLesing("valgt-okt", where); return okter.find(r => r.id === where.id && r.playerId === where.playerId &&
      (where.hiddenByPlayer !== false || !r.hiddenByPlayer) && (!where.AND || !r.sourceGroupSessionId || r.localOverride || r.status !== "DRAFT")) ?? null; },
  },
  trainingPlanSession: { findMany: async ({ where }: { where: { plan: { userId: string }; scheduledAt: { gte: Date; lt: Date } } }) => {
    lagreLesing("legacy", where); return legacy.filter(r => r.owner === where.plan.userId && r.scheduledAt >= where.scheduledAt.gte && r.scheduledAt < where.scheduledAt.lt);
  } },
  trainingSessionV2: { findMany: async ({ where }: { where: { studentId: string; startTime?: { gte: Date; lt: Date }; generertFra?: string; generertFraId?: { in: string[] } } }) => {
    lagreLesing("v2", where); return v2.filter(r => r.studentId === where.studentId && (!where.startTime || r.startTime >= where.startTime.gte && r.startTime < where.startTime.lt) &&
      (!where.generertFra || r.generertFra === where.generertFra) &&
      (!where.generertFraId || where.generertFraId.in.includes(r.generertFraId ?? "")));
  } },
  round: { findMany: async ({ where }: { where: { userId: string; playedAt: { gte: Date; lt: Date } } }) => {
    lagreLesing("round", where); return analyserunder.filter(r => r.userId === where.userId && r.playedAt >= where.playedAt.gte && r.playedAt < where.playedAt.lt);
  } },
  testResult: { findMany: async ({ where }: { where: unknown }) => { lagreLesing("test", where); return []; } },
  trackManSession: { findMany: async ({ where }: { where: unknown }) => { lagreLesing("tm", where); return []; } },
  tournamentEntry: { findMany: async ({ where }: { where: unknown }) => { lagreLesing("turnering", where); return []; } },
} } });
let load: typeof import("./workbench-samlet-data").loadWorkbenchSamletData;
before(async () => { ({ loadWorkbenchSamletData: load } = await import("./workbench-samlet-data")); });
beforeEach(() => {
  viewer = { id: "coach", role: "COACH" }; tilgang = true; authFeil = false; periodPlan = null; roster = [{ id: "eier", name: "Syntetisk spiller" }];
  okter = []; legacy = []; v2 = []; denyWeek = ""; sourceFail = false; volumFeil = false; active = 0; peak = 0; lesinger.length = 0; ukeKall.length = 0;
});
const input = { playerId: "eier", routeSurface: "agency" as const, flate: "uke" as const, query: { uke: "2026-09-28" }, now };

test("auth-/samtykkevakt stanser alle datalesinger; player kan aldri lese annen eier", async () => {
  authFeil = true;
  await assert.rejects(load(input), /samtykke/); assert.equal(lesinger.length, 0); assert.equal(ukeKall.length, 0);
  authFeil = false; viewer = { id: "annen", role: "PLAYER" };
  assert.equal((await load({ ...input, routeSurface: "player" })).ok, false); assert.equal(lesinger.length, 0);
});
test("coachens spillerfilter kommer først og avvist spiller utløser ingen planlesing", async () => {
  tilgang = false;
  assert.equal((await load(input)).ok, false);
  assert.deepEqual(lesinger, [{ kilde: "user", where: { AND: [{ primaryCoachId: "coach", deletedAt: null }, { id: "eier" }] } }]);
});
test("felles ukevolum bevarer registrert 0/null/framtid og avstemmer dublett uten annen eier", async () => {
  okter = [okt(), okt(), okt({ id: "null", actualMinutes: null }), okt({ id: "zero", pyramid: "FYS", actualMinutes: 0 }),
    okt({ id: "future", date: dbDato("2026-10-02"), startMinute: 780 }), okt({ id: "fremmed", playerId: "annen" })];
  const r = await load(input); assert.ok(r.ok);
  assert.equal(r.data.volum.total.planlagtMinutter, 240); assert.equal(r.data.volum.total.faktiskMinutter, 45);
  assert.equal(r.data.volum.akser[0].faktiskMinutter, 0); assert.equal(r.data.volum.total.ukjentOkter, 1);
  assert.equal(r.data.volum.total.framtidigeOkter, 1); assert.equal(r.data.volum.total.faktiskRegistrerteOkter, 2);
});
test("migrert økt utenfor vinduet/skjult erstatter legacy; ingen planvarighet blir faktisk", async () => {
  legacy = [{ id: "old", owner: "eier", scheduledAt: new Date("2026-10-01T07:00:00Z"), durationMin: 60,
    pyramidArea: "TEK", status: "COMPLETED", updatedAt: now, log: null }];
  okter = [okt({ id: "flyttet", migrertFraTrainingPlanSessionId: "old", date: dbDato("2026-11-01"), hiddenByPlayer: true })];
  const r = await load(input); assert.ok(r.ok); assert.equal(r.data.volum.total.planlagtMinutter, 0); assert.equal(r.data.volum.total.faktiskMinutter, null);
  okter = [];
  const old = await load(input); assert.ok(old.ok); assert.equal(old.data.volum.total.planlagtMinutter, 60);
  assert.equal(old.data.volum.total.faktiskMinutter, null); assert.equal(old.data.volum.total.ukjentOkter, 1);
});
test("legacy loggklokke er separat anslag og V2-speil erstatter original bare én gang", async () => {
  legacy = [{ id: "old", owner: "eier", scheduledAt: new Date("2026-10-01T07:00:00Z"), durationMin: 60,
    pyramidArea: "TEK", status: "COMPLETED", updatedAt: now, log: { startedAt: new Date("2026-10-01T07:00:00Z"), completedAt: new Date("2026-10-01T07:35:00Z") } }];
  const r = await load(input); assert.ok(r.ok); assert.equal(r.data.volum.total.legacyAnslagMinutter, 35); assert.equal(r.data.volum.total.faktiskMinutter, null);
  v2 = [{ id: "v2", studentId: "eier", startTime: new Date("2026-10-01T07:00:00Z"), endTime: new Date("2026-10-01T08:00:00Z"),
    practiceType: "BLOKK", status: "COMPLETED", generertFra: "WORKBENCH_PLAN", generertFraId: "old", updatedAt: now }];
  const speil = await load(input); assert.ok(speil.ok); assert.equal(speil.data.volum.total.planlagteOkter, 1); assert.equal(speil.data.volum.total.faktiskMinutter, null);
});
test("spillerbytte tømmer fremmed periode-/økt-ID men beholder dato, år og måned", async () => {
  okter = [okt({ id: "fremmed-okt", playerId: "annen" })];
  const r = await load({ ...input, query: { uke: "2024-12-30", aar: "2025", maned: "2025-02", periode: "fremmed", okt: "fremmed-okt" } });
  assert.ok(r.ok); assert.equal(r.data.planKontekst.weekStart, "2024-12-30"); assert.equal(r.data.planKontekst.isoWeekYear, 2025);
  assert.equal(r.data.planKontekst.weekNumber, 1); assert.equal(r.data.planKontekst.year, 2025); assert.equal(r.data.planKontekst.monthStart, "2025-02-01");
  assert.equal(r.data.planKontekst.referanse.periode, undefined); assert.equal(r.data.planKontekst.referanse.okt, undefined); assert.equal(r.data.valgtOkt, null);
  assert.deepEqual(lesinger.find(q => q.kilde === "valgt-okt")?.where, { id: "fremmed-okt", playerId: "eier" });
});
test("player-bord har bare egen rad, ingen coachroster eller gruppeliste", async () => {
  viewer = { id: "eier", role: "PLAYER" };
  roster = [{ id: "annen", name: "Skal ikke leses" }];
  const r = await load({ ...input, routeSurface: "player", flate: "bord" }); assert.ok(r.ok);
  assert.deepEqual(r.data.roster, []); assert.deepEqual(r.data.grupper, []); assert.equal(r.data.bord?.total, 1);
  assert.deepEqual(ukeKall.map(k => k.playerId), ["eier"]); assert.ok(!lesinger.some(l => l.kilde === "roster" || l.kilde === "group"));
  const wb = lesinger.find(l => l.kilde === "wb")?.where as WbWhere; assert.equal(wb.hiddenByPlayer, false); assert.ok(wb.AND);
});
test("coach-bord laster faktisk uke for alle 13 autoriserte spillere, maks fire samtidig", async () => {
  roster = [{ id: "eier", name: "Syntetisk spiller" }, ...Array.from({ length: 12 }, (_, i) => ({ id: `spiller-${i}`, name: `Syntetisk ${i}` }))];
  denyWeek = "spiller-5";
  const r = await load({ ...input, flate: "bord" }); assert.ok(r.ok);
  assert.equal(r.data.bord?.total, 13); assert.equal(r.data.bord?.rader.length, 13); assert.equal(ukeKall.length, 13);
  assert.ok(peak <= 4); assert.equal(new Set(ukeKall.map(k => k.playerId)).size, 13);
  for (const k of ukeKall) { assert.equal(k.weekStart, "2026-09-28"); assert.equal(k.subjectId, k.playerId); }
  const denied = r.data.bord?.rader.find(p => p.spiller.id === denyWeek); assert.equal(denied?.uke, null); assert.equal(denied?.volum, null);
  assert.equal(denied?.spiller.navn, "Utilgjengelig"); assert.ok(!lesinger.some(l => l.kilde === "wb" && (l.where as WbWhere).playerId === denyWeek));
});
test("sesonggrenser og måned-/periodevolum kommer fra lagrede datoer og rå registreringer", async () => {
  periodPlan = { id: "plan", userId: "eier", year: 2026, name: "Syntetisk sesong", startDate: dbDato("2026-09-15"), endDate: dbDato("2027-01-10"), updatedAt: now,
    periodBlocks: [{ id: "periode", lPhase: "GRUNN", startDate: dbDato("2026-09-20"), endDate: dbDato("2026-10-01"), focus: null,
      weeklyVolMin: 0, weeklyVolMax: 100, weeklySessionBudget: { TEK: 0 } }] };
  okter = [okt({ actualMinutes: 0 }), okt({ id: "for-sesong", date: dbDato("2026-09-01"), actualMinutes: 90 }),
    okt({ id: "siste-dag", date: dbDato("2027-01-10"), status: "PUBLISHED", actualMinutes: null }),
    okt({ id: "etter-sesong", date: dbDato("2027-01-11"), status: "PUBLISHED" })];
  const r = await load({ ...input, flate: "sesong", query: { ...input.query, aar: "2026", periode: "periode" } }); assert.ok(r.ok);
  assert.deepEqual(r.data.sesong?.vindu, { fraDato: "2026-09-15", tilDato: "2027-01-11" });
  assert.equal(r.data.sesong?.volum.total.planlagtMinutter, 120); assert.equal(r.data.sesong?.volum.total.faktiskMinutter, 0);
  assert.equal(r.data.sesong?.perioder[0].volum.total.faktiskMinutter, 0); assert.deepEqual(r.data.sesong?.perioder[0].sessionBudget, { TEK: 0 });
  assert.equal(r.data.sesong?.maneder.length, 5); assert.equal(r.data.sesong?.maneder.reduce((n, m) => n + m.volum.total.planlagtMinutter, 0), 120);
});
test("analyse er bare valgt spiller og eksakt valgt periode med reell SG-nullverdi", async () => {
  periodPlan = { id: "plan", userId: "eier", year: 2026, name: null, startDate: dbDato("2026-01-01"), endDate: dbDato("2026-12-31"), updatedAt: now,
    periodBlocks: [{ id: "periode", lPhase: "GRUNN", startDate: dbDato("2026-10-01"), endDate: dbDato("2026-10-02"), focus: null,
      weeklyVolMin: null, weeklyVolMax: null, weeklySessionBudget: null }] };
  const r = await load({ ...input, flate: "analyse", query: { aar: "2026", periode: "periode" } }); assert.ok(r.ok);
  assert.deepEqual(r.data.analyse?.vindu, { fraDato: "2026-10-01", tilDato: "2026-10-03" });
  assert.deepEqual(r.data.analyse?.runder.map(r => r.id), ["runde-egen"]); assert.equal(r.data.analyse?.runder[0].sgTotal, 0);
  assert.equal(r.data.analyse?.sg.total, null); assert.equal(r.data.analyse?.runder[0].sgKilde, "syntetisk-kilde");
  assert.equal(r.data.analyse?.sg.roundCount, 1); assert.match(r.data.analyse?.sg.referanse ?? "", /ikke dokumentert/);
  const q = lesinger.find(l => l.kilde === "round")?.where as { userId: string; playedAt: { gte: Date; lt: Date } };
  assert.equal(q.userId, "eier"); assert.equal(q.playedAt.gte.toISOString(), "2026-09-30T22:00:00.000Z"); assert.equal(q.playedAt.lt.toISOString(), "2026-10-02T22:00:00.000Z");
});
test("tom analyse bruker valgt kalenderår uten falske nullverdier; kildefeil er synlig", async () => {
  sourceFail = true;
  const r = await load({ ...input, flate: "analyse", query: { aar: "2027" } }); assert.ok(r.ok);
  assert.equal(r.data.analyse?.runder.length, 0); assert.equal(r.data.analyse?.sg.total, null); assert.equal(r.data.analyse?.volum.total.faktiskMinutter, null);
  assert.match(r.data.varsler.join(" "), /Kildebiblioteket.*kalenderår/);
});

test("2027 januar bruker ISO-uke 1/2 og samme valgte referanse i alle fire flater", async () => {
  for (const flate of ["sesong", "uke", "bord", "analyse"] as const) {
    const r = await load({ ...input, flate, query: { uke: "2027-01-04", aar: "2027", maned: "2027-01" } }); assert.ok(r.ok);
    assert.equal(r.data.planKontekst.weekNumber, 1); assert.equal(r.data.planKontekst.isoWeekYear, 2027);
    assert.equal(r.data.planKontekst.referanse.uke, "2027-01-04"); assert.equal(r.data.volum.vindu.fraDato, "2027-01-04T00:00:00.000Z");
  }
  const neste = await load({ ...input, query: { uke: "2027-01-11" } }); assert.ok(neste.ok); assert.equal(neste.data.planKontekst.weekNumber, 2);
});
test("coachens utkast, maler, skjulte og ubesvarte økter er aldri faktisk volum", async () => {
  okter = [okt({ status: "DRAFT" }), okt({ id: "mal", isTemplate: true }), okt({ id: "hidden", hiddenByPlayer: true }),
    okt({ id: "pending", needsPlayerApproval: true }), okt({ id: "rejected", approvalStatus: "REJECTED" })];
  const r = await load(input); assert.ok(r.ok); assert.equal(r.data.volum.total.planlagteOkter, 0); assert.equal(r.data.volum.total.faktiskMinutter, null);
});
test("WB-migrering erstatter både legacy og V2-speil, selv når WB er annullert og flyttet", async () => {
  legacy = [{ id: "old", owner: "eier", scheduledAt: new Date("2026-10-01T07:00:00Z"), durationMin: 60,
    pyramidArea: "TEK", status: "COMPLETED", updatedAt: now, log: null }];
  v2 = [{ id: "speil", studentId: "eier", startTime: new Date("2026-10-01T07:00:00Z"), endTime: new Date("2026-10-01T08:00:00Z"),
    practiceType: "BLOKK", status: "COMPLETED", generertFra: "WORKBENCH_PLAN", generertFraId: "old", updatedAt: now }];
  okter = [okt({ migrertFraTrainingPlanSessionId: "old", date: dbDato("2026-11-01"), status: "CANCELLED" })];
  const r = await load(input); assert.ok(r.ok); assert.equal(r.data.volum.total.planlagteOkter, 0); assert.equal(r.data.volum.total.faktiskMinutter, null);
});
test("egen valgt økt gjenbrukes, skjult/tilbaketrukket gruppereferanse tømmes for spiller", async () => {
  viewer = { id: "eier", role: "PLAYER" }; okter = [okt()];
  const r = await load({ ...input, routeSurface: "player", query: { ...input.query, okt: "okt" } }); assert.ok(r.ok);
  assert.equal(r.data.valgtOkt?.id, "okt"); assert.equal(r.data.planKontekst.referanse.okt, "okt");
  okter = [okt({ hiddenByPlayer: true })];
  const hidden = await load({ ...input, routeSurface: "player", query: { ...input.query, okt: "okt" } }); assert.ok(hidden.ok);
  assert.equal(hidden.data.valgtOkt, null); assert.equal(hidden.data.planKontekst.referanse.okt, undefined);
  okter = [okt({ sourceGroupSessionId: "gruppeoriginal", status: "DRAFT" })];
  const withdrawn = await load({ ...input, routeSurface: "player", query: { ...input.query, okt: "okt" } }); assert.ok(withdrawn.ok);
  assert.equal(withdrawn.data.valgtOkt, null); assert.equal(withdrawn.data.planKontekst.referanse.okt, undefined);
});
test("lesefeil og valgt spiller uten uketilgang gir feil, aldri falsk tom flate", async () => {
  volumFeil = true;
  const r = await load(input); assert.equal(r.ok, false); if (!r.ok) assert.match(r.error, /kunne ikke lastes/);
  volumFeil = false; denyWeek = "eier";
  const denied = await load(input); assert.equal(denied.ok, false);
});
test("ni/18 hull og ulike SG-kilder beholdes per runde uten samlet snitt eller normalisering", async () => {
  analyserunder.push({ id: "ni-hull", userId: "eier", playedAt: new Date("2026-10-01T13:00:00Z"), score: 38,
    sgSource: "annen-syntetisk-referanse", sgTotal: 3, sgOtt: 1, sgApp: 1, sgArg: 0, sgPutt: 1, _count: { holeScores: 9 } });
  try {
    const r = await load({ ...input, flate: "analyse" }); assert.ok(r.ok);
    assert.deepEqual(r.data.analyse?.runder.map(q => [q.hull, q.brutto, q.sgTotal]), [[18, 74, 0], [9, 38, 3]]);
    assert.equal(r.data.analyse?.sg.total, null); assert.equal(r.data.analyse?.sg.ott, null); assert.match(r.data.analyse?.sg.referanse ?? "", /normalisering/);
  } finally { analyserunder.pop(); }
});
test("valgt økt beholder loadSession sin sperre mot gruppeoriginal", async () => {
  const id = `wb-group-${"a".repeat(64)}`;
  okter = [okt({ id, groupId: "gruppe", sourceGroupSessionId: null, status: "PUBLISHED" })];
  const r = await load({ ...input, query: { ...input.query, okt: id } }); assert.ok(r.ok);
  assert.equal(r.data.valgtOkt, null); assert.equal(r.data.planKontekst.referanse.okt, undefined);
});
