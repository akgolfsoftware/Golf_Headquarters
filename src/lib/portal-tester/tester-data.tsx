/**
 * Data-loader for PlayerHQ · Tren · Tester (/portal/tren/tester).
 *
 * Henter ekte Prisma-data (TestResult, TestDefinition, TestSession) for én
 * spiller og mapper til props for tester-skjermen. Porten av
 * public/design-handover/playerhq/components-test-week.html — men
 * mobile-first og uten fabrikerte tall.
 *
 * Tre baselines per test (jf. design-prinsipp): NÅ (siste resultat),
 * FORRIGE (nest-siste), TREND (3+ sykluser sparkline). Kohort-snitt finnes
 * ikke i schemaet og utelates bevisst — aldri falske benchmark-tall.
 */

import { prisma } from "@/lib/prisma";
import type { PyramidArea, TestSessionStatus } from "@/generated/prisma/client";

export type Axis = "fys" | "tek" | "slag" | "spill" | "turn";

const AREA_TIL_AXIS: Record<PyramidArea, Axis> = {
  FYS: "fys",
  TEK: "tek",
  SLAG: "slag",
  SPILL: "spill",
  TURN: "turn",
};

export const AXIS_LABEL: Record<Axis, string> = {
  fys: "Fysisk",
  tek: "Teknisk",
  slag: "Slagteknikk",
  spill: "Spillforståelse",
  turn: "Turneringsmodus",
};

/** Verdikt-flagg — kun signalfunksjon (mennesket tar avgjørelsen). */
export type Verdict = "gain" | "hold" | "drop" | "signal" | "new";

export type TestRow = {
  id: string;
  name: string;
  axis: Axis;
  /** Kort kontekst (scoringRule trimmet). */
  rule: string;
  /** Siste resultat formatert (uten enhet — schemaet har ingen). */
  latest: string | null;
  latestRaw: number | null;
  /** Dato for siste resultat. */
  latestDate: string | null;
  /** Endring vs forrige resultat, fortegns-formatert. */
  delta: { text: string; tone: "pos" | "neg" | "flat" } | null;
  /** Antall registrerte forsøk. */
  attempts: number;
  /** Eldste→nyeste score for sparkline (min. 2 punkter for linje). */
  history: number[];
  /** Lavere score = bedre (utledet fra scoringRule). */
  lowerIsBetter: boolean;
  verdict: Verdict;
  href: string;
};

export type AxisGroup = {
  axis: Axis;
  label: string;
  done: number;
  total: number;
  rows: TestRow[];
};

export type PlannedTest = {
  id: string;
  name: string;
  axis: Axis;
  /** "PÅGÅR" (IN_PROGRESS) eller "PLANLAGT". */
  state: "ongoing" | "planned";
  /** Steg-progresjon for pågående økt, ellers null. */
  step: { current: number; total: number } | null;
  when: string | null;
  href: string;
};

export type TesterScreenData = {
  playerName: string;
  playerInitials: string;
  hcp: number | null;
  isPro: boolean;
  /** Totalt antall tester i spillerens univers. */
  totalTests: number;
  /** Antall tester med minst ett resultat. */
  testedCount: number;
  /** Totale forsøk på tvers av alle tester. */
  totalAttempts: number;
  lastResultLabel: string | null;
  /** Pyramide-grupper i fast rekkefølge fys→turn. */
  groups: AxisGroup[];
  planned: PlannedTest[];
  /** Pågående økt for banner (første IN_PROGRESS), ellers null. */
  active: PlannedTest | null;
};

const MND_KORT = [
  "jan", "feb", "mar", "apr", "mai", "jun",
  "jul", "aug", "sep", "okt", "nov", "des",
];

function initials(name: string | null | undefined): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function dateLabel(d: Date): string {
  return `${d.getDate()}. ${MND_KORT[d.getMonth()]}`;
}

function isToday(d: Date, now: Date): boolean {
  return d.toDateString() === now.toDateString();
}

/** Norsk tall-format: maks 2 desimaler, komma som desimalskille. */
function fmtNum(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString("nb-NO", { maximumFractionDigits: 2 });
}

/** Heuristikk: scoringRule som beskriver tid/avvik/spredning = lavere er bedre. */
function deriveLowerIsBetter(scoringRule: string): boolean {
  const t = scoringRule.toLowerCase();
  return /(spredning|avvik|sekund|\bsek\b|\bs\b|\btid\b|dispersion|spread|deviation|sideavvik|laser)/.test(
    t,
  );
}

const AXIS_REKKEFOLGE: Axis[] = ["fys", "tek", "slag", "spill", "turn"];

