/**
 * Kilde: AK Golf Precision Athletics PH-26 (Utenfor banen).
 * Hjelpefunksjoner og modeller for FYS, utfordringer, putte-lab, turneringer og ukesdigest.
 */

export interface FysOvelse {
  navn: string;
  mengde: string; // f.eks. "4 × 6 @ 40 kg" eller "10 min"
  rir: string;    // f.eks. "RIR 2" eller "Bevegelighet"
}

export const DEFAULT_FYS_OVELSER: FysOvelse[] = [
  { navn: "Oppvarming · mobilitet", mengde: "10 min", rir: "Bevegelighet" },
  { navn: "Knebøy", mengde: "4 × 6 @ 40 kg", rir: "RIR 2" },
  { navn: "Rumensk markløft", mengde: "3 × 8 @ 30 kg", rir: "RIR 3" },
  { navn: "Utfall med rotasjon", mengde: "3 × 8 per side", rir: "RIR 3" },
  { navn: "Pallof press", mengde: "3 × 10 per side", rir: "RIR 2" },
];

export interface ChallengeDeltaker {
  name: string;
  score: number | null;
  rank?: number | null;
}

export interface ChallengeDef {
  id: string;
  title: string;
  status: "Aktiv" | "Avsluttet";
  win: "hi" | "lo";
  unit: string;
  ends: string;
  by: string;
  rows: [string, number | null][];
}

/** Rangerer deltakere i en utfordring etter høyeste eller laveste score. */
export function rankChallengeRows(
  rows: [string, number | null][],
  win: "hi" | "lo" = "hi",
): ChallengeDeltaker[] {
  const completed = rows
    .filter((r): r is [string, number] => r[1] !== null && r[1] !== undefined)
    .sort((a, b) => (win === "hi" ? b[1] - a[1] : a[1] - b[1]));

  return rows
    .map(([name, score]) => {
      let rank: number | null = null;
      if (score !== null && score !== undefined) {
        rank = completed.findIndex((x) => x[0] === name) + 1;
      }
      return { name, score, rank };
    })
    .sort((a, b) => (a.rank || 999) - (b.rank || 999));
}

export interface PuttLabBand {
  avstandFt: number;
  minProsent: number | null;
  pgaProsent: number;
  antallPutter: number;
}

export const PGA_PUTT_BANDS: PuttLabBand[] = [
  { avstandFt: 3, minProsent: 96, pgaProsent: 99, antallPutter: 48 },
  { avstandFt: 5, minProsent: 78, pgaProsent: 81, antallPutter: 36 },
  { avstandFt: 10, minProsent: 42, pgaProsent: 43, antallPutter: 40 },
  { avstandFt: 15, minProsent: 24, pgaProsent: 26, antallPutter: 28 },
  { avstandFt: 20, minProsent: 16, pgaProsent: 18, antallPutter: 25 },
  { avstandFt: 25, minProsent: 11, pgaProsent: 12, antallPutter: 20 },
];

/** Beregner break i cm basert på greenhastighet (stimp), avstand (fot) og helning (prosent). */
export function beregnBreakCm(stimp: number, avstandFt: number, helningProsent: number): number {
  const k = stimp / 10;
  return Math.round(0.55 * avstandFt * helningProsent * k);
}

export interface TurneringsRad {
  id: string;
  dato: string;
  navn: string;
  type: string;
  status: "Påmeldt" | "Ikke påmeldt";
}

export interface UkesdigestData {
  ukeNr: number;
  treningstimerFaktisk: number;
  treningstimerPlanlagt: number;
  okterFaktisk: number;
  okterPlanlagt: number;
  runderSpilt: number;
  sgTotal: number | null;
  bestePrestasjon: string;
  kilde: string;
}
