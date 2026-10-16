/**
 * Datamodell og hjelpefunksjoner for PH-16 Stats og PH-16b Skill Map
 * i Precision Athletics (Claude Design ui_kits/playerhq/screens/PH-16-stats.jsx).
 *
 * Fire deler:
 * 1. Snittscore (PH-18 runde og snittscore, Kategori A-K)
 * 2. Strokes Gained (SG per område, sammenligning mot neste kategori og PGA Tour)
 * 3. Trening (volum, pyramidefordeling, TrackMan-spredningskart og parametere)
 * 4. Tester (testbatteri og protokoller)
 *
 * Alt bygges fra målte data (`byggPH16Stats`). Det som ikke er målt, er null
 * (vises «—») eller en tom liste (skjermens tomtilstand). Ingen demotall.
 */

export type StatsFane = "snitt" | "sg" | "tren" | "test";

export interface SgRad {
  id: string;
  label: string;
  g: "tee" | "innspill" | "naer" | "putt";
  c: number | null; // SG mot neste kategori — null så lenge kategorireferansen ikke er vedtatt
  pga: number | null; // SG mot PGA Tour-referansen (snitt siste 10 runder), null under 4 runder
  n: number; // antall runder med målt SG for området i vinduet (siste 10)
  d: number | null; // trend (siste 10 mot 10 før), null uten nok runder i begge vinduene
  prox?: [number, number]; // [du, pga] i meter
}

export interface SgGruppe {
  g: "tee" | "innspill" | "naer" | "putt";
  label: string;
  rows: SgRad[];
}

export interface RundeData {
  id: string;
  date: string;
  course: string;
  /** Par fra rundens hullscore (9 eller 18 hull). null når hullantallet er ukjent. */
  par: number | null;
  score: number;
  diff: number | null; // score - par, null når par er ukjent
  kind: "Turnering" | "Treningsrunde" | null;
  sg: number | null;
  card?: number[];
}

export interface PyramideData {
  rows: Array<[kode: "fys" | "tek" | "slag" | "spill" | "turn", prosent: number, timer: number]>;
  totalHours: number | null;
  src: string;
}

export interface TrackManKolleParam {
  navn: string;
  enhet: string;
  snitt: number;
  spredning: number;
  mal?: string | null;
}

export interface TrackManKolleData {
  params: TrackManKolleParam[];
  shots: Array<[x: number, y: number]>; // [sideveis meter, lengde meter]
  antallSlag: number;
}

export interface TestBatteriPost {
  id: string;
  name: string;
  sub: string;
  axis: "slag" | "fys" | "tek" | "spill" | "turn";
  unit: string;
  hist: number[];
  dates: string[];
  norm: number | null;
  hi: boolean;
  by: "Kontrollert" | "Egenregistrert";
  lvl?: string | null;
}

export interface PH16StatsData {
  spiller: {
    navn: string;
    /** Bokstav A–K. null så lenge nivåtallene for A–K ikke er vedtatt. */
    kategori: string | null;
    nesteKategori: string | null;
    /** Snitt brutto av siste 10 18-hullsrunder. null under 4 runder. */
    snittBrutto: number | null;
    /** Snitt brutto av de 10 18-hullsrundene før. null under 4 runder i det vinduet. */
    forrigeSnitt: number | null;
    slagTilNesteKategori: number | null;
    /** Antall 18-hullsrunder i snittvinduet (maks 10). */
    antallSnittRunder: number;
    trend: number[];
  };
  sg: SgGruppe[];
  runder: RundeData[];
  trening: {
    pyramide: PyramideData;
    trackman: {
      koller: string[];
      data: Record<string, TrackManKolleData>;
    };
  };
  tester: TestBatteriPost[];
}

