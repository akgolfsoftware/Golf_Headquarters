/**
 * Datamodell og hjelpefunksjoner for PH-17 TrackMan & analyse
 * i Precision Athletics (Claude Design ui_kits/playerhq/screens/PH-17.jsx).
 *
 * Fire deler:
 * 1. Økter (TrackMan-økter, køller, 2D scatter-kart og parametere)
 * 2. Gapping (Carry per kølle med 1 SD spredning og avstandsgap)
 * 3. Utstyrshelse (Fitting-sjekk, rilleslitasje, loft-avvik)
 * 4. Stasjon (DataGolf-referanse for kølle mot PGA Tour og Kategori C)
 */

export type TrackManFane = "okter" | "gap" | "utstyr" | "stasjon";

export interface TrackManSessionItem {
  id: string;
  date: string;
  bay: string;
  shots: number;
  clubs: string[];
  title: string;
}

export interface TrackManClubStats {
  carry: number;
  clubSpeed: number;
  ballSpeed: number;
  smashFactor: number;
  launchAngle: number;
  clubPath: number;
  faceToPath: number | null;
  spinRate: number | null;
}

export interface TrackManGappingRow {
  id: string;
  club: string;
  carry: number;
  spredning: number;
  gapTilNeste: number | null;
  flag: "Overlapp" | "Hull" | null;
}

export interface TrackManGearItem {
  club: string;
  model: string;
  check: string;
  status: "OK" | "Sjekk loft" | "Slitte riller";
  note: string | null;
  est?: boolean;
}

export interface TrackManStationRow {
  id: string;
  param: string;
  enhet: string;
  spillerVerdi: number;
  pgaTourVerdi: number;
  kategoriCVerdi: number;
  avvikPga: number;
}

export interface PH17TrackManData {
  sessions: TrackManSessionItem[];
  shots: Record<string, Array<[x: number, y: number]>>;
  clubStats: Record<string, TrackManClubStats>;
  gapping: TrackManGappingRow[];
  gear: TrackManGearItem[];
  station: {
    club: string;
    spillerNavn: string;
    rows: TrackManStationRow[];
  };
}

/** Formaterer et tall med gitt antall desimaler og komma som skilletegn, uten .toFixed */
export function formaterDesimal(v: number | null | undefined, desimaler = 1): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const faktor = Math.pow(10, desimaler);
  const avrundet = Math.round(v * faktor) / faktor;
  const fortegn = avrundet < 0 ? "−" : "";
  const abs = Math.abs(avrundet);
  const heltall = Math.floor(abs);
  const rest = Math.round((abs - heltall) * faktor);

  if (desimaler === 0) {
    return `${fortegn}${heltall}`;
  }

  const restStr = String(rest).padStart(desimaler, "0");
  return `${fortegn}${heltall},${restStr}`;
}

