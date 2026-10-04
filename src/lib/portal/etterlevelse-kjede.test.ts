import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { TodaySession } from "@/app/portal/actions";
import { startOfWeek } from "@/lib/uke-helpers";

const NOW = new Date("2026-10-01T12:00:00Z");
const DAY = 86_400_000;
const rangeCalls: { id: string; start: Date; end: Date }[] = [];
let visible: TodaySession[] = [];
let playerAllowed = true;
let childApproved = true;
const player = {
  id: "player-test", name: "Testspiller", avatarUrl: null, hcp: null, dateOfBirth: null,
  guardianConsentGivenAt: NOW, homeClub: null, preferences: null, userStatus: "AKTIV", tier: "PRO",
  lastLoginAt: NOW, groupMemberships: [], enrollmentsAsPlayer: [], sgInputs: [], rounds: [],
  sessionRequestsAsPlayer: [], subscriptions: [], _count: { payments: 0 }, trainingPlans: [],
};
const emptyModel = { findMany: async () => [], findFirst: async () => null, findUnique: async () => null,
  groupBy: async () => [], count: async () => 0 };
const prisma = new Proxy({
  user: { ...emptyModel, findMany: async () => playerAllowed ? [player] : [],
    findFirst: async () => playerAllowed ? player : null, findUnique: async () => player },
  parentRelation: { ...emptyModel, findMany: async () => childApproved ? [{ id: "relation-test", child: player }] : [] },
}, { get(target, key) { return Reflect.get(target, key) ?? emptyModel; } });
mock.module("next/navigation", { namedExports: { redirect: () => { throw new Error("redirect"); }, notFound: () => { throw new Error("not found"); } } });
mock.module("@/lib/prisma", { namedExports: { prisma } });
mock.module("@/lib/portal/visible-session-range", { namedExports: {
  loadVisibleSessionRange: async (id: string, startISO: string, endISO: string) => {
    const start = new Date(startISO), end = new Date(endISO);
    rangeCalls.push({ id, start, end });
    assert.equal(id, "player-test", "aldri les en fremmed spiller etter scope-filteret");
    return visible.filter(s => s.startTime >= start && s.startTime < end);
  },
} });
mock.module("@/lib/admin/ukesrapport-deling", { namedExports: {
  hentSisteDeling: async () => ({ ukeStart: startOfWeek(new Date(NOW.getTime() - 7 * DAY)), deltAt: NOW, coachId: "coach-test" }),
} });
mock.module("@/lib/workbench/sg-gap", { namedExports: { beregnSgGap: async () => null } });
mock.module("@/lib/workbench/teknisk-plan-panel", { namedExports: { hentTekniskPanel: async () => null } });
mock.module("@/lib/workbench/fys-turnering-data", { namedExports: { loadFysTurneringWorkbenchData: async () => null } });

function session(id: string, days: number, minutes: number, status: TodaySession["status"], model: TodaySession["model"]): TodaySession {
  const startTime = new Date(NOW.getTime() - days * DAY);
  return { id, model, startTime, endTime: new Date(startTime.getTime() + minutes * 60_000),
    durationMin: minutes, status, title: "Syntetisk økt", pyramidArea: "TEK", practiceType: "BLOKK", sted: null,
    maalsetning: null, drills: [], href: "/portal/plan" };
}

