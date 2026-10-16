/** Leste Shot-rader til én SG-verdi per fysisk slag. */
import {
  beregnSg, kategoriForPosisjon,
  type SgBaselinePoint, type SgLie, type SgResultat, type SgShot,
} from "@/lib/domain/sg";
import { akkumulerGranulaerSg, type GranulaerInput } from "./granulaer-sg";
import type { GranulaerSg } from "./types";

export type DbShotRad = {
  holeNumber: number;
  holePar: number;
  shotNumber: number;
  lie: string;
  distanceToPin: number | null;
  endLie?: string | null;
  endDistanceToPinM?: number | null;
  holed?: boolean | null;
  penaltyStrokes?: number;
  isPenalty: boolean;
};

export type DbHoleScoreRad = { holeNumber: number; strokes: number };

const GYLDIGE_LIES = new Set<SgLie>([
  "TEE", "FAIRWAY", "SEMI_ROUGH", "ROUGH", "DEEP_ROUGH",
  "BUNKER", "GREEN", "WATER", "OOB", "TREES",
]);

function gyldigLie(value: string | null | undefined): value is SgLie {
  return value != null && GYLDIGE_LIES.has(value as SgLie);
}

export function shotsTilSgShotsMedMeta(
  shots: ReadonlyArray<DbShotRad>,
  holeScores: ReadonlyArray<DbHoleScoreRad>,
): GranulaerInput[] | null {
  if (shots.length === 0 || holeScores.length === 0) return null;
  const perHull = new Map<number, DbShotRad[]>();
  for (const shot of shots) perHull.set(shot.holeNumber, [...(perHull.get(shot.holeNumber) ?? []), shot]);
  const scorePerHull = new Map(holeScores.map((h) => [h.holeNumber, h.strokes]));
  if (perHull.size !== scorePerHull.size) return null;

  const ut: GranulaerInput[] = [];
  for (const [holeNumber, liste] of perHull) {
    const strokes = scorePerHull.get(holeNumber);
    if (strokes == null) return null;
    const sortert = [...liste].sort((a, b) => a.shotNumber - b.shotNumber);
    const straffer = sortert.reduce((sum, shot) =>
      sum + Math.max(shot.penaltyStrokes ?? 0, shot.isPenalty ? 1 : 0), 0);
    if (sortert.length + straffer !== strokes) return null;

    for (let i = 0; i < sortert.length; i++) {
      const shot = sortert[i];
      const neste = sortert[i + 1];
      const holed = shot.holed ?? (neste == null);
      const lie = shot.lie;
      const distanceM = shot.distanceToPin;
      if (!gyldigLie(lie) || distanceM == null || !Number.isFinite(distanceM) || distanceM <= 0) return null;
      if (holed && neste) return null;
      if (!holed && !neste) return null;
      const endLie = holed ? null : (shot.endLie ?? neste?.lie);
      const endDistanceM = holed ? 0 : (shot.endDistanceToPinM ?? neste?.distanceToPin);
      if (!holed && (!gyldigLie(endLie) || endDistanceM == null || endDistanceM <= 0)) return null;
      if (neste && (endLie !== neste.lie || Math.abs(endDistanceM! - (neste.distanceToPin ?? NaN)) > 0.01)) return null;
      ut.push({
        category: kategoriForPosisjon(lie, distanceM, shot.holePar),
        startLie: lie,
        startDistanceM: distanceM,
        endLie: holed ? null : endLie as SgLie,
        endDistanceM,
        holed,
        penaltyStrokes: Math.max(shot.penaltyStrokes ?? 0, shot.isPenalty ? 1 : 0),
        teePar: shot.holePar,
        slagIndex: i,
        holeNumber,
        erStraffeRad: false,
        bunkerStart: lie === "BUNKER",
      });
    }
  }
  return ut;
}

export function shotsTilSgShots(
  shots: ReadonlyArray<DbShotRad>,
  holeScores: ReadonlyArray<DbHoleScoreRad>,
): SgShot[] | null {
  return shotsTilSgShotsMedMeta(shots, holeScores);
}

export function beregnSgFraShots(
  shots: ReadonlyArray<DbShotRad>,
  holeScores: ReadonlyArray<DbHoleScoreRad>,
  punkter: ReadonlyArray<SgBaselinePoint>,
): SgResultat | null {
  const sgShots = shotsTilSgShots(shots, holeScores);
  return sgShots ? beregnSg(sgShots, punkter) : null;
}

export function beregnGranulaerSgFraShots(
  shots: ReadonlyArray<DbShotRad>,
  holeScores: ReadonlyArray<DbHoleScoreRad>,
  punkter: ReadonlyArray<SgBaselinePoint>,
): GranulaerSg | null {
  const medMeta = shotsTilSgShotsMedMeta(shots, holeScores);
  return medMeta ? akkumulerGranulaerSg(medMeta, punkter) : null;
}
