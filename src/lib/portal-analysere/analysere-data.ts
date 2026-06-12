/**
 * Data-loader for /portal/analysere — "Les tallene" (ph-screens.jsx · AnalyzeScreen).
 *
 * Én flate med faner: SG · Runder · TrackMan · Tester · Innsikt + sesong-header
 * (trend-graf + 4 KPI). Alt fra ekte Prisma (runder/SG/tester/insights/club-trend).
 * Tom-tilstand når data mangler — aldri liksom-tall.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { InsightCategory } from "@/generated/prisma/client";

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

export type InsightNarrativeData = {
  strip: "lime" | "pos" | "neg" | "warn" | "low";
  kicker: string;
  title: string;
  lede: string;
  rec: { eyebrow?: string; text: string; icon?: "lightbulb" | "hourglass" };
  footnote: string;
};

// Behold gammel type som alias for bakoverkompatibilitet
export type InnsiktKort = InsightNarrativeData;

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
  innsikt: InsightNarrativeData[];
};

const MND = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

function nb(n: number, des = 1, signed = false): string {
  return n.toLocaleString("nb-NO", { minimumFractionDigits: des, maximumFractionDigits: des, signDisplay: signed ? "exceptZero" : "auto" });
}
function snitt(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}
// ── Insight v10 mapper ──────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<InsightCategory, string> = {
  DISTANCE_GAPPING: "Distanse-gap",
  CONSISTENCY_LEAK: "Konsistens",
  TRAINING_GAP: "Trenings-gap",
  D_PLANE_DRIFT: "D-plane",
  STRIKE_QUALITY: "Strike",
  FATIGUE_PATTERN: "Fatigue",
  EQUIPMENT_FIT: "Utstyr",
  TEMPO_VARIANCE: "Tempo",
  PROGRESSION_TREND: "Fremgang",
  SAME_DISTANCE_OPPORTUNITY: "Mulighet",
};

const DEFAULT_REC: Record<InsightCategory, string> = {
  DISTANCE_GAPPING: "Juster køllebaggen slik at du har ett slag per 10-yards-intervall. Mål med TrackMan i rolig tempo.",
  CONSISTENCY_LEAK: "Logg tre TrackMan-økter med konsistens-fokus — mål avvik, ikke distanse.",
  TRAINING_GAP: "Prioriter en ekstra treningsøkt i denne kategorien neste uke — se plan for detaljer.",
  D_PLANE_DRIFT: "Ta en stikktreningsøkt med d-plane-fokus og mål kontakt-punkt per slag.",
  STRIKE_QUALITY: "Én økt med strike-fokus: 50 slag, alle med TrackMan-feedback på smash factor.",
  FATIGUE_PATTERN: "Sjekk treningsbelastningen mot plan og reduser volum med 20 % neste uke.",
  EQUIPMENT_FIT: "Ta kontakt med coach for en kølle-evaluering basert på ferskeste distanse-data.",
  TEMPO_VARIANCE: "Øv inn ett tempo-anker (pusteøvelse + 3 svinger) og bruk det konsekvent på banen.",
  PROGRESSION_TREND: "Hold kursen — fortsett plan som planlagt og evaluer igjen neste uke.",
  SAME_DISTANCE_OPPORTUNITY: "Identifiser din primærkølle for denne distansen og drill den konsekvent.",
};

function insightStrip(cat: InsightCategory, severity: number): InsightNarrativeData["strip"] {
  if (severity <= 1) return "low";
  if (cat === "PROGRESSION_TREND" || cat === "SAME_DISTANCE_OPPORTUNITY") return "pos";
  if (cat === "D_PLANE_DRIFT" || cat === "STRIKE_QUALITY" || cat === "FATIGUE_PATTERN") return "neg";
  if (cat === "TRAINING_GAP" || cat === "TEMPO_VARIANCE" || cat === "DISTANCE_GAPPING") return "warn";
  if (cat === "CONSISTENCY_LEAK") return severity >= 3 ? "warn" : "lime";
  return "lime";
}

function isoWeek(d: Date): number {
  const tmp = new Date(d.valueOf());
  tmp.setUTCHours(0, 0, 0, 0);
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const start = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp.valueOf() - start.valueOf()) / 86400000 + 1) / 7);
}

function relTime(d: Date): string {
  const h = Math.floor((Date.now() - d.getTime()) / 3600000);
  if (h < 1) return "nylig";
  if (h < 24) return `${h} t siden`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} d siden`;
  const weeks = Math.floor(days / 7);
  return `${weeks} uke${weeks === 1 ? "" : "r"} siden`;
}

function mapInsightToNarrative(i: {
  category: InsightCategory;
  severity: number;
  title: string;
  body: string;
  createdAt: Date;
}): InsightNarrativeData {
  const catLabel = CATEGORY_LABELS[i.category] ?? i.category;
  const kicker = `UKE ${isoWeek(i.createdAt)} · ${catLabel.toUpperCase()} · ${relTime(i.createdAt)}`;
  return {
    strip: insightStrip(i.category, i.severity),
    kicker,
    title: i.title,
    lede: i.body,
    rec: {
      text: DEFAULT_REC[i.category] ?? i.body,
      icon: i.severity <= 1 ? "hourglass" : "lightbulb",
    },
    footnote: `Alvorlighetsgrad ${i.severity}/5`,
  };
}

// ───────────────────────────────────────────────────────────────────────────

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
    prisma.sgInsight.findMany({ where: { userId }, orderBy: { severity: "desc" }, take: 4, select: { category: true, severity: true, title: true, body: true, createdAt: true } }).catch(() => []),
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

  // Innsikt — v10 narrativ format
  const innsikt: InsightNarrativeData[] = insights.map(mapInsightToNarrative);

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
