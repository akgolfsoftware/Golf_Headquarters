/**
 * Styrkeprogram — WANGs 6-ukers belastningsberegning for golfspillere (FYS-søylen).
 *
 * Beregner ukentlig belastning (%1RM og reell kg) for baseløft:
 *   - Markløft (Trapbar Deadlift)
 *   - Benkpress
 *   - Knebøy
 *
 * Struktur:
 *   - Periode 1 (Uke 1–2): Grunnlag / tilvenning (3 sett)
 *   - Periode 2 (Uke 3–4): Oppbygging (3 sett)
 *   - Periode 3 (Uke 5–6): Topping / Bølge (wave loading, 6 sett)
 *
 * Nedtrappingsregel / Bygging:
 *   Hvis 1RM relativt til kroppsvekt er under terskelen:
 *     - Markløft / Knebøy: 1RM / kroppsvekt < 1,0
 *     - Benkpress: 1RM / kroppsvekt < 0,8
 *   erstattes bølgebelastningen i uke 5–6 med kontrollerte 3×5-sett.
 *   Hvis kroppsvekt mangler (null), kan ratio ikke vurderes, og bølgen beholdes.
 *
 * Kg-avrunding:
 *   Treningsvekter rundes til nærmeste 2,5 kg (standard skiveintervall).
 *
 * Rent domene — ingen Prisma-kall eller sideeffekter. Beregnes live ved visning.
 */

export type StyrkeloftKode = "MARKLOFT" | "BENKPRESS" | "KNEBOY";

export interface StyrkeSettBelastning {
  settNr: number;
  reps: number;
  belastningPst: number;
  belastningKg: number | null;
}

export interface EnUkersBelastning {
  /** Uke 1–6. */
  uke: number;
  /** Periode 1 (uke 1–2), Periode 2 (uke 3–4), Periode 3 (uke 5–6). */
  periode: 1 | 2 | 3;
  /** Ett sett per rad. */
  sett: StyrkeSettBelastning[];
  /** Sant hvis nedtrappingsregelen har erstattet bølgen (kun mulig uke 5–6). */
  erNedtrapping: boolean;
}

export interface StyrkeprogramInput {
  loft: StyrkeloftKode;
  /** Siste 1RM-testresultat (kg) for dette løftet. Null = kan ikke beregnes. */
  ettRepMaksKg: number | null;
  /** Siste kroppsvekt (kg) fra HealthEntry. Null = nedtrappingsregelen kan ikke vurderes. */
  kroppsvektKg: number | null;
}

/** Terskler for nedtrapping / volumbygging (1RM / kroppsvekt). */
export const NEDTRAPPING_TERSKLER: Record<StyrkeloftKode, number> = {
  MARKLOFT: 1.0,
  BENKPRESS: 0.8,
  KNEBOY: 1.0,
};

/** Mål-ratioer ved fullført videregående (WANG Toppidrett). */
export const MAL_RATIO_VG3: Record<StyrkeloftKode, number> = {
  MARKLOFT: 2.0,
  KNEBOY: 2.0,
  BENKPRESS: 1.7,
};

/** Standard progresjon: sett-maler for uke 1–4. */
const STANDARD_UKER_1_TIL_4: Record<number, { reps: number; pst: number }[]> = {
  1: [
    { reps: 8, pst: 70 },
    { reps: 8, pst: 72.5 },
    { reps: 6, pst: 75 },
  ],
  2: [
    { reps: 8, pst: 72.5 },
    { reps: 6, pst: 75 },
    { reps: 6, pst: 77.5 },
  ],
  3: [
    { reps: 6, pst: 75 },
    { reps: 5, pst: 77.5 },
    { reps: 5, pst: 80 },
  ],
  4: [
    { reps: 5, pst: 77.5 },
    { reps: 5, pst: 80 },
    { reps: 4, pst: 82.5 },
  ],
};

/** Bølgelastning (Wave loading) uke 5–6 når spilleren ikke trenger nedtrapping. */
const BOLGE_UKE_5: { reps: number; pst: number }[] = [
  { reps: 3, pst: 80 },
  { reps: 2, pst: 82.5 },
  { reps: 1, pst: 85 },
  { reps: 3, pst: 82.5 },
  { reps: 2, pst: 85 },
  { reps: 1, pst: 87.5 },
];

const BOLGE_UKE_6: { reps: number; pst: number }[] = [
  { reps: 3, pst: 82.5 },
  { reps: 2, pst: 85 },
  { reps: 1, pst: 87.5 },
  { reps: 3, pst: 85 },
  { reps: 2, pst: 87.5 },
  { reps: 1, pst: 90 },
];

/** Nedtrapping / kontrollert bygging for Markløft og Knebøy (< 1,0x kroppsvekt). */
const BYGG_MARKLOFT_KNEBOY: Record<5 | 6, { reps: number; pst: number }[]> = {
  5: [
    { reps: 5, pst: 78 },
    { reps: 5, pst: 80 },
    { reps: 5, pst: 82.5 },
  ],
  6: [
    { reps: 5, pst: 80 },
    { reps: 5, pst: 82.5 },
    { reps: 5, pst: 85 },
  ],
};

