/**
 * Data-loader for /portal/analysere — "Les tallene" (ph-screens.jsx · AnalyzeScreen).
 *
 * Én flate med faner: SG · Runder · TrackMan · Tester · Innsikt + sesong-header
 * (trend-graf + 4 KPI). Alt fra ekte Prisma (runder/SG/tester/insights/club-trend).
 * Tom-tilstand når data mangler — aldri liksom-tall.
 */

import "server-only";
import { prisma } from "@/lib/prisma";

export type SgRad = { name: string; value: number };
export type AnalyseRunde = {
  id: string;
  dato: string;
  bane: string;
  score: string;
  topar: string;
  state: "done" | "best" | "soon";
  meta: string;
};
export type KolleRad = { club: string; total: string };
export type TestRad = { navn: string; dato: string; resultat: string; ok: boolean };
export type InnsiktKort = { tittel: string; body: string; tone: "pos" | "neg" | "neutral" };

export type AnalysereData = {
  hcp: string | null;
  kpi: {
    runder: string;
    snitt: string;
    snittTrend: { value: string; tone: "positive" | "negative" | "neutral" } | null;
    best: string;
    sgTotal: string;
    sgTotalTrend: { value: string; tone: "positive" | "negative" | "neutral" } | null;
  };
  /** Sesong-graf: SG-total per runde, kronologisk (eldst → nyest). */
  trend: number[];
  sg: SgRad[];
  runder: AnalyseRunde[];
  trackman: KolleRad[];
  tester: TestRad[];
  innsikt: InnsiktKort[];
};

const MND = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

function nb(n: number, des = 1, signed = false): string {
  return n.toLocaleString("nb-NO", { minimumFractionDigits: des, maximumFractionDigits: des, signDisplay: signed ? "exceptZero" : "auto" });
}
function snitt(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}
function deltaTrend(vals: number[], lavereErBedre: boolean, des = 1): AnalysereData["kpi"]["snittTrend"] {
  if (vals.length < 6) return null;
  const ny = snitt(vals.slice(0, Math.ceil(vals.length / 2)));
  const gml = snitt(vals.slice(Math.ceil(vals.length / 2)));
  if (ny == null || gml == null) return null;
  const d = ny - gml;
  const bedre = lavereErBedre ? d < 0 : d > 0;
  // Pil følger retning, fortegn-tall følger verdi, farge (tone) følger godhet.
  return { value: `${d <= 0 ? "↓" : "↑"} ${nb(d, des, true)}`, tone: bedre ? "positive" : "negative" };
}

export async function getAnalysereData(userId: string): Promise<AnalysereData> {
  const [user, runderRaw, insights, clubTrends, testResults, testDefs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { hcp: true } }),
    prisma.round.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
      select: { id: true, score: true, sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true, playedAt: true, course: { select: { name: true } } },
      take: 20,
    }).catch(() => []),
    prisma.sgInsight.findMany({ where: { userId }, orderBy: { severity: "desc" }, take: 4, select: { category: true, severity: true, title: true, body: true } }).catch(() => []),
    prisma.clubMetricTrend.findMany({ where: { userId }, orderBy: { weekStart: "desc" }, select: { club: true, avgTotal: true } }).catch(() => []),
    prisma.testResult.findMany({ where: { userId }, orderBy: { takenAt: "desc" }, take: 6, select: { testId: true, score: true, takenAt: true } }).catch(() => []),
    prisma.testDefinition.findMany({ select: { id: true, name: true } }).catch(() => []),
  ]);

  // KPI
  const scores = runderRaw.map((r) => r.score).filter((n): n is number => n != null);
  const sgTotals = runderRaw.map((r) => r.sgTotal).filter((n): n is number => n != null);
  const snittScore = snitt(scores);
  const bestScore = scores.length ? Math.min(...scores) : null;
  const sgSnitt = snitt(sgTotals);

  // SG-fordeling (snitt per kategori)
  const avgKat = (key: "sgOtt" | "sgApp" | "sgArg" | "sgPutt") =>
    snitt(runderRaw.map((r) => r[key]).filter((n): n is number => n != null)) ?? 0;
  const sg: SgRad[] = [
    { name: "Off the tee", value: Math.round(avgKat("sgOtt") * 100) / 100 },
    { name: "Approach", value: Math.round(avgKat("sgApp") * 100) / 100 },
    { name: "Around green", value: Math.round(avgKat("sgArg") * 100) / 100 },
    { name: "Putting", value: Math.round(avgKat("sgPutt") * 100) / 100 },
  ];

  // Trend (kronologisk eldst → nyest), siste 8
  const trend = [...sgTotals].reverse().slice(-8);

  // Runde-liste
  const runder: AnalyseRunde[] = runderRaw.slice(0, 6).map((r) => {
    const d = r.playedAt;
    const dato = `${d.getDate()}. ${MND[d.getMonth()]}`;
    const erBest = r.score != null && r.score === bestScore;
    const topar = r.score != null ? (r.score - 72 === 0 ? "E" : r.score - 72 > 0 ? `+${r.score - 72}` : `${r.score - 72}`) : "—";
    return {
      id: r.id,
      dato,
      bane: r.course?.name ?? "Ukjent bane",
      score: r.score != null ? String(r.score) : "—",
      topar,
      state: erBest ? "best" : "done",
      meta: `18 hull${r.sgTotal != null ? ` · SG ${nb(r.sgTotal, 1, true)}` : ""}`,
    };
  });

  // TrackMan: siste total per kølle (behold rekkefølge etter første forekomst)
  const seen = new Set<string>();
  const trackman: KolleRad[] = [];
  for (const c of clubTrends) {
    if (seen.has(c.club)) continue;
    seen.add(c.club);
    trackman.push({ club: c.club, total: `${Math.round(c.avgTotal)} m` });
  }

  // Tester
  const defMap = new Map(testDefs.map((d) => [d.id, d.name]));
  const tester: TestRad[] = testResults.map((t) => ({
    navn: defMap.get(t.testId) ?? "Test",
    dato: `${t.takenAt.getDate()}. ${MND[t.takenAt.getMonth()]}`,
    resultat: t.score != null ? nb(t.score, 0) : "—",
    ok: (t.score ?? 0) >= 70,
  }));

  // Innsikt
  const innsikt: InnsiktKort[] = insights.map((i) => ({
    tittel: i.title,
    body: i.body,
    tone: i.severity >= 4 ? "neg" : i.severity <= 2 ? "pos" : "neutral",
  }));

  return {
    hcp: user?.hcp != null ? nb(user.hcp, 1) : null,
    kpi: {
      runder: scores.length ? String(runderRaw.length) : "—",
      snitt: snittScore != null ? nb(snittScore, 1) : "—",
      snittTrend: deltaTrend(scores, true),
      best: bestScore != null ? String(bestScore) : "—",
      sgTotal: sgSnitt != null ? nb(sgSnitt, 2, true) : "—",
      sgTotalTrend: deltaTrend(sgTotals, false, 2),
    },
    trend,
    sg,
    runder,
    trackman,
    tester,
    innsikt,
  };
}