/** Formaterer heltall med mellomrom som tusenskille (f.eks. spin rate 9 180) */
export function formaterHeltall(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const avrundet = Math.round(v);
  const s = String(Math.abs(avrundet));
  const fortegn = avrundet < 0 ? "−" : "";
  const medMellomrom = s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${fortegn}${medMellomrom}`;
}

/** Beregner gapping-rader og flagg (overlapp < 8 m, hull > 18 m) */
export function beregnGappingRader(
  kilde: Array<[club: string, carry: number, spredning: number]>
): TrackManGappingRow[] {
  return kilde.map(([club, carry, spredning], i) => {
    const neste = kilde[i + 1];
    const gapTilNeste = neste ? Math.round((carry - neste[1]) * 10) / 10 : null;
    let flag: "Overlapp" | "Hull" | null = null;
    if (gapTilNeste != null) {
      if (gapTilNeste < 8) flag = "Overlapp";
      else if (gapTilNeste > 18) flag = "Hull";
    }
    return {
      id: club,
      club,
      carry,
      spredning,
      gapTilNeste,
      flag,
    };
  });
}

const RAW_GAP_DATA: Array<[string, number, number]> = [
  ["Driver", 228.4, 18.2],
  ["3W", 201.0, 14.6],
  ["5W", 188.2, 12.1],
  ["4H", 178.5, 10.4],
  ["5i", 168.3, 9.8],
  ["6i", 160.1, 8.9],
  ["7i", 150.4, 8.1],
  ["8i", 139.2, 7.4],
  ["9i", 128.0, 6.8],
  ["PW", 112.6, 5.9],
  ["50°", 98.3, 4.8],
  ["54°", 82.1, 4.1],
  ["58°", 64.8, 3.6],
];

export const STANDARD_PH17_DATA: PH17TrackManData = {
  sessions: [
    {
      id: "tm1",
      date: "24.09.2026",
      bay: "Bay 3",
      shots: 96,
      clubs: ["PW", "50°", "54°", "58°"],
      title: "Wedge-lengder",
    },
    {
      id: "tm2",
      date: "17.09.2026",
      bay: "Bay 1",
      shots: 120,
      clubs: ["Driver", "7i", "PW"],
      title: "Full bag · kontroll",
    },
    {
      id: "tm3",
      date: "10.09.2026",
      bay: "Bay 3",
      shots: 84,
      clubs: ["6i", "7i", "8i"],
      title: "Innspill 150–200 m",
    },
  ],
  shots: {
    PW: [
      [1.8, 3.1],
      [-2.4, -1.2],
      [0.6, 4.6],
      [3.3, -2.8],
      [-0.9, 1.4],
      [1.1, -4.2],
      [-3.6, 2.2],
      [2.2, 0.7],
      [-1.4, -3.0],
      [0.2, 2.8],
      [4.1, 1.9],
      [-2.9, -0.4],
    ],
    "50°": [
      [1.2, 2.2],
      [-1.9, -0.8],
      [0.4, 3.5],
      [2.1, -2.1],
      [-0.6, 0.9],
      [0.9, -3.1],
      [-2.8, 1.5],
      [1.6, 0.4],
      [-1.1, -2.4],
      [0.3, 1.8],
    ],
    "54°": [
      [0.9, 1.4],
      [-1.4, -0.6],
      [0.2, 2.6],
      [1.8, -1.7],
      [-0.4, 0.8],
      [0.7, -2.2],
      [-2.1, 1.1],
      [1.2, 0.2],
      [-0.8, -1.9],
      [0.5, 1.2],
    ],
    "58°": [
      [0.6, 1.1],
      [-1.1, -0.4],
      [0.3, 1.9],
      [1.3, -1.2],
      [-0.5, 0.6],
      [0.5, -1.7],
      [-1.6, 0.9],
      [0.9, 0.1],
      [-0.7, -1.3],
    ],
    Driver: [
      [8, 12],
      [-14, -6],
      [4, 18],
      [18, -10],
      [-6, 4],
      [10, -16],
      [-20, 8],
      [12, 2],
      [-9, -12],
      [2, 10],
    ],
    "7i": [
      [3, 4],
      [-5, -2],
      [1, 6],
      [6, -4],
      [-2, 2],
      [4, -5],
      [-7, 3],
      [4, 1],
      [-3, -4],
      [1, 3],
    ],
    "6i": [
      [4, 5],
      [-6, -3],
      [2, 7],
      [7, -5],
      [-3, 2],
      [4, -6],
      [-8, 3],
    ],
    "8i": [
      [2, 3],
      [-4, -2],
      [1, 5],
      [5, -3],
      [-2, 1],
      [3, -4],
      [-5, 2],
    ],
  },
  clubStats: {
    Driver: {
      carry: 228.4,
      clubSpeed: 101.2,
      ballSpeed: 149.6,
      smashFactor: 1.48,
      launchAngle: 12.1,
      clubPath: 1.2,
      faceToPath: null,
      spinRate: 2650,
    },
    "3W": {
      carry: 201.0,
      clubSpeed: 95.0,
      ballSpeed: 139.1,
      smashFactor: 1.46,
      launchAngle: 11.4,
      clubPath: 0.6,
      faceToPath: null,
      spinRate: 3420,
    },
    "5W": {
      carry: 188.2,
      clubSpeed: 91.3,
      ballSpeed: 132.0,
      smashFactor: 1.45,
      launchAngle: 12.6,
      clubPath: 0.2,
      faceToPath: null,
      spinRate: 4100,
    },
    "4H": {
      carry: 178.5,
      clubSpeed: 88.4,
      ballSpeed: 125.0,
      smashFactor: 1.41,
      launchAngle: 13.2,
      clubPath: -0.1,
      faceToPath: null,
      spinRate: 4600,
    },
    "5i": {
      carry: 168.3,
      clubSpeed: 85.1,
      ballSpeed: 118.9,
      smashFactor: 1.4,
      launchAngle: 13.8,
      clubPath: -0.4,
      faceToPath: null,
      spinRate: 5200,
    },
    "6i": {
      carry: 160.1,
      clubSpeed: 82.6,
      ballSpeed: 114.2,
      smashFactor: 1.38,
      launchAngle: 15.5,
      clubPath: -0.9,
      faceToPath: null,
      spinRate: 5800,
    },
    "7i": {
      carry: 150.4,
      clubSpeed: 80.3,
      ballSpeed: 109.8,
      smashFactor: 1.37,
      launchAngle: 17.6,
      clubPath: -1.1,
      faceToPath: null,
      spinRate: 6480,
    },
    "8i": {
      carry: 139.2,
      clubSpeed: 77.9,
      ballSpeed: 104.1,
      smashFactor: 1.34,
      launchAngle: 19.8,
      clubPath: -0.8,
      faceToPath: null,
      spinRate: 7200,
    },
    "9i": {
      carry: 128.0,
      clubSpeed: 75.2,
      ballSpeed: 98.6,
      smashFactor: 1.31,
      launchAngle: 22.3,
      clubPath: -0.8,
      faceToPath: null,
      spinRate: 7800,
    },
    PW: {
      carry: 112.6,
      clubSpeed: 72.0,
      ballSpeed: 91.4,
      smashFactor: 1.27,
      launchAngle: 25.9,
      clubPath: -0.2,
      faceToPath: null,
      spinRate: 8120,
    },
    "50°": {
      carry: 98.3,
      clubSpeed: 69.8,
      ballSpeed: 85.1,
      smashFactor: 1.22,
      launchAngle: 28.4,
      clubPath: 0.3,
      faceToPath: null,
      spinRate: 8640,
    },
    "54°": {
      carry: 82.1,
      clubSpeed: 66.4,
      ballSpeed: 74.3,
      smashFactor: 1.12,
      launchAngle: 31.2,
      clubPath: 0.9,
      faceToPath: null,
      spinRate: 9180,
    },
    "58°": {
      carry: 64.8,
      clubSpeed: 62.0,
      ballSpeed: 66.1,
      smashFactor: 1.07,
      launchAngle: 34.6,
      clubPath: 1.4,
      faceToPath: null,
      spinRate: 9840,
    },
  },
  gapping: beregnGappingRader(RAW_GAP_DATA),
  gear: [
    {
      club: "Driver",
      model: "Stivt skaft · 10,5°",
      check: "14.03.2026",
      status: "OK",
      note: "Spin Rate stabil siste 3 mnd",
    },
    {
      club: "7i",
      model: "Stål · regular",
      check: "14.03.2026",
      status: "Sjekk loft",
      note: "Carry +6 m mot 8i-gap siden juni. Mulig sterkere loft.",
    },
    {
      club: "54°",
      model: "Bounce 10°",
      check: "14.03.2026",
      status: "Slitte riller",
      note: "Spin Rate −620 rpm siden april",
      est: true,
    },
    {
      club: "58°",
      model: "Bounce 8°",
      check: "14.03.2026",
      status: "OK",
      note: null,
    },
    {
      club: "Putter",
      model: "Mallet · 34 tommer",
      check: "02.05.2026",
      status: "OK",
      note: "Grep byttet 02.05.2026",
    },
  ],
  station: {
    club: "7i",
    spillerNavn: "Tobias",
    rows: [
      {
        id: "clubSpeed",
        param: "Club Speed",
        enhet: "mph",
        spillerVerdi: 80.3,
        pgaTourVerdi: 90.0,
        kategoriCVerdi: 78.0,
        avvikPga: -9.7,
      },
      {
        id: "ballSpeed",
        param: "Ball Speed",
        enhet: "mph",
        spillerVerdi: 109.8,
        pgaTourVerdi: 120.0,
        kategoriCVerdi: 106.0,
        avvikPga: -10.2,
      },
      {
        id: "smashFactor",
        param: "Smash Factor",
        enhet: "",
        spillerVerdi: 1.37,
        pgaTourVerdi: 1.33,
        kategoriCVerdi: 1.36,
        avvikPga: 0.04,
      },
      {
        id: "launchAngle",
        param: "Launch Angle",
        enhet: "°",
        spillerVerdi: 17.6,
        pgaTourVerdi: 16.3,
        kategoriCVerdi: 18.2,
        avvikPga: 1.3,
      },
      {
        id: "spinRate",
        param: "Spin Rate",
        enhet: "rpm",
        spillerVerdi: 6480,
        pgaTourVerdi: 7097,
        kategoriCVerdi: 6200,
        avvikPga: -617,
      },
      {
        id: "carry",
        param: "Carry",
        enhet: "m",
        spillerVerdi: 150.4,
        pgaTourVerdi: 157.0,
        kategoriCVerdi: 145.0,
        avvikPga: -6.6,
      },
      {
        id: "attackAngle",
        param: "Attack Angle",
        enhet: "°",
        spillerVerdi: -3.2,
        pgaTourVerdi: -4.3,
        kategoriCVerdi: -2.6,
        avvikPga: 1.1,
      },
    ],
  },
};