/** Nedtrapping / kontrollert bygging for Benkpress (< 0,8x kroppsvekt). */
const BYGG_BENKPRESS: Record<5 | 6, { reps: number; pst: number }[]> = {
  5: [
    { reps: 5, pst: 80 },
    { reps: 5, pst: 82.5 },
    { reps: 5, pst: 85 },
  ],
  6: [
    { reps: 5, pst: 82.5 },
    { reps: 5, pst: 85 },
    { reps: 5, pst: 87.5 },
  ],
};

/** Runder en belastning til nærmeste 2,5 kg. */
export function avrundVektKg(vektKg: number): number {
  return Math.round(vektKg / 2.5) * 2.5;
}

/**
 * Beregner estimert 1RM fra submaksimale tester (f.eks. 3RM eller 5RM)
 * ved bruk av Epley-formelen, avrundet til nærmeste 2,5 kg.
 *
 * Nyttig for juniorer og golfere der submaksimal testing er tryggere enn maksimal 1RM.
 */
export function beregnEstimert1RM(vektKg: number, reps: number): number {
  if (vektKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return avrundVektKg(vektKg);
  const estimat = vektKg * (1 + reps / 30);
  return avrundVektKg(estimat);
}

/**
 * Nedtrappingsregelen isolert, for testbarhet og forklaring i UI.
 *
 * Returnerer false dersom kroppsvektKg mangler (null eller <= 0),
 * eller hvis 1RM ikke er registrert.
 */
export function trengerNedtrapping(
  loft: StyrkeloftKode,
  ettRepMaksKg: number | null,
  kroppsvektKg: number | null
): boolean {
  if (ettRepMaksKg == null || ettRepMaksKg <= 0) return false;
  if (kroppsvektKg == null || kroppsvektKg <= 0) return false;
  const terskel = NEDTRAPPING_TERSKLER[loft] ?? 1.0;
  return ettRepMaksKg / kroppsvektKg < terskel;
}

/**
 * Beregner 6-ukers styrkeprogram for ett baseløft.
 *
 * Ren funksjon som kalles på nytt ved hver rendring slik at oppdaterte
 * 1RM-tester slår rett gjennom uten manuell recalculation.
 */
export function beregnStyrkeprogram(input: StyrkeprogramInput): EnUkersBelastning[] {
  const { loft, ettRepMaksKg, kroppsvektKg } = input;
  const nedtrapping = trengerNedtrapping(loft, ettRepMaksKg, kroppsvektKg);

  const uker: EnUkersBelastning[] = [];

  for (let uke = 1; uke <= 6; uke++) {
    const periode: 1 | 2 | 3 = uke <= 2 ? 1 : uke <= 4 ? 2 : 3;
    let mal: { reps: number; pst: number }[];
    let erNedtrappingDenneUken = false;

    if (uke <= 4) {
      mal = STANDARD_UKER_1_TIL_4[uke];
    } else if (nedtrapping) {
      erNedtrappingDenneUken = true;
      const ukeKey = uke as 5 | 6;
      mal = loft === "BENKPRESS" ? BYGG_BENKPRESS[ukeKey] : BYGG_MARKLOFT_KNEBOY[ukeKey];
    } else {
      mal = uke === 5 ? BOLGE_UKE_5 : BOLGE_UKE_6;
    }

    const sett: StyrkeSettBelastning[] = mal.map((s, idx) => {
      const belastningKg =
        ettRepMaksKg != null && ettRepMaksKg > 0
          ? avrundVektKg((ettRepMaksKg * s.pst) / 100)
          : null;
      return {
        settNr: idx + 1,
        reps: s.reps,
        belastningPst: s.pst,
        belastningKg,
      };
    });

    uker.push({
      uke,
      periode,
      sett,
      erNedtrapping: erNedtrappingDenneUken,
    });
  }

  return uker;
}

export interface MalbaneBeregning {
  loft: StyrkeloftKode;
  kroppsvektKg: number;
  malRatio: number;
  malKg: number;
  naaKg: number;
  gapKg: number;
  gapProsent: number;
  arIgjen: number;
  arligFramgangKg: number;
}

/**
 * Beregner avstand og årlig fremgangsbehov mot WANG Toppidretts mål-ratio ved VG3.
 */
export function beregnMalbane(
  loft: StyrkeloftKode,
  kroppsvektKg: number | null,
  siste1RMKg: number | null,
  arIgjen = 3
): MalbaneBeregning | null {
  if (kroppsvektKg == null || kroppsvektKg <= 0 || siste1RMKg == null || siste1RMKg <= 0) {
    return null;
  }
  const malRatio = MAL_RATIO_VG3[loft] ?? 2.0;
  const malKg = avrundVektKg(kroppsvektKg * malRatio);
  const gapKg = Math.max(0, malKg - siste1RMKg);
  const gapProsent = Math.round((gapKg / malKg) * 100);
  const sikkerAr = Math.max(1, arIgjen);
  const arligFramgangKg = Math.round((gapKg / sikkerAr) * 10) / 10;

  return {
    loft,
    kroppsvektKg,
    malRatio,
    malKg,
    naaKg: siste1RMKg,
    gapKg,
    gapProsent,
    arIgjen: sikkerAr,
    arligFramgangKg,
  };
}
