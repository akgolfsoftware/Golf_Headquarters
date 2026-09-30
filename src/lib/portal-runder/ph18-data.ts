/**
 * PH-18 Runder og statistikk — ren aggregering (ingen database).
 *
 * Tar rundene slik Prisma leverer dem og bygger modellen skjermen viser:
 * runde-liste med scorekort, statistikk-serier, snitt til par per hull og
 * til par per måned per sesong. Manglende verdi er alltid null (vises «—»),
 * aldri 0 eller en gjetning. Score er brutto.
 */

export type PH18RundeInn = {
  id: string;
  playedAt: Date;
  score: number;
  courseName: string;
  /** Baneregisterets par. Brukes bare når rundens egne hull mangler. */
  coursePar: number;
  sgTotal: number | null;
  sgSource: string | null;
  roundType: string | null;
  holeScores: { holeNumber: number; par: number; strokes: number; putts: number | null; fairway: boolean | null; gir: boolean | null }[];
};

export type PH18Runde = {
  id: string;
  /** dd.mm.åååå (Oslo). */
  dato: string;
  kortDato: string;
  bane: string;
  score: number;
  par: number;
  /** 9 eller 18, eller null når antall hull ikke kan avgjøres. */
  hull: 9 | 18 | null;
  art: string | null;
  sg: number | null;
  sgKilde: string | null;
  fairwayPct: number | null;
  girPct: number | null;
  putter: number | null;
  kort: { par: number; slag: number }[] | null;
};

export type PH18HullSnitt = {
  bane: string;
  antallRunder: number;
  par: number[];
  /** Snitt til par per hull, hull 1 først. */
  snitt: number[];
  dyreste: { hull: number; par: number; snitt: number; rundeMedBogey: number };
  beste: { hull: number; par: number; snitt: number };
};

export type PH18Sesong = {
  aar: number;
  /** Snitt til par for 18-hullsrunder per måned APR–OKT (index 0 = april), null uten runder. */
  maaneder: (number | null)[];
  snittBrutto: number | null;
  antall: number;
};

export type PH18Model = {
  runder: PH18Runde[];
  hull: PH18HullSnitt | null;
  sesonger: PH18Sesong[];
};

const OSLO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });
const OSLO_DEL = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", year: "numeric", month: "numeric" });

function osloAarMaaned(d: Date): { aar: number; maaned: number } {
  const p = OSLO_DEL.formatToParts(d);
  return { aar: Number(p.find((x) => x.type === "year")?.value), maaned: Number(p.find((x) => x.type === "month")?.value) };
}

function prosent(verdier: (boolean | null)[]): number | null {
  const kjent = verdier.filter((v): v is boolean => v != null);
  if (kjent.length === 0) return null;
  return Math.round((kjent.filter(Boolean).length / kjent.length) * 100);
}

function tilRunde(r: PH18RundeInn): PH18Runde {
  const hs = [...r.holeScores].sort((a, b) => a.holeNumber - b.holeNumber);
  const hull: 9 | 18 | null = hs.length === 18 || hs.length === 9 ? (hs.length as 9 | 18) : hs.length === 0 && r.coursePar >= 60 ? 18 : null;
  const par = hs.length > 0 && (hs.length === 9 || hs.length === 18) ? hs.reduce((s, h) => s + h.par, 0) : r.coursePar;
  const dato = OSLO.format(r.playedAt).replaceAll("/", ".");
  const putter = hs.length > 0 && hs.every((h) => h.putts != null) ? hs.reduce((s, h) => s + (h.putts ?? 0), 0) : null;
  return {
    id: r.id,
    dato,
    kortDato: dato.slice(0, 5),
    bane: r.courseName,
    score: r.score,
    par,
    hull,
    art: r.roundType,
    sg: r.sgTotal,
    sgKilde: r.sgSource,
    fairwayPct: prosent(hs.map((h) => h.fairway)),
    girPct: prosent(hs.map((h) => h.gir)),
    putter,
    kort: hs.length === 9 || hs.length === 18 ? hs.map((h) => ({ par: h.par, slag: h.strokes })) : null,
  };
}

