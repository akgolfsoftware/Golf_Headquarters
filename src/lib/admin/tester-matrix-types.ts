/**
 * Typer for Tester-matrisen (/admin/tester).
 * Flyttet ut av tester-matrix-data.ts (ren mekanisk splitt, re-eksportert derfra).
 */

export type TesterAxis = "fys" | "tek" | "slag" | "spill" | "turn";
export type CellTone = "measured" | "untested";
export type DeltaTone = "up" | "down" | "flat";

export type CellBenchmark = {
  /** Kompakt badge-tekst: "PGA", "DPW/KFT", "CHA", "NOR", "JR", "SCR". */
  short: string;
  label: string;
  /** Posisjon i nivåstigen (0 = beste). */
  index: number;
  /** `false` når målingen ligger under Scratch-kravet. */
  achieved: boolean;
  /** Hele nivåstigen som flerlinjers tooltip-tekst. */
  ladder: string;
};

export type MatrixCell = {
  tone: CellTone;
  /** Formatert måleverdi, f.eks. "54", "1,78", "72 %". `null` når ikke testet. */
  value: string | null;
  delta: { text: string; tone: DeltaTone } | null;
  /** Relativ dato, f.eks. "14 d", "i går". `null` når ikke testet. */
  when: string | null;
  /** Lenke til måle-detalj (TestResult) når den finnes. */
  href: string | null;
  /** Beste oppnådde nivå mot DataGolf-fasit. `null` når testen mangler benchmarks. */
  benchmark: CellBenchmark | null;
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
