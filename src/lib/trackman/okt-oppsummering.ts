/**
 * AG-18: sammendrag per TrackMan-økt, regnet ut fra de lagrede slagene.
 * Ingen tall lages: mangler målingen, er verdien null og vises som «—».
 */

export type OktSlag = {
  club: string;
  outlier: boolean;
  clubSpeed: number | null;
  ballSpeed: number | null;
  smashFactor: number | null;
  launchAngle: number | null;
  spinRate: number | null;
  clubPath: number | null;
  faceAngle: number | null;
  carryDistance: number | null;
};

export type OktRad = [string, string, number | null];

export type OktOppsummering = {
  /** Kølla med flest slag i økta, eller null uten slag. */
  club: string | null;
  rows: OktRad[];
};

const MILJO_ETIKETT: Record<string, string> = {
  SIMULATOR_INDOOR: "Simulator inne",
  NET_INDOOR: "Nett inne",
  RANGE_OUTDOOR_MAT: "Range ute, matte",
  RANGE_OUTDOOR_GRASS: "Range ute, gress",
  COURSE_PRACTICE: "Bane, trening",
  COURSE_COMPETITION: "Bane, konkurranse",
};

export function miljoEtikett(miljo: string | null | undefined): string | null {
  return miljo ? (MILJO_ETIKETT[miljo] ?? null) : null;
}

function snitt(verdier: Array<number | null>): number | null {
  const gyldige = verdier.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (gyldige.length === 0) return null;
  return gyldige.reduce((a, b) => a + b, 0) / gyldige.length;
}

export function oppsummerOkt(slag: OktSlag[]): OktOppsummering {
  const telling = new Map<string, number>();
  for (const s of slag) telling.set(s.club, (telling.get(s.club) ?? 0) + 1);

  let club: string | null = null;
  let flest = 0;
  for (const [navn, antall] of telling) {
    if (antall > flest) {
      club = navn;
      flest = antall;
    }
  }

  // Snitt for dominerende kølle, uten utliggere (samme regel som trendene).
  const utvalg = slag.filter((s) => s.club === club && !s.outlier);
  const rows: OktRad[] = [
    ["Club Speed", "mph", snitt(utvalg.map((s) => s.clubSpeed))],
    ["Ball Speed", "mph", snitt(utvalg.map((s) => s.ballSpeed))],
    ["Smash Factor", "", snitt(utvalg.map((s) => s.smashFactor))],
    ["Launch Angle", "°", snitt(utvalg.map((s) => s.launchAngle))],
    ["Spin Rate", "rpm", snitt(utvalg.map((s) => s.spinRate))],
    ["Club Path", "°", snitt(utvalg.map((s) => s.clubPath))],
    ["Face Angle", "°", snitt(utvalg.map((s) => s.faceAngle))],
    ["Carry", "m", snitt(utvalg.map((s) => s.carryDistance))],
  ];

  return { club, rows };
}

/** «m:ss» fra sekunder, eller null når varigheten ikke er lagret. */
export function formaterVarighet(sek: number | null | undefined): string | null {
  if (sek == null || !Number.isFinite(sek) || sek < 0) return null;
  const hele = Math.round(sek);
  return `${Math.floor(hele / 60)}:${String(hele % 60).padStart(2, "0")}`;
}
