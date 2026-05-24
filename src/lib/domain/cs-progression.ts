/**
 * Clubhead Speed-progresjon over tid (4 ukers rullende snitt).
 *
 * Input: TrackMan-sesjoner med dato og CS-verdi (mph).
 * Beregner:
 *  - gjeldende snitt (siste 4 uker)
 *  - forrige snitt (4 uker før det)
 *  - endring og prosent-endring
 *  - trend: "OPP" | "FLAT" | "NED" (±2 % terskel)
 *  - varselFlagg: "MULIG_SKADE" hvis siste uke har fall > 3 mph
 */

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type CsSesjon = {
  /** Dato for sesjonen */
  dato: Date;
  /** Clubhead speed i mph */
  csValue: number;
};

export type CsTrend = "OPP" | "FLAT" | "NED";

export type CsVarsel = "MULIG_SKADE" | null;

export type CsProgresjon = {
  /** Snitt CS de siste 4 ukene (mph) — null hvis ingen data */
  gjeldendeSnitt: number | null;
  /** Snitt CS uke −8 til −4 (mph) — null hvis ingen data */
  forrigeSnitt: number | null;
  /** gjeldende − forrige (mph) — null hvis en av snittene mangler */
  endring: number | null;
  /** Endring i prosent (av forrige snitt) — null hvis forrige er null/0 */
  endringPct: number | null;
  /** Trend basert på prosent-endring */
  trend: CsTrend;
  /** Varsel hvis siste uke har fall > 3 mph fra forrige uke */
  varselFlagg: CsVarsel;
};

// ---------------------------------------------------------------------------
// Konstanter
// ---------------------------------------------------------------------------

const MS_PR_UKE = 7 * 24 * 60 * 60 * 1000;
const TREND_TERSKEL_PCT = 2;
const VARSEL_FALL_MPH = 3;

// ---------------------------------------------------------------------------
// Internfunksjoner
// ---------------------------------------------------------------------------

function snittEllerNull(verdier: ReadonlyArray<number>): number | null {
  if (verdier.length === 0) return null;
  const sum = verdier.reduce((acc, v) => acc + v, 0);
  return sum / verdier.length;
}

function rundTilEnDesimal(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Returnerer siste dato i sesjons-arrayet, eller `new Date()` hvis tom.
 * Brukes som anker for å beregne "siste 4 uker".
 */
function senesteDato(sesjoner: ReadonlyArray<CsSesjon>): Date {
  if (sesjoner.length === 0) return new Date();
  let maks = sesjoner[0].dato.getTime();
  for (const s of sesjoner) {
    if (s.dato.getTime() > maks) maks = s.dato.getTime();
  }
  return new Date(maks);
}

// ---------------------------------------------------------------------------
// Eksporterte funksjoner
// ---------------------------------------------------------------------------

/**
 * Beregner CS-progresjon basert på siste 8 uker.
 *
 * @param sesjoner — sortering spiller ingen rolle, vi filtrerer på dato
 */
export function beregnCsProgresjon(sesjoner: ReadonlyArray<CsSesjon>): CsProgresjon {
  if (sesjoner.length === 0) {
    return {
      gjeldendeSnitt: null,
      forrigeSnitt: null,
      endring: null,
      endringPct: null,
      trend: "FLAT",
      varselFlagg: null,
    };
  }

  const anker = senesteDato(sesjoner);
  const cutoffGjeldende = anker.getTime() - 4 * MS_PR_UKE;
  const cutoffForrige = anker.getTime() - 8 * MS_PR_UKE;
  const cutoffSisteUke = anker.getTime() - 1 * MS_PR_UKE;
  const cutoffNestSisteUke = anker.getTime() - 2 * MS_PR_UKE;

  const gjeldendeVerdier: number[] = [];
  const forrigeVerdier: number[] = [];
  const sisteUkeVerdier: number[] = [];
  const nestSisteUkeVerdier: number[] = [];

  for (const s of sesjoner) {
    const t = s.dato.getTime();
    if (t > anker.getTime()) continue; // ignorer framtidige
    if (t >= cutoffGjeldende) {
      gjeldendeVerdier.push(s.csValue);
    } else if (t >= cutoffForrige) {
      forrigeVerdier.push(s.csValue);
    }
    if (t >= cutoffSisteUke) {
      sisteUkeVerdier.push(s.csValue);
    } else if (t >= cutoffNestSisteUke) {
      nestSisteUkeVerdier.push(s.csValue);
    }
  }

  const gjeldendeSnittRaa = snittEllerNull(gjeldendeVerdier);
  const forrigeSnittRaa = snittEllerNull(forrigeVerdier);
  const sisteUkeSnitt = snittEllerNull(sisteUkeVerdier);
  const nestSisteUkeSnitt = snittEllerNull(nestSisteUkeVerdier);

  const gjeldendeSnitt = gjeldendeSnittRaa === null ? null : rundTilEnDesimal(gjeldendeSnittRaa);
  const forrigeSnitt = forrigeSnittRaa === null ? null : rundTilEnDesimal(forrigeSnittRaa);

  let endring: number | null = null;
  let endringPct: number | null = null;
  if (gjeldendeSnittRaa !== null && forrigeSnittRaa !== null) {
    endring = rundTilEnDesimal(gjeldendeSnittRaa - forrigeSnittRaa);
    if (forrigeSnittRaa !== 0) {
      endringPct = rundTilEnDesimal(((gjeldendeSnittRaa - forrigeSnittRaa) / forrigeSnittRaa) * 100);
    }
  }

  let trend: CsTrend = "FLAT";
  if (endringPct !== null) {
    if (Math.abs(endringPct) <= TREND_TERSKEL_PCT) {
      trend = "FLAT";
    } else if (endringPct > 0) {
      trend = "OPP";
    } else {
      trend = "NED";
    }
  }

  let varselFlagg: CsVarsel = null;
  if (sisteUkeSnitt !== null && nestSisteUkeSnitt !== null) {
    if (sisteUkeSnitt - nestSisteUkeSnitt < -VARSEL_FALL_MPH) {
      varselFlagg = "MULIG_SKADE";
    }
  }

  return {
    gjeldendeSnitt,
    forrigeSnitt,
    endring,
    endringPct,
    trend,
    varselFlagg,
  };
}
