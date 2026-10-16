/**
 * PH-18 Runder og statistikk — ren aggregering (ingen database).
 *
 * Tar rundene slik Prisma leverer dem og bygger modellen skjermen viser:
 * runde-liste med scorekort, statistikk-serier, snitt til par per hull og
 * til par per måned per sesong. Manglende verdi er alltid null (vises «—»),
 * aldri 0 eller en gjetning. Score er brutto.
 *
 * Regel: Par og hullantall utledes ALDRI fra baneregisteret hvis hullscore mangler.
 * Ukjent hullantall gir hull: null, par: null og tilPar: null, og telles ikke
 * i snitt brutto eller sesonger.
 */

export type PH18RundeInn = {
  id: string;
  playedAt: Date;
  score: number;
  courseName: string;
  coursePar: number;
  notes?: string | null;
  status?: string | null;
  partialSave?: boolean | null;
  source?: string | null;
  sourceDate?: Date | null;
  sgTotal?: number | null;
  sgOtt?: number | null;
  sgApp?: number | null;
  sgArg?: number | null;
  sgPutt?: number | null;
  sgSource?: string | null;
  roundType?: string | null;
  holeScores: { holeNumber: number; par: number; strokes: number; putts: number | null; fairway: boolean | null; gir: boolean | null }[];
};

export type PH18Runde = {
  id: string;
  /** Full dato dd.mm.åååå (Oslo). */
  dato: string;
  /** Kortdato: dd.mm for inneværende år, dd.mm.åååå for eldre år. */
  kortDato: string;
  bane: string;
  score: number;
  /** Banens/rundens par hvis kjent (kun ved 9 eller 18 hull). */
  par: number | null;
  /** Score til par, f.eks. "+3", "−2", "E", eller null ("—"). */
  tilPar: string | null;
  /** 9 eller 18, eller null når antall hull ikke kan avgjøres. */
  hull: 9 | 18 | null;
  art: string | null;
  status: string;
  partialSave: boolean;
  kilde: string | null;
  kildeDato: string | null;
  notater: string | null;
  sg: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
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
  oversikt: PH18Oversikt;
};

/** Snittscore-kortet og snitt per par i PH-18 (pakke 5). Bare brutto, bare 18-hullsrunder i snittet. */
export type PH18Oversikt = {
  /** Sesongen (Oslo-år) snittet gjelder: nyeste år med en tellende runde, null uten. */
  aar: number | null;
  /** Snitt brutto for 18-hullsrunder med kjent par i sesongen. */
  snitt: number | null;
  antall: number;
  /** Snitt av de fem siste tellende rundene i sesongen (null under fem runder). */
  siste5: number | null;
  /** Snitt forrige sesong, for trendmerket (null uten tellende runder året før). */
  forrigeSnitt: number | null;
  /** Tellende runder i sesongen, eldste først, med glidende snitt av inntil fem siste. */
  serie: { dato: string; score: number; glidende: number }[];
  /** Snitt slag per hull for par 3, 4 og 5 fra alle runder med hullscore. null når ingen hull har den paren. */
  perPar: { par: 3 | 4 | 5; snitt: number | null; hull: number }[];
  /** Runder med hullscore som er med i snitt per par. */
  runderMedHull: number;
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

  // Regelen: Par og hullantall utledes ALDRI fra baneregisteret hvis hullscore mangler.
  // Kun runder med nøyaktig 9 eller 18 hull har kjent hullantall og kjent par.
  let hull: 9 | 18 | null = null;
  let par: number | null = null;
  let tilPar: string | null = null;

  if (hs.length === 18 || hs.length === 9) {
    hull = hs.length as 9 | 18;
    par = hs.reduce((s, h) => s + h.par, 0);
    const diff = r.score - par;
    tilPar = diff === 0 ? "E" : diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
  }

  const dato = OSLO.format(r.playedAt).replaceAll("/", ".");
  const roundYear = osloAarMaaned(r.playedAt).aar;
  const currentYear = new Date().getFullYear();
  // Hvis runden er fra et annet år enn i år: vis årstall for å unngå tvetydighet
  const kortDato = roundYear === currentYear ? dato.slice(0, 5) : dato;

  const kildeDato = r.sourceDate ? OSLO.format(r.sourceDate).replaceAll("/", ".") : null;
  const putter = hs.length > 0 && hs.every((h) => h.putts != null) ? hs.reduce((s, h) => s + (h.putts ?? 0), 0) : null;

  return {
    id: r.id,
    dato,
    kortDato,
    bane: r.courseName,
    score: r.score,
    par,
    tilPar,
    hull,
    art: r.roundType ?? null,
    status: r.status ?? (r.partialSave ? "Delvis lagret" : "Fullført"),
    partialSave: !!r.partialSave,
    kilde: r.source ?? r.sgSource ?? null,
    kildeDato,
    notater: r.notes ?? null,
    sg: r.sgTotal ?? null,
    sgOtt: r.sgOtt ?? null,
    sgApp: r.sgApp ?? null,
    sgArg: r.sgArg ?? null,
    sgPutt: r.sgPutt ?? null,
    sgKilde: r.sgSource ?? null,
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
    // Kun runder med 18 hull og kjent par teller i sesongtabellen
    if (runder[i].hull !== 18 || runder[i].par == null) return;
    const { aar, maaned } = osloAarMaaned(r.playedAt);
    perAar.set(aar, [...(perAar.get(aar) ?? []), { maaned, tilPar: runder[i].score - runder[i].par!, score: runder[i].score }]);
  });
  return [...perAar.entries()]
    .sort((a, b) => b[0] - a[0])
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