test("spiller, foresatt, coach, stall, analyse, Workbench og planmotor viser samme fireukersprosent", async t => {
  t.mock.timers.enable({ apis: ["Date"], now: NOW });
  visible = [session("v2", 3, 30, "COMPLETED", "v2"), session("wb", 10, 60, "COMPLETED", "wb"),
    session("legacy", 20, 90, "PLANNED", "plan"), session("old", 29, 500, "COMPLETED", "wb"),
    session("future", -1, 500, "COMPLETED", "v2"), session("ongoing", 0, 60, "COMPLETED", "v2")];
  const { hentUkesdigest } = await import("./ukesdigest");
  const { hentForelderUkerapport } = await import("@/lib/forelder");
  const { hentUkesrapport } = await import("@/lib/admin/ukesrapport");
  const { loadComplianceData } = await import("@/lib/admin-compliance/compliance-data");
  const { loadStallen } = await import("@/lib/admin/stallen-data");
  const { lastSpiller360Hode } = await import("@/lib/admin-spiller/spiller360-data");
  const { hentTreningsanalyse } = await import("@/lib/portal-analyse/treningsanalyse-data");
  const { loadWorkbenchData } = await import("@/lib/workbench/load-workbench");
  const { hentPlayerSignals } = await import("@/lib/plan-engine/load-signals");
  const viewer = { id: "coach-test", role: "COACH" };
  const digest = await hentUkesdigest(player.id, NOW);
  assert.equal(digest.etterlevelseTekst, "50 %", "digestens delte uke endrer ikke etterlevelsesvinduet");
  assert.equal(digest.loggetMinutter, 90);
  assert.equal(digest.planlagtMinutter, 180);
  assert.equal((await hentForelderUkerapport("parent-test", player.id))?.etterlevelseTekst, "50 %");
  assert.equal((await hentUkesrapport({ id: player.id }, NOW))?.tall.find(x => x.key === "etterlevelse")?.verdi, "50 %");
  const compliance = await loadComplianceData({ viewer, now: NOW, windowDays: 365, periodLabel: "Gammelt filter", selectedPlayerId: "foreign-test" });
  assert.equal(compliance.windowDays, 28, "gammel URL kan ikke endre produktregelen");
  assert.equal(compliance.selectedPlayerId, player.id);
  assert.equal(compliance.panel?.pct, 50);
  assert.equal(compliance.panel?.totalDone, 90);
  assert.equal(compliance.panel?.totalPlanned, 180);
  assert.equal(compliance.stall[0].pct, 50);
  assert.equal(compliance.panel?.axes[0].pct, 50);
  assert.equal((await loadStallen(viewer, {})).rows[0].adhPct, 50);
  assert.equal((await lastSpiller360Hode(viewer, player.id))?.etterlevelse.pct, 50);
  assert.equal((await hentTreningsanalyse({ userId: player.id, fra: NOW, til: new Date(NOW.getTime() + DAY), now: NOW })).etterlevelsePct, 50,
    "reps-/øktfilteret endrer ikke etterlevelsens fireukersvindu");
  assert.equal((await loadWorkbenchData(player.id, 0, { viewer: "player" }))?.adherencePct, 50,
    "tom navigert uke skjuler ikke historisk etterlevelse");
  assert.equal((await loadWorkbenchData(player.id, 6, { viewer: "coach" }))?.adherencePct, 50,
    "coach-utkast og navigert framtidsuke inngår ikke i prosentgrunnlaget");
  assert.equal((await hentPlayerSignals(player.id, NOW)).adherencePct, 50);
  assert.ok(rangeCalls.some(c => c.start.getTime() === NOW.getTime() - 28 * DAY && c.end.getTime() === NOW.getTime()));
});

test("ingen forfalte minutter vises som ukjent, ikke som 0 %", async t => {
  t.mock.timers.enable({ apis: ["Date"], now: NOW });
  visible = [session("future-only", -1, 60, "COMPLETED", "wb")];
  const { hentUkesdigest } = await import("./ukesdigest");
  const { hentForelderUkerapport } = await import("@/lib/forelder");
  const { loadWorkbenchData } = await import("@/lib/workbench/load-workbench");
  assert.equal((await hentUkesdigest(player.id, NOW)).etterlevelseTekst, null);
  assert.equal((await hentForelderUkerapport("parent-test", player.id))?.etterlevelseTekst, null);
  assert.equal((await loadWorkbenchData(player.id))?.adherencePct, null);
  const { loadComplianceData } = await import("@/lib/admin-compliance/compliance-data");
  const noPlan = await loadComplianceData({ viewer: { id: "coach-test", role: "COACH" }, now: NOW, windowDays: 28, periodLabel: "" });
  assert.equal(noPlan.panel?.pct, null);
  assert.equal(noPlan.stall[0].pct, null);
  assert.equal(noPlan.cohortAvg, null);

});

test("coach uten spiller og foresatt uten godkjent barn leser ingen økter", async () => {
  playerAllowed = false;
  childApproved = false;
  rangeCalls.length = 0;
  const { loadComplianceData } = await import("@/lib/admin-compliance/compliance-data");
  const { lastSpiller360Hode } = await import("@/lib/admin-spiller/spiller360-data");
  const { hentForelderUkerapport } = await import("@/lib/forelder");
  assert.equal((await loadComplianceData({ viewer: { id: "unrelated-coach", role: "COACH" }, windowDays: 28, periodLabel: "" })).stall.length, 0);
  assert.equal(await lastSpiller360Hode({ id: "unrelated-coach", role: "COACH" }, player.id), null);
  assert.equal(await hentForelderUkerapport("unrelated-parent", player.id), null);
  assert.equal(rangeCalls.length, 0);
  playerAllowed = childApproved = true;
});
