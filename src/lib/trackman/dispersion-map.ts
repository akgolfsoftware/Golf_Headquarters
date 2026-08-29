/**
 * TrackMan DispersionMap (B7, TM-08/TM-11/TM-08f) — domenelogikk for
 * spredningskartet på PlayerHQ-økt-detalj.
 *
 * Gjenbruker ALL matematikk fra `src/lib/gameplan/dispersion.ts`
 * (`computeDispersion`, `trackmanToPoints`) — ingen ny kovarians/ellipse-
 * utregning her. Dette laget legger kun på TrackMan-spesifikk tolkning:
 * 1σ/2σ-konfidens, bøtte-klassifisering (innenfor 1σ / 1–2σ / utenfor 2σ)
 * og den norske caddie-setningen.
 *
 * VIKTIG 2D-fakta (verifisert, se HANDOFF §TRACKMAN og oppgavebrief): en
 * "1σ-ellipse" for en 2D normalfordeling er IKKE 68 % konfidens (det er
 * 1D-tenkning) — den tilsvarer 1 − e^(−0,5) ≈ 39,35 %. 2σ tilsvarer
 * 1 − e^(−2) ≈ 86,47 %. `ONE_SIGMA_CONFIDENCE`/`TWO_SIGMA_CONFIDENCE` under
 * er nøyaktig disse verdiene — IKKE Gameplans default 0,95, som er en annen
 * konvensjon og ikke skal blandes inn her.
 *
 * Under `MIN_SHOTS_FOR_ELLIPSE` slag (TM-11/TM-08g: 8) tegnes prikker + mål-
 * linje, men INGEN ellipse — 1σ vises som "—" med caps "FRA 8 SLAG".
 *
 * Fasit: designsystem/train-lock/TM-05 Tom og faa slag.dc.html —
 * `generateCaddieSentence` fikk en forsiktigere lavt-n-variant («To slag
 * høyre. Median står — vent med å flytte siktet.», TM-05a viser den
 * eksakt ved n=2) i stedet for bare `null` under 8 slag. TM-05b (tom
 * TrackMan-tilstand med «CSV, PDF eller foto») er IKKE dekket her — appen
 * har kun CSV/HTML-parsing (src/lib/trackman/parse-*.ts), ingen
 * PDF/foto-OCR ennå, så den delen av fasiten er en funksjonsgap, ikke en
 * visningsjobb (anti-scope PX-3: bygges ikke på sparket).
 */

import {
  computeDispersion,
  trackmanToPoints,
  type DispersionEllipse,
  type DispersionPoint,
  type DispersionStats,
} from "@/lib/gameplan/dispersion";

/** 1 − e^(−0,5·1²) — konfidensen en 1σ-ellipse faktisk dekker i 2D. */
export const ONE_SIGMA_CONFIDENCE = 1 - Math.exp(-0.5);
/** 1 − e^(−0,5·2²) — konfidensen en 2σ-ellipse faktisk dekker i 2D. */
export const TWO_SIGMA_CONFIDENCE = 1 - Math.exp(-2);

/** TM-11/TM-08g: under dette antallet slag tegnes ingen ellipse. */
export const MIN_SHOTS_FOR_ELLIPSE = 8;

export type TrackManDispersionShot = {
  id: string;
  shotNumber: number;
  club: string;
  side: number | null;
  carryDistance: number | null;
  totalDistance: number | null;
  smashFactor: number | null;
  launchAngle: number | null;
  /** Grader — TM-02/TM-08 «Funn»-radens «Face mot path». Valgfri: eldre rader kan mangle feltet. */
  faceToPath?: number | null;
};

export type DispersionBucketKey = "good" | "acceptable" | "disaster";

export type DispersionMapShot = TrackManDispersionShot & {
  /** Sentrert punkt (lateral = side, distance = carry − snitt-carry). */
  point: DispersionPoint;
  /** Hvilken bøtte slaget faller i — kun meningsfullt når `hasEllipse`. */
  bucket: DispersionBucketKey | null;
};

export type DispersionBuckets = {
  /** Innenfor 1σ-ellipsen (m ≤ 1). */
  good: number;
  /** Mellom 1σ og 2σ (1 < m ≤ 2). */
  acceptable: number;
  /** Utenfor 2σ (m > 2) — outlier. */
  disaster: number;
};

