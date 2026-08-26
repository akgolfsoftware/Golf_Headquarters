/**
 * pei-beregning.ts — PEI-motoren (Proximity/Precision Efficiency Index),
 * høstet fra ak-golf-talenthq (shared/protocols/scorecard-compute.js,
 * `computeCell`s "pei"/"diff"/"tilMaal"-grener).
 *
 * PEI-FORMELEN (AVKLART med produkteier 2026-08-26): PEI er en prosent der
 * LAVERE er bedre.
 *
 *   PEI = resultat ÷ lengde
 *
 * IKKE `(Rand − avstand) ÷ Rand × 100` — den formelen finnes også i
 * talenthq-kildekoden (test-reference-data.ts, PEI_REF_FW/PEI_REF_BUNKER) men
 * er en konkurrerende, feilaktig formel og skal ALDRI brukes. Dette matcher
 * kommentaren i src/lib/portal-tester/test-scoring.ts: «PEI for ett slag =
 * nærhet ÷ lengde».
 *
 * Tre måter «lengde» og «resultat» kommer inn på i scorekortene (samme tre
 * grener som i talenthq sin computeCell):
 *   1. Fast preset-lengde (8-ball, banetester): PEI = resultat / radLengde.
 *   2. Dispersion (driver/inspill/wedge-variasjon, PEI-slagtester): spilleren
 *      taster carry + side, avstand til mål regnes ut, PEI = tilMål / mål.
 *   3. PEI Test Bane: spilleren taster lengdeInn og tilHull direkte,
 *      PEI = tilHull / lengdeInn.
 *
 * UFRAVIKELIG REGEL: denne modulen inneholder KUN PEI. Ingen funksjon her
 * tar inn eller returnerer Broadie-SG (broadie-sg-tabeller.ts) eller
 * DataGolf-tall — de er egne motorer og blandes aldri sammen i én rad/kort.
 */

/** PEI er en prosentandel der LAVERE tall er bedre prestasjon. */
export const PEI_LAVERE_ER_BEDRE = true as const;

/** Er `a` en bedre PEI-prestasjon enn `b`? (lavere er bedre) */
export function erPeiBedre(a: number, b: number): boolean {
  return a < b;
}

/** Avstand fra landingspunkt (carry, side) til mål — Pythagoras. */
export function avstandTilMal(mal: number, carry: number, side: number): number {
  const dy = mal - carry;
  const dx = side;
  return Math.sqrt(dy * dy + dx * dx);
}

/** «Lengde +/-»: hvor langt forbi (+) eller kort (−) målet slaget landet. */
export function avvikFraMal(carry: number, mal: number): number {
  return carry - mal;
}

/** Gren 1: fast preset-lengde (8-ball, banetester). PEI = resultat / radLengde. */
export function peiFraFastLengde(resultatMeter: number, radLengdeMeter: number): number | null {
  if (!radLengdeMeter) return null;
  return resultatMeter / radLengdeMeter;
}

/** Gren 2: dispersion — PEI = avstandTilMål / mål. */
export function peiFraAvstandTilMal(tilMalMeter: number, malMeter: number): number | null {
  if (!malMeter) return null;
  return tilMalMeter / malMeter;
}

/** Gren 3: PEI Test Bane — spilleren taster lengdeInn og tilHull direkte. */
export function peiFraInnLengdeOgTilHull(tilHullMeter: number, lengdeInnMeter: number): number | null {
  if (!lengdeInnMeter) return null;
  return tilHullMeter / lengdeInnMeter;
}

/**
 * Samlet PEI-utregning for én rad i et scorekort — velger riktig av de tre
 * grenene over ut fra hvilke felt raden faktisk har fylt ut. Speiler
 * rekkefølgen i talenthq sin `computeCell` (gren 3 → gren 2 → gren 1).
 */
export type PeiRadInput = {
  /** Gren 3 (PEI Test Bane): fritt tastet lengde inn til hullet. */
  lengdeInn?: number | null;
  /** Gren 3: fritt tastet avstand fra utslag til hull. */
  tilHull?: number | null;
  /** Gren 1/2: mål-avstanden for slaget (preset eller fritt tastet). */
  mal?: number | null;
  /** Gren 2: registrert carry. */
  carry?: number | null;
  /** Gren 2: registrert sideavvik (default 0). */
  side?: number | null;
  /** Gren 1: registrert resultat i meter fra hull (8-ball/banetester). */
  resultat?: number | null;
  /** Gren 1: radens faste lengde (fra protokollen, f.eks. EIGHT_BALL_LEN). */
  radLengde?: number | null;
};

export function beregnPeiForRad(input: PeiRadInput): number | null {
  const { lengdeInn, tilHull, mal, carry, side, resultat, radLengde } = input;

  if (lengdeInn != null || tilHull != null) {
    return lengdeInn && tilHull != null ? peiFraInnLengdeOgTilHull(tilHull, lengdeInn) : null;
  }
  if (mal != null) {
    if (carry == null) return null;
    const tilMaal = avstandTilMal(mal, carry, side ?? 0);
    return peiFraAvstandTilMal(tilMaal, mal);
  }
  if (resultat == null || !radLengde) return null;
  return peiFraFastLengde(resultat, radLengde);
}