function byggHull(inn: PH18RundeInn[]): PH18HullSnitt | null {
  const med = inn.filter((r) => r.holeScores.length === 18);
  if (med.length === 0) return null;
  const perBane = new Map<string, PH18RundeInn[]>();
  for (const r of med) perBane.set(r.courseName, [...(perBane.get(r.courseName) ?? []), r]);
  const [bane, runder] = [...perBane.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  const par = Array.from({ length: 18 }, (_, i) => runder[0].holeScores.find((h) => h.holeNumber === i + 1)?.par ?? 0);
  const perHull = par.map((_, i) => runder.map((r) => r.holeScores.find((h) => h.holeNumber === i + 1)).filter((h): h is NonNullable<typeof h> => h != null));
  const snitt = perHull.map((hs) => (hs.length ? hs.reduce((s, h) => s + (h.strokes - h.par), 0) / hs.length : 0));
  const dyr = snitt.indexOf(Math.max(...snitt));
  const best = snitt.indexOf(Math.min(...snitt));
  return {
    bane,
    antallRunder: runder.length,
    par,
    snitt,
    dyreste: { hull: dyr + 1, par: par[dyr], snitt: snitt[dyr], rundeMedBogey: perHull[dyr].filter((h) => h.strokes - h.par >= 1).length },
    beste: { hull: best + 1, par: par[best], snitt: snitt[best] },
  };
}

function byggSesonger(runder: PH18Runde[], inn: PH18RundeInn[]): PH18Sesong[] {
  const perAar = new Map<number, { maaned: number; tilPar: number; score: number }[]>();
  inn.forEach((r, i) => {
    if (runder[i].hull !== 18) return;
    const { aar, maaned } = osloAarMaaned(r.playedAt);
    perAar.set(aar, [...(perAar.get(aar) ?? []), { maaned, tilPar: runder[i].score - runder[i].par, score: runder[i].score }]);
  });
  return [...perAar.entries()]
    .sort((a, b) => b[0] - a[0])
    .slice(0, 4)
    .map(([aar, rs]) => ({
      aar,
      maaneder: Array.from({ length: 7 }, (_, k) => {
        const m = rs.filter((x) => x.maaned === k + 4);
        return m.length ? m.reduce((s, x) => s + x.tilPar, 0) / m.length : null;
      }),
      snittBrutto: rs.reduce((s, x) => s + x.score, 0) / rs.length,
      antall: rs.length,
    }))
    .reverse();
}

/** `inn` er sortert nyeste først. */
export function byggPH18(inn: PH18RundeInn[]): PH18Model {
  const runder = inn.map(tilRunde);
  return { runder, hull: byggHull(inn), sesonger: byggSesonger(runder, inn) };
}

export type PH18Metrikk = "snitt" | "fairway" | "gir" | "putter";

export const PH18_METRIKKER: { verdi: PH18Metrikk; navn: string; enhet: string; lavereErBedre: boolean; bareAtten: boolean }[] = [
  { verdi: "snitt", navn: "Snitt brutto", enhet: "slag", lavereErBedre: true, bareAtten: true },
  { verdi: "fairway", navn: "Fairway treff", enhet: "%", lavereErBedre: false, bareAtten: false },
  { verdi: "gir", navn: "GIR", enhet: "%", lavereErBedre: false, bareAtten: false },
  { verdi: "putter", navn: "Putter per runde", enhet: "putter", lavereErBedre: true, bareAtten: true },
];

/** Verdien til én metrikk for én runde. 9-hullsrunder teller ikke i snitt brutto og putter. */
export function metrikkVerdi(r: PH18Runde, m: PH18Metrikk): number | null {
  switch (m) {
    case "snitt": return r.hull === 18 ? r.score : null;
    case "fairway": return r.fairwayPct;
    case "gir": return r.girPct;
    case "putter": return r.hull === 18 ? r.putter : null;
  }
}
