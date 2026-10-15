/**
 * PH-RD-06 Rask score: rene hjelpere for hull-for-hull-føring og SG fra en annen app.
 * Bare brutto. Par kommer fra banens hull (CourseHole) eller fra spilleren; den gjettes aldri.
 */

export type RaskHull = {
  nr: number;
  /** null når banen ikke har par for hullet og spilleren ikke har valgt. */
  par: number | null;
  lengde: number | null;
  score: number | null;
  putter: number | null;
  /** «ja» = traff fairway, «venstre»/«hoyre» = bom. null = ikke ført. */
  fairway: "ja" | "venstre" | "hoyre" | null;
  gir: boolean | null;
};

/** Hullene i runden: 18, første ni (1–9) eller siste ni (10–18). */
export function hullNumre(valg: "18" | "ut" | "inn"): number[] {
  const fra = valg === "inn" ? 10 : 1;
  const antall = valg === "18" ? 18 : 9;
  return Array.from({ length: antall }, (_, i) => fra + i);
}

/** Første trykk setter scoren til par. Uten par står hullet tomt til spilleren har valgt par. */
export function stegScore(h: RaskHull, d: number): number | null {
  if (h.score == null) return h.par;
  return Math.max(1, Math.min(15, h.score + d));
}

export function raskSum(hull: RaskHull[]): { ført: number; brutto: number; par: number } {
  const ført = hull.filter((h) => h.score != null && h.par != null);
  return {
    ført: ført.length,
    brutto: ført.reduce((s, h) => s + (h.score ?? 0), 0),
    par: ført.reduce((s, h) => s + (h.par ?? 0), 0),
  };
}

/** Til logRoundManual.hullDetaljer. Kaster ikke: returnerer null når et hull mangler par eller score. */
export function tilHullDetaljer(hull: RaskHull[]) {
  if (hull.some((h) => h.score == null || h.par == null)) return null;
  return hull.map((h) => ({
    nr: h.nr,
    par: h.par as number,
    strokes: h.score as number,
    putts: h.putter,
    fairway: h.par === 3 || h.fairway == null ? null : h.fairway === "ja",
    gir: h.gir,
  }));
}

/** «−0,8», «+0,3», «0,0» → tall. Tom tekst → null. Ugyldig → undefined. */
export function lesSgTekst(tekst: string): number | null | undefined {
  const t = tekst.trim().replaceAll("−", "-").replace(",", ".");
  if (!t) return null;
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(t)) return undefined;
  return Number(t);
}
