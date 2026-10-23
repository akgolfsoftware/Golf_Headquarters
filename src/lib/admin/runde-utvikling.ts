/**
 * Datagrunnlag til utviklingsdiagrammet på /admin/runder.
 *
 * Bare tellende runder (18 hull eller ukjent hullantall) tas med: brutto på ni hull
 * er ikke sammenlignbar. Rundene kommer nyeste først fra spørringen; diagrammet går
 * fra eldst til nyest. Manglende runder blir ikke tegnet som null.
 */

export type UtviklingInn = { dato: string; brutto: number; hull: number | null };

export type UtviklingPunkt = { dato: string; kort: string; brutto: number };

export type Utvikling = {
  punkter: UtviklingPunkt[];
  utelatt: number;
  forste: number;
  siste: number;
  endring: number;
  beste: number;
};

/** Minst tre runder må til før en kurve forteller noe. */
export const MIN_RUNDER_FOR_DIAGRAM = 3;

export function bygUtvikling(nyesteForst: UtviklingInn[]): Utvikling | null {
  const tellende = nyesteForst.filter((r) => r.hull == null || r.hull >= 18);
  const utelatt = nyesteForst.length - tellende.length;
  if (tellende.length < MIN_RUNDER_FOR_DIAGRAM) return null;

  const punkter = [...tellende].reverse().map((r) => ({
    dato: r.dato,
    kort: r.dato.slice(0, 5),
    brutto: r.brutto,
  }));
  const forste = punkter[0].brutto;
  const siste = punkter[punkter.length - 1].brutto;
  return {
    punkter,
    utelatt,
    forste,
    siste,
    endring: siste - forste,
    beste: Math.min(...punkter.map((p) => p.brutto)),
  };
}
