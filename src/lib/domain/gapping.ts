/**
 * Gapping — carry per kølle og hull mellom nabokøller (D5).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-gapping.html
 *
 * Kartet MÅLER. Det anbefaler aldri kjøp. Et flagget gap er et målt hull i
 * settet, og fasitens egen tekst sender spilleren til coachen for å avgjøre om
 * det løses med sving, kølle eller gameplan.
 *
 * Tre regler fra fasiten, alle håndhevet her:
 *  1. Båndet er 25.–75. persentil, streken er medianen.
 *  2. Et gap flagges når avstanden mellom to nabokøller er over 22 m OG begge
 *     har minst 20 slag.
 *  3. Driveren står utenfor flaggingen — den slås fra tee, ikke til innspill.
 *
 * Køller under måleterskelen vises med tallene sine, men deltar ikke i
 * flagging. Å skjule dem ville vært å gjemme data; å flagge på dem ville vært
 * å konkludere på for tynt grunnlag.
 */

/** Meter mellom nabokøller før hullet regnes som reelt. */
export const GAP_TERSKEL_M = 22;

/** Slag per kølle før den er sikker nok til å flagge på. */
export const MIN_SLAG = 20;

/** Køller som aldri flagges — de slås ikke mot green. */
const UTENFOR_FLAGGING = /^driver$/i;

export type KolleSlag = {
  /** Køllenavn slik det står i TrackMan-dataene, f.eks. «7-jern». */
  klubb: string;
  /** Carry i meter. */
  carry: number;
};

export type KolleMaaling = {
  klubb: string;
  median: number;
  p25: number;
  p75: number;
  slag: number;
  /** Under måleterskelen — vises, men flagges ikke. */
  tynn: boolean;
};

export type Gap = {
  /** Køllen med lengst carry i paret. */
  over: string;
  /** Køllen med kortest carry i paret. */
  under: string;
  /** Avstand i meter mellom medianene. */
  meter: number;
  /** Midtpunktet — avstanden som mangler en kølle å lande på. */
  hullMidt: number;
};

export type Gapping = {
  koller: KolleMaaling[];
  gap: Gap[];
  totaltSlag: number;
  /** Under terskelen totalt — kartet skal ikke tegnes. */
  forFaaSlag: boolean;
};

/**
 * Persentil med lineær interpolasjon. Sorterer ikke selv — kaller sorterer.
 * Tom liste gir NaN, som er kallerens ansvar å unngå.
 */
function persentil(sortert: number[], p: number): number {
  if (sortert.length === 1) return sortert[0];
  const pos = (sortert.length - 1) * p;
  const lav = Math.floor(pos);
  const hoy = Math.ceil(pos);
  if (lav === hoy) return sortert[lav];
  return sortert[lav] + (sortert[hoy] - sortert[lav]) * (pos - lav);
}

/**
 * Regner ut kartet. Køllene sorteres etter median synkende — rekkefølgen
 * kommer fra de målte tallene, ikke fra køllenavnet, så et uvanlig sett
 * (sterk lofting, delvis bag) sorteres like riktig som et standard sett.
 */
export function beregnGapping(slag: readonly KolleSlag[]): Gapping {
  const perKolle = new Map<string, number[]>();
  for (const s of slag) {
    if (!Number.isFinite(s.carry) || s.carry <= 0) continue;
    const liste = perKolle.get(s.klubb);
    if (liste) liste.push(s.carry);
    else perKolle.set(s.klubb, [s.carry]);
  }

  const koller: KolleMaaling[] = [];
  for (const [klubb, carries] of perKolle) {
    const sortert = [...carries].sort((a, b) => a - b);
    koller.push({
      klubb,
      median: Math.round(persentil(sortert, 0.5)),
      p25: Math.round(persentil(sortert, 0.25)),
      p75: Math.round(persentil(sortert, 0.75)),
      slag: sortert.length,
      tynn: sortert.length < MIN_SLAG,
    });
  }

  koller.sort((a, b) => b.median - a.median);

  const totaltSlag = koller.reduce((sum, k) => sum + k.slag, 0);

  const gap: Gap[] = [];
  for (let i = 0; i < koller.length - 1; i++) {
    const over = koller[i];
    const under = koller[i + 1];

    // Driveren slås fra tee — et hull under den er ikke et innspillshull.
    if (UTENFOR_FLAGGING.test(over.klubb) || UTENFOR_FLAGGING.test(under.klubb)) continue;
    // For tynt grunnlag på én av dem: mål, men ikke konkluder.
    if (over.tynn || under.tynn) continue;

    const meter = over.median - under.median;
    if (meter <= GAP_TERSKEL_M) continue;

    gap.push({
      over: over.klubb,
      under: under.klubb,
      meter,
      hullMidt: Math.round(under.median + meter / 2),
    });
  }

  return {
    koller,
    gap,
    totaltSlag,
    forFaaSlag: totaltSlag < MIN_SLAG,
  };
}
