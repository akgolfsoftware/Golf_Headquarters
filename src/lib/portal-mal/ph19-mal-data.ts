/**
 * Datamodell og hjelpere for PH-19 Målsetninger i Precision Athletics.
 * Kilde: Claude Design arkiv/2026-09-30/playerhq/screens/PH-19.jsx og ui_kits/toppidrett/MalScreen.jsx
 */

export type PH19GoalCategory = "OUTCOME" | "PROCESS";

export type PH19Goal = {
  id: string;
  category: PH19GoalCategory;
  type: string;
  sentence: string;
  title: string;
  src: string;
  due: string;
  now: number;
  unit: string;
  target: number;
  pct: number;
  status: "on-track" | "behind" | "achieved" | "no-data";
  statusLabel: string;
  hasData: boolean;
};

export type PH19Milepael = {
  tittel: string;
  dato: string;
};

export type PH19MalData = {
  antall: number;
  antallResultat: number;
  antallProsess: number;
  goals: PH19Goal[];
  milepael: PH19Milepael | null;
};

const TYPE_KILDE_LABELS: Record<string, string> = {
  HCP_TARGET: "HCP-MÅL",
  ROUNDS_PER_MONTH: "RUNDER / SESONG",
  SG_AREA: "STROKES GAINED",
  SESSION_FREQUENCY: "TRENINGSØKTER",
  TEST_SCORE: "TEST",
  FREE_TEXT: "EGET MÅL",
};

export function hentKildeLabel(type: string): string {
  return TYPE_KILDE_LABELS[type] ?? "MÅL";
}

export function formatDatoKort(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDesimal(verdi: number, desimaler = 1): string {
  if (Number.isInteger(verdi)) return verdi.toString();
  return verdi.toFixed(desimaler).replace(".", ",");
}

export function beregnProsent(naa: number, maal: number, kategori: string): number {
  if (maal === 0) return 0;
  if (kategori === "HCP_TARGET") {
    // For HCP er lavere bedre
    if (naa <= maal) return 100;
    const diff = naa - maal;
    return Math.max(0, Math.min(100, Math.round((1 - diff / Math.max(1, naa)) * 100)));
  }
  return Math.max(0, Math.min(100, Math.round((naa / maal) * 100)));
}

export const SYNTETISKE_PH19_GOALS: PH19Goal[] = [
  {
    id: "syntetisk-1",
    category: "PROCESS",
    type: "TEST_SCORE",
    sentence: "Innen 31.10.2026 skal jeg treffe 7 av 10 innspill 50–100 m innenfor 4 m i test.",
    title: "Innspill 50–100 m presisjon",
    src: "TEST · TEAM NORWAY",
    due: "31.10.2026",
    now: 5,
    unit: "av 10",
    target: 7,
    pct: 71,
    status: "on-track",
    statusLabel: "På sporet",
    hasData: true,
  },
  {
    id: "syntetisk-2",
    category: "OUTCOME",
    type: "ROUNDS_PER_MONTH",
    sentence: "Spille minst 8 runder under 74 slag i nasjonale turneringer denne sesongen.",
    title: "Scoringssnitt i turnering",
    src: "TURNERING · SESONG 2026",
    due: "15.11.2026",
    now: 75.2,
    unit: "slag snitt",
    target: 74.0,
    pct: 85,
    status: "on-track",
    statusLabel: "Nær mål",
    hasData: true,
  },
  {
    id: "syntetisk-3",
    category: "PROCESS",
    type: "SESSION_FREQUENCY",
    sentence: "Gjennomføre 4 ukentlige styrke- og mobilitetsøkter for rotasjon og hofteledd.",
    title: "Fysisk grunntrening",
    src: "FYS-PLAN · UKE 39",
    due: "31.12.2026",
    now: 3,
    unit: "av 4 økter",
    target: 4,
    pct: 75,
    status: "on-track",
    statusLabel: "På sporet",
    hasData: true,
  },
];