export type DispersionMapResult = {
  n: number;
  hasEllipse: boolean;
  /** Ellipse ved 1σ (39,35 % konfidens) — null under MIN_SHOTS_FOR_ELLIPSE. */
  oneSigmaEllipse: DispersionEllipse | null;
  /** Ellipse ved 2σ (86,47 % konfidens) — null under MIN_SHOTS_FOR_ELLIPSE. */
  twoSigmaEllipse: DispersionEllipse | null;
  /** Snitt-carry (senter for distance-aksen). Null uten gyldige slag. */
  meanCarry: number | null;
  /** Median carry — KPI-stripens «Carry»-tall (median, ikke snitt — TM-00). */
  medianCarry: number | null;
  /** Snitt offline/side (+ = høyre). KPI-stripens «Offline». */
  offlineBias: number | null;
  /** «1σ»-KPI: representativ radius for 1σ-ellipsen (geometrisk snitt av halvaksene). */
  oneSigmaRadius: number | null;
  /** Snitt smash factor. */
  meanSmash: number | null;
  /** «Spredning» (TM-00/TM-02/TM-08 «Funn»-lista): P90−P10 av carry, meter. Null under 2 gyldige slag. */
  carrySpreadP90P10: number | null;
  /** Snitt face-to-path (grader) — TM-02/TM-08 «Funn»-radens «Face mot path». Null uten TrackManShot.faceToPath-data. */
  meanFaceToPath: number | null;
  /** Andel (0–1) av slagene i hver bøtte. Kun fylt når `hasEllipse`. */
  bucketShare: DispersionBuckets;
  shots: DispersionMapShot[];
  /** Norsk caddie-setning, eller null når det ikke er nok slag. */
  caddieSentence: string | null;
};

/** P-te persentil (0–100) i en tallrekke, lineær interpolasjon (samme metode som brukes for median). */
function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 1) return sortedValues[0];
  const rank = (p / 100) * (sortedValues.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sortedValues[lo];
  const frac = rank - lo;
  return sortedValues[lo] * (1 - frac) + sortedValues[hi] * frac;
}