const snittAv = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

function byggOversikt(runder: PH18Runde[], inn: PH18RundeInn[]): PH18Oversikt {
  // Eldste først. Bare 18-hullsrunder med kjent par teller i snittet (ni hull teller ikke).
  const tellende = inn
    .map((r, i) => ({ r, ut: runder[i], aar: osloAarMaaned(r.playedAt).aar }))
    .filter((x) => x.ut.hull === 18 && x.ut.par != null)
    .sort((a, b) => a.r.playedAt.getTime() - b.r.playedAt.getTime());
  const aar = tellende.length ? tellende[tellende.length - 1].aar : null;
  const sesong = tellende.filter((x) => x.aar === aar);
  const scorer = sesong.map((x) => x.ut.score);
  const serie = sesong.map((x, i) => ({
    dato: x.ut.dato,
    score: x.ut.score,
    glidende: snittAv(scorer.slice(Math.max(0, i - 4), i + 1)) ?? x.ut.score,
  }));
  const forrige = aar == null ? [] : tellende.filter((x) => x.aar === aar - 1).map((x) => x.ut.score);

  const medHull = inn.filter((r) => r.holeScores.length > 0);
  const alleHull = medHull.flatMap((r) => r.holeScores);
  const perPar = ([3, 4, 5] as const).map((par) => {
    const hs = alleHull.filter((h) => h.par === par);
    return { par, snitt: snittAv(hs.map((h) => h.strokes)), hull: hs.length };
  });

  return {
    aar,
    snitt: snittAv(scorer),
    antall: scorer.length,
    siste5: scorer.length >= 5 ? snittAv(scorer.slice(-5)) : null,
    forrigeSnitt: snittAv(forrige),
    serie,
    perPar,
    runderMedHull: medHull.length,
  };
}

/** `inn` er sortert nyeste først. */
export function byggPH18(inn: PH18RundeInn[]): PH18Model {
  const runder = inn.map(tilRunde);
  return { runder, hull: byggHull(inn), sesonger: byggSesonger(runder, inn), oversikt: byggOversikt(runder, inn) };
}

export type PH18Metrikk = "snitt" | "fairway" | "gir" | "putter";

export const PH18_METRIKKER: { verdi: PH18Metrikk; navn: string; enhet: string; lavereErBedre: boolean; bareAtten: boolean }[] = [
  { verdi: "snitt", navn: "Snitt brutto", enhet: "slag", lavereErBedre: true, bareAtten: true },
  { verdi: "fairway", navn: "Fairway treff", enhet: "%", lavereErBedre: false, bareAtten: false },
  { verdi: "gir", navn: "GIR", enhet: "%", lavereErBedre: false, bareAtten: false },
  { verdi: "putter", navn: "Putter per runde", enhet: "putter", lavereErBedre: true, bareAtten: true },
];

/** Verdien til én metrikk for én runde. Runder uten 18 hull teller ikke i snitt brutto og putter. */
export function metrikkVerdi(r: PH18Runde, m: PH18Metrikk): number | null {
  switch (m) {
    case "snitt": return r.hull === 18 ? r.score : null;
    case "fairway": return r.fairwayPct;
    case "gir": return r.girPct;
    case "putter": return r.hull === 18 ? r.putter : null;
  }
}
