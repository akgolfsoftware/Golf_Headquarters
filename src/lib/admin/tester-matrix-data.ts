/**
 * Data-loader for AgencyOS Tester-matrise (/admin/tester).
 *
 * Bygger en ekte spillere × tester ytelse-matrise fra Prisma:
 *   - Rader  = PLAYER-brukere (testede spillere først)
 *   - Kolonner = TestDefinition-er som har minst én registrert måling
 *   - Celle  = siste TestResult + delta vs forrige + relativ dato
 *
 * Nivå-fargekoding (DataGolf-fasiter v1):
 *   Tester seedet med `protocol.benchmarks` (zod-validert i test-benchmarks.ts)
 *   får beregnet beste oppnådde nivå per målt celle (retningsbevisst mot
 *   nivåstigen PGA topp 40 → Scratch) — vises som kompakt nivå-badge.
 *   Tester UTEN benchmarks beholder nøytral "målt"-tilstand, og `noTargets`
 *   settes kun når INGEN tester har benchmarks (fallback for gammel DB-state).
 *   Retning/enhet hentes fra benchmarks når de finnes, ellers utledes de ærlig
 *   fra `protocol.scoringMode` / `protocol.unit` / `scoringRule`-tekst.
 */

import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import {
  DISPLAY_UNIT,
  achievedLevel,
  ladderText,
  parseBenchmarks,
  type Benchmarks,
} from "./test-benchmarks";
import {
  formatDelta,
  formatScore,
  initials,
  relativeWhen,
  shortClub,
  unitAndDirection,
  unitLineFor,
} from "./tester-matrix-format";

import type {
  CellBenchmark,
  DeltaTone,
  MatrixCell,
  MatrixColumn,
  MatrixRow,
  GroupFilter,
  TesterAxis,
  TesterMatrixData,
} from "./tester-matrix-types";

// Re-eksport så eksisterende importer fra denne fila fortsatt virker.
export type {
  CellBenchmark,
  CellTone,
  DeltaTone,
  GroupFilter,
  MatrixCell,
  MatrixColumn,
  MatrixRow,
  TesterAxis,
  TesterMatrixData,
  TrendSummary,
} from "./tester-matrix-types";

const AXIS_MAP: Record<PyramidArea, TesterAxis> = {
  FYS: "fys",
  TEK: "tek",
  SLAG: "slag",
  SPILL: "spill",
  TURN: "turn",
};

/** Enhet + retning: benchmarks vinner når de finnes, ellers ærlig utledning. */
function resolveUnitDirection(
  bm: Benchmarks | undefined,
  protocol: unknown,
  scoringRule: string,
): { unit: string; lowerBetter: boolean } {
  if (bm) return { unit: DISPLAY_UNIT[bm.unit], lowerBetter: bm.direction === "lower" };
  return unitAndDirection(protocol, scoringRule);
}

/** Nivå-badge for en målt verdi, eller `null` når testen mangler benchmarks. */
function cellBenchmark(bm: Benchmarks | undefined, score: number): CellBenchmark | null {
  if (!bm) return null;
  const lvl = achievedLevel(bm, score);
  const ladder = ladderText(bm);
  if (!lvl) {
    return { short: "U/SCR", label: "Under Scratch-nivå", index: bm.levels.length, achieved: false, ladder };
  }
  return { short: lvl.short, label: lvl.label, index: lvl.index, achieved: true, ladder };
}