/** Formaterer et tall med gitt antall desimaler og komma som skilletegn, uten .toFixed */
export function formaterDesimal(v: number | null | undefined, desimaler = 1): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const faktor = Math.pow(10, desimaler);
  const avrundet = Math.round(Math.abs(v) * faktor) / faktor;
  const fortegn = v < 0 ? "−" : "";
  const streng = String(avrundet);
  const deler = streng.split(".");
  const hel = deler[0];
  let des = deler[1] || "";
  while (des.length < desimaler) des += "0";
  return desimaler > 0 ? `${fortegn}${hel},${des}` : `${fortegn}${hel}`;
}

/** Formaterer Strokes Gained med fortegn og komma */
export function formaterSg(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  if (Math.abs(v) < 0.05) return "0,0";
  const pluss = v > 0 ? "+" : "";
  return pluss + formaterDesimal(v, 1);
}

/** Beregner gjennomsnitt og standardavvik for 2D scatter-punkter */
export function beregnSpredning(punkter: Array<[x: number, y: number]>): {
  mx: number;
  my: number;
  sdx: number;
  sdy: number;
} {
  if (!punkter.length) return { mx: 0, my: 0, sdx: 0, sdy: 0 };
  const mx = punkter.reduce((s, p) => s + p[0], 0) / punkter.length;
  const my = punkter.reduce((s, p) => s + p[1], 0) / punkter.length;
  const sdx = Math.sqrt(
    punkter.reduce((s, p) => s + Math.pow(p[0] - mx, 2), 0) / punkter.length
  );
  const sdy = Math.sqrt(
    punkter.reduce((s, p) => s + Math.pow(p[1] - my, 2), 0) / punkter.length
  );
  return { mx, my, sdx, sdy };
}

/** Under så mange runder trekkes ingen konklusjon (beslutninger.md §SKJERMENE … RUNDE 8). */
export const MIN_RUNDER_FOR_KONKLUSJON = 4;
/** Vindu for snitt og trend: siste 10 mot 10 før. */
export const SNITT_VINDU = 10;
/** Referansesettet SG-motoren regner mot (src/lib/domain/sg-reference.ts). */
export const PGA_REFERANSE = "PGA_TOUR";

/** SG-kilder appen faktisk lagrer (manuell, beregnet fra slag eller estimert). */
const KJENTE_SG_KILDER = new Set(["manual", "beregnet", "estimert"]);

export interface PH16RundeInn {
  id: string;
  playedAt: Date;
  score: number;
  roundType: string | null;
  courseName: string | null;
  sgTotal: number | null;
  sgSource: string | null;
  benchmarkLevelSnapshot: string | null;
  holeScores: { par: number }[];
  sgTee: number | null;
  sgApp200: number | null;
  sgApp150: number | null;
  sgApp100: number | null;
  sgApp50: number | null;
  sgChip: number | null;
  sgPitch: number | null;
  sgLob: number | null;
  sgBunker: number | null;
  sgPutt0_3: number | null;
  sgPutt3_5: number | null;
  sgPutt5_10: number | null;
  sgPutt10_15: number | null;
  sgPutt15_25: number | null;
  sgPutt25_40: number | null;
  sgPutt40plus: number | null;
}

export interface PH16TmSlagInn {
  club: string;
  side: number | null;
  carryDistance: number | null;
  clubPath: number | null;
  faceAngle: number | null;
  faceToPath: number | null;
  attackAngle: number | null;
  dynamicLoft: number | null;
  clubSpeed: number | null;
  outlier: boolean;
}

export interface PH16Inn {
  navn: string;
  /** Sortert nyeste først. */
  runder: PH16RundeInn[];
  tmSlag: PH16TmSlagInn[];
}

type SgOmrade = {
  id: string;
  label: string;
  g: SgRad["g"];
  verdi: (r: PH16RundeInn) => number | null;
};

function sumAvKjente(...v: Array<number | null>): number | null {
  const kjente = v.filter((x): x is number => x != null);
  return kjente.length ? kjente.reduce((a, b) => a + b, 0) : null;
}

