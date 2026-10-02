/** Calculate a complete stored round against one active AK Golf model. */

import { AkSgCalculator, type AkSgLie } from "@/lib/domain/ak-sg";
import type { SgGranulaer, SgHovedtall } from "@/lib/domain/sg-skriving";
import type { DbHoleScoreRad, DbShotRad } from "./shots-til-sg";

type SgCategory = "ott" | "app" | "arg" | "putt";
type Bucket = keyof SgGranulaer;
type AkSgRound = { sg: SgHovedtall; gran: SgGranulaer; versionId: string };

function lieOf(value: string): AkSgLie | null {
  switch (value) {
    case "TEE": return "tee";
    case "FAIRWAY": return "fairway";
    case "SEMI_ROUGH":
    case "ROUGH":
    case "DEEP_ROUGH": return "rough";
    case "BUNKER": return "bunker";
    case "GREEN": return "green";
    case "TREES": return "recovery";
    default: return null; // WATER/OOB are outcomes, never a resting position.
  }
}

function category(lie: AkSgLie, distanceM: number): SgCategory {
  if (lie === "tee") return "ott";
  if (lie === "green") return "putt";
  if (lie === "bunker" || lie === "recovery" || distanceM <= 30) return "arg";
  return "app";
}

function bucket(lie: AkSgLie, distanceM: number, shotNumber: number, area: SgCategory): Bucket | null {
  if (shotNumber === 1) return "sgTee";
  if (area === "app") {
    if (distanceM <= 75) return "sgApp50";
    if (distanceM <= 125) return "sgApp100";
    if (distanceM <= 175) return "sgApp150";
    return "sgApp200";
  }
  if (area === "arg") {
    if (lie === "bunker") return "sgBunker";
    return distanceM <= 12 ? "sgChip" : "sgPitch";
  }
  if (area === "putt") {
    const feet = distanceM / 0.3048;
    if (feet <= 3) return "sgPutt0_3";
    if (feet <= 5) return "sgPutt3_5";
    if (feet <= 10) return "sgPutt5_10";
    if (feet <= 15) return "sgPutt10_15";
    if (feet <= 25) return "sgPutt15_25";
    if (feet <= 40) return "sgPutt25_40";
    return "sgPutt40plus";
  }
  return null;
}

const roundTwo = (value: number): number => Math.round(value * 100) / 100;

/** Returns null for any incomplete hole or unsupported state; never mixes models. */
export function beregnAkSgFraShots(
  shots: ReadonlyArray<DbShotRad>,
  holeScores: ReadonlyArray<DbHoleScoreRad>,
  model: AkSgCalculator,
): AkSgRound | null {
  if (shots.length === 0 || holeScores.length === 0) return null;
  const scoreByHole = new Map<number, number>();
  for (const score of holeScores) {
    if (!Number.isInteger(score.holeNumber) || !Number.isInteger(score.strokes) ||
        score.strokes <= 0 || scoreByHole.has(score.holeNumber)) return null;
    scoreByHole.set(score.holeNumber, score.strokes);
  }

  const shotsByHole = new Map<number, DbShotRad[]>();
  for (const shot of shots) {
    const rows = shotsByHole.get(shot.holeNumber) ?? [];
    rows.push(shot);
    shotsByHole.set(shot.holeNumber, rows);
  }
  if (scoreByHole.size !== shotsByHole.size) return null;

  const sums: Record<SgCategory, number> = { ott: 0, app: 0, arg: 0, putt: 0 };
  const granular = new Map<Bucket, number>();
  for (const [holeNumber, rows] of shotsByHole) {
    const score = scoreByHole.get(holeNumber);
    if (score === undefined) return null;
    const ordered = [...rows].sort((left, right) => left.shotNumber - right.shotNumber);
    if (ordered[0].lie !== "TEE" ||
        ordered.some((shot, index) => shot.shotNumber !== index + 1) ||
        score !== ordered.length + ordered.filter((shot) => shot.isPenalty).length) return null;

    for (let index = 0; index < ordered.length; index++) {
      const shot = ordered[index];
      const startLie = lieOf(shot.lie);
      const startDistanceM = shot.distanceToPin;
      if (!startLie || startDistanceM == null || !Number.isFinite(startDistanceM) || startDistanceM <= 0) return null;
      const next = ordered[index + 1];
      const endLie = next ? lieOf(next.lie) : null;
      if (next && (!endLie || next.distanceToPin == null ||
          !Number.isFinite(next.distanceToPin) || next.distanceToPin <= 0)) return null;

      let value: number | null;
      try {
        value = model.calculateShot({
          startLie, startDistanceM,
          end: next ? { holed: false, lie: endLie!, distanceM: next.distanceToPin! } : { holed: true },
          penaltyStrokes: shot.isPenalty ? 1 : 0,
        });
      } catch (error) {
        if (error instanceof RangeError || error instanceof TypeError) return null;
        throw error;
      }
      if (value === null) return null;
      const area = category(startLie, startDistanceM);
      sums[area] += value;
      const key = bucket(startLie, startDistanceM, shot.shotNumber, area);
      if (key) granular.set(key, (granular.get(key) ?? 0) + value);
    }
  }

  const gran: SgGranulaer = {};
  for (const [key, value] of granular) gran[key] = roundTwo(value);
  return {
    sg: {
      ott: roundTwo(sums.ott), app: roundTwo(sums.app),
      arg: roundTwo(sums.arg), putt: roundTwo(sums.putt),
      total: roundTwo(sums.ott + sums.app + sums.arg + sums.putt),
    },
    gran,
    versionId: model.versionId,
  };
}