export async function loadTesterMatrix(): Promise<TesterMatrixData> {
  const now = new Date();

  const [players, testDefs, results] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER", deletedAt: null },
      select: { id: true, name: true, homeClub: true, hcp: true, tier: true },
      orderBy: { name: "asc" },
    }),
    prisma.testDefinition.findMany({
      select: {
        id: true,
        name: true,
        pyramidArea: true,
        scoringRule: true,
        protocol: true,
      },
      orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
    }),
    prisma.testResult.findMany({
      select: { id: true, userId: true, testId: true, score: true, takenAt: true },
      orderBy: { takenAt: "asc" }, // eldst → nyest, så vi enkelt finner siste + forrige
    }),
  ]);

  // Grupper resultater per (player, test), bevarer kronologisk rekkefølge.
  const byKey = new Map<string, { score: number; takenAt: Date; id: string }[]>();
  const testsWithResults = new Set<string>();
  for (const r of results) {
    const key = `${r.userId}::${r.testId}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push({ score: r.score, takenAt: r.takenAt, id: r.id });
    testsWithResults.add(r.testId);
  }

  // Benchmarks per test (zod-validert fra protocol-JSON). Tom map = ingen fasiter seedet.
  const benchmarksByTest = new Map<string, Benchmarks>();
  for (const t of testDefs) {
    const bm = parseBenchmarks(t.protocol);
    if (bm) benchmarksByTest.set(t.id, bm);
  }

  // Kolonner = tester som faktisk har minst én måling (ellers blir matrisen tom-støy).
  const columnsRaw = testDefs.filter((t) => testsWithResults.has(t.id));
  const lowerBetterByTest = new Map<string, boolean>();
  const columns: MatrixColumn[] = columnsRaw.map((t) => {
    const { unit, lowerBetter } = resolveUnitDirection(
      benchmarksByTest.get(t.id),
      t.protocol,
      t.scoringRule,
    );
    lowerBetterByTest.set(t.id, lowerBetter);
    const measuredCount = players.reduce(
      (acc, p) => acc + (byKey.has(`${p.id}::${t.id}`) ? 1 : 0),
      0,
    );
    return {
      testId: t.id,
      axis: AXIS_MAP[t.pyramidArea],
      name: t.name,
      unitLine: unitLineFor(unit, lowerBetter),
      measuredCount,
    };
  });

  // Per-test enhet (for KPI-snitt-formatering).
  const unitByTest = new Map<string, string>();
  for (const t of columnsRaw) {
    unitByTest.set(
      t.id,
      resolveUnitDirection(benchmarksByTest.get(t.id), t.protocol, t.scoringRule).unit,
    );
  }

  // Bygg rader.
  let measurementCount = 0;
  let missingCountTotal = 0;
  const rowsUnsorted: MatrixRow[] = players.map((p, idx) => {
    let rowMissing = 0;
    let rowMeasured = 0;
    const cells: MatrixCell[] = columns.map((col) => {
      const hist = byKey.get(`${p.id}::${col.testId}`);
      if (!hist || hist.length === 0) {
        rowMissing += 1;
        return { tone: "untested", value: null, delta: null, when: null, href: null, benchmark: null };
      }
      rowMeasured += 1;
      const last = hist[hist.length - 1];
      const prev = hist.length >= 2 ? hist[hist.length - 2] : null;
      const delta = prev
        ? {
            text: formatDelta(last.score - prev.score),
            tone: deltaTone(last.score, prev.score, lowerBetterByTest.get(col.testId) ?? false),
          }
        : null;
      return {
        tone: "measured",
        value: formatScore(last.score),
        delta,
        when: relativeWhen(last.takenAt, now),
        href: `/admin/tester/${last.id}`,
        benchmark: cellBenchmark(benchmarksByTest.get(col.testId), last.score),
      };
    });
    measurementCount += rowMeasured;
    missingCountTotal += rowMissing;

    const group = shortClub(p.homeClub);
    const hcpPart = p.hcp != null ? ` · HCP ${formatScore(p.hcp)}` : "";
    const sub =
      rowMeasured > 0
        ? `${rowMeasured} AV ${columns.length} TESTER${hcpPart.toUpperCase()}`
        : `INGEN MÅLINGER${hcpPart.toUpperCase()}`;

    return {
      playerId: p.id,
      initials: initials(p.name),
      name: p.name,
      avatarTone: rowMeasured > 0 ? "primary" : idx % 5 === 0 ? "accent" : "default",
      sub,
      group,
      missingCount: rowMissing,
      cells,
      tildelHref: `/admin/tester/tildel/${p.id}`,
    };
  });

  // Testede spillere først, deretter alfabetisk.
  const rows = rowsUnsorted.sort((a, b) => {
    const am = a.cells.filter((c) => c.tone === "measured").length;
    const bm = b.cells.filter((c) => c.tone === "measured").length;
    if (am !== bm) return bm - am;
    return a.name.localeCompare(b.name, "nb");
  });

  // Gruppe-filtre fra homeClub (ekte).
  const groupCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.group) groupCounts.set(r.group, (groupCounts.get(r.group) ?? 0) + 1);
  }
  const groups: GroupFilter[] = [
    { label: "ALLE", count: rows.length },
    ...Array.from(groupCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count })),
  ];

  // Bunn-KPI: gruppe-snitt per test (siste verdi per spiller).
  const groupAverages = columns.map((col) => {
    const vals: number[] = [];
    for (const p of players) {
      const hist = byKey.get(`${p.id}::${col.testId}`);
      if (hist && hist.length > 0) vals.push(hist[hist.length - 1].score);
    }
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return {
      testId: col.testId,
      name: col.name,
      avg: vals.length > 0 ? formatScore(avg) : "—",
      unit: unitByTest.get(col.testId) ?? "",
    };
  });

  // Trender: tell spillere etter retning på siste delta (på tvers av tester).
  let improving = 0;
  let flat = 0;
  let declining = 0;
  for (const p of players) {
    let up = 0;
    let down = 0;
    for (const col of columns) {
      const hist = byKey.get(`${p.id}::${col.testId}`);
      if (!hist || hist.length < 2) continue;
      const diff = hist[hist.length - 1].score - hist[hist.length - 2].score;
      const { unitLine } = col;
      const lowerBetter = unitLine.includes("LAVERE");
      const better = lowerBetter ? diff < 0 : diff > 0;
      const worse = lowerBetter ? diff > 0 : diff < 0;
      if (better) up += 1;
      else if (worse) down += 1;
    }
    if (up === 0 && down === 0) continue; // ingen sammenlignbar historikk
    if (up > down) improving += 1;
    else if (down > up) declining += 1;
    else flat += 1;
  }

  return {
    rows,
    columns,
    groups,
    playerCount: players.length,
    testCount: columns.length,
    measurementCount,
    missingCount: missingCountTotal,
    groupAverages,
    trends: { improving, flat, declining },
    // Fallback: kun når INGEN tester har benchmarks (f.eks. før seed er kjørt).
    noTargets: benchmarksByTest.size === 0,
  };
}

/** Retningsbevisst tone: "up" betyr alltid forbedring, "down" alltid forverring. */
function deltaTone(curr: number, prev: number, lowerBetter: boolean): DeltaTone {
  if (curr === prev) return "flat";
  const better = lowerBetter ? curr < prev : curr > prev;
  return better ? "up" : "down";
}
