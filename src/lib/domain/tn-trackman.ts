import "server-only";

import { medTnSpillerData, type TnBruker } from "./tn-arbeidsflate";

/**
 * Spillerens TrackMan-økter for Team Norway-treneren (§TRACKMAN I TEAM NORWAY-TESTENE, Anders 22.10.2026).
 * Leses bare innenfor delingslåsen, som de andre personlige dataene. Null uten deling.
 */
export type TnTrackManSlag = {
  id: string; shotNumber: number; club: string | null; outlier: boolean;
  carryDistance: number | null; side: number | null; totalDistance: number | null;
  clubSpeed: number | null; ballSpeed: number | null; smashFactor: number | null;
  attackAngle: number | null; clubPath: number | null; faceAngle: number | null; faceToPath: number | null;
  dynamicLoft: number | null; launchAngle: number | null; launchDirection: number | null;
  spinRate: number | null; spinAxis: number | null; apexHeight: number | null; landAngle: number | null;
  strikePatternX: number | null; strikePatternY: number | null;
};
export type TnTrackManOkt = { id: string; recordedAt: Date; source: string; akse: "TEK" | "SLAG" | null; slag: TnTrackManSlag[] };

const SLAG_FELT = {
  id: true, shotNumber: true, club: true, outlier: true, carryDistance: true, side: true, totalDistance: true,
  clubSpeed: true, ballSpeed: true, smashFactor: true, attackAngle: true, clubPath: true, faceAngle: true, faceToPath: true,
  dynamicLoft: true, launchAngle: true, launchDirection: true, spinRate: true, spinAxis: true, apexHeight: true, landAngle: true,
  strikePatternX: true, strikePatternY: true,
} as const;

export async function hentTnTrackManOkter(bruker: TnBruker, spillerId: string, antall = 20): Promise<TnTrackManOkt[] | null> {
  return medTnSpillerData(bruker, spillerId, async (tx) => {
    const okter = await tx.trackManSession.findMany({
      where: { userId: spillerId },
      orderBy: { recordedAt: "desc" },
      take: antall,
      select: { id: true, recordedAt: true, source: true, akse: true, shots: { select: SLAG_FELT, orderBy: { shotNumber: "asc" } } },
    });
    return okter.map((o) => ({
      id: o.id, recordedAt: o.recordedAt, source: o.source,
      akse: o.akse === "TEK" || o.akse === "SLAG" ? o.akse : null,
      slag: o.shots.map((s) => ({ ...s, club: s.club?.trim() ? s.club : null })),
    }));
  });
}
