import assert from "node:assert/strict";
import { before, beforeEach, mock, test, type TestContext } from "node:test";
import type { TreningsvolumOkt } from "./treningsvolum";

let rader: TreningsvolumOkt[] = [];
const sporringer: { gte: Date; lt: Date }[] = [];
mock.module("@/lib/prisma", { namedExports: { prisma: {
  workbenchSession: { findMany: async ({ where, select }: {
    where: { playerId: string; date: { gte: Date; lt: Date } };
    select: Record<string, boolean>;
  }) => {
    assert.equal(where.playerId, "syntetisk-spiller");
    sporringer.push(where.date);
    return rader.filter(r => r.date >= where.date.gte && r.date < where.date.lt)
      .map(r => Object.fromEntries(Object.entries(r).filter(([key]) => select[key])));
  } },
  round: { findMany: async () => [], aggregate: async () => ({ _avg: { sgOtt: null, sgApp: null, sgArg: null, sgPutt: null } }) },
  user: { findFirst: async () => ({ name: "Syntetisk spiller", email: "syntetisk@example.invalid", hcp: null,
    groupMemberships: [], childRelations: [], goals: [], primaryCoachId: null }) },
  technicalPlan: { findMany: async () => [] },
  testResult: { findMany: async () => [] },
} } });
mock.module("@/lib/auth/coached", { namedExports: { coachScopedPlayerWhere: () => ({ primaryCoachId: "syntetisk-coach" }) } });
mock.module("@/lib/portal/ph01-data", { namedExports: { osloDagSomDbDato: () => new Date("2026-10-02T00:00:00Z") } });
mock.module("@/lib/training/volum", { namedExports: { hentTreningsVolum: async () => [] } });
mock.module("@/lib/training/korrelasjon", { namedExports: { beregnKorrelasjon: async () => [] } });
mock.module("@/lib/min-golf/load-min-golf", { namedExports: { loadMinGolf: async () => ({
  sgStatus: { kategorier: [] }, runder: { tigerFive: [] }, putting: { band: [], baseline: "syntetisk" },
  nesteFokus: null, progresjon: null,
}) } });
mock.module("@/app/portal/analysere/actions", { namedExports: { loadAnalyticsWorkbenchData: async () => ({
  sgBreakdown: { roundCount: 0 }, training: { analyse: null }, trackman: { clubs: [], sessions: [] }, tests: [],
}) } });
mock.module("@/lib/portal/turneringshistorikk-data", { namedExports: { hentTurneringshistorikk: async () => ({ aar: [] }) } });
mock.module("@/lib/admin/vekstrate-data", { namedExports: { hentVekstrateData: async () => ({}) } });
mock.module("@/lib/intelligence/benchmark-provider", { namedExports: { getPlayerBenchmarkGaps: async () => [] } });
mock.module("@/lib/admin-spiller/spiller-dashboard-data", { namedExports: { loadSpillerDashboardEkstra: async () => ({
  wagr: null, sesong: null, turneringsResultater: [], fysTester: [],
}) } });
mock.module("@/lib/portal/goals/progress", { namedExports: { beregnGoalProgressListe: async () => [] } });

// Andre faner inngår ikke i denne prøven. En uventet sideeffekt skal feile,
// og ingen avhengighet får åpne en ekte database-/nettverksforbindelse.
for (const [path, navn] of [
  ["@/lib/health/samtykke", ["hentSamtykkeStatus"]],
  ["@/lib/health/leave-innsyn", ["innsynsNivaaFra", "maskerLeave"]],
  ["@/lib/admin/spiller-tester-data", ["loadSpillerTesterData"]],
  ["@/lib/portal-tester/test-followup-data", ["loadTestFollowup"]],
  ["@/lib/portal-tester/test-anbefaling", ["ovelsesNavn"]],
  ["@/lib/portal-tester/tn-historikk", ["tnHistorikkRader"]],
  ["@/lib/portal-tester/tn-catalog", ["tnProtocol"]],
  ["@/lib/portal-tester/tn-scoring", ["tnFormat"]],
  ["@/lib/portal-tester/format-verdi", ["formaterTestVerdi"]],
  ["@/lib/portal-tester/test-scoring", ["parseForScoring"]],
  ["@/lib/workbench/visning-url", ["workbenchUrl"]],
  ["@/lib/portal/etterlevelse-data", ["hentEtterlevelse"]],
  ["@/lib/admin-spiller/spiller-oversikt-data", ["lastSpillerOversiktForViewer"]],
  ["@/lib/admin-spiller/spiller-arbeidsvisning-data", ["lastSpillerArbeidsvisning"]],
  ["@/lib/teknisk-plan/tp-last", ["hentTekniskPlan"]],
  ["@/lib/teknisk-plan/tp-visning", ["planVisning"]],
] as const) mock.module(path, { namedExports: Object.fromEntries(navn.map(n => [n, () => { throw new Error(`Uventet kall: ${n}`); }])) });