/** Områdene følger feltene Round faktisk lagrer (src/lib/runde-logg/granulaer-sg.ts). */
const SG_OMRADER: SgOmrade[] = [
  { id: "tee", label: "Tee", g: "tee", verdi: (r) => r.sgTee },
  { id: "i200", label: "200+ m", g: "innspill", verdi: (r) => r.sgApp200 },
  { id: "i150", label: "150–200 m", g: "innspill", verdi: (r) => r.sgApp150 },
  { id: "i100", label: "100–150 m", g: "innspill", verdi: (r) => r.sgApp100 },
  { id: "i50", label: "50–100 m", g: "innspill", verdi: (r) => r.sgApp50 },
  { id: "chip", label: "Chip", g: "naer", verdi: (r) => r.sgChip },
  { id: "pitch", label: "Pitch", g: "naer", verdi: (r) => r.sgPitch },
  { id: "lob", label: "Lob", g: "naer", verdi: (r) => r.sgLob },
  { id: "bunker", label: "Bunker", g: "naer", verdi: (r) => r.sgBunker },
  { id: "p0", label: "0–3 fot", g: "putt", verdi: (r) => r.sgPutt0_3 },
  { id: "p3", label: "3–5 fot", g: "putt", verdi: (r) => r.sgPutt3_5 },
  { id: "p6", label: "5–10 fot", g: "putt", verdi: (r) => r.sgPutt5_10 },
  { id: "p10", label: "10–25 fot", g: "putt", verdi: (r) => sumAvKjente(r.sgPutt10_15, r.sgPutt15_25) },
  { id: "p20", label: "25–40 fot", g: "putt", verdi: (r) => r.sgPutt25_40 },
  { id: "p40", label: "40+ fot", g: "putt", verdi: (r) => r.sgPutt40plus },
];

const SG_GRUPPER: Array<{ g: SgRad["g"]; label: string }> = [
  { g: "tee", label: "Tee" },
  { g: "innspill", label: "Innspill" },
  { g: "naer", label: "Nærspill 0–50 m" },
  { g: "putt", label: "Putting" },
];

