/**
 * Datamodell og hjelpefunksjoner for PH-16 Stats og PH-16b Skill Map
 * i Precision Athletics (Claude Design ui_kits/playerhq/screens/PH-16-stats.jsx).
 *
 * Fire deler:
 * 1. Snittscore (PH-18 runde og snittscore, Kategori A-K)
 * 2. Strokes Gained (SG per område, sammenligning mot Kategori C og PGA Tour)
 * 3. Trening (volum, pyramidefordeling, TrackMan-spredningskart og parametere)
 * 4. Tester (testbatteri og protokoller)
 */

export type StatsFane = "snitt" | "sg" | "tren" | "test";

export interface SgRad {
  id: string;
  label: string;
  g: "tee" | "innspill" | "naer" | "putt";
  c: number; // SG mot Kategori C
  pga: number; // SG mot PGA Tour
  n: number; // antall slag
  d: number | null; // trend (siste 10 mot 10 før)
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
  par: number;
  score: number;
  diff: number; // score - par
  kind: "Tellende" | "Turnering" | "Treningsrunde";
  sg: number;
  card?: number[];
}

export interface PyramideData {
  rows: Array<[kode: "fys" | "tek" | "slag" | "spill" | "turn", prosent: number, timer: number]>;
  totalHours: number;
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
    kategori: string;
    nesteKategori: string;
    snittBrutto: number;
    forrigeSnitt: number;
    slagTilNesteKategori: number;
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

export const STANDARD_PH16_DATA: PH16StatsData = {
  spiller: {
    navn: "Tobias Lindvik",
    kategori: "D",
    nesteKategori: "C",
    snittBrutto: 75.2,
    forrigeSnitt: 76.6,
    slagTilNesteKategori: 1.2,
    trend: [77.4, 77.0, 76.8, 76.6, 76.1, 75.8, 75.6, 75.2],
  },
  sg: [
    {
      g: "tee",
      label: "Tee",
      rows: [
        { id: "tee", label: "Tee · par 4 og 5", g: "tee", c: -0.1, pga: -1.6, n: 196, d: 0.3 },
      ],
    },
    {
      g: "innspill",
      label: "Innspill",
      rows: [
        { id: "i200", label: "200+ m", g: "innspill", c: -0.2, pga: -0.7, n: 38, d: 0.0, prox: [24.1, 16.2] },
        { id: "i150", label: "150–200 m", g: "innspill", c: -0.3, pga: -1.1, n: 96, d: -0.1, prox: [14.8, 10.2] },
        { id: "i100", label: "100–150 m", g: "innspill", c: -0.4, pga: -1.0, n: 142, d: 0.1, prox: [11.6, 7.4] },
        { id: "i50", label: "50–100 m", g: "innspill", c: -0.1, pga: -0.5, n: 88, d: 0.1, prox: [9.4, 5.8] },
      ],
    },
    {
      g: "naer",
      label: "Nærspill 0–50 m",
      rows: [
        { id: "chip", label: "Chip", g: "naer", c: -0.1, pga: -0.3, n: 58, d: 0.2, prox: [2.4, 1.6] },
        { id: "pitch", label: "Pitch", g: "naer", c: -0.2, pga: -0.4, n: 31, d: 0.0, prox: [4.1, 2.7] },
        { id: "lob", label: "Lob", g: "naer", c: -0.1, pga: -0.1, n: 9, d: null, prox: [3.8, 2.9] },
        { id: "bunker", label: "Bunker", g: "naer", c: -0.1, pga: -0.3, n: 17, d: -0.1, prox: [4.6, 3.1] },
      ],
    },
    {
      g: "putt",
      label: "Putting",
      rows: [
        { id: "p0", label: "0–3 fot", g: "putt", c: 0.0, pga: -0.1, n: 212, d: 0.0 },
        { id: "p3", label: "3–6 fot", g: "putt", c: -0.3, pga: -0.5, n: 64, d: -0.2 },
        { id: "p6", label: "6–10 fot", g: "putt", c: -0.1, pga: -0.3, n: 48, d: 0.0 },
        { id: "p10", label: "10–20 fot", g: "putt", c: -0.1, pga: -0.2, n: 71, d: 0.1 },
        { id: "p20", label: "20–40 fot", g: "putt", c: 0.0, pga: -0.1, n: 52, d: 0.0 },
        { id: "p40", label: "40+ fot", g: "putt", c: -0.1, pga: -0.1, n: 19, d: null },
      ],
    },
  ],
  runder: [
    { id: "r22", date: "20.09.2026", course: "Fredrikstad GK", par: 72, score: 76, diff: 4, kind: "Tellende", sg: -2.6 },
    { id: "r21", date: "13.09.2026", course: "Borregaard GK", par: 71, score: 74, diff: 3, kind: "Turnering", sg: -1.7 },
    { id: "r20", date: "06.09.2026", course: "Onsøy GK", par: 72, score: 75, diff: 3, kind: "Tellende", sg: -2.0 },
    { id: "r19", date: "30.08.2026", course: "Fredrikstad GK", par: 72, score: 73, diff: 1, kind: "Turnering", sg: -0.9 },
    { id: "r18", date: "23.08.2026", course: "Fredrikstad GK", par: 72, score: 77, diff: 5, kind: "Tellende", sg: -3.1 },
    { id: "r17", date: "16.08.2026", course: "Borregaard GK", par: 71, score: 75, diff: 4, kind: "Tellende", sg: -2.3 },
    { id: "r16", date: "09.08.2026", course: "Hvaler GK", par: 72, score: 76, diff: 4, kind: "Turnering", sg: -2.4 },
    { id: "r15", date: "02.08.2026", course: "Fredrikstad GK", par: 72, score: 74, diff: 2, kind: "Tellende", sg: -1.4 },
    { id: "r14", date: "26.07.2026", course: "Onsøy GK", par: 72, score: 76, diff: 4, kind: "Tellende", sg: -2.5 },
    { id: "r13", date: "19.07.2026", course: "Fredrikstad GK", par: 72, score: 76, diff: 4, kind: "Tellende", sg: -2.2 },
  ],
  trening: {
    pyramide: {
      rows: [
        ["fys", 22, 21.2],
        ["tek", 5, 4.8],
        ["slag", 45, 43.4],
        ["spill", 23, 22.2],
        ["turn", 5, 4.8],
      ],
      totalHours: 96.5,
      src: "ØKTLOGG · UKE 31–38 · 96,5 T · 20.09.2026",
    },
    trackman: {
      koller: ["7i", "PW", "Driver"],
      data: {
        "7i": {
          antallSlag: 64,
          params: [
            { navn: "Club Path", enhet: "°", snitt: 1.8, spredning: 2.4, mal: "0 til +2°" },
            { navn: "Face Angle", enhet: "°", snitt: -0.6, spredning: 2.1, mal: null },
            { navn: "Face to Path", enhet: "°", snitt: -2.4, spredning: 1.9, mal: "−1 til +1°" },
            { navn: "Attack Angle", enhet: "°", snitt: -3.2, spredning: 1.2, mal: "−4 til −2°" },
            { navn: "Dynamic Loft", enhet: "°", snitt: 22.4, spredning: 1.6, mal: null },
            { navn: "Club Speed", enhet: "mph", snitt: 80.3, spredning: 1.4, mal: null },
          ],
          shots: [
            [-2.1, 142], [-1.2, 145], [0.4, 144], [1.1, 147], [-0.5, 143],
            [2.3, 148], [-3.1, 139], [0.8, 146], [-1.8, 141], [1.5, 149],
            [0.2, 145], [-0.9, 143], [1.9, 146], [-2.4, 140], [0.5, 145],
          ],
        },
        PW: {
          antallSlag: 96,
          params: [
            { navn: "Club Path", enhet: "°", snitt: 2.6, spredning: 2.8, mal: "0 til +2°" },
            { navn: "Face Angle", enhet: "°", snitt: 0.4, spredning: 2.3, mal: null },
            { navn: "Face to Path", enhet: "°", snitt: -2.2, spredning: 2.0, mal: "−1 til +1°" },
            { navn: "Attack Angle", enhet: "°", snitt: -4.6, spredning: 1.4, mal: "−5 til −3°" },
            { navn: "Dynamic Loft", enhet: "°", snitt: 31.8, spredning: 2.1, mal: null },
            { navn: "Club Speed", enhet: "mph", snitt: 72.1, spredning: 1.6, mal: null },
          ],
          shots: [
            [-1.1, 112], [0.2, 114], [-0.8, 111], [1.2, 115], [-1.5, 110],
            [0.5, 113], [1.8, 116], [-0.2, 112], [-1.9, 109], [0.9, 114],
          ],
        },
        Driver: {
          antallSlag: 48,
          params: [
            { navn: "Club Path", enhet: "°", snitt: 3.4, spredning: 3.1, mal: null },
            { navn: "Face Angle", enhet: "°", snitt: 1.2, spredning: 2.6, mal: null },
            { navn: "Face to Path", enhet: "°", snitt: -2.2, spredning: 2.2, mal: null },
            { navn: "Attack Angle", enhet: "°", snitt: 1.1, spredning: 1.8, mal: "+2 til +4°" },
            { navn: "Dynamic Loft", enhet: "°", snitt: 14.6, spredning: 1.9, mal: null },
            { navn: "Club Speed", enhet: "mph", snitt: 101.2, spredning: 1.8, mal: "105 mph" },
          ],
          shots: [
            [-4.2, 235], [2.1, 242], [-1.8, 238], [3.5, 246], [-5.1, 230],
            [1.2, 241], [-0.5, 239], [4.8, 248], [-2.3, 236], [0.8, 240],
          ],
        },
      },
    },
  },
  tester: [
    {
      id: "t50",
      name: "Innspill 50–100 m",
      sub: "10 slag · innenfor 4 m",
      axis: "slag",
      unit: "av 10",
      hist: [3, 4, 4, 5, 5],
      dates: ["02.05", "13.06", "11.07", "15.08", "12.09"],
      norm: 7,
      hi: true,
      by: "Kontrollert",
      lvl: "D",
    },
    {
      id: "tp3",
      name: "Putting 3 fot",
      sub: "20 putter i rad",
      axis: "slag",
      unit: "av 20",
      hist: [13, 14, 15, 16, 16],
      dates: ["02.05", "13.06", "11.07", "15.08", "12.09"],
      norm: 18,
      hi: true,
      by: "Egenregistrert",
      lvl: "D",
    },
    {
      id: "tch",
      name: "Chip 10 m",
      sub: "10 slag · innenfor 1 m",
      axis: "slag",
      unit: "av 10",
      hist: [4, 5, 6],
      dates: ["13.06", "15.08", "12.09"],
      norm: 7,
      hi: true,
      by: "Kontrollert",
      lvl: "D",
    },
    {
      id: "tcs",
      name: "Driver · Club Speed",
      sub: "Snitt av 5 slag",
      axis: "fys",
      unit: "mph",
      hist: [98.4, 99.6, 100.4, 101.2],
      dates: ["02.05", "11.07", "15.08", "12.09"],
      norm: 105,
      hi: true,
      by: "Kontrollert",
      lvl: "D",
    },
  ],
};
