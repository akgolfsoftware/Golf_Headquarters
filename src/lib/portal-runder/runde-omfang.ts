/**
 * PlayerHQ · Runder (PH-07) — én regel for hvor mange hull en runde er,
 * hva par for de hullene er, og når et SG-tall faktisk kan vises.
 *
 * Bakgrunn (designkontroll 21.09.2026): `Round` har ingen «antall hull»-kolonne.
 * Både listen og detaljsiden antok derfor 18 hull og banens totalpar når
 * scorekortet manglet — en nihullsrunde med brutto 42 ble vist som −30 mot
 * par 72. Dette er den feilen modulen finnes for å hindre.
 *
 * Reglene, som gjelder alle runde-flater:
 *   1. Antall hull er KJENT bare når runden har ekte HoleScore-rader.
 *   2. Par er summen av par for de spilte hullene — aldri banens totalpar
 *      påført en runde vi ikke vet lengden på.
 *   3. Uten scorekort er både par og mot par ukjent. Flatene viser «—».
 *   4. Brutto score er summen av de spilte hullene når scorekortet finnes.
 *   5. Et komplett scorekort er IKKE i seg selv et SG-tall. SG vises bare
 *      når det finnes en lagret verdi OG en kjent metode (`sgSource`).
 */

/** Metodene `Round.sgSource` kan ha. Ukjent/manglende metode = ingen SG-visning. */
export const SG_METODER = {
  manual: {
    etikett: "Håndtastet",
    forklaring:
      "Tallene er tastet inn av spilleren, ikke regnet ut av appen. Kilde og referanse er den som førte dem.",
    erEstimat: false,
  },
  beregnet: {
    etikett: "Beregnet fra slagkjeden",
    forklaring:
      "Regnet ut fra hvert enkelt slag med avstand, mot Broadie-basislinjen for forventet antall slag.",
    erEstimat: false,
  },
  estimert: {
    etikett: "Estimat fra totalscore",
    forklaring:
      "Fordelt fra totalscoren over en antatt hullfordeling. Dette er et anslag, ikke en måling av spillerens slag.",
    erEstimat: true,
  },
} as const;

export type SgMetode = keyof typeof SG_METODER;

export function erKjentSgMetode(kilde: string | null | undefined): kilde is SgMetode {
  return kilde != null && Object.hasOwn(SG_METODER, kilde);
}

/** Ett hull fra scorekortet. Bare feltene omfanget faktisk trenger. */
export type HullRad = { par: number; strokes: number };

export type RundeOmfang = {
  /** Antall hull med ekte scorekort-rad. null = ukjent. */
  antallSpilteHull: number | null;
  /** Sum av par for de spilte hullene. null = ukjent. */
  par: number | null;
  /** score − par. null når par er ukjent — vises som «—». */
  motPar: number | null;
  /** Brutto: summen av spilte hull når scorekortet finnes, ellers lagret total. */
  brutto: number;
  /** True når runden har et scorekort å regne mot par fra. */
  harScorekort: boolean;
};

/**
 * Utleder omfanget av én runde.
 * `lagretScore` er `Round.score` — brukes bare når scorekortet mangler.
 */
export function utledRundeOmfang(
  hull: readonly HullRad[],
  lagretScore: number,
): RundeOmfang {
  if (hull.length === 0) {
    return {
      antallSpilteHull: null,
      par: null,
      motPar: null,
      brutto: lagretScore,
      harScorekort: false,
    };
  }
  const par = hull.reduce((sum, h) => sum + h.par, 0);
  const brutto = hull.reduce((sum, h) => sum + h.strokes, 0);
  return {
    antallSpilteHull: hull.length,
    par,
    motPar: brutto - par,
    brutto,
    harScorekort: true,
  };
}

export type SgVisning =
  | { vis: false; grunn: "ingen-verdi" | "ukjent-metode" }
  | {
      vis: true;
      verdi: number;
      metode: SgMetode;
      etikett: string;
      forklaring: string;
      erEstimat: boolean;
    };

/**
 * Avgjør om et SG-tall kan vises, og med hvilken metodemerking.
 * Et tall uten kjent metode vises ALDRI — da kan vi ikke si hvor det kom fra.
 */
export function sgVisning(
  verdi: number | null | undefined,
  kilde: string | null | undefined,
): SgVisning {
  if (verdi == null) return { vis: false, grunn: "ingen-verdi" };
  if (!erKjentSgMetode(kilde)) return { vis: false, grunn: "ukjent-metode" };
  const m = SG_METODER[kilde];
  return {
    vis: true,
    verdi,
    metode: kilde,
    etikett: m.etikett,
    forklaring: m.forklaring,
    erEstimat: m.erEstimat,
  };
}

/**
 * Snitt over runder av SAMME lengde. Å blande ni og atten hull i ett
 * bruttosnitt gir et tall som ikke beskriver noen runde spilleren har spilt.
 */
export function snittForHullantall(
  runder: readonly { antallSpilteHull: number | null; brutto: number }[],
  antallHull: number,
): { snitt: number; antall: number } | null {
  const med = runder.filter((r) => r.antallSpilteHull === antallHull);
  if (med.length === 0) return null;
  return {
    snitt: med.reduce((sum, r) => sum + r.brutto, 0) / med.length,
    antall: med.length,
  };
}