function snitt(v: number[]): number | null {
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

function avrund(v: number | null, desimaler = 1): number | null {
  if (v == null) return null;
  const f = Math.pow(10, desimaler);
  return Math.round(v * f) / f;
}

/** Snitt av et vindu, eller null når vinduet har færre enn MIN_RUNDER_FOR_KONKLUSJON verdier. */
function vinduSnitt(v: number[]): number | null {
  return v.length >= MIN_RUNDER_FOR_KONKLUSJON ? snitt(v) : null;
}

function rundeType(t: string | null): RundeData["kind"] {
  const n = t?.toLowerCase();
  if (n === "turnering" || n === "tournament") return "Turnering";
  if (n === "trening" || n === "practice") return "Treningsrunde";
  return null;
}

const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function byggSg(runder: PH16RundeInn[]): SgGruppe[] {
  // Bare runder beregnet mot PGA Tour-referansen gir tall vi vet hva betyr.
  const pgaRunder = runder.filter((r) => r.benchmarkLevelSnapshot === PGA_REFERANSE);
  const rader: SgRad[] = SG_OMRADER.map((o) => {
    const verdier = pgaRunder.map(o.verdi).filter((v): v is number => v != null);
    const siste = verdier.slice(0, SNITT_VINDU);
    const foer = verdier.slice(SNITT_VINDU, SNITT_VINDU * 2);
    const sisteSnitt = vinduSnitt(siste);
    const foerSnitt = vinduSnitt(foer);
    return {
      id: o.id,
      label: o.label,
      g: o.g,
      c: null,
      pga: avrund(sisteSnitt, 2),
      n: siste.length,
      d: sisteSnitt != null && foerSnitt != null ? avrund(sisteSnitt - foerSnitt, 2) : null,
    };
  });
  return SG_GRUPPER.map((gr) => ({ ...gr, rows: rader.filter((r) => r.g === gr.g) }));
}

const TM_PARAMETRE: Array<{ navn: string; enhet: string; felt: keyof PH16TmSlagInn }> = [
  { navn: "Club Path", enhet: "°", felt: "clubPath" },
  { navn: "Face Angle", enhet: "°", felt: "faceAngle" },
  { navn: "Face to Path", enhet: "°", felt: "faceToPath" },
  { navn: "Attack Angle", enhet: "°", felt: "attackAngle" },
  { navn: "Dynamic Loft", enhet: "°", felt: "dynamicLoft" },
  { navn: "Club Speed", enhet: "mph", felt: "clubSpeed" },
];

function byggTrackman(slag: PH16TmSlagInn[]): PH16StatsData["trening"]["trackman"] {
  const perKolle = new Map<string, PH16TmSlagInn[]>();
  for (const s of slag) {
    if (s.outlier || !s.club) continue;
    perKolle.set(s.club, [...(perKolle.get(s.club) ?? []), s]);
  }
  const data: Record<string, TrackManKolleData> = {};
  for (const [kolle, liste] of perKolle) {
    const params: TrackManKolleParam[] = [];
    for (const p of TM_PARAMETRE) {
      const v = liste.map((s) => s[p.felt]).filter((x): x is number => typeof x === "number");
      const m = snitt(v);
      if (m == null) continue;
      const sd = Math.sqrt(v.reduce((a, x) => a + (x - m) ** 2, 0) / v.length);
      params.push({ navn: p.navn, enhet: p.enhet, snitt: m, spredning: sd, mal: null });
    }
    data[kolle] = {
      antallSlag: liste.length,
      params,
      shots: liste
        .filter((s) => s.side != null && s.carryDistance != null)
        .map((s) => [s.side as number, s.carryDistance as number]),
    };
  }
  const koller = [...perKolle.keys()].sort((a, b) => data[b].antallSlag - data[a].antallSlag);
  return { koller, data };
}

/**
 * Bygger Stats-grunnlaget bare fra målte data.
 * - Snitt brutto: bare 18-hullsrunder (hullscore), siste 10, minst 4.
 * - Forrige snitt: de 10 18-hullsrundene før, minst 4 — ellers null.
 * - Par: summen av hullscorens par (9 eller 18 hull), aldri baneregisteret.
 * - SG: rundenes lagrede områdefelt mot PGA Tour-referansen. Neste kategori er null.
 * - Kategori A–K: null til nivåtallene er vedtatt.
 */
export function byggPH16Stats(inn: PH16Inn): PH16StatsData {
  const atten = inn.runder.filter((r) => r.holeScores.length === 18 && r.score > 0);
  const siste = atten.slice(0, SNITT_VINDU).map((r) => r.score);
  const foer = atten.slice(SNITT_VINDU, SNITT_VINDU * 2).map((r) => r.score);

  const runder: RundeData[] = inn.runder.slice(0, SNITT_VINDU).map((r) => {
    const kjentHullantall = r.holeScores.length === 9 || r.holeScores.length === 18;
    const par = kjentHullantall ? r.holeScores.reduce((s, h) => s + h.par, 0) : null;
    return {
      id: r.id,
      date: OSLO_DATO.format(r.playedAt),
      course: r.courseName ?? "—",
      par,
      score: r.score,
      diff: par != null ? r.score - par : null,
      kind: rundeType(r.roundType),
      sg: r.sgTotal != null && r.sgSource != null && KJENTE_SG_KILDER.has(r.sgSource) ? r.sgTotal : null,
    };
  });

  return {
    spiller: {
      navn: inn.navn,
      kategori: null,
      nesteKategori: null,
      snittBrutto: avrund(vinduSnitt(siste)),
      forrigeSnitt: avrund(vinduSnitt(foer)),
      slagTilNesteKategori: null,
      antallSnittRunder: siste.length,
      trend: [...siste].reverse(),
    },
    sg: byggSg(inn.runder),
    runder,
    trening: {
      pyramide: { rows: [], totalHours: null, src: "ØKTLOGG IKKE KOBLET HIT ENNÅ" },
      trackman: byggTrackman(inn.tmSlag),
    },
    tester: [],
  };
}
