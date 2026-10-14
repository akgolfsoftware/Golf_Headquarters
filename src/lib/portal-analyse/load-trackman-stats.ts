/**
 * Henter TrackMan-økter med alle slag for Stats › TrackMan (pakke 6).
 * Bare ekte data. Ingen økter gir tom liste, aldri demotall.
 * Regnestykkene ligger i trackman-stats.ts.
 */
import { prisma } from "@/lib/prisma";
import { harCoachLesetilgangTilSpiller } from "@/lib/auth/coached";
import { stedFraMiljo, type TmOkt, type TmSlag } from "./trackman-stats";

const SLAG_FELT = {
  shotNumber: true, club: true, outlier: true, targetDistanceM: true, hastighet: true,
  ballSpeed: true, smashFactor: true, launchAngle: true, launchDirection: true, spinRate: true, spinAxis: true,
  carryDistance: true, totalDistance: true, side: true, apexHeight: true, landAngle: true,
  clubSpeed: true, attackAngle: true, clubPath: true, faceAngle: true, faceToPath: true, dynamicLoft: true,
  strikePatternX: true, strikePatternY: true,
  task: { select: { tittel: true } },
} as const;

type SesjonRad = {
  id: string;
  recordedAt: Date;
  environment: string | null;
  targetDistanceM: number | null;
  shots: Array<{
    shotNumber: number; club: string; outlier: boolean; targetDistanceM: number | null; hastighet: TmSlag["hast"];
    ballSpeed: number | null; smashFactor: number | null; launchAngle: number | null; launchDirection: number | null;
    spinRate: number | null; spinAxis: number | null; carryDistance: number | null; totalDistance: number | null;
    side: number | null; apexHeight: number | null; landAngle: number | null; clubSpeed: number | null;
    attackAngle: number | null; clubPath: number | null; faceAngle: number | null; faceToPath: number | null;
    dynamicLoft: number | null; strikePatternX: number | null; strikePatternY: number | null;
    task: { tittel: string } | null;
  }>;
};

export function tilTmOkt(s: SesjonRad): TmOkt {
  const oppgaver = new Map<string, number>();
  for (const sh of s.shots) if (sh.task) oppgaver.set(sh.task.tittel, (oppgaver.get(sh.task.tittel) ?? 0) + 1);
  const plan = [...oppgaver.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return {
    id: s.id,
    dato: s.recordedAt.toISOString(),
    sted: stedFraMiljo(s.environment),
    plan,
    slag: s.shots.map((sh) => ({
      nr: sh.shotNumber, kolle: sh.club.trim(), ekstrem: sh.outlier, mal: sh.targetDistanceM ?? s.targetDistanceM, hast: sh.hastighet,
      bs: sh.ballSpeed, smash: sh.smashFactor, launch: sh.launchAngle, ldir: sh.launchDirection, spin: sh.spinRate, saxis: sh.spinAxis,
      carry: sh.carryDistance, total: sh.totalDistance, side: sh.side, apex: sh.apexHeight, land: sh.landAngle,
      cs: sh.clubSpeed, aa: sh.attackAngle, path: sh.clubPath, face: sh.faceAngle, ftp: sh.faceToPath, dl: sh.dynamicLoft,
      sx: sh.strikePatternX, sy: sh.strikePatternY,
    })),
  };
}

/** Spillerens økter fra og med `fra`, nyeste først. */
export async function hentTmOkter(userId: string, fra: Date): Promise<TmOkt[]> {
  const okter = await prisma.trackManSession.findMany({
    where: { userId, recordedAt: { gte: fra } },
    orderBy: { recordedAt: "desc" },
    select: { id: true, recordedAt: true, environment: true, targetDistanceM: true, shots: { orderBy: { shotNumber: "asc" }, select: SLAG_FELT } },
  });
  return okter.map(tilTmOkt);
}

/**
 * Én økt for eieren, eller for en coach med lesetilgang til spilleren.
 * Null når den ikke finnes eller brukeren ikke har tilgang.
 */
export async function hentTmOkt(id: string, bruker: { id: string; role: string }): Promise<TmOkt | null> {
  const s = await prisma.trackManSession.findUnique({
    where: { id },
    select: { id: true, userId: true, recordedAt: true, environment: true, targetDistanceM: true, shots: { orderBy: { shotNumber: "asc" }, select: SLAG_FELT } },
  });
  if (!s) return null;
  if (s.userId !== bruker.id && !(await harCoachLesetilgangTilSpiller(bruker, s.userId))) return null;
  return tilTmOkt(s);
}
