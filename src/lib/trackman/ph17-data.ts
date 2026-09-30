/**
 * PH-17 TrackMan · Økter — data til spredning og snitt per kølle.
 * Leser bare TrackManSession/TrackManShot. Manglende felt gir null (vises «—»).
 */
import { prisma } from "@/lib/prisma";
import { ENVIRONMENT_LABELS } from "@/lib/sg-hub/environment-labels";

export type Ph17Snitt = {
  carry: number | null;
  clubSpeed: number | null;
  ballSpeed: number | null;
  smash: number | null;
  launch: number | null;
  clubPath: number | null;
  faceToPath: number | null;
  spin: number | null;
};

export type Ph17Kolle = {
  navn: string;
  /** [sideavvik m (+ = høyre), lengdeavvik m fra snitt-carry]. */
  pts: [number, number][];
  snitt: Ph17Snitt;
};

export type Ph17Okt = {
  id: string;
  tittel: string;
  dato: string;
  slag: number;
  kilde: string;
  klubber: Ph17Kolle[];
};

const KILDE: Record<string, string> = { "csv-import": "CSV", "html-import": "HTML", api: "API" };
const OSLO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });
const dma = (d: Date) => OSLO.format(d).replaceAll("/", ".");

function snittAv(v: (number | null)[]): number | null {
  const t = v.filter((x): x is number => x != null && Number.isFinite(x));
  return t.length ? t.reduce((a, b) => a + b, 0) / t.length : null;
}

type Slag = {
  club: string; carryDistance: number | null; side: number | null; clubSpeed: number | null; ballSpeed: number | null;
  smashFactor: number | null; launchAngle: number | null; clubPath: number | null; faceToPath: number | null; spinRate: number | null; outlier: boolean;
};

export function byggKolle(navn: string, slag: Slag[]): Ph17Kolle {
  const gyldige = slag.filter((s) => !s.outlier);
  const carry = snittAv(gyldige.map((s) => s.carryDistance));
  const pts: [number, number][] = carry == null ? [] : gyldige.flatMap((s) => (s.side != null && s.carryDistance != null ? [[s.side, s.carryDistance - carry] as [number, number]] : []));
  return {
    navn, pts,
    snitt: {
      carry: snittAv(gyldige.map((s) => s.carryDistance)), clubSpeed: snittAv(gyldige.map((s) => s.clubSpeed)), ballSpeed: snittAv(gyldige.map((s) => s.ballSpeed)),
      smash: snittAv(gyldige.map((s) => s.smashFactor)), launch: snittAv(gyldige.map((s) => s.launchAngle)), clubPath: snittAv(gyldige.map((s) => s.clubPath)),
      faceToPath: snittAv(gyldige.map((s) => s.faceToPath)), spin: snittAv(gyldige.map((s) => s.spinRate)),
    },
  };
}

const SLAG_VALG = {
  club: true, carryDistance: true, side: true, clubSpeed: true, ballSpeed: true, smashFactor: true,
  launchAngle: true, clubPath: true, faceToPath: true, spinRate: true, outlier: true,
} as const;

export async function hentPh17Okter(userId: string, valgtId?: string): Promise<Ph17Okt[]> {
  const select = { id: true, recordedAt: true, source: true, environment: true, shots: { select: SLAG_VALG, orderBy: { shotNumber: "asc" as const } } };
  const [siste, valgt] = await Promise.all([
    prisma.trackManSession.findMany({ where: { userId }, orderBy: { recordedAt: "desc" }, take: 20, select }),
    valgtId ? prisma.trackManSession.findFirst({ where: { id: valgtId, userId }, select }) : Promise.resolve(null),
  ]);
  const alle = valgt && !siste.some((s) => s.id === valgt.id) ? [...siste, valgt].sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime()) : siste;
  return alle.map((o) => {
    const perKolle = new Map<string, Slag[]>();
    for (const s of o.shots) perKolle.set(s.club, [...(perKolle.get(s.club) ?? []), s]);
    const klubber = [...perKolle.entries()].sort((a, b) => b[1].length - a[1].length).map(([n, s]) => byggKolle(n, s));
    return {
      id: o.id,
      tittel: o.environment ? ENVIRONMENT_LABELS[o.environment] : "TrackMan-økt",
      dato: dma(o.recordedAt),
      slag: o.shots.length,
      kilde: KILDE[o.source] ?? o.source,
      klubber,
    };
  });
}