export async function loadTesterScreen(user: {
  id: string;
  name: string | null;
  hcp: number | null;
  tier: string;
}): Promise<TesterScreenData> {
  const now = new Date();

  const [definitions, results, sessions] = await Promise.all([
    // Spillerens test-univers: standard + egne + delt med akademi/coach-godkjent.
    prisma.testDefinition.findMany({
      where: {
        OR: [
          { isCustom: false },
          { createdById: user.id },
          { isCustom: true, visibility: "ACADEMY" },
          { isCustom: true, isCoachApproved: true },
        ],
      },
      select: { id: true, name: true, pyramidArea: true, scoringRule: true },
      orderBy: { name: "asc" },
    }),
    prisma.testResult.findMany({
      where: { userId: user.id },
      select: { id: true, testId: true, score: true, takenAt: true },
      orderBy: { takenAt: "asc" },
    }),
    prisma.testSession.findMany({
      where: { userId: user.id, status: { in: ["IN_PROGRESS"] } },
      select: {
        id: true,
        testId: true,
        status: true,
        currentStepIndex: true,
        startedAt: true,
        test: { select: { name: true, pyramidArea: true, protocol: true } },
      },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  // Resultater gruppert per test, eldste→nyeste (input er allerede asc).
  const resultsByTest = new Map<string, { score: number; takenAt: Date }[]>();
  for (const r of results) {
    const arr = resultsByTest.get(r.testId) ?? [];
    arr.push({ score: r.score, takenAt: r.takenAt });
    resultsByTest.set(r.testId, arr);
  }

  // ── Bygg test-rader ─────────────────────────────────────
  const rowsByAxis = new Map<Axis, TestRow[]>();
  for (const a of AXIS_REKKEFOLGE) rowsByAxis.set(a, []);

  let testedCount = 0;
  let totalAttempts = 0;
  let lastResultDate: Date | null = null;

  for (const def of definitions) {
    const axis = AREA_TIL_AXIS[def.pyramidArea];
    const lowerIsBetter = deriveLowerIsBetter(def.scoringRule);
    const hist = resultsByTest.get(def.id) ?? [];
    const attempts = hist.length;
    totalAttempts += attempts;
    if (attempts > 0) {
      testedCount += 1;
      const lastTaken = hist[hist.length - 1].takenAt;
      if (!lastResultDate || lastTaken > lastResultDate) lastResultDate = lastTaken;
    }

    const last = attempts > 0 ? hist[hist.length - 1] : null;
    const prev = attempts > 1 ? hist[hist.length - 2] : null;

    let delta: TestRow["delta"] = null;
    let verdict: Verdict = "new";
    if (last && prev) {
      const raw = last.score - prev.score;
      const improved = lowerIsBetter ? raw < 0 : raw > 0;
      const worsened = lowerIsBetter ? raw > 0 : raw < 0;
      const sign = raw > 0 ? "+" : raw < 0 ? "−" : "±";
      delta = {
        text: `${sign}${fmtNum(Math.abs(raw))}`,
        tone: improved ? "pos" : worsened ? "neg" : "flat",
      };
      verdict = improved ? "gain" : worsened ? "drop" : "hold";
    } else if (last) {
      verdict = "signal"; // første måling — baseline satt
    }

    const row: TestRow = {
      id: def.id,
      name: def.name,
      axis,
      rule: def.scoringRule.trim(),
      latest: last ? fmtNum(last.score) : null,
      latestRaw: last ? last.score : null,
      latestDate: last ? dateLabel(last.takenAt) : null,
      delta,
      attempts,
      history: hist.map((h) => h.score),
      lowerIsBetter,
      verdict,
      href: `/portal/tren/tester/${def.id}`,
    };
    rowsByAxis.get(axis)!.push(row);
  }

  // Sorter rader: tatt (nyeste først) før utatte, innen hver akse.
  for (const arr of rowsByAxis.values()) {
    arr.sort((a, b) => {
      if (a.attempts > 0 !== b.attempts > 0) return a.attempts > 0 ? -1 : 1;
      return a.name.localeCompare(b.name, "nb-NO");
    });
  }

  const groups: AxisGroup[] = AXIS_REKKEFOLGE.map((axis) => {
    const rows = rowsByAxis.get(axis)!;
    return {
      axis,
      label: AXIS_LABEL[axis],
      done: rows.filter((r) => r.attempts > 0).length,
      total: rows.length,
      rows,
    };
  });

  // ── Pågående / planlagte økter ──────────────────────────
  const planned: PlannedTest[] = sessions.map((s) => {
    const proto = s.test.protocol;
    let stepTotal = 0;
    if (proto && typeof proto === "object" && !Array.isArray(proto)) {
      const steps = (proto as Record<string, unknown>).steps;
      if (Array.isArray(steps)) stepTotal = steps.length;
    }
    const state: PlannedTest["state"] =
      s.status === ("IN_PROGRESS" as TestSessionStatus) ? "ongoing" : "planned";
    return {
      id: s.id,
      name: s.test.name,
      axis: AREA_TIL_AXIS[s.test.pyramidArea],
      state,
      step: stepTotal > 0 ? { current: s.currentStepIndex + 1, total: stepTotal } : null,
      when: isToday(s.startedAt, now)
        ? "i dag"
        : `${dateLabel(s.startedAt)}`,
      href: `/portal/tren/tester/${s.testId}`,
    };
  });

  const active = planned.find((p) => p.state === "ongoing") ?? null;

  return {
    playerName: user.name ?? "Spiller",
    playerInitials: initials(user.name),
    hcp: user.hcp ?? null,
    isPro: user.tier === "PRO",
    totalTests: definitions.length,
    testedCount,
    totalAttempts,
    lastResultLabel: lastResultDate
      ? `${lastResultDate.getDate()}. ${MND_KORT[lastResultDate.getMonth()]} ${lastResultDate.getFullYear()}`
      : null,
    groups,
    planned,
    active,
  };
}
