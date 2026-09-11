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
  /** Medgått tid på drillen (sekunder). Følger med i offline-køen så tiden
   * ikke går tapt når økta kjøres uten nett. */
  actualDurationSec?: number;
};

export type LiveDrillKoRad = {
  sessionId: string;
  drills: LiveDrillReps[];
  totalSec: number;
  sistOppdatert: string;
  forsokAntall: number;
  /** Lokale felter; krever ingen database- eller IndexedDB-skjemaendring. */
  revision?: number;
  synketRevision?: number;
  paused?: boolean;
  drillSec?: number;
  /**
   * R-C (2026-09-11): hvilken innlogget bruker som la raden i køen — se
   * samme begrunnelse på `TapperKoRad.userId` (tapper-kladd.ts). Valgfri av
   * samme bakoverkompatibilitetsgrunn; en rad uten feltet flushes aldri
   * automatisk av portal-wide bootstrap.
   */
  userId?: string;
};

const MAKS_STILLE_FORSOK = 5;

export function byggLiveDrillKoRad(
  sessionId: string,
  drills: LiveDrillReps[],
  totalSec: number,
  naa: Date,
  userId?: string,
): LiveDrillKoRad {
  return {
    sessionId,
    drills,
    totalSec,
    sistOppdatert: naa.toISOString(),
    forsokAntall: 0,
    userId,
  };
}

export function registrerMislykketLiveForsok(rad: LiveDrillKoRad, naa: Date): LiveDrillKoRad {
  return { ...rad, forsokAntall: rad.forsokAntall + 1, sistOppdatert: naa.toISOString() };
}

export function trengerManuellLiveHandling(rad: LiveDrillKoRad): boolean {
  return rad.forsokAntall >= MAKS_STILLE_FORSOK;
}

/** R-C: samme regel som `tilhoererBruker` i tapper-kladd.ts — se der. */
export function tilhoererBrukerLive(rad: LiveDrillKoRad, userId: string): boolean {
  return rad.userId != null && rad.userId === userId;
}
