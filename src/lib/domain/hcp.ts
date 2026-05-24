/**
 * WHS-standard handicap-beregning.
 *
 * Algoritme:
 *  1. Beregn score-differensial for hvert oppgjør.
 *  2. Sorter stigende, ta 8 beste (laveste).
 *  3. Snitt av de 8 = handicap-indeks (HCP).
 *
 * Referanse: World Handicap System (WHS) 2020-specifikasjonen.
 */

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type HcpRunde = {
  /** Bruttoscore (antall slag) */
  score: number;
  /** Course Rating for banen (f.eks. 72.4) */
  courseRating: number;
  /** Slope Rating for banen (55–155, standard 113) */
  slope: number;
  /** Banens par */
  par: number;
};

export type HcpResultat = {
  /** Beregnet handicap-indeks. null = ingen runder. */
  hcp: number | null;
  /** Antall differensialer som ble brukt i snittet */
  beregnetAv: number;
  /** true = færre enn 8 runder → usikkert grunnlag */
  lavBeregning: boolean;
};

// ---------------------------------------------------------------------------
// Internfunksjoner
// ---------------------------------------------------------------------------

const STANDARD_SLOPE = 113;
const MIN_RUNDER_FULL = 8;

/**
 * Beregner score-differensial etter WHS-formelen:
 *   (score - courseRating) × 113 / slope
 */
function beregnDifferensial(runde: HcpRunde): number {
  return ((runde.score - runde.courseRating) * STANDARD_SLOPE) / runde.slope;
}

// ---------------------------------------------------------------------------
// Eksporterte funksjoner
// ---------------------------------------------------------------------------

/**
 * Beregner handicap-indeks fra et sett med runder (maks 20 brukes, resten ignoreres).
 */
export function beregnHcp(runder: HcpRunde[]): HcpResultat {
  if (runder.length === 0) {
    return { hcp: null, beregnetAv: 0, lavBeregning: false };
  }

  // Bruk siste 20
  const aktuelle = runder.slice(-20);
  const differensialer = aktuelle.map(beregnDifferensial);
  differensialer.sort((a, b) => a - b);

  const antallBeste = Math.min(MIN_RUNDER_FULL, differensialer.length);
  const beste = differensialer.slice(0, antallBeste);
  const hcp = beste.reduce((sum, d) => sum + d, 0) / beste.length;

  // Rund til 1 desimal (WHS-standard)
  const hcpAvrundet = Math.floor(hcp * 10) / 10;

  return {
    hcp: hcpAvrundet,
    beregnetAv: antallBeste,
    lavBeregning: aktuelle.length < MIN_RUNDER_FULL,
  };
}

/**
 * Formaterer handicap-indeks til norsk visningsformat.
 *
 * @example
 *   formaterHcp(-3.5) → "+3,5"
 *   formaterHcp(12.4) → "12,4"
 *   formaterHcp(null) → "—"
 */
export function formaterHcp(hcp: number | null): string {
  if (hcp === null) return "—";
  const abs = Math.abs(hcp).toFixed(1).replace(".", ",");
  // Plusshcp er negativ indeks (spilleren er bedre enn scratch)
  if (hcp < 0) return `+${abs}`;
  return abs;
}

/**
 * Klassifiserer spiller etter handicap-indeks.
 *
 * | Klasse | HCP-område      |
 * |--------|-----------------|
 * | PROF   | < 0             |
 * | ELITE  | 0 – 5,4         |
 * | MIDS   | 5,5 – 18,4      |
 * | HOY    | >= 18,5         |
 * | UKJENT | null            |
 */
export function vurderHcpKlasse(
  hcp: number | null
): "PROF" | "ELITE" | "MIDS" | "HOY" | "UKJENT" {
  if (hcp === null) return "UKJENT";
  if (hcp < 0) return "PROF";
  if (hcp <= 5.4) return "ELITE";
  if (hcp <= 18.4) return "MIDS";
  return "HOY";
}
