/**
 * Ren logikk for live-drill offline-kø (Bølge 4-rest).
 * Absolutt reps-snapshot per drill — logDrillReps er idempotent upsert.
 */

export type LiveDrillReps = {
  drillId: string;
  repsTotal: number;
  repsWithoutBall: number;
  repsLowSpeed: number;
  repsAutomatic: number;
  repsHit: number;
  notes?: string;
  status: "active" | "queued" | "done";
};

export type LiveDrillKoRad = {
  sessionId: string;
  drills: LiveDrillReps[];
  totalSec: number;
  sistOppdatert: string;
  forsokAntall: number;
};

const MAKS_STILLE_FORSOK = 5;

export function byggLiveDrillKoRad(
  sessionId: string,
  drills: LiveDrillReps[],
  totalSec: number,
  naa: Date,
): LiveDrillKoRad {
  return {
    sessionId,
    drills,
    totalSec,
    sistOppdatert: naa.toISOString(),
    forsokAntall: 0,
  };
}

export function registrerMislykketLiveForsok(rad: LiveDrillKoRad, naa: Date): LiveDrillKoRad {
  return { ...rad, forsokAntall: rad.forsokAntall + 1, sistOppdatert: naa.toISOString() };
}

export function trengerManuellLiveHandling(rad: LiveDrillKoRad): boolean {
  return rad.forsokAntall >= MAKS_STILLE_FORSOK;
}
