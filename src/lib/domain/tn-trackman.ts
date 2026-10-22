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
  strikePatternX: number | null; strikePatternY: number | null; targetDistanceM: number | null;
};
export type TnTrackManOkt = { id: string; recordedAt: Date; source: string; akse: "TEK" | "SLAG" | null; slag: TnTrackManSlag[] };

const SLAG_FELT = {
  id: true, shotNumber: true, club: true, outlier: true, carryDistance: true, side: true, totalDistance: true,
  clubSpeed: true, ballSpeed: true, smashFactor: true, attackAngle: true, clubPath: true, faceAngle: true, faceToPath: true,
  dynamicLoft: true, launchAngle: true, launchDirection: true, spinRate: true, spinAxis: true, apexHeight: true, landAngle: true,
  strikePatternX: true, strikePatternY: true, targetDistanceM: true,
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

export type TnTrackManMaalRad = { kolle: string; parameter: string; maal: number | null; vinduMin: number | null; vinduMax: number | null; settAv: string | null; settAt: Date };

/** Egne mål og vinduer for spilleren (TrackManMaal), med navnet på den som satte dem. */
export async function hentTnTrackManMaal(bruker: TnBruker, spillerId: string): Promise<TnTrackManMaalRad[] | null> {
  return medTnSpillerData(bruker, spillerId, async (tx) => {
    const rader = await tx.trackManMaal.findMany({ where: { spillerId }, orderBy: { settAt: "desc" } });
    const navn = new Map((await tx.user.findMany({ where: { id: { in: rader.flatMap((r) => (r.settAvId ? [r.settAvId] : [])) } }, select: { id: true, name: true } })).map((u) => [u.id, u.name]));
    return rader.map((r) => ({ kolle: r.kolle, parameter: r.parameter, maal: r.maal, vinduMin: r.vinduMin, vinduMax: r.vinduMax, settAv: r.settAvId ? navn.get(r.settAvId) ?? null : null, settAt: r.settAt }));
  });
}

export type TnRundeSg = { playedAt: Date; type: "turnering" | "trening"; sgOtt: number | null; sgApp: number | null; sgArg: number | null; sgPutt: number | null };

/**
 * Registrerte runder med Strokes Gained for «TrackMan mot spill» (sammenstilling, ikke årsak). SG regnes fra
 * spillerens faktiske slag, altså brutto. Runder uten type (`roundType` null) holdes utenfor, så trening og
 * turnering ikke blandes.
 */
export async function hentTnRunderSg(bruker: TnBruker, spillerId: string, fra: Date): Promise<TnRundeSg[] | null> {
  return medTnSpillerData(bruker, spillerId, async (tx) => {
    const runder = await tx.round.findMany({
      where: { userId: spillerId, playedAt: { gte: fra }, roundType: { in: ["turnering", "trening"] } },
      orderBy: { playedAt: "asc" },
      select: { playedAt: true, roundType: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    });
    return runder.map((r) => ({ playedAt: r.playedAt, type: r.roundType === "turnering" ? "turnering" : "trening", sgOtt: r.sgOtt, sgApp: r.sgApp, sgArg: r.sgArg, sgPutt: r.sgPutt }));
  });
}