function komma(v: number, desimaler: number): string {
  return v.toFixed(desimaler).replace(".", ",");
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Normalisert Mahalanobis-lignende avstand (m) for et punkt relativt til
 * ellipsens senter/akser, ved k=1 (dvs. `ellipse` MÅ komme fra
 * `computeDispersion({ confidence: ONE_SIGMA_CONFIDENCE })`, hvor
 * semiMajor/semiMinor allerede er de urskalerte √egenverdiene).
 * m ≤ 1 → innenfor 1σ, m ≤ 2 → innenfor 2σ, ellers utenfor.
 */
function normalizedDistance(point: DispersionPoint, ellipse: DispersionEllipse): number {
  const dLateral = point.lateral - ellipse.centerLateral;
  const dDistance = point.distance - ellipse.centerDistance;
  const cosA = Math.cos(ellipse.angleRad);
  const sinA = Math.sin(ellipse.angleRad);
  // Invers av rotasjonen brukt i ellipseGpsPunkter (dispersion.ts): løs for
  // (ex, ey) i lateral = center + ex·cosA + ey·sinA, distance = center − ex·sinA + ey·cosA.
  const ex = dLateral * cosA - dDistance * sinA;
  const ey = dLateral * sinA + dDistance * cosA;
  const a = ellipse.semiMinor || 1e-9; // lateral-akse
  const b = ellipse.semiMajor || 1e-9; // distance-akse
  return Math.sqrt((ex / a) ** 2 + (ey / b) ** 2);
}

function bucketFor(m: number): DispersionBucketKey {
  if (m <= 1) return "good";
  if (m <= 2) return "acceptable";
  return "disaster";
}

function spelltAntall(n: number): string {
  if (n === 1) return "Ett slag";
  if (n === 2) return "To slag";
  return `${n} slag`;
}

/**
 * Caddie-setning à la HANDOFF: «Klyngen ligger 3,7 m høyre. Sikt 4 m venstre, samme sving.»
 *
 * Under MIN_SHOTS_FOR_ELLIPSE (ellipsen tegnes ikke ennå) gir vi en FORSIKTIGERE
 * variant uten sikt-korreksjon — TM-00 TmCaddieLeak sier eksplisitt: «Ved 1–2
 * slag: 'To slag høyre. Median står — vent med å flytte siktet.'» — og TM-05a
 * viser akkurat denne teksten ved n=2. Under 1 m bias ved lavt n sier vi
 * ingenting ennå (for lite grunnlag til å påstå noen retning).
 */
export function generateCaddieSentence(offlineBias: number | null, n: number): string | null {
  if (n < 1 || offlineBias === null) return null;
  const abs = Math.abs(offlineBias);
  const side = offlineBias > 0 ? "høyre" : "venstre";
  if (n < MIN_SHOTS_FOR_ELLIPSE) {
    if (abs < 1) return null;
    return `${spelltAntall(n)} ${side}. Median står — vent med å flytte siktet.`;
  }
  if (abs < 1) return "Klyngen ligger midt på linja. Ingen sideveis lekkasje å rette på.";
  const motsattSide = offlineBias > 0 ? "venstre" : "høyre";
  const siktKorreksjon = Math.round(abs);
  return `Klyngen ligger ${komma(abs, 1)} m ${side}. Sikt ${siktKorreksjon} m ${motsattSide}, samme sving.`;
}

/**
 * Hovedfunksjonen: TrackMan-slag → komplett dispersion-resultat for TM-11 /
 * TM-08f. Rent uttrekk + regning — ingen JSX, ingen Prisma-kall.
 */
export function computeTrackManDispersionMap(shots: TrackManDispersionShot[]): DispersionMapResult {
  const points = trackmanToPoints(shots);
  const n = points.length;

  const carries = shots.map((s) => s.carryDistance).filter((v): v is number => v != null);
  const smashes = shots.map((s) => s.smashFactor).filter((v): v is number => v != null);

  const meanCarry = mean(carries);
  const medianCarry = median(carries);
  const meanSmash = mean(smashes);

  const sortedCarries = [...carries].sort((a, b) => a - b);
  const carrySpreadP90P10 = sortedCarries.length >= 2 ? percentile(sortedCarries, 90) - percentile(sortedCarries, 10) : null;
  const faceToPaths = shots.map((s) => s.faceToPath).filter((v): v is number => v != null);
  const meanFaceToPath = mean(faceToPaths);

  const hasEllipse = n >= MIN_SHOTS_FOR_ELLIPSE;

  let oneSigma: DispersionStats | null = null;
  let twoSigma: DispersionStats | null = null;
  if (hasEllipse) {
    oneSigma = computeDispersion(points, { confidence: ONE_SIGMA_CONFIDENCE });
    twoSigma = computeDispersion(points, { confidence: TWO_SIGMA_CONFIDENCE });
  }

  const offlineBias = n > 0 ? mean(points.map((p) => p.lateral)) : null;
  const oneSigmaRadius =
    oneSigma?.ellipse != null ? Math.sqrt(oneSigma.ellipse.semiMajor * oneSigma.ellipse.semiMinor) : null;

  const bucketCounts: Record<DispersionBucketKey, number> = { good: 0, acceptable: 0, disaster: 0 };

  const mappedShots: DispersionMapShot[] = shots
    .map((shot, i) => {
      // trackmanToPoints filtrerer bort ugyldige slag — punktrekkefølgen
      // matcher rekkefølgen av gyldige shots i inputlisten.
      return { shot, point: points[i] as DispersionPoint | undefined };
    })
    .filter((x): x is { shot: TrackManDispersionShot; point: DispersionPoint } => x.point != null)
    .map(({ shot, point }) => {
      let bucket: DispersionBucketKey | null = null;
      if (hasEllipse && oneSigma?.ellipse) {
        const m = normalizedDistance(point, oneSigma.ellipse);
        bucket = bucketFor(m);
        bucketCounts[bucket] += 1;
      }
      return { ...shot, point, bucket };
    });

  const bucketTotal = bucketCounts.good + bucketCounts.acceptable + bucketCounts.disaster;
  const bucketShare: DispersionBuckets = {
    good: bucketTotal > 0 ? bucketCounts.good / bucketTotal : 0,
    acceptable: bucketTotal > 0 ? bucketCounts.acceptable / bucketTotal : 0,
    disaster: bucketTotal > 0 ? bucketCounts.disaster / bucketTotal : 0,
  };

  return {
    n,
    hasEllipse,
    oneSigmaEllipse: oneSigma?.ellipse ?? null,
    twoSigmaEllipse: twoSigma?.ellipse ?? null,
    meanCarry,
    medianCarry,
    offlineBias,
    oneSigmaRadius,
    meanSmash,
    carrySpreadP90P10,
    meanFaceToPath,
    bucketShare,
    shots: mappedShots,
    caddieSentence: generateCaddieSentence(offlineBias, n),
  };
}
