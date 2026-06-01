/**
 * Data-loader for AgencyOS Tester-matrise (/admin/tester).
 *
 * Bygger en ekte spillere × tester ytelse-matrise fra Prisma:
 *   - Rader  = PLAYER-brukere (testede spillere først)
 *   - Kolonner = TestDefinition-er som har minst én registrert måling
 *   - Celle  = siste TestResult + delta vs forrige + relativ dato
 *
 * VIKTIG om mål/fargekoding (over/nær/under):
 *   TestDefinition har INGEN strukturert numerisk mål-kolonne. `scoringRule` er
 *   fritekst og `protocol.baselineNormal` er null for alle tester i databasen.
 *   Vi finner derfor IKKE opp mål — målte celler vises i en nøytral "målt"-tilstand
 *   (verdi + delta + dato), og ikke-testede celler vises som skravert tom-tilstand.
 *   Retning (høyere/lavere bedre) og enhet utledes ærlig fra `protocol.scoringMode`
 *   / `protocol.unit` / `scoringRule`-tekst — disse finnes reelt.
 */

import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";

export type TesterAxis = "fys" | "tek" | "slag" | "spill" | "turn";
export type CellTone = "measured" | "untested";
export type DeltaTone = "up" | "down" | "flat";

export type MatrixCell = {
  tone: CellTone;
  /** Formatert måleverdi, f.eks. "54", "1,78", "72 %". `null` når ikke testet. */
  value: string | null;
  delta: { text: string; tone: DeltaTone } | null;
  /** Relativ dato, f.eks. "14 d", "i går". `null` når ikke testet. */
  when: string | null;
  /** Lenke til måle-detalj (TestResult) når den finnes. */
  href: string | null;
};

export type MatrixColumn = {
  testId: string;
  axis: TesterAxis;
  name: string;
  /** Enhet + retning, f.eks. "MPH · HØYERE BEDRE". */
  unitLine: string;
  /** Antall målinger for denne testen (på tvers av synlige spillere). */
  measuredCount: number;
};

export type MatrixRow = {
  playerId: string;
  initials: string;
  name: string;
  avatarTone: "default" | "primary" | "accent";
  /** Sekundær linje, f.eks. "GFGK · HCP 4,2" eller "INGEN MÅLINGER". */
  sub: string;
  group: string | null;
  /** Antall manglende/ikke-testede celler i denne raden. */
  missingCount: number;
  cells: MatrixCell[];
  tildelHref: string;
};

export type GroupFilter = { label: string; count: number };

export type TrendSummary = { improving: number; flat: number; declining: number };

export type TesterMatrixData = {
  rows: MatrixRow[];
  columns: MatrixColumn[];
  groups: GroupFilter[];
  /** Header-tall. */
  playerCount: number;
  testCount: number;
  measurementCount: number;
  missingCount: number;
  /** Bunn-KPI: gruppe-snitt (per test) + trender. */
  groupAverages: { testId: string; name: string; avg: string; unit: string }[];
  trends: TrendSummary;
  /** Datagap-flagg — settes når mål-fargekoding ikke er mulig. */
  noTargets: boolean;
};

const AXIS_MAP: Record<PyramidArea, TesterAxis> = {
  FYS: "fys",
  TEK: "tek",
  SLAG: "slag",
  SPILL: "spill",
  TURN: "turn",
};

function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** "Gamle Fredrikstad Golfklubb" → "GFGK"-aktig kort form for chip. */
function shortClub(club: string | null): string | null {
  if (!club) return null;
  const t = club.trim();
  if (!t) return null;
  if (/fredrikstad/i.test(t)) return "GFGK";
  // Initialer av de første ordene (maks 4 tegn).
  const init = t
    .split(/\s+/)
    .filter((w) => /[a-zA-ZæøåÆØÅ]/.test(w))
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 4);
  return init || t.slice(0, 4).toUpperCase();
}

function formatScore(n: number): string {
  // Heltall uten desimal, ellers én desimal med komma (norsk).
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1).replace(".", ",");
}

function formatDelta(diff: number): string {
  const abs = Math.abs(diff);
  const s = Number.isInteger(abs) ? String(abs) : abs.toFixed(1).replace(".", ",");
  if (diff > 0) return `+${s}`;
  if (diff < 0) return `−${s}`;
  return "±0";
}

function relativeWhen(d: Date, now: Date): string {
  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (days <= 0) return "i dag";
  if (days === 1) return "i går";
  return `${days} d`;
}

type ProtocolShape = { unit?: unknown; scoringMode?: unknown };

/** Utleder enhet + retning ÆRLIG fra protocol-JSON og scoringRule-tekst. */
function unitAndDirection(
  protocol: unknown,
  scoringRule: string,
): { unit: string; lowerBetter: boolean } {
  const p = (protocol ?? {}) as ProtocolShape;
  const mode = typeof p.scoringMode === "string" ? p.scoringMode.toLowerCase() : "";
  const rule = scoringRule.toLowerCase();

  // Retning fra scoringMode (mest pålitelig).
  let lowerBetter: boolean;
  if (["lowest", "pei", "average"].includes(mode)) lowerBetter = true;
  else if (["max", "hit-rate", "sum", "distance"].includes(mode)) lowerBetter = false;
  else {
    // Fallback: tekst-signaler ("lavere", "tid", "spredning", "avstand til hull").
    lowerBetter = /lavere|tid i sekunder|spredning|avstand til hull|standardavvik/.test(rule);
  }

  let unit = typeof p.unit === "string" && p.unit.trim() ? p.unit.trim() : "";
  if (!unit) {
    const m = rule.match(/\(([^)]+)\)/); // "Maks vekt (kg)" → "kg"
    if (m) unit = m[1].trim();
    else if (/prosent|sink/.test(rule)) unit = "%";
    else if (/sekunder|tid/.test(rule)) unit = "sek";
  }

  return { unit, lowerBetter };
}

function unitLineFor(unit: string, lowerBetter: boolean): string {
  const dir = lowerBetter ? "LAVERE BEDRE" : "HØYERE BEDRE";
  const u = unit ? unit.toUpperCase() : "VERDI";
  return `${u} · ${dir}`;
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

  // Kolonner = tester som faktisk har minst én måling (ellers blir matrisen tom-støy).
  const columnsRaw = testDefs.filter((t) => testsWithResults.has(t.id));
  const columns: MatrixColumn[] = columnsRaw.map((t) => {
    const { unit, lowerBetter } = unitAndDirection(t.protocol, t.scoringRule);
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
    unitByTest.set(t.id, unitAndDirection(t.protocol, t.scoringRule).unit);
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
        return { tone: "untested", value: null, delta: null, when: null, href: null };
      }
      rowMeasured += 1;
      const last = hist[hist.length - 1];
      const prev = hist.length >= 2 ? hist[hist.length - 2] : null;
      const delta = prev
        ? { text: formatDelta(last.score - prev.score), tone: deltaTone(last.score, prev.score) }
        : null;
      return {
        tone: "measured",
        value: formatScore(last.score),
        delta,
        when: relativeWhen(last.takenAt, now),
        href: `/admin/tester/${last.id}`,
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
    noTargets: true,
  };
}

function deltaTone(curr: number, prev: number): DeltaTone {
  if (curr > prev) return "up";
  if (curr < prev) return "down";
  return "flat";
}