let lastFane: typeof import("@/lib/admin-spiller/spiller360-data").lastSpiller360Fane;
before(async () => { ({ lastSpiller360Fane: lastFane } = await import("@/lib/admin-spiller/spiller360-data")); });
beforeEach(ctx => {
  if (!("mock" in ctx)) throw new Error("Leserprøven krever en testkontekst");
  const testContext: TestContext = ctx;
  testContext.mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-02T10:00:00Z") });
  sporringer.length = 0;
  rader = [];
});
function okt(patch: Partial<TreningsvolumOkt> = {}): TreningsvolumOkt {
  return { id: "registrert", date: new Date("2026-10-01T00:00:00Z"), startMinute: 540,
    pyramid: "TEK", durationMinutes: 60, actualMinutes: 45, status: "COMPLETED", ...patch };
}
async function beggeFaner() {
  const viewer = { id: "syntetisk-coach", role: "COACH" };
  const stats = await lastFane(viewer, "syntetisk-spiller", "stats");
  const iup = await lastFane(viewer, "syntetisk-spiller", "iup");
  assert.equal(stats?.fane, "stats");
  assert.equal(iup?.fane, "iup");
  if (stats?.fane !== "stats" || iup?.fane !== "iup") throw new Error("Manglende fane");
  return { stats: stats.data.trening, iup: iup.data.trening };
}

test("begge Spiller360-lesere beholder 60/45, registrert 0, ukjent og framtid", async () => {
  rader = [okt(), okt(), okt({ id: "null", pyramid: "SLAG", actualMinutes: null }),
    okt({ id: "nullverdi", pyramid: "FYS", actualMinutes: 0 }),
    okt({ id: "annullert", status: "CANCELLED", pyramid: "TURN" }),
    okt({ id: "ikke-utfort", status: "SKIPPED", pyramid: "TURN" }),
    okt({ id: "framtid", pyramid: "SPILL", date: new Date("2026-10-02T00:00:00Z"), startMinute: 780 }),
    okt({ id: "for-vindu", date: new Date("2026-09-01T00:00:00Z") }),
    okt({ id: "etter-vindu", date: new Date("2026-10-05T00:00:00Z") })];
  const { stats, iup } = await beggeFaner();
  assert.deepEqual(stats.planMotFaktisk, [{ akse: "fys", plan: 60, faktisk: 0 }, { akse: "tek", plan: 60, faktisk: 45 }]);
  assert.deepEqual(iup?.timer, [{ akse: "fys", timer: 0 }, { akse: "tek", timer: 0.8 }]);
  for (const meta of [stats.volumMetadata, iup?.volumMetadata]) {
    assert.equal(meta?.total.faktiskMinutter, 45);
    assert.equal(meta?.total.planlagtMinutter, 300);
    assert.equal(meta?.total.faktiskRegistrerteOkter, 2);
    assert.equal(meta?.total.ukjentOkter, 1);
    assert.equal(meta?.total.framtidigeOkter, 1);
    assert.equal(meta?.akser.length, 5);
  }
  assert.equal(iup?.gjennomfort, 3);
});

test("bare ukjent gjennomført tid gir ingen falske 0-stolper i noen av fanene", async () => {
  rader = [okt({ actualMinutes: null })];
  const { stats, iup } = await beggeFaner();
  assert.deepEqual(stats.planMotFaktisk, []);
  assert.deepEqual(iup?.timer, []);
  assert.equal(stats.volumMetadata?.total.faktiskMinutter, null);
  assert.equal(iup?.volumMetadata?.total.faktiskMinutter, null);
  assert.equal(iup?.gjennomfort, 1);
  assert.equal(iup?.planlagt, 1);
  assert.match(stats.planKilde, /1 UKJENT/);
  assert.match(iup?.kilde ?? "", /1 UKJENT/);
});

test("summer og spørringer deler eksakt datovindu i begge faner", async () => {
  rader = [okt()];
  const { stats, iup } = await beggeFaner();
  assert.equal(stats.volumMetadata?.vindu.fraDato, "2026-09-28T00:00:00.000Z");
  assert.equal(stats.volumMetadata?.vindu.tilDato, "2026-10-05T00:00:00.000Z");
  assert.equal(iup?.volumMetadata?.vindu.fraDato, "2026-09-04T00:00:00.000Z");
  assert.equal(iup?.volumMetadata?.vindu.tilDato, "2026-10-03T00:00:00.000Z");
  for (const meta of [stats.volumMetadata, iup?.volumMetadata]) {
    assert.ok(sporringer.some(q => q.gte.toISOString() === meta?.vindu.fraDato && q.lt.toISOString() === meta?.vindu.tilDato));
  }
});
